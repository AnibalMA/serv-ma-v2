import { describe, it, expect, vi, beforeEach } from "vitest";

const { setUser, post } = vi.hoisted(() => ({
  setUser: vi.fn(),
  post: vi.fn(),
}));

vi.mock("src/stores/user", () => ({ useUserStore: () => ({ setUser }) }));
vi.mock("stores/user", () => ({ useUserStore: () => ({ setUser }) }));
vi.mock("src/utils/serviceHttp", () => ({ serviceHttp: { post } }));
vi.mock("src/utils/loadScript", () => ({ loadScript: vi.fn() }));
vi.mock("src/utils/googleSignIn", () => ({
  GOOGLE_CLIENT_ID: "",
  renderGoogleButton: vi.fn(),
}));

import loginPage from "src/pages/login/index";
import methods from "src/pages/login/methods";

// Minimal stand-in for the component's "this"
function createPage(overrides = {}) {
  return {
    ...methods,
    email: "ana@mail.com",
    password: "secreto",
    isLoginDisabled: false,
    turnstileToken: "",
    turnstileWidgetId: null,
    $q: { loading: { show: vi.fn(), hide: vi.fn() }, notify: vi.fn() },
    $router: { replace: vi.fn() },
    ...overrides,
  };
}

function lastNotifyMessage(page) {
  return page.$q.notify.mock.calls.at(-1)[0].message;
}

describe("login (email + password)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.turnstile = { reset: vi.fn() };
  });

  it("does nothing while the button is disabled (pressing Enter)", async () => {
    const page = createPage({ isLoginDisabled: true });

    await page.login();

    expect(post).not.toHaveBeenCalled();
  });

  it("marks the page as busy while the request is running", async () => {
    let finishRequest;
    post.mockReturnValue(
      new Promise((resolve) => {
        finishRequest = resolve;
      })
    );
    const page = createPage({ isLoggingIn: false });

    const request = page.login();
    expect(page.isLoggingIn).toBe(true);

    finishRequest({ data: { ok: false, sMessage: "Error" } });
    await request;
    expect(page.isLoggingIn).toBe(false);
  });

  it("sends the Turnstile token with the email and password", async () => {
    post.mockResolvedValue({ data: { ok: true, data: { id: 1 } } });
    const page = createPage({ turnstileToken: "tok-1" });

    await page.login();

    expect(post).toHaveBeenCalledWith("/loginUser", {
      sEmail: "ana@mail.com",
      sPwd: "secreto",
      sTurnstileToken: "tok-1",
    });
  });

  it("saves the user and goes to the dashboard", async () => {
    post.mockResolvedValue({
      data: { ok: true, sMessage: "Bienvenido", data: { id: 1 } },
    });
    const page = createPage();

    await page.login();

    expect(setUser).toHaveBeenCalledWith({ id: 1 });
    expect(page.$router.replace).toHaveBeenCalledWith("/dashboard");
    expect(page.$q.loading.hide).toHaveBeenCalled();
  });

  it("sends first-time users to change their password", async () => {
    post.mockResolvedValue({
      data: { ok: true, data: { bFirstTime: true, sTokenPwd: "abc" } },
    });
    const page = createPage();

    await page.login();

    expect(setUser).not.toHaveBeenCalled();
    expect(page.$router.replace).toHaveBeenCalledWith("/reset-password/abc");
  });

  it("asks Turnstile for a new token after wrong credentials", async () => {
    post.mockResolvedValue({
      data: { ok: false, sMessage: "Credenciales incorrectas" },
    });
    const page = createPage({ turnstileToken: "tok-1", turnstileWidgetId: "w1" });

    await page.login();

    expect(lastNotifyMessage(page)).toBe("Credenciales incorrectas");
    expect(window.turnstile.reset).toHaveBeenCalledWith("w1");
    expect(page.turnstileToken).toBe("");
    expect(page.$router.replace).not.toHaveBeenCalled();
  });

  it("asks Turnstile for a new token when the request fails", async () => {
    post.mockRejectedValue({
      response: {
        data: { sMessage: "Verificación anti-robots fallida. Intenta nuevamente." },
      },
    });
    const page = createPage({ turnstileToken: "tok-1", turnstileWidgetId: "w1" });
    vi.spyOn(console, "error").mockImplementation(() => {});

    await page.login();

    expect(lastNotifyMessage(page)).toBe(
      "Verificación anti-robots fallida. Intenta nuevamente."
    );
    expect(window.turnstile.reset).toHaveBeenCalledWith("w1");
    expect(page.turnstileToken).toBe("");
    expect(page.$q.loading.hide).toHaveBeenCalled();
  });

  it("does not touch Turnstile when it is turned off", async () => {
    post.mockResolvedValue({ data: { ok: false, sMessage: "Error" } });
    const page = createPage();

    await page.login();

    expect(window.turnstile.reset).not.toHaveBeenCalled();
  });
});

