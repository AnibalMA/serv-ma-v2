// Small helpers for the admin payments page (no Vue here, easy to test)

import { getAmountToPay } from "src/utils/boletas";

const OPTION_FIELDS = [
  "nom_payment_opc",
  "desc_payment_opc",
  "detalles_payment_opc",
];

// QR images accepted by the backend
export const QR_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const QR_MAX_SIZE = 2 * 1024 * 1024; // 2 MB

// Form values taken from an option (empty when it is a new one)
export function paymentOptionFormFromOption(option) {
  const form = {};
  OPTION_FIELDS.forEach((field) => {
    form[field] = option?.[field] || "";
  });
  return form;
}

// Same fields without the extra spaces, ready to send
export function cleanPaymentOptionForm(form) {
  const clean = {};
  OPTION_FIELDS.forEach((field) => {
    clean[field] = String(form[field] || "").trim();
  });
  return clean;
}

function textLength(value) {
  return String(value || "").trim().length;
}

// Quasar input rules, with the same limits as the backend
export const paymentOptionRules = {
  name: [
    (v) => textLength(v) >= 2 || "Escribe al menos 2 letras",
    (v) => textLength(v) <= 100 || "Máximo 100 caracteres",
  ],
  text: [(v) => textLength(v) <= 255 || "Máximo 255 caracteres"],
};

// Returns the error message for the picked QR image, or "" when it is fine
export function getQrFileError(file) {
  if (!file) return "Elige una imagen para el QR";
  if (!QR_TYPES.includes(file.type)) {
    return "El QR debe ser una imagen JPG, PNG o WEBP";
  }
  if (file.size > QR_MAX_SIZE) return "La imagen del QR debe pesar 2 MB o menos";
  return "";
}

// New list with the option the server answered: replaces the one with the
// same id, or adds it at the end when it is new
export function putOptionInList(options, option) {
  const exists = options.some((item) => item.id === option.id);
  if (!exists) return [...options, option];
  return options.map((item) => (item.id === option.id ? option : item));
}

// Payment request amount: what the client was asked to pay (the pending amount
// of the boleta), unless the request brings a declared amount
export function amountToApprove(request) {
  return request.monto_declarado ?? getAmountToPay(request);
}
