import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("src/utils/serviceHttp", () => ({ serviceHttp: {} }));
vi.mock("src/utils/clipboard", () => ({
  copyAndNotify: vi.fn(() => Promise.resolve(true)),
}));

import { copyAndNotify } from "src/utils/clipboard";
import platformsPage from "src/pages/platforms/index";

describe("copy buttons use the shared clipboard helper", () => {
  beforeEach(() => {
    copyAndNotify.mockClear();
  });

  it("platforms: copies the profile info for WhatsApp", async () => {
    const platform = { nombre: "Netflix" };
    const grupo = {
      cuentas: [{ correo_acc: "user@mail.com", pass_acc: "secreto" }],
    };
    const perfil = { perfil: "Perfil 1", pin: "1234", payday: 15 };

    await platformsPage.methods.copyPerfilInfo(platform, grupo, perfil);

    const [text, message] = copyAndNotify.mock.calls[0];
    expect(text).toContain("Netflix");
    expect(text).toContain("user@mail.com");
    expect(text).toContain("secreto");
    expect(text).toContain("1234");
    expect(message).toBe("Información del perfil copiada");
  });
});
