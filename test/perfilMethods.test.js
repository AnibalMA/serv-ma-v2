import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { post, put, del, squareImageBlob } = vi.hoisted(() => ({
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
  squareImageBlob: vi.fn(),
}));

vi.mock("src/utils/serviceHttp", () => ({
  serviceHttp: { post, put, delete: del },
}));
vi.mock("src/utils/compressImage", () => ({ squareImageBlob }));
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
  avatar: null,
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
    avatarAction: "",
    showAvatarPicker: false,
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

// Gives back the real console.error after the tests that silence it
afterEach(() => vi.restoreAllMocks());

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

  it("sends the chosen género and saves it in the user", async () => {
    post.mockResolvedValue({ data: { ok: true } });
    const page = createPage();
    page.profileForm = { ...page.profileForm, genero: "M" };

    await page.saveProfile();

    expect(post.mock.calls[0][1].genero).toBe("M");
    expect(page.userStore.setUser.mock.calls[0][0].genero).toBe("M");
  });

  it("keeps every field in the form after saving, also an empty género", async () => {
    post.mockResolvedValue({ data: { ok: true } });
    const page = createPage();
    page.profileForm = { ...page.profileForm, genero: "" };

    await page.saveProfile();

    expect(page.profileForm).toEqual({
      nom_usuario: "Ana María",
      ape_usuario: "Pérez",
      email_principal_usuario: "ana@mail.com",
      celular_principal_usuario: "987654321",
      genero: "",
    });
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

describe("perfil avatar: choose a preset", () => {
  beforeEach(() => vi.clearAllMocks());

  it("saves the chosen avatar and closes the picker", async () => {
    put.mockResolvedValue({
      data: {
        ok: true,
        sMessage: "Avatar actualizado",
        data: { avatar: "preset:lorelei-03" },
      },
    });
    const page = createPage({ showAvatarPicker: true });

    await page.chooseAvatar("lorelei-03");

    expect(put).toHaveBeenCalledWith("/my-avatar", { preset: "lorelei-03" });
    expect(page.userStore.setUser).toHaveBeenCalledWith({
      ...user,
      avatar: "preset:lorelei-03",
    });
    expect(lastNotify(page)).toMatchObject({
      type: "positive",
      message: "Avatar actualizado",
    });
    expect(page.showAvatarPicker).toBe(false);
    expect(page.avatarAction).toBe("");
  });

  it("only closes the picker when the avatar is already the current one", async () => {
    const page = createPage({
      user: { ...user, avatar: "preset:lorelei-03" },
      showAvatarPicker: true,
    });

    await page.chooseAvatar("lorelei-03");

    expect(put).not.toHaveBeenCalled();
    expect(page.showAvatarPicker).toBe(false);
  });

  it("keeps the saved avatar when the server answers ok without one", async () => {
    put.mockResolvedValue({ data: { ok: true, sMessage: "Avatar actualizado" } });
    const page = createPage({
      user: { ...user, avatar: "preset:lorelei-01" },
      showAvatarPicker: true,
    });

    await page.chooseAvatar("lorelei-03");

    expect(page.userStore.setUser).not.toHaveBeenCalled();
    expect(lastNotify(page).type).toBe("positive");
    expect(page.showAvatarPicker).toBe(false);
  });

  it("does nothing while another avatar change is running", async () => {
    const page = createPage({ avatarAction: "photo", showAvatarPicker: true });
    const photo = new File(["foto"], "foto.png", { type: "image/png" });

    await page.chooseAvatar("lorelei-03");
    await page.uploadAvatarPhoto(photo);
    await page.resetAvatar();

    expect(put).not.toHaveBeenCalled();
    expect(squareImageBlob).not.toHaveBeenCalled();
    expect(post).not.toHaveBeenCalled();
    expect(del).not.toHaveBeenCalled();
    expect(page.avatarAction).toBe("photo");
  });

  it("shows the server message and keeps the picker open when it fails", async () => {
    put.mockRejectedValue({
      response: { status: 400, data: { ok: false, sMessage: "Avatar no válido" } },
    });
    vi.spyOn(console, "error").mockImplementation(() => {});
    const page = createPage({ showAvatarPicker: true });

    await page.chooseAvatar("lorelei-03");

    expect(page.userStore.setUser).not.toHaveBeenCalled();
    expect(lastNotify(page)).toMatchObject({
      type: "negative",
      message: "Avatar no válido",
    });
    expect(page.showAvatarPicker).toBe(true);
    expect(page.avatarAction).toBe("");
  });

  it("has a friendly message when the server gives no answer", async () => {
    put.mockRejectedValue(new Error("Network Error"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const page = createPage();

    await page.chooseAvatar("lorelei-03");

    expect(lastNotify(page)).toMatchObject({
      type: "negative",
      message: "No se pudo cambiar tu avatar. Intenta nuevamente.",
    });
  });
});

describe("perfil avatar: upload a photo", () => {
  beforeEach(() => vi.clearAllMocks());

  const MB = 1024 * 1024;
  const photo = new File(["foto"], "foto.png", { type: "image/png" });
  const squarePhoto = new Blob(["jpeg"], { type: "image/jpeg" });
  const photoUrl = "https://res.cloudinary.com/demo/image/upload/servma/avatars/7.jpg";

  it("sends a square JPEG as 'image' and saves the photo url", async () => {
    squareImageBlob.mockResolvedValue(squarePhoto);
    post.mockResolvedValue({
      data: { ok: true, sMessage: "Foto actualizada", data: { avatar: photoUrl } },
    });
    const page = createPage();

    await page.uploadAvatarPhoto(photo);

    expect(squareImageBlob).toHaveBeenCalledWith(photo);
    const [url, formData] = post.mock.calls[0];
    expect(url).toBe("/my-avatar/photo");
    expect(formData.get("image").name).toBe("avatar.jpg");
    expect(formData.get("image").type).toBe("image/jpeg");
    expect(page.userStore.setUser).toHaveBeenCalledWith({ ...user, avatar: photoUrl });
    expect(lastNotify(page)).toMatchObject({
      type: "positive",
      message: "Foto actualizada",
    });
    expect(page.avatarAction).toBe("");
  });

  it("does not upload files that are not images", async () => {
    const page = createPage();

    await page.uploadAvatarPhoto(
      new File(["pdf"], "boleta.pdf", { type: "application/pdf" })
    );

    expect(squareImageBlob).not.toHaveBeenCalled();
    expect(post).not.toHaveBeenCalled();
    expect(lastNotify(page)).toMatchObject({
      type: "negative",
      message: "Elige una imagen (JPG, PNG o WEBP)",
    });
  });

  it("tells the user when the photo cannot be opened (e.g. HEIC)", async () => {
    squareImageBlob.mockRejectedValue(new Error("No se pudo abrir la imagen"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const page = createPage();

    await page.uploadAvatarPhoto(photo);

    expect(post).not.toHaveBeenCalled();
    expect(lastNotify(page)).toMatchObject({
      type: "negative",
      message: "No se pudo preparar tu foto. Prueba con otra imagen JPG o PNG.",
    });
    expect(page.avatarAction).toBe("");
  });

  it("does not upload a photo bigger than 2 MB", async () => {
    squareImageBlob.mockResolvedValue({ size: 2 * MB + 1, type: "image/jpeg" });
    const page = createPage();

    await page.uploadAvatarPhoto(photo);

    expect(post).not.toHaveBeenCalled();
    expect(lastNotify(page).type).toBe("negative");
    expect(page.avatarAction).toBe("");
  });

  it("shows the server message when the upload fails", async () => {
    squareImageBlob.mockResolvedValue(squarePhoto);
    post.mockRejectedValue({
      response: { status: 500, data: { ok: false, sMessage: "Error al subir" } },
    });
    vi.spyOn(console, "error").mockImplementation(() => {});
    const page = createPage();

    await page.uploadAvatarPhoto(photo);

    expect(page.userStore.setUser).not.toHaveBeenCalled();
    expect(lastNotify(page)).toMatchObject({
      type: "negative",
      message: "Error al subir",
    });
    expect(page.avatarAction).toBe("");
  });

  it("uploads the picked file and clears the input so it can be picked again", () => {
    const page = createPage({ uploadAvatarPhoto: vi.fn() });
    const event = { target: { files: [photo], value: "C:\\fakepath\\foto.png" } };

    page.onAvatarFilePicked(event);

    expect(page.uploadAvatarPhoto).toHaveBeenCalledWith(photo);
    expect(event.target.value).toBe("");
  });
});

describe("perfil avatar: back to the default picture", () => {
  beforeEach(() => vi.clearAllMocks());

  it("removes the avatar", async () => {
    del.mockResolvedValue({
      data: { ok: true, sMessage: "Avatar eliminado", data: { avatar: null } },
    });
    const page = createPage({ user: { ...user, avatar: "preset:lorelei-01" } });

    await page.resetAvatar();

    expect(del).toHaveBeenCalledWith("/my-avatar");
    expect(page.userStore.setUser).toHaveBeenCalledWith({ ...user, avatar: null });
    expect(lastNotify(page).type).toBe("positive");
    expect(page.avatarAction).toBe("");
  });

  it("keeps the avatar when the server says no", async () => {
    del.mockResolvedValue({ data: { ok: false } });
    const page = createPage({ user: { ...user, avatar: "preset:lorelei-01" } });

    await page.resetAvatar();

    expect(page.userStore.setUser).not.toHaveBeenCalled();
    expect(lastNotify(page)).toMatchObject({
      type: "negative",
      message: "No se pudo quitar tu avatar. Intenta nuevamente.",
    });
  });
});
