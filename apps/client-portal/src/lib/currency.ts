/** Formats an amount using the couple's chosen currency — set by their planner when the
 * workspace was created, since couples based outside the US often think in their own currency. */
export function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}
