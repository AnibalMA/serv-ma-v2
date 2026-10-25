import { loadScript } from "src/utils/loadScript";

// Empty when Turnstile is turned off (no TURNSTILE_SITE_KEY in the .env file)
export const TURNSTILE_SITE_KEY = process.env.TURNSTILE_SITE_KEY || "";

const TURNSTILE_SCRIPT =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

// Draws the Cloudflare anti-robots check inside el and returns its widget id.
// onToken(token) gets each new token, or "" when it expires or fails.
export async function renderTurnstile(el, onToken) {
  await loadScript(TURNSTILE_SCRIPT);

  // The user may have left the page while the script was loading
  if (!el || !el.isConnected) return null;

  return window.turnstile.render(el, {
    sitekey: TURNSTILE_SITE_KEY,
    language: "es",
    theme: "dark",
    callback: (token) => onToken(token),
    "expired-callback": () => onToken(""),
    "error-callback": () => onToken(""),
  });
}

// Each token works only once, so ask the widget for a new one
export function resetTurnstile(widgetId) {
  if (widgetId) window.turnstile.reset(widgetId);
}

export function removeTurnstile(widgetId) {
  if (widgetId) window.turnstile.remove(widgetId);
}
