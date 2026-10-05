const moneyFormatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
});

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
// The backend runs on Heroku (UTC), so DATE columns arrive as "YYYY-MM-DDT00:00:00.000Z"
const UTC_MIDNIGHT = /^(\d{4}-\d{2}-\d{2})T00:00:00(\.000)?Z$/;

// Peruvian soles, e.g. "S/ 1,234.50". Empty or invalid values show "S/ 0.00".
export function formatMoney(value) {
  const isEmpty = value === null || value === undefined || value === "";
  const number = Number(value);

  if (isEmpty || Number.isNaN(number)) {
    return moneyFormatter.format(0);
  }
  return moneyFormatter.format(number);
}

function toDate(value) {
  // new Date("YYYY-MM-DD") is read as UTC midnight, which is the previous day
  // in Lima. Build the date from its parts so it stays on the same day.
  if (typeof value === "string" && UTC_MIDNIGHT.test(value)) {
    value = value.slice(0, 10);
  }
  if (typeof value === "string" && DATE_ONLY.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(value);
}

// Returns "dd/mm/yyyy", or "" when the value is empty or invalid.
export function formatDate(value) {
  if (!value) return "";

  const date = toDate(value);
  if (Number.isNaN(date.getTime())) return "";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}
