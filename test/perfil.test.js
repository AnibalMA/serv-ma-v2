import { describe, it, expect } from "vitest";
import {
  profileFormFromUser,
  cleanProfileForm,
  profileRules,
  getPasswordChangeError,
  getProfileErrorMessage,
} from "src/pages/perfil/helpers";

// Runs Quasar-style rules: returns the first error message, or true
function check(rules, value) {
  for (const rule of rules) {
    const result = rule(value);
    if (result !== true) return result;
  }
  return true;
}

describe("profileFormFromUser", () => {
  it("copies the editable fields of the logged-in user", () => {
    const user = {
      id: 7,
      rol: "ROL_USER",
      nom_usuario: "Ana",
      ape_usuario: "Pérez",
      email_principal_usuario: "ana@mail.com",
      celular_principal_usuario: "987654321",
    };

    expect(profileFormFromUser(user)).toEqual({
      nom_usuario: "Ana",
      ape_usuario: "Pérez",
      email_principal_usuario: "ana@mail.com",
      celular_principal_usuario: "987654321",
    });
  });

  it("uses empty strings for missing values", () => {
    expect(profileFormFromUser({ nom_usuario: "Ana", ape_usuario: null })).toEqual({
      nom_usuario: "Ana",
      ape_usuario: "",
      email_principal_usuario: "",
      celular_principal_usuario: "",
    });
    expect(profileFormFromUser(null).nom_usuario).toBe("");
  });
});

describe("cleanProfileForm", () => {
  it("trims the spaces of every field", () => {
    expect(
      cleanProfileForm({
        nom_usuario: "  Ana ",
        ape_usuario: "Pérez  ",
        email_principal_usuario: " ana@mail.com",
        celular_principal_usuario: " 987654321 ",
      })
    ).toEqual({
      nom_usuario: "Ana",
      ape_usuario: "Pérez",
      email_principal_usuario: "ana@mail.com",
      celular_principal_usuario: "987654321",
    });
  });
});

describe("profileRules (same limits as the backend)", () => {
  it("name: between 2 and 100 letters", () => {
    expect(check(profileRules.name, "")).toEqual(expect.any(String));
    expect(check(profileRules.name, " A ")).toEqual(expect.any(String));
    expect(check(profileRules.name, "Ana")).toBe(true);
    expect(check(profileRules.name, "a".repeat(101))).toEqual(expect.any(String));
  });

  it("email: required, valid and up to 150 characters", () => {
    expect(check(profileRules.email, "")).toEqual(expect.any(String));
    expect(check(profileRules.email, "ana")).toEqual(expect.any(String));
    expect(check(profileRules.email, "ana@mail.c")).toEqual(expect.any(String));
    expect(check(profileRules.email, "ana@mail.com")).toBe(true);
    expect(check(profileRules.email, "Ana@Mail.PE")).toBe(true);
    expect(check(profileRules.email, "a".repeat(145) + "@mail.com")).toEqual(
      expect.any(String)
    );
  });

  it("phone: between 8 and 15 characters", () => {
    expect(check(profileRules.phone, "")).toEqual(expect.any(String));
    expect(check(profileRules.phone, "1234567")).toEqual(expect.any(String));
    expect(check(profileRules.phone, " 987654321 ")).toBe(true);
    expect(check(profileRules.phone, "1".repeat(16))).toEqual(expect.any(String));
  });
});

describe("getPasswordChangeError", () => {
  const valid = {
    currentPassword: "vieja123",
    newPassword: "nueva123",
    confirmPassword: "nueva123",
  };

  it("returns an empty string when everything is fine", () => {
    expect(getPasswordChangeError(valid)).toBe("");
  });

  it("asks to fill every field", () => {
    for (const field of Object.keys(valid)) {
      expect(getPasswordChangeError({ ...valid, [field]: "" })).toBe(
        "Por favor complete todos los campos"
      );
    }
  });

  it("checks that both new passwords match", () => {
    expect(getPasswordChangeError({ ...valid, confirmPassword: "otra123" })).toBe(
      "Las contraseñas no coinciden"
    );
  });

  it("asks for a new password between 6 and 72 characters", () => {
    const message = "La nueva contraseña debe tener entre 6 y 72 caracteres";
    const withNew = (password) => ({
      currentPassword: "vieja123",
      newPassword: password,
      confirmPassword: password,
    });

    expect(getPasswordChangeError(withNew("abc12"))).toBe(message);
    expect(getPasswordChangeError(withNew("a".repeat(73)))).toBe(message);
    expect(getPasswordChangeError(withNew("abc123"))).toBe("");
    expect(getPasswordChangeError(withNew("a".repeat(72)))).toBe("");
  });

  it("does not allow the same password again", () => {
    expect(
      getPasswordChangeError({
        currentPassword: "igual123",
        newPassword: "igual123",
        confirmPassword: "igual123",
      })
    ).toBe("La nueva contraseña debe ser diferente a la actual");
  });
});

describe("getProfileErrorMessage", () => {
  it("shows the first field error sent by the backend (HTTP 412)", () => {
    const response = {
      ok: false,
      sMessage: "(*) Campos con errores o sin valores",
      data: [
        { attribute: "celular_principal_usuario", error: "debe tener entre 8 y 15 caracteres" },
        { attribute: "nom_usuario", error: "es requerido" },
      ],
    };

    expect(getProfileErrorMessage(response)).toBe(
      "Celular: debe tener entre 8 y 15 caracteres"
    );
  });

  it("uses the server message when there are no field errors", () => {
    expect(
      getProfileErrorMessage({
        ok: false,
        sMessage: "El email ya está registrado por otro usuario",
        data: [],
      })
    ).toBe("El email ya está registrado por otro usuario");
  });

  it("has a friendly message when there is no answer at all", () => {
    expect(getProfileErrorMessage(undefined)).toBe(
      "No se pudieron guardar tus datos. Intenta nuevamente."
    );
  });
});
