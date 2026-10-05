// Small helpers for the payment modal (no Vue here, easy to test)

// Bigger captures are rejected before compressing them
export const MAX_CAPTURE_SIZE = 15 * 1024 * 1024; // 15 MB

// Cloudinary image urls look like https://res.cloudinary.com/<cloud>/image/upload/...
const CLOUDINARY_UPLOAD = /^https?:\/\/res\.cloudinary\.com\/.+\/upload\//;

// Only the digits, so "1234 5678" or "Nº 12345678" also work
export function cleanOperationNumber(value) {
  return String(value ?? "").replace(/\D/g, "");
}

// Yape operation number: from 4 to 20 digits
export function isValidOperationNumber(value) {
  const digits = cleanOperationNumber(value);
  return digits.length >= 4 && digits.length <= 20;
}

// Quasar input rules for the operation number
export const operationNumberRules = [
  (v) => isValidOperationNumber(v) || "Debe tener de 4 a 20 dígitos",
];

// Cloudinary sends the image as a download when "fl_attachment/" goes right
// after "/upload/". Other urls are returned as they are.
export function toCloudinaryDownloadUrl(url) {
  if (!CLOUDINARY_UPLOAD.test(url || "")) return url;
  if (url.includes("/upload/fl_attachment")) return url;
  return url.replace("/upload/", "/upload/fl_attachment/");
}
