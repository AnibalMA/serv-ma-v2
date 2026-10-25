import { describe, it, expect, vi, beforeEach } from "vitest";

const { loadScript } = vi.hoisted(() => ({ loadScript: vi.fn() }));
vi.mock("src/utils/loadScript", () => ({ loadScript }));

import {
  renderTurnstile,
  resetTurnstile,
  removeTurnstile,
} from "src/utils/turnstile";

// Fake of the Cloudflare Turnstile library (window.turnstile)
function fakeTurnstile() {
  window.turnstile = {
    render: vi.fn(() => "widget-1"),
    reset: vi.fn(),
    remove: vi.fn(),
  };
  return window.turnstile;
}

function pageElement() {
  const el = document.createElement("div");
  document.body.appendChild(el);
  return el;
}

describe("renderTurnstile", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    loadScript.mockReset();
    loadScript.mockResolvedValue();
  });

  it("loads the script and draws the widget in Spanish", async () => {
    const turnstile = fakeTurnstile();
    const el = pageElement();

    const widgetId = await renderTurnstile(el, vi.fn());

    expect(loadScript).toHaveBeenCalledWith(
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
    );
    expect(widgetId).toBe("widget-1");
    expect(turnstile.render).toHaveBeenCalledWith(
      el,
      expect.objectContaining({ language: "es", theme: "dark" })
    );
  });

  it("gives the token, and an empty token when it expires or fails", async () => {
    const turnstile = fakeTurnstile();
    const onToken = vi.fn();

    await renderTurnstile(pageElement(), onToken);
    const options = turnstile.render.mock.calls[0][1];

    options.callback("tok-1");
    expect(onToken).toHaveBeenLastCalledWith("tok-1");
    options["expired-callback"]();
    expect(onToken).toHaveBeenLastCalledWith("");
    options["error-callback"]();
    expect(onToken).toHaveBeenLastCalledWith("");
  });

  it("does not draw anything if the page was closed while loading", async () => {
    const turnstile = fakeTurnstile();
    const el = document.createElement("div"); // not in the page

    const widgetId = await renderTurnstile(el, vi.fn());

    expect(widgetId).toBeNull();
    expect(turnstile.render).not.toHaveBeenCalled();
  });

  it("fails when the script cannot be loaded", async () => {
    fakeTurnstile();
    loadScript.mockRejectedValue(new Error("blocked"));

    await expect(renderTurnstile(pageElement(), vi.fn())).rejects.toThrow(
      "blocked"
    );
  });
});

describe("resetTurnstile / removeTurnstile", () => {
  it("only call Turnstile when there is a widget", () => {
    const turnstile = fakeTurnstile();

    resetTurnstile(null);
    removeTurnstile(null);
    expect(turnstile.reset).not.toHaveBeenCalled();
    expect(turnstile.remove).not.toHaveBeenCalled();

    resetTurnstile("widget-1");
    removeTurnstile("widget-1");
    expect(turnstile.reset).toHaveBeenCalledWith("widget-1");
    expect(turnstile.remove).toHaveBeenCalledWith("widget-1");
  });
});
