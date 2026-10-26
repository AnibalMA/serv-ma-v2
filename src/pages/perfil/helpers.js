// Small helpers for the "Mi perfil" page (no Vue here, easy to test)

const PROFILE_FIELDS = [
  "nom_usuario",
  "ape_usuario",
  "email_principal_usuario",
  "celular_principal_usuario",
  "genero",
];

export const GENDER_OPTIONS = [
  { label: "Masculino", value: "M" },
  { label: "Femenino", value: "F" },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

// Names shown when the backend rejects a field (HTTP 412)
const FIELD_LABELS = {
  nom_usuario: "Nombre",
  ape_usuario: "Apellido",
  email_principal_usuario: "Correo electrónico",
  celular_principal_usuario: "Celular",
  genero: "Género",
};

function isGender(value) {
  return GENDER_OPTIONS.some((option) => option.value === value);
}

// Form values taken from the logged-in user
export function profileFormFromUser(user) {
  const form = {};
  PROFILE_FIELDS.forEach((field) => {
    form[field] = user?.[field] || "";
  });
  // Old values (e.g. "Otro") are not in the list: the field starts empty
  if (!isGender(form.genero)) form.genero = "";
  return form;
}

// Same fields without the extra spaces, ready to send
export function cleanProfileForm(form) {
  const clean = {};
  PROFILE_FIELDS.forEach((field) => {
    clean[field] = String(form[field] || "").trim();
  });
  // Género is optional: it is only sent when the user chose one
  if (!clean.genero) delete clean.genero;
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

// Photos bigger than this are probably not a profile photo (phones take ~5 MB).
// The photo is made smaller before uploading anyway (see squareImageBlob).
const AVATAR_PHOTO_MAX_ORIGINAL = 15 * 1024 * 1024;
// What the backend accepts
export const AVATAR_PHOTO_MAX_UPLOAD = 2 * 1024 * 1024;

// Returns the error message for the picked photo, or "" when it is fine
export function getAvatarPhotoError(file) {
  if (!file) return "Elige una foto";
  if (!String(file.type || "").startsWith("image/")) {
    return "Elige una imagen (JPG, PNG o WEBP)";
  }
  if (file.size > AVATAR_PHOTO_MAX_ORIGINAL) {
    return "La foto pesa demasiado. Elige una de hasta 15 MB";
  }
  return "";
}
