export const CURRENCIES = [
  { code: "USD", label: "US Dollar ($)" },
  { code: "GBP", label: "British Pound (£)" },
  { code: "EUR", label: "Euro (€)" },
  { code: "CAD", label: "Canadian Dollar (CA$)" },
  { code: "AUD", label: "Australian Dollar (A$)" },
  { code: "GHS", label: "Ghanaian Cedi (GH₵)" },
  { code: "NGN", label: "Nigerian Naira (₦)" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

/** Formats an amount using the client's chosen currency — couples based outside the US often
 * think in their own currency, so budget figures follow whatever was set up for that client. */
export function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}
