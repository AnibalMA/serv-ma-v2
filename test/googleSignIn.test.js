import { describe, it, expect, vi, beforeEach } from "vitest";

// Same fake function even after vi.resetModules()
const { loadScript } = vi.hoisted(() => ({ loadScript: vi.fn() }));
vi.mock("src/utils/loadScript", () => ({ loadScript }));

// Fake of the Google Identity Services library (window.google)
function fakeGoogle() {
  const id = { initialize: vi.fn(), renderButton: vi.fn() };
  window.google = { accounts: { id } };
  return id;
}

// Fresh module each time, so "already initialized" starts as false
async function importHelper() {
  vi.resetModules();
  return import("src/utils/googleSignIn");
}

describe("renderGoogleButton", () => {
  beforeEach(() => {
    loadScript.mockClear();
    loadScript.mockImplementation(() => Promise.resolve());
  });

  it("loads the Google script and draws the button with our defaults", async () => {
    const google = fakeGoogle();
    const { renderGoogleButton } = await importHelper();
    const el = document.createElement("div");

    await renderGoogleButton(el, vi.fn(), { text: "continue_with" });

    expect(loadScript).toHaveBeenCalledWith(
      "https://accounts.google.com/gsi/client"
    );
    expect(google.initialize).toHaveBeenCalledTimes(1);
    expect(google.renderButton).toHaveBeenCalledWith(
      el,
      expect.objectContaining({
        theme: "outline",
        size: "large",
        shape: "pill",
        locale: "es",
        text: "continue_with",
      })
    );
  });

  it("never makes the button wider than 400px (Google's limit)", async () => {
    const google = fakeGoogle();
    const { renderGoogleButton } = await importHelper();
    const el = document.createElement("div");
    Object.defineProperty(el, "offsetWidth", { value: 900 });

    await renderGoogleButton(el, vi.fn());

    expect(google.renderButton.mock.calls[0][1].width).toBe(400);
  });

  it("initializes Google once and sends the credential to the latest handler", async () => {
    const google = fakeGoogle();
    const { renderGoogleButton } = await importHelper();
    const firstHandler = vi.fn();
    const secondHandler = vi.fn();

    await renderGoogleButton(document.createElement("div"), firstHandler);
    await renderGoogleButton(document.createElement("div"), secondHandler);

    expect(google.initialize).toHaveBeenCalledTimes(1);

    const { callback } = google.initialize.mock.calls[0][0];
    callback({ credential: "google-token" });

    expect(secondHandler).toHaveBeenCalledWith("google-token");
    expect(firstHandler).not.toHaveBeenCalled();
  });

  it("fails when the script cannot be loaded (e.g. ad-blocker)", async () => {
    const google = fakeGoogle();
    loadScript.mockImplementation(() => Promise.reject(new Error("blocked")));
    const { renderGoogleButton } = await importHelper();

    await expect(
      renderGoogleButton(document.createElement("div"), vi.fn())
    ).rejects.toThrow("blocked");
    expect(google.renderButton).not.toHaveBeenCalled();
  });
});
