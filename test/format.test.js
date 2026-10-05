import { describe, it, expect } from "vitest";
import { formatMoney, formatDate } from "src/utils/format";

// Run the date tests as if we were in Lima (UTC-5), where the bug happened
process.env.TZ = "America/Lima";

// Intl puts a non-breaking space between "S/" and the number
const NBSP = "\u00a0";

describe("formatMoney", () => {
  it("uses comma for thousands and dot for decimals", () => {
    expect(formatMoney(1234.5)).toBe(`S/${NBSP}1,234.50`);
  });

  it("accepts numeric strings", () => {
    expect(formatMoney("1234.5")).toBe(`S/${NBSP}1,234.50`);
    expect(formatMoney("25")).toBe(`S/${NBSP}25.00`);
  });

  it("shows zero for empty or invalid values", () => {
    expect(formatMoney(null)).toBe(`S/${NBSP}0.00`);
    expect(formatMoney(undefined)).toBe(`S/${NBSP}0.00`);
    expect(formatMoney("")).toBe(`S/${NBSP}0.00`);
    expect(formatMoney("abc")).toBe(`S/${NBSP}0.00`);
  });

  it("formats zero", () => {
    expect(formatMoney(0)).toBe(`S/${NBSP}0.00`);
  });
});

describe("formatDate", () => {
  it("runs in Lima time, where new Date('YYYY-MM-DD') shows the previous day", () => {
    expect(new Date("2024-05-01").getDate()).toBe(30);
  });

  it("keeps the same day for date-only strings (no UTC shift)", () => {
    expect(formatDate("2024-05-01")).toBe("01/05/2024");
    expect(formatDate("2024-12-31")).toBe("31/12/2024");
  });

  it("formats full datetime strings", () => {
    expect(formatDate("2024-05-01T15:30:00-05:00")).toBe("01/05/2024");
  });

  it("keeps the day of DATE columns sent as UTC midnight (backend on Heroku runs in UTC)", () => {
    expect(formatDate("2024-05-01T00:00:00.000Z")).toBe("01/05/2024");
    expect(formatDate("2024-05-01T00:00:00Z")).toBe("01/05/2024");
  });

  it("shows other UTC times in Lima time", () => {
    // 03:30 UTC is 22:30 of the previous day in Lima
    expect(formatDate("2024-05-01T03:30:00.000Z")).toBe("30/04/2024");
  });

  it("formats Date objects", () => {
    expect(formatDate(new Date(2024, 0, 9))).toBe("09/01/2024");
  });

  it("returns an empty string for empty or invalid values", () => {
    expect(formatDate(null)).toBe("");
    expect(formatDate(undefined)).toBe("");
    expect(formatDate("")).toBe("");
    expect(formatDate("not a date")).toBe("");
  });
});
