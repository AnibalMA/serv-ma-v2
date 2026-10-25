import { describe, it, expect } from "vitest";
import { getAmountToPay } from "src/utils/boletas";

describe("getAmountToPay", () => {
  it("is the billed amount when nothing was paid yet", () => {
    expect(getAmountToPay({ monto_facturado: "35.50", monto_cancelado: null })).toBe(
      35.5
    );
    expect(getAmountToPay({ monto_facturado: 20 })).toBe(20);
  });

  it("subtracts what was already paid", () => {
    expect(getAmountToPay({ monto_facturado: "30.00", monto_cancelado: "10.10" })).toBe(
      19.9
    );
  });

  it("is never negative and is 0 without a boleta", () => {
    expect(getAmountToPay({ monto_facturado: 10, monto_cancelado: 15 })).toBe(0);
    expect(getAmountToPay(null)).toBe(0);
  });
});