describe("loginWithGoogle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends the Google credential and uses the same success flow", async () => {
    post.mockResolvedValue({
      data: { ok: true, sMessage: "Bienvenido", data: { id: 2 } },
    });
    const page = createPage();

    await page.loginWithGoogle("google-token");

    expect(post).toHaveBeenCalledWith("/loginGoogle", {
      credential: "google-token",
    });
    expect(setUser).toHaveBeenCalledWith({ id: 2 });
    expect(page.$router.replace).toHaveBeenCalledWith("/dashboard");
  });

  it("shows the server message when Google login fails", async () => {
    post.mockResolvedValue({
      data: { ok: false, sMessage: "Tu cuenta de Google no está vinculada" },
    });
    const page = createPage();

    await page.loginWithGoogle("google-token");

    expect(lastNotifyMessage(page)).toBe(
      "Tu cuenta de Google no está vinculada"
    );
    expect(setUser).not.toHaveBeenCalled();
    expect(page.$q.loading.hide).toHaveBeenCalled();
    expect(page.isLoggingIn).toBe(false);
  });

  it("ignores Google while another login is running", async () => {
    const page = createPage({ isLoggingIn: true });

    await page.loginWithGoogle("google-token");

    expect(post).not.toHaveBeenCalled();
  });
});

describe("isLoginDisabled", () => {
  const { isLoginDisabled } = loginPage.computed;
  const online = { isOnline: true, isInMaintenance: false };

  it("needs a Turnstile token only when Turnstile is on", () => {
    const base = { isFormValid: true, serverStatus: online };

    expect(
      isLoginDisabled.call({ ...base, isTurnstileEnabled: false, turnstileToken: "" })
    ).toBe(false);
    expect(
      isLoginDisabled.call({ ...base, isTurnstileEnabled: true, turnstileToken: "" })
    ).toBe(true);
    expect(
      isLoginDisabled.call({ ...base, isTurnstileEnabled: true, turnstileToken: "t" })
    ).toBe(false);
  });

  it("stays disabled with an incomplete form or server offline", () => {
    expect(
      isLoginDisabled.call({
        isFormValid: false,
        serverStatus: online,
        isTurnstileEnabled: false,
      })
    ).toBe(true);
    expect(
      isLoginDisabled.call({
        isFormValid: true,
        serverStatus: { isOnline: false, isInMaintenance: false },
        isTurnstileEnabled: false,
      })
    ).toBe(true);
  });

  it("stays disabled while a login request is running (double Enter)", () => {
    expect(
      isLoginDisabled.call({
        isFormValid: true,
        serverStatus: online,
        isTurnstileEnabled: false,
        isLoggingIn: true,
      })
    ).toBe(true);
  });
});

describe("isWaitingForTurnstile", () => {
  const { isWaitingForTurnstile } = loginPage.computed;

  it("is true only while Turnstile is on, loaded and without a token", () => {
    const waiting = { isTurnstileEnabled: true, turnstileToken: "", turnstileError: "" };

    expect(isWaitingForTurnstile.call(waiting)).toBe(true);
    expect(isWaitingForTurnstile.call({ ...waiting, turnstileToken: "t" })).toBe(false);
    expect(
      isWaitingForTurnstile.call({ ...waiting, turnstileError: "No se pudo cargar" })
    ).toBe(false);
    expect(
      isWaitingForTurnstile.call({ ...waiting, isTurnstileEnabled: false })
    ).toBe(false);
  });
});
