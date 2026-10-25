// Boleta helpers shared by the client and the admin pages

// What is still pending on the boleta (billed minus already paid)
export function getAmountToPay(boleta) {
  const billed = Number(boleta?.monto_facturado || 0);
  const paid = Number(boleta?.monto_cancelado || 0);
  const pending = Math.round((billed - paid) * 100) / 100;
  return Math.max(pending, 0);
}
