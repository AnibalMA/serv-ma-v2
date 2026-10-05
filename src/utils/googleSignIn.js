import { loadScript } from "src/utils/loadScript";

// Empty when Google sign-in is turned off (no GOOGLE_CLIENT_ID in the .env file)
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";

const GOOGLE_SCRIPT = "https://accounts.google.com/gsi/client";

// Google wants initialize() to be called only once per page.
// Its callback sends the credential to the page that drew the last button.
let isInitialized = false;
let currentHandler = null;

// Draws the "Sign in with Google" button inside el.
// onCredential(credential) runs when the user picks a Google account.
export async function renderGoogleButton(el, onCredential, options = {}) {
  await loadScript(GOOGLE_SCRIPT);
  currentHandler = onCredential;

  if (!isInitialized) {
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => currentHandler(response.credential),
    });
    isInitialized = true;
  }

  window.google.accounts.id.renderButton(el, {
    theme: "outline",
    size: "large",
    shape: "pill",
    locale: "es",
    // As wide as its container, but Google allows 400px at most
    width: Math.min(el.offsetWidth || 300, 400),
    ...options,
  });
}
