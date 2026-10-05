import { describe, it, expect, vi, afterEach } from "vitest";
import { compressImage, scaleToFit } from "src/utils/compressImage";

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
