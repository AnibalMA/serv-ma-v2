import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("quasar", () => ({
  Notify: { create: vi.fn() },
}));

import { Notify } from "quasar";
import { copyText, copyAndNotify } from "src/utils/clipboard";

// jsdom has no clipboard API, no execCommand and no isSecureContext,
// so each test sets up the browser it wants to pretend to be.
function setClipboard(clipboard) {
  Object.defineProperty(navigator, "clipboard", {
    value: clipboard,
    configurable: true,
  });
}

function setSecureContext(isSecure) {
  Object.defineProperty(window, "isSecureContext", {
    value: isSecure,
    configurable: true,
  });
}

describe("copyText", () => {
  let writeText;

  beforeEach(() => {
    writeText = vi.fn(() => Promise.resolve());
    setClipboard({ writeText });
    setSecureContext(true);
    document.execCommand = vi.fn(() => true);
    document.body.innerHTML = "";
  });

  it("uses the clipboard API when it is available", async () => {
    const copied = await copyText("hola");

    expect(copied).toBe(true);
    expect(writeText).toHaveBeenCalledWith("hola");
    expect(document.execCommand).not.toHaveBeenCalled();
  });

  it("falls back to execCommand when the clipboard API rejects", async () => {
    writeText.mockRejectedValue(new Error("NotAllowedError"));

    const copied = await copyText("hola");

    expect(copied).toBe(true);
    expect(document.execCommand).toHaveBeenCalledWith("copy");
  });

  it("falls back to execCommand when there is no clipboard API", async () => {
    setClipboard(undefined);
    let selectedText;
    document.execCommand = vi.fn(() => {
      selectedText = document.querySelector("textarea").value;
      return true;
    });

    const copied = await copyText("123 456 789");

    expect(copied).toBe(true);
    expect(selectedText).toBe("123 456 789");
  });

  it("does not use the clipboard API outside a secure context", async () => {
    setSecureContext(false);

    const copied = await copyText("hola");

    expect(copied).toBe(true);
    expect(writeText).not.toHaveBeenCalled();
    expect(document.execCommand).toHaveBeenCalledWith("copy");
  });

  it("returns false when execCommand cannot copy", async () => {
    setClipboard(undefined);
    document.execCommand = vi.fn(() => false);

    expect(await copyText("hola")).toBe(false);
  });

  it("returns false instead of throwing when execCommand throws", async () => {
    setClipboard(undefined);
    document.execCommand = vi.fn(() => {
      throw new Error("not supported");
    });

    expect(await copyText("hola")).toBe(false);
  });

  it("removes the hidden textarea afterwards", async () => {
    setClipboard(undefined);

    await copyText("hola");
    expect(document.querySelector("textarea")).toBeNull();

    document.execCommand = vi.fn(() => {
      throw new Error("not supported");
    });
    await copyText("hola");
    expect(document.querySelector("textarea")).toBeNull();
  });

  it("treats null and undefined as empty text", async () => {
    await copyText(null);
    await copyText(undefined);

    expect(writeText).toHaveBeenNthCalledWith(1, "");
    expect(writeText).toHaveBeenNthCalledWith(2, "");
  });
});

describe("copyAndNotify", () => {
  beforeEach(() => {
    setSecureContext(true);
    document.execCommand = vi.fn(() => false);
    Notify.create.mockClear();
  });

  it("shows a success message when it copies", async () => {
    setClipboard({ writeText: vi.fn(() => Promise.resolve()) });

    const copied = await copyAndNotify("hola");

    expect(copied).toBe(true);
    expect(Notify.create).toHaveBeenCalledWith({
      message: "Copiado al portapapeles",
      color: "positive",
      icon: "check",
      position: "bottom",
    });
  });

  it("uses the custom success message when given", async () => {
    setClipboard({ writeText: vi.fn(() => Promise.resolve()) });

    await copyAndNotify("hola", "Texto copiado");

    expect(Notify.create).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Texto copiado" })
    );
  });

  it("explains how to copy manually when it fails", async () => {
    setClipboard(undefined);

    const copied = await copyAndNotify("hola");

    expect(copied).toBe(false);
    expect(Notify.create).toHaveBeenCalledWith({
      message:
        "No se pudo copiar. Mantén presionado el texto para copiarlo manualmente.",
      color: "negative",
      icon: "error",
      position: "bottom",
    });
  });
});
