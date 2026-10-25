import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  QR_MAX_SIZE,
  cleanPaymentOptionForm,
  getQrFileError,
  paymentOptionFormFromOption,
  paymentOptionRules,
  putOptionInList,
} from "src/pages/admin-payments/helpers";

const { get, post, put, del } = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
}));

vi.mock("stores/user", () => ({
  useUserStore: () => ({ user: { id: 1, rol: "ROL_ADM" } }),
}));
vi.mock("src/utils/serviceHttp", () => ({
  serviceHttp: { get, post, put, delete: del },
}));

import methods from "src/pages/admin-payments/methods";

// Runs Quasar-style rules: returns the first error message, or true
function check(rules, value) {
  for (const rule of rules) {
    const result = rule(value);
    if (result !== true) return result;
  }
  return true;
}

const yape = {
  id: 3,
  nom_payment_opc: "Yape",
  desc_payment_opc: "Paga con Yape",
  detalles_payment_opc: "Celular: 987654321",
  qr_url: null,
};

describe("payment option form helpers", () => {
  it("fills the form from an option, or empty for a new one", () => {
    expect(paymentOptionFormFromOption(yape)).toEqual({
      nom_payment_opc: "Yape",
      desc_payment_opc: "Paga con Yape",
      detalles_payment_opc: "Celular: 987654321",
    });
    expect(paymentOptionFormFromOption(null)).toEqual({
      nom_payment_opc: "",
      desc_payment_opc: "",
      detalles_payment_opc: "",
    });
    expect(
      paymentOptionFormFromOption({ nom_payment_opc: "Plin", desc_payment_opc: null })
        .desc_payment_opc
    ).toBe("");
  });

  it("trims every field before sending", () => {
    expect(
      cleanPaymentOptionForm({
        nom_payment_opc: "  Yape ",
        desc_payment_opc: " Paga con Yape ",
        detalles_payment_opc: "",
      })
    ).toEqual({
      nom_payment_opc: "Yape",
      desc_payment_opc: "Paga con Yape",
      detalles_payment_opc: "",
    });
  });

  it("uses the same limits as the backend", () => {
    expect(check(paymentOptionRules.name, "")).toEqual(expect.any(String));
    expect(check(paymentOptionRules.name, " Y ")).toEqual(expect.any(String));
    expect(check(paymentOptionRules.name, "Yape")).toBe(true);
    expect(check(paymentOptionRules.name, "a".repeat(101))).toEqual(
      expect.any(String)
    );

    expect(check(paymentOptionRules.text, "")).toBe(true);
    expect(check(paymentOptionRules.text, null)).toBe(true);
    expect(check(paymentOptionRules.text, "a".repeat(255))).toBe(true);
    expect(check(paymentOptionRules.text, "a".repeat(256))).toEqual(
      expect.any(String)
    );
  });
});

describe("getQrFileError", () => {
  it("accepts JPG, PNG and WEBP up to 2 MB", () => {
    expect(getQrFileError({ type: "image/jpeg", size: 1000 })).toBe("");
    expect(getQrFileError({ type: "image/png", size: QR_MAX_SIZE })).toBe("");
    expect(getQrFileError({ type: "image/webp", size: 10 })).toBe("");
  });

  it("rejects other types", () => {
    expect(getQrFileError({ type: "image/gif", size: 10 })).toBe(
      "El QR debe ser una imagen JPG, PNG o WEBP"
    );
    expect(getQrFileError({ type: "application/pdf", size: 10 })).toBe(
      "El QR debe ser una imagen JPG, PNG o WEBP"
    );
  });

  it("rejects images bigger than 2 MB", () => {
    expect(getQrFileError({ type: "image/png", size: QR_MAX_SIZE + 1 })).toBe(
      "La imagen del QR debe pesar 2 MB o menos"
    );
  });

  it("asks for a file when there is none", () => {
    expect(getQrFileError(null)).toBe("Elige una imagen para el QR");
  });
});

describe("putOptionInList", () => {
  it("replaces the option with the same id", () => {
    const plin = { id: 4, nom_payment_opc: "Plin" };
    const updated = { ...yape, qr_url: "https://res.cloudinary.com/x/upload/qr.png" };

    expect(putOptionInList([yape, plin], updated)).toEqual([updated, plin]);
  });

  it("adds a new option at the end", () => {
    const plin = { id: 4, nom_payment_opc: "Plin" };

    expect(putOptionInList([yape], plin)).toEqual([yape, plin]);
  });
});

// Minimal stand-in for the component's "this"
function createPage(overrides = {}) {
  return {
    ...methods,
    paymentOptions: [yape],
    loadingOptions: false,
    showOptionDialog: true,
    editingOption: null,
    savingOption: false,
    uploadingQrId: null,
    $q: { notify: vi.fn(), dialog: vi.fn() },
    $router: { replace: vi.fn() },
    ...overrides,
  };
}

function lastNotify(page) {
  return page.$q.notify.mock.calls.at(-1)[0];
}

const form = {
  nom_payment_opc: "Plin",
  desc_payment_opc: "",
  detalles_payment_opc: "987654321",
};

