export interface PackagePrice {
  /** The base price — shown as "GHS 100,000". */
  priceMin?: number;
  currency?: string;
  /** Free-text override (e.g. "By enquiry") — wins over the number when set. */
  priceRange?: string;
}

/** "GHS 100,000", or "" when there's nothing to show. */
export function formatPackagePrice(p: PackagePrice): string {
  if (p.priceRange?.trim()) return p.priceRange.trim();
  if (p.priceMin == null) return "";
  return `${p.currency || "USD"} ${p.priceMin.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}
