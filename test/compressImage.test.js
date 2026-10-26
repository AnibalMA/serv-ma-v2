import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import {
  compressImage,
  scaleToFit,
  squareCrop,
  squareImageBlob,
} from "src/utils/compressImage";

describe("scaleToFit", () => {
  it("keeps images that already fit", () => {
    expect(scaleToFit(800, 600, 1280)).toEqual({ width: 800, height: 600 });
    expect(scaleToFit(1280, 1280, 1280)).toEqual({ width: 1280, height: 1280 });
  });

  it("shrinks a wide image to the max width", () => {
    expect(scaleToFit(2560, 1440, 1280)).toEqual({ width: 1280, height: 720 });
  });

  it("shrinks a tall image (phone screenshot) to the max height", () => {
    expect(scaleToFit(1080, 2400, 1280)).toEqual({ width: 576, height: 1280 });
  });

  it("never returns a side smaller than 1px", () => {
    expect(scaleToFit(10000, 2, 1280)).toEqual({ width: 1280, height: 1 });
  });
});

// jsdom cannot load images nor draw on a canvas, so those parts are faked
describe("compressImage", () => {
  const originalImage = globalThis.Image;

  afterEach(() => {
    globalThis.Image = originalImage;
    vi.restoreAllMocks();
    delete URL.createObjectURL;
    delete URL.revokeObjectURL;
  });

  function fakeImage({ width, height, fails = false }) {
    globalThis.Image = class {
      set src(value) {
        this.naturalWidth = width;
        this.naturalHeight = height;
        setTimeout(() => (fails ? this.onerror() : this.onload()));
      }
    };
  }

  function fakeObjectUrls() {
    URL.createObjectURL = vi.fn(() => "blob:captura");
    URL.revokeObjectURL = vi.fn();
  }

  const file = new File(["captura"], "captura.png", { type: "image/png" });

  it("returns a smaller JPEG and frees the object url", async () => {
    fakeObjectUrls();
    fakeImage({ width: 1080, height: 2400 });
    const context = { fillRect: vi.fn(), drawImage: vi.fn(), fillStyle: "" };
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context);
    const toDataURL = vi
      .spyOn(HTMLCanvasElement.prototype, "toDataURL")
      .mockReturnValue("data:image/jpeg;base64,abc");

    const result = await compressImage(file);

    expect(result).toBe("data:image/jpeg;base64,abc");
    expect(toDataURL).toHaveBeenCalledWith("image/jpeg", 0.8);
    expect(context.drawImage).toHaveBeenCalledWith(
      expect.anything(),
      0,
      0,
      576,
      1280
    );
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:captura");
  });

  it("fails when the browser cannot open the image (e.g. HEIC)", async () => {
    fakeObjectUrls();
    fakeImage({ width: 0, height: 0, fails: true });

    await expect(compressImage(file)).rejects.toThrow("No se pudo abrir la imagen");
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:captura");
  });

  it("fails when the browser cannot draw on a canvas", async () => {
    fakeObjectUrls();
    fakeImage({ width: 800, height: 600 });
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);

    await expect(compressImage(file)).rejects.toThrow();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:captura");
  });
});

describe("squareCrop", () => {
  it("keeps the center of a wide photo", () => {
    expect(squareCrop(1600, 1200)).toEqual({ x: 200, y: 0, side: 1200 });
  });

  it("keeps the center of a tall photo", () => {
    expect(squareCrop(1080, 1920)).toEqual({ x: 0, y: 420, side: 1080 });
  });

  it("keeps a square photo as it is", () => {
    expect(squareCrop(500, 500)).toEqual({ x: 0, y: 0, side: 500 });
  });

  it("uses whole pixels", () => {
    expect(squareCrop(101, 100)).toEqual({ x: 1, y: 0, side: 100 });
  });
});

describe("squareImageBlob", () => {
  const originalImage = globalThis.Image;

  afterEach(() => {
    globalThis.Image = originalImage;
    vi.restoreAllMocks();
    delete URL.createObjectURL;
    delete URL.revokeObjectURL;
  });

  function fakeImage({ width, height, fails = false }) {
    globalThis.Image = class {
      set src(value) {
        this.naturalWidth = width;
        this.naturalHeight = height;
        setTimeout(() => (fails ? this.onerror() : this.onload()));
      }
    };
  }

  function fakeCanvas(blob) {
    const context = { fillRect: vi.fn(), drawImage: vi.fn(), fillStyle: "" };
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context);
    const toBlob = vi
      .spyOn(HTMLCanvasElement.prototype, "toBlob")
      .mockImplementation((callback) => callback(blob));
    return { context, toBlob };
  }

  const photo = new File(["foto"], "foto.png", { type: "image/png" });
  const jpeg = new Blob(["jpeg"], { type: "image/jpeg" });

  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => "blob:foto");
    URL.revokeObjectURL = vi.fn();
  });

  it("returns a 512px square JPEG cut from the center", async () => {
    fakeImage({ width: 1600, height: 1200 });
    const { context, toBlob } = fakeCanvas(jpeg);

    const result = await squareImageBlob(photo);

    expect(result).toBe(jpeg);
    expect(toBlob).toHaveBeenCalledWith(expect.any(Function), "image/jpeg", 0.85);
    expect(context.drawImage).toHaveBeenCalledWith(
      expect.anything(),
      200,
      0,
      1200,
      1200,
      0,
      0,
      512,
      512
    );
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:foto");
  });

  it("does not make small photos bigger", async () => {
    fakeImage({ width: 300, height: 400 });
    const { context } = fakeCanvas(jpeg);

    await squareImageBlob(photo);

    expect(context.drawImage).toHaveBeenCalledWith(
      expect.anything(),
      0,
      50,
      300,
      300,
      0,
      0,
      300,
      300
    );
  });

  it("fails when the browser cannot open the image (e.g. HEIC)", async () => {
    fakeImage({ width: 0, height: 0, fails: true });

    await expect(squareImageBlob(photo)).rejects.toThrow("No se pudo abrir la imagen");
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:foto");
  });

  it("fails when the browser cannot create the JPEG", async () => {
    fakeImage({ width: 800, height: 600 });
    fakeCanvas(null);

    await expect(squareImageBlob(photo)).rejects.toThrow();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:foto");
  });
});
