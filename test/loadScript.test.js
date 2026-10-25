import { describe, it, expect, beforeEach } from "vitest";
import { loadScript } from "src/utils/loadScript";

// jsdom never downloads the file, so we fire the events ourselves
function findScript(src) {
  return document.head.querySelector(`script[src="${src}"]`);
}

describe("loadScript", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
  });

  it("adds one async script tag and resolves when it loads", async () => {
    const src = "https://example.com/a.js";
    const promise = loadScript(src);

    const script = findScript(src);
    expect(script).not.toBeNull();
    expect(script.async).toBe(true);
    expect(script.defer).toBe(true);

    script.dispatchEvent(new Event("load"));
    await expect(promise).resolves.toBeUndefined();
  });

  it("adds the script only once when called again with the same src", async () => {
    const src = "https://example.com/b.js";
    const first = loadScript(src);
    const second = loadScript(src);

    expect(second).toBe(first);
    expect(document.head.querySelectorAll("script").length).toBe(1);

    findScript(src).dispatchEvent(new Event("load"));
    await first;
    expect(loadScript(src)).toBe(first);
  });

  it("rejects when the script cannot be loaded", async () => {
    const src = "https://example.com/c.js";
    const promise = loadScript(src);

    findScript(src).dispatchEvent(new Event("error"));
    await expect(promise).rejects.toThrow(src);
  });

  it("lets you try again after a failure", async () => {
    const src = "https://example.com/d.js";
    const failed = loadScript(src);
    findScript(src).dispatchEvent(new Event("error"));
    await expect(failed).rejects.toThrow();

    const retry = loadScript(src);
    expect(retry).not.toBe(failed);
    expect(document.head.querySelectorAll("script").length).toBe(1);

    findScript(src).dispatchEvent(new Event("load"));
    await expect(retry).resolves.toBeUndefined();
  });
});