describe("admin payment options", () => {
  beforeEach(() => vi.clearAllMocks());

  it("loads the options", async () => {
    get.mockResolvedValue({ data: { ok: true, data: [yape] } });
    const page = createPage({ paymentOptions: [] });

    await page.loadPaymentOptions();

    expect(get).toHaveBeenCalledWith("/getPaymentsOpts");
    expect(page.paymentOptions).toEqual([yape]);
    expect(page.loadingOptions).toBe(false);
  });

  it("creates a new option with POST", async () => {
    const plin = { id: 4, ...form, qr_url: null };
    post.mockResolvedValue({ data: { ok: true, sMessage: "Creado", data: plin } });
    const page = createPage();

    await page.savePaymentOption(form);

    expect(post).toHaveBeenCalledWith("/payment-options", form);
    expect(page.paymentOptions).toEqual([yape, plin]);
    expect(page.showOptionDialog).toBe(false);
    expect(page.savingOption).toBe(false);
    expect(lastNotify(page)).toMatchObject({ type: "positive", message: "Creado" });
  });

  it("updates the option being edited with PUT", async () => {
    const changed = { ...yape, nom_payment_opc: "Yape BCP" };
    put.mockResolvedValue({ data: { ok: true, data: changed } });
    const page = createPage({ editingOption: yape });

    await page.savePaymentOption({ ...form, nom_payment_opc: "Yape BCP" });

    expect(put).toHaveBeenCalledWith("/payment-options/3", {
      ...form,
      nom_payment_opc: "Yape BCP",
    });
    expect(page.paymentOptions).toEqual([changed]);
  });

  it("does not save twice while a save is running (Enter pressed twice)", async () => {
    const page = createPage({ savingOption: true });

    await page.savePaymentOption(form);

    expect(post).not.toHaveBeenCalled();
    expect(put).not.toHaveBeenCalled();
  });

  it("keeps the dialog open and shows the server error", async () => {
    post.mockRejectedValue({
      response: { status: 400, data: { ok: false, sMessage: "El nombre es obligatorio" } },
    });
    vi.spyOn(console, "error").mockImplementation(() => {});
    const page = createPage();

    await page.savePaymentOption(form);

    expect(page.showOptionDialog).toBe(true);
    expect(lastNotify(page)).toMatchObject({
      type: "negative",
      message: "El nombre es obligatorio",
    });
    expect(page.savingOption).toBe(false);
  });

  it("uploads the QR as multipart with the field 'image'", async () => {
    const withQr = { ...yape, qr_url: "https://res.cloudinary.com/x/upload/qr.png" };
    post.mockResolvedValue({ data: { ok: true, data: withQr } });
    const page = createPage();
    const file = new File(["qr"], "qr.png", { type: "image/png" });

    await page.onQrFilePicked(yape, file);

    const [url, body] = post.mock.calls[0];
    expect(url).toBe("/payment-options/3/qr");
    expect(body).toBeInstanceOf(FormData);
    expect(body.get("image")).toBe(file);
    expect(page.paymentOptions).toEqual([withQr]);
    expect(page.uploadingQrId).toBeNull();
  });

  it("does not upload a QR that is too big", async () => {
    const page = createPage();
    const bigFile = { name: "qr.png", type: "image/png", size: QR_MAX_SIZE + 1 };

    await page.onQrFilePicked(yape, bigFile);

    expect(post).not.toHaveBeenCalled();
    expect(lastNotify(page).message).toBe("La imagen del QR debe pesar 2 MB o menos");
  });

  it("removes the QR with DELETE", async () => {
    const withQr = { ...yape, qr_url: "https://res.cloudinary.com/x/upload/qr.png" };
    del.mockResolvedValue({ data: { ok: true, data: yape } });
    const page = createPage({ paymentOptions: [withQr] });

    await page.removeQr(withQr);

    expect(del).toHaveBeenCalledWith("/payment-options/3/qr");
    expect(page.paymentOptions).toEqual([yape]);
  });
});

describe("admin payment requests amount", () => {
  const request = {
    id: 9,
    cod_boleta: "B-001",
    nom_usuario: "Ana",
    ape_usuario: "Pérez",
    monto_facturado: "30.00",
    monto_cancelado: "10.00",
    monto_declarado: null,
    nro_operacion: "12345678",
  };

  it("uses the pending amount the client was asked to pay", () => {
    expect(methods.amountToApprove(request)).toBe(20);
    expect(methods.amountToApprove({ monto_facturado: "30.00" })).toBe(30);
  });

  it("uses the declared amount when there is one", () => {
    expect(methods.amountToApprove({ ...request, monto_declarado: "15.00" })).toBe(
      "15.00"
    );
    expect(methods.amountToApprove({ ...request, monto_declarado: 0 })).toBe(0);
  });

  it("shows the same amount and the operation number before approving", () => {
    const page = createPage({ showApproveDialog: false, approveForm: {} });

    page.onApproveRequest(request);

    expect(page.approveForm).toEqual({
      id_solicitud: 9,
      cod_boleta: "B-001",
      nom_usuario: "Ana Pérez",
      monto_a_pagar: 20,
      nro_operacion: "12345678",
    });
    expect(page.showApproveDialog).toBe(true);
  });
});
