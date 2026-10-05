import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("src/stores/user", () => ({ useUserStore: vi.fn() }));
vi.mock("src/utils/serviceHttp", () => ({ serviceHttp: {} }));
vi.mock("src/utils/clipboard", () => ({
  copyAndNotify: vi.fn(() => Promise.resolve(true)),
}));

import { copyAndNotify } from "src/utils/clipboard";
import methods from "src/pages/boletas/methods";

// Minimal stand-in for the component's "this"
function createPage() {
  return {
    extractNumericData: methods.extractNumericData,
    $q: { notify: vi.fn() },
  };
}

describe("boletas extractNumericData", () => {
  it("finds a number with keyword (cuenta)", () => {
    expect(methods.extractNumericData("Cuenta: 191-1234567-0-12")).toBe(
      "191-1234567-0-12"
    );
  });

  it("finds a long number with spaces when there is no keyword", () => {
    expect(methods.extractNumericData("Yape 987 654 321")).toBe("987 654 321");
  });

  it("keeps the dashes of a number without keyword", () => {
    expect(methods.extractNumericData("BCP 191-12345678-0-12")).toBe(
      "191-12345678-0-12"
    );
  });

  it("returns null when there is no long number", () => {
    expect(methods.extractNumericData("Pago en efectivo")).toBeNull();
    expect(methods.extractNumericData("")).toBeNull();
  });

  it("ignores runs of only spaces or dashes", () => {
    expect(
      methods.extractNumericData("Pago en efectivo -------- gracias")
    ).toBeNull();
    expect(methods.extractNumericData("Nota:          fin")).toBeNull();
  });

  it("does not include trailing dashes or spaces around the number", () => {
    expect(methods.extractNumericData("Yape: -- 987654321 --")).toBe(
      "987654321"
    );
  });
});

describe("boletas copyToClipboard", () => {
  beforeEach(() => {
    copyAndNotify.mockClear();
  });

  it("copies only the numbers and shows them in the message", async () => {
    const page = createPage();

    await methods.copyToClipboard.call(page, "Yape 987 654 321");

    expect(copyAndNotify).toHaveBeenCalledWith(
      "987 654 321",
      "Copiado: 987 654 321"
    );
  });

  it("warns and does not copy when there are no numbers", async () => {
    const page = createPage();

    await methods.copyToClipboard.call(page, "Pago en efectivo");

    expect(copyAndNotify).not.toHaveBeenCalled();
    expect(page.$q.notify).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "No se encontraron datos numéricos para copiar",
      })
    );
  });
});
