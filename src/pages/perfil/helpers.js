// Small helpers for the "Mi perfil" page (no Vue here, easy to test)

const PROFILE_FIELDS = [
  "nom_usuario",
  "ape_usuario",
  "email_principal_usuario",
  "celular_principal_usuario",
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

// Names shown when the backend rejects a field (HTTP 412)
const FIELD_LABELS = {
  nom_usuario: "Nombre",
  ape_usuario: "Apellido",
  email_principal_usuario: "Correo electrónico",
  celular_principal_usuario: "Celular",
};

// Form values taken from the logged-in user
export function profileFormFromUser(user) {
  const form = {};
  PROFILE_FIELDS.forEach((field) => {
    form[field] = user?.[field] || "";
  });
  return form;
}

// Same fields without the extra spaces, ready to send
export function cleanProfileForm(form) {
  const clean = {};
  PROFILE_FIELDS.forEach((field) => {
    clean[field] = String(form[field] || "").trim();
  });
  return clean;
}

function textLength(value) {
  return String(value || "").trim().length;
}

// Quasar input rules, with the same limits as the backend
export const profileRules = {
  name: [
    (v) => textLength(v) >= 2 || "Escribe al menos 2 letras",
    (v) => textLength(v) <= 100 || "Máximo 100 caracteres",
  ],
  email: [
    (v) => EMAIL_REGEX.test(String(v || "").trim()) || "Escribe un correo válido",
    (v) => textLength(v) <= 150 || "Máximo 150 caracteres",
  ],
  phone: [
    (v) =>
      (textLength(v) >= 8 && textLength(v) <= 15) ||
      "Debe tener entre 8 y 15 caracteres",
  ],
};

// One message for the user from the backend answer of /update-user-profile.
// Field errors (HTTP 412) come as data: [{ attribute, error }].
export function getProfileErrorMessage(response) {
  const fieldError = Array.isArray(response?.data) ? response.data[0] : null;
  if (fieldError?.error) {
    const label = FIELD_LABELS[fieldError.attribute] || fieldError.attribute;
    return label + ": " + fieldError.error;
  }
  return (
    response?.sMessage || "No se pudieron guardar tus datos. Intenta nuevamente."
  );
}

// Rules to change the password from Mi perfil: all fields filled,
// a new password of 6 to 72 characters, typed twice the same.
// Returns the error message, or "" when everything is fine.
export function getPasswordChangeError({
  currentPassword,
  newPassword,
  confirmPassword,
}) {
  if (!currentPassword || !newPassword || !confirmPassword) {
    return "Por favor complete todos los campos";
  }
  if (newPassword.length < 6 || newPassword.length > 72) {
    return "La nueva contraseña debe tener entre 6 y 72 caracteres";
  }
  if (newPassword !== confirmPassword) {
    return "Las contraseñas no coinciden";
  }
  if (newPassword === currentPassword) {
    return "La nueva contraseña debe ser diferente a la actual";
  }
  return "";
}
