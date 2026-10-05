import { describe, it, expect, vi, beforeEach } from "vitest";

const { post, compressImage } = vi.hoisted(() => ({
  post: vi.fn(),
  compressImage: vi.fn(),
}));

vi.mock("src/stores/user", () => ({ useUserStore: vi.fn() }));
vi.mock("stores/user", () => ({ useUserStore: vi.fn() }));
vi.mock("src/utils/serviceHttp", () => ({ serviceHttp: { post } }));
vi.mock("src/utils/clipboard", () => ({ copyAndNotify: vi.fn() }));
vi.mock("src/utils/compressImage", () => ({ compressImage }));

import boletasPage from "src/pages/boletas/index";
import methods from "src/pages/boletas/methods";

const yape = {
  id: 3,
  nom_payment_opc: "Yape",
  detalles_payment_opc: "Celular: 987 654 321",
  qr_url: "https://res.cloudinary.com/demo/image/upload/v1/yape.png",
};

// Minimal stand-in for the component's "this"
function createPage(overrides = {}) {
  return {
    ...methods,
    optBoleta: "Pending",
    showPaymentModal: true,
    selectedBoleta: { id: 10, cod_boleta: "B-010", monto_facturado: "25.00" },
    selectedPaymentMethod: yape,
    paymentCapture: "data:image/jpeg;base64,abc",
    captureFile: new File(["x"], "captura.png", { type: "image/png" }),
    processingCapture: false,
    operationNumber: " 12345678 ",
    paymentComment: "",
    getList: vi.fn(),
    $q: {
      notify: vi.fn(),
      loading: { show: vi.fn(), hide: vi.fn() },
    },
    ...overrides,
  };
}

function lastNotify(page) {
  return page.$q.notify.mock.calls.at(-1)[0];
}

