import { describe, it, expect, vi, beforeEach } from "vitest";

const { post } = vi.hoisted(() => ({ post: vi.fn() }));

vi.mock("src/utils/serviceHttp", () => ({ serviceHttp: { post } }));
vi.mock("src/utils/googleSignIn", () => ({
  GOOGLE_CLIENT_ID: "",
  renderGoogleButton: vi.fn(),
}));

import methods from "src/pages/perfil/methods";

const user = {
  id: 7,
  rol: "ROL_USER",
  nom_usuario: "Ana",
  ape_usuario: "Pérez",
  email_principal_usuario: "ana@mail.com",
  celular_principal_usuario: "987654321",
  bGoogleLinked: false,
  sGoogleEmail: null,
};

// Minimal stand-in for the component's "this"
function createPage(overrides = {}) {
  return {
    ...methods,
    user,
    userStore: { setUser: vi.fn(), logout: vi.fn() },
    profileForm: {
      nom_usuario: " Ana María ",
      ape_usuario: "Pérez",
      email_principal_usuario: "ana@mail.com",
      celular_principal_usuario: "987654321",
    },
    passwordForm: {
      currentPassword: "vieja123",
      newPassword: "nueva123",
      confirmPassword: "nueva123",
    },
    $q: {
      notify: vi.fn(),
      loading: { show: vi.fn(), hide: vi.fn() },
    },
    $router: { replace: vi.fn() },
    ...overrides,
  };
}

function lastNotify(page) {
  return page.$q.notify.mock.calls.at(-1)[0];
}

describe("perfil saveProfile", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sends my id with the cleaned data and updates the saved user", async () => {
    post.mockResolvedValue({ data: { ok: true, sMessage: "Listo" } });
    const page = createPage();

    await page.saveProfile();

    expect(post).toHaveBeenCalledWith("/update-user-profile", {
      id_usuario: 7,
      nom_usuario: "Ana María",
      ape_usuario: "Pérez",
      email_principal_usuario: "ana@mail.com",
      celular_principal_usuario: "987654321",
    });
    expect(page.userStore.setUser).toHaveBeenCalledWith({
      ...user,
      nom_usuario: "Ana María",
    });
    expect(lastNotify(page).type).toBe("positive");
    expect(page.savingProfile).toBe(false);
  });

  it("shows the server message and keeps the user when it fails", async () => {
    post.mockRejectedValue({
      response: { data: { ok: false, sMessage: "El email ya está registrado" } },
    });
    vi.spyOn(console, "error").mockImplementation(() => {});
    const page = createPage();

    await page.saveProfile();

    expect(page.userStore.setUser).not.toHaveBeenCalled();
    expect(lastNotify(page)).toMatchObject({
      type: "negative",
      message: "El email ya está registrado",
    });
    expect(page.savingProfile).toBe(false);
  });
  it("shows the first field error when the backend rejects a field (412)", async () => {
    post.mockRejectedValue({
      response: {
        status: 412,
        data: {
          ok: false,
          sMessage: "(*) Campos con errores o sin valores",
          data: [
            { attribute: "email_principal_usuario", error: "debe ser un email válido" },
          ],
        },
      },
    });
    vi.spyOn(console, "error").mockImplementation(() => {});
    const page = createPage();

    await page.saveProfile();

    expect(lastNotify(page).message).toBe(
      "Correo electrónico: debe ser un email válido"
    );
  });
});

describe("perfil changePassword", () => {
  beforeEach(() => vi.clearAllMocks());

  it("does not call the server when the form has an error", async () => {
    const page = createPage({
      passwordForm: {
        currentPassword: "vieja123",
        newPassword: "nueva123",
        confirmPassword: "otra",
      },
    });

    await page.changePassword();

    expect(post).not.toHaveBeenCalled();
    expect(lastNotify(page).message).toBe("Las contraseñas no coinciden");
  });

  it("sends the current and new password and clears the form", async () => {
    post.mockResolvedValue({ data: { ok: true, sMessage: "Contraseña actualizada" } });
    const page = createPage();

    await page.changePassword();

    expect(post).toHaveBeenCalledWith("/change-my-password", {
      currentPassword: "vieja123",
      newPassword: "nueva123",
    });
    expect(page.passwordForm).toEqual({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    expect(lastNotify(page).type).toBe("positive");
  });

  it("keeps the form when the current password is wrong", async () => {
    post.mockResolvedValue({
      data: { ok: false, sMessage: "La contraseña actual no es correcta" },
    });
    const page = createPage();

    await page.changePassword();

    expect(page.passwordForm.currentPassword).toBe("vieja123");
    expect(lastNotify(page)).toMatchObject({
      type: "negative",
      message: "La contraseña actual no es correcta",
    });
  });
});

describe("perfil Google account", () => {
  beforeEach(() => vi.clearAllMocks());

  it("links Google and saves the linked email", async () => {
    post.mockResolvedValue({
      data: {
        ok: true,
        sMessage: "Cuenta vinculada",
        data: { bGoogleLinked: true, sGoogleEmail: "ana@gmail.com" },
      },
    });
    const page = createPage();

    await page.linkGoogle("google-token");

    expect(post).toHaveBeenCalledWith("/link-google", {
      credential: "google-token",
    });
    expect(page.userStore.setUser).toHaveBeenCalledWith({
      ...user,
      bGoogleLinked: true,
      sGoogleEmail: "ana@gmail.com",
    });
  });

  it("unlinks Google and forgets the email", async () => {
    post.mockResolvedValue({
      data: { ok: true, data: { bGoogleLinked: false, sGoogleEmail: null } },
    });
    const page = createPage({
      user: { ...user, bGoogleLinked: true, sGoogleEmail: "ana@gmail.com" },
    });

    await page.confirmUnlinkGoogle();

    expect(post).toHaveBeenCalledWith("/unlink-google");
    expect(page.userStore.setUser).toHaveBeenCalledWith({
      ...user,
      bGoogleLinked: false,
      sGoogleEmail: null,
    });
  });

  it("does not change the user when linking fails", async () => {
    post.mockResolvedValue({
      data: { ok: false, sMessage: "Esa cuenta de Google ya está en uso" },
    });
    const page = createPage();

    await page.linkGoogle("google-token");

    expect(page.userStore.setUser).not.toHaveBeenCalled();
    expect(lastNotify(page).message).toBe("Esa cuenta de Google ya está en uso");
    expect(page.$q.loading.hide).toHaveBeenCalled();
  });
});
