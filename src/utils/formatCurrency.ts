/**
 * Format a number or string into Indian Rupee currency (₹)
 * Examples:
 * 20 -> "₹20"
 * 100 -> "₹100"
 * 1000 -> "₹1,000"
 * 125000 -> "₹1,25,000"
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  options?: {
    showDecimals?: boolean;
    fallback?: string;
  }
): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return options?.fallback ?? "₹0";
  }

  const numeric = typeof amount === "string" ? parseFloat(amount) : amount;
  const showDecimals = options?.showDecimals ?? (numeric % 1 !== 0);

  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(numeric);

  // en-IN currency style includes ₹ symbol cleanly
  return formatted;
}

export default formatCurrency;