describe("boletas onFileSelected", () => {
  beforeEach(() => vi.clearAllMocks());

  it("keeps the compressed image to show and send it", async () => {
    compressImage.mockResolvedValue("data:image/jpeg;base64,small");
    const page = createPage({ paymentCapture: null, captureFile: null });
    const file = new File(["x"], "captura.png", { type: "image/png" });

    const pending = page.onFileSelected(file);
    expect(page.processingCapture).toBe(true);
    await pending;

    expect(compressImage).toHaveBeenCalledWith(file);
    expect(page.paymentCapture).toBe("data:image/jpeg;base64,small");
    expect(page.processingCapture).toBe(false);
  });

  it("rejects images bigger than 15 MB without compressing them", async () => {
    const page = createPage({ paymentCapture: null });
    const bigFile = { name: "enorme.png", size: 16 * 1024 * 1024 };

    await page.onFileSelected(bigFile);

    expect(compressImage).not.toHaveBeenCalled();
    expect(page.captureFile).toBeNull();
    expect(page.paymentCapture).toBeNull();
    expect(lastNotify(page).message).toBe(
      "La imagen pesa más de 15 MB. Elige una captura más liviana."
    );
  });

  it("clears the preview when the file is removed", async () => {
    const page = createPage();

    await page.onFileSelected(null);

    expect(page.captureFile).toBeNull();
    expect(page.paymentCapture).toBeNull();
    expect(page.processingCapture).toBe(false);
  });

  it("ignores an old image that finishes after a new one was picked", async () => {
    let finishFirst;
    compressImage.mockReturnValueOnce(
      new Promise((resolve) => (finishFirst = resolve))
    );
    compressImage.mockResolvedValueOnce("data:image/jpeg;base64,second");
    const page = createPage({ paymentCapture: null });
    const first = new File(["1"], "1.png", { type: "image/png" });
    const second = new File(["2"], "2.png", { type: "image/png" });

    const firstPending = page.onFileSelected(first);
    await page.onFileSelected(second);
    finishFirst("data:image/jpeg;base64,first");
    await firstPending;

    expect(page.paymentCapture).toBe("data:image/jpeg;base64,second");
    expect(page.processingCapture).toBe(false);
  });

  it("asks for a JPG or PNG when the image cannot be opened (e.g. HEIC)", async () => {
    compressImage.mockRejectedValue(new Error("No se pudo abrir la imagen"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const page = createPage({ paymentCapture: null });

    await page.onFileSelected(new File(["x"], "x.heic", { type: "image/heic" }));

    expect(page.captureFile).toBeNull();
    expect(page.paymentCapture).toBeNull();
    expect(page.processingCapture).toBe(false);
    expect(lastNotify(page).message).toBe(
      "No se pudo leer la imagen. Sube una captura en JPG o PNG."
    );
  });
});

describe("boletas submitPaymentVerification", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sends only the digits of the operation number with the compressed capture", async () => {
    post.mockResolvedValue({ data: { ok: true } });
    const page = createPage({
      operationNumber: "Nº 1234 5678",
      paymentComment: " gracias ",
    });

    await page.submitPaymentVerification();

    expect(post).toHaveBeenCalledWith(
      "/send-payment-verification",
      {
        id_boleta: 10,
        id_payment_opc: 3,
        screenshot_data: "data:image/jpeg;base64,abc",
        comments: "gracias",
        nro_operacion: "12345678",
      },
      expect.any(Object)
    );
    expect(page.showPaymentModal).toBe(false);
    expect(page.getList).toHaveBeenCalledWith("Pending");
  });

  it("asks for a payment method", async () => {
    const page = createPage({ selectedPaymentMethod: null });

    await page.submitPaymentVerification();

    expect(post).not.toHaveBeenCalled();
    expect(lastNotify(page).message).toBe("Por favor selecciona un método de pago");
  });

  it("asks for the capture", async () => {
    const page = createPage({ paymentCapture: null, captureFile: null });

    await page.submitPaymentVerification();

    expect(post).not.toHaveBeenCalled();
    expect(lastNotify(page).message).toBe(
      "Por favor adjunta la captura de la transacción"
    );
  });

  it("asks for a valid operation number", async () => {
    const page = createPage({ operationNumber: "12a" });

    await page.submitPaymentVerification();

    expect(post).not.toHaveBeenCalled();
    expect(lastNotify(page).message).toBe(
      "Escribe el número de operación (de 4 a 20 dígitos)"
    );
  });

  it("shows the server message when the number was already used", async () => {
    post.mockRejectedValue({
      response: {
        status: 409,
        data: {
          ok: false,
          sMessage: "Este número de operación ya fue registrado en otro pago",
        },
      },
    });
    vi.spyOn(console, "error").mockImplementation(() => {});
    const page = createPage();

    await page.submitPaymentVerification();

    expect(lastNotify(page).message).toBe(
      "Este número de operación ya fue registrado en otro pago"
    );
    expect(page.showPaymentModal).toBe(true);
    expect(page.$q.loading.hide).toHaveBeenCalled();
  });
});

describe("boletas payment modal state", () => {
  it("cancelPayment clears the operation number and the capture", () => {
    const page = createPage();

    page.cancelPayment();

    expect(page.showPaymentModal).toBe(false);
    expect(page.operationNumber).toBe("");
    expect(page.paymentCapture).toBeNull();
    expect(page.captureFile).toBeNull();
    expect(page.processingCapture).toBe(false);
  });

  it("qrDownloadUrl is the Cloudinary download link of the selected QR", () => {
    const qrDownloadUrl = (overrides) =>
      boletasPage.computed.qrDownloadUrl.call(createPage(overrides));

    expect(qrDownloadUrl({})).toBe(
      "https://res.cloudinary.com/demo/image/upload/fl_attachment/v1/yape.png"
    );
    expect(qrDownloadUrl({ selectedPaymentMethod: null })).toBeUndefined();
  });

  it("amountToPay is what is still pending on the boleta", () => {
    const page = createPage({
      selectedBoleta: { monto_facturado: "30.00", monto_cancelado: "10.00" },
    });

    expect(boletasPage.computed.amountToPay.call(page)).toBe(20);
  });
});
