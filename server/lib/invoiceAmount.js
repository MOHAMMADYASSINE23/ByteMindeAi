/**
 * Prefer a valid manually entered amount. When the field is blank or invalid,
 * fall back to the best-effort amount extracted from the uploaded document.
 */
export function resolveInvoiceAmount(input, extractedAmount) {
  const hasManualAmount = typeof input === "number"
    || (typeof input === "string" && input.trim() !== "");
  const manualAmount = hasManualAmount ? Number(input) : Number.NaN;

  if (Number.isFinite(manualAmount)) {
    return manualAmount;
  }

  return Number.isFinite(extractedAmount) ? extractedAmount : Number.NaN;
}
