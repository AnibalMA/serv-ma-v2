import { describe, it, expect } from "vitest";
import {
  MAX_CAPTURE_SIZE,
  cleanOperationNumber,
  isValidOperationNumber,
  operationNumberRules,
  toCloudinaryDownloadUrl,
} from "src/pages/boletas/helpers";

describe("toCloudinaryDownloadUrl", () => {
  it("adds fl_attachment right after /upload/", () => {
    expect(
      toCloudinaryDownloadUrl(
        "https://res.cloudinary.com/demo/image/upload/v1712345678/pagos/yape.png"
      )
    ).toBe(
      "https://res.cloudinary.com/demo/image/upload/fl_attachment/v1712345678/pagos/yape.png"
    );
  });

  it("keeps the other transformations of the url", () => {
    expect(
      toCloudinaryDownloadUrl(
        "https://res.cloudinary.com/demo/image/upload/w_500/v1/yape.webp"
      )
    ).toBe(
      "https://res.cloudinary.com/demo/image/upload/fl_attachment/w_500/v1/yape.webp"
    );
  });

  it("does not add fl_attachment twice", () => {
    const url =
      "https://res.cloudinary.com/demo/image/upload/fl_attachment/v1/yape.png";
    expect(toCloudinaryDownloadUrl(url)).toBe(url);
  });

  it("returns other urls as they are", () => {
    expect(toCloudinaryDownloadUrl("https://example.com/upload/yape.png")).toBe(
      "https://example.com/upload/yape.png"
    );
    expect(
      toCloudinaryDownloadUrl("https://res.cloudinary.com/demo/image/fetch/yape.png")
    ).toBe("https://res.cloudinary.com/demo/image/fetch/yape.png");
    expect(toCloudinaryDownloadUrl("")).toBe("");
    expect(toCloudinaryDownloadUrl(null)).toBeNull();
  });
});

describe("cleanOperationNumber", () => {
  it("keeps only the digits", () => {
    expect(cleanOperationNumber(" 12345678 ")).toBe("12345678");
    expect(cleanOperationNumber("1234 5678")).toBe("12345678");
    expect(cleanOperationNumber("Nº 12345678")).toBe("12345678");
    expect(cleanOperationNumber("12-34-56")).toBe("123456");
  });

  it("returns an empty string for empty values", () => {
    expect(cleanOperationNumber("")).toBe("");
    expect(cleanOperationNumber(null)).toBe("");
    expect(cleanOperationNumber(undefined)).toBe("");
  });
});

describe("isValidOperationNumber", () => {
  it("needs from 4 to 20 digits", () => {
    expect(isValidOperationNumber("1234")).toBe(true);
    expect(isValidOperationNumber("12345678")).toBe(true);
    expect(isValidOperationNumber("1".repeat(20))).toBe(true);
    expect(isValidOperationNumber("123")).toBe(false);
    expect(isValidOperationNumber("1".repeat(21))).toBe(false);
  });

  it("accepts the number with spaces or text around it", () => {
    expect(isValidOperationNumber("  12345678 ")).toBe(true);
    expect(isValidOperationNumber("1234 5678")).toBe(true);
    expect(isValidOperationNumber("Nº 12345678")).toBe(true);
  });

  it("rejects values without enough digits", () => {
    expect(isValidOperationNumber("")).toBe(false);
    expect(isValidOperationNumber(null)).toBe(false);
    expect(isValidOperationNumber(undefined)).toBe(false);
    expect(isValidOperationNumber("abc")).toBe(false);
    expect(isValidOperationNumber("Nº 12-3")).toBe(false);
  });

  it("works as a Quasar rule", () => {
    const [rule] = operationNumberRules;
    expect(rule("1234 5678")).toBe(true);
    expect(rule("12a")).toBe("Debe tener de 4 a 20 dígitos");
  });
});

describe("MAX_CAPTURE_SIZE", () => {
  it("is 15 MB", () => {
    expect(MAX_CAPTURE_SIZE).toBe(15 * 1024 * 1024);
  });
});
