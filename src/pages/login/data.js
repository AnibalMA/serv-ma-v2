export default function () {
  return {
    email: "",
    password: "",
    showServerStatus: false,
    isLoggingIn: false,
    // Cloudflare Turnstile (anti-robots)
    turnstileToken: "",
    turnstileWidgetId: null,
    turnstileError: "",
    // Google sign-in
    googleError: "",
  };
}
