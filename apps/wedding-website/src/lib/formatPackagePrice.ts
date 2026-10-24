export interface PackagePrice {
  /** The base price — shown as "GHS 100,000". */
  priceMin?: number;
  currency?: string;
  /** Free-text override (e.g. "By enquiry") — wins over the number when set. */
  priceRange?: string;
}

const SYMBOLS: Record<string, string> = { USD: "$", GHS: "GH₵", GHC: "GH₵", NGN: "₦", EUR: "€", GBP: "£" };

/** Swaps currency codes for their symbols ("USD2,000" → "$2,000", "NGN 2,500,000" → "₦2,500,000"),
 * which keeps long multi-currency prices short. Unknown codes are left as they are. */
function withSymbols(text: string): string {
  return text.replace(/\b(USD|GHS|GHC|NGN|EUR|GBP)\s*(?=\d)/gi, (_, code: string) => SYMBOLS[code.toUpperCase()]);
}

/** The price as separate amounts — "USD2,000/GHC23,500/NGN2,500,000" becomes ["$2,000", "GH₵23,500",
 * "₦2,500,000"] — so a card can stack them instead of letting a long line run off the edge. */
export function formatPackagePriceParts(p: PackagePrice): string[] {
  if (p.priceRange?.trim()) {
    return p.priceRange
      .split(/\s*\/\s*|\s*\|\s*|\n/)
      .map((part) => withSymbols(part.trim()))
      .filter(Boolean);
  }
  if (p.priceMin == null) return [];
  return [withSymbols(`${p.currency || "USD"} ${p.priceMin.toLocaleString("en-US", { maximumFractionDigits: 0 })}`)];
}

/** "$2,000 / GH₵23,500 / ₦2,500,000", or "" when there's nothing to show. */
export function formatPackagePrice(p: PackagePrice): string {
  return formatPackagePriceParts(p).join(" / ");
}
