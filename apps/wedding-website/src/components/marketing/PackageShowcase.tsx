import { Link } from "react-router-dom";
import { cn } from "@ovutor/ui";
import { RichText } from "@/components/RichText";
import { PlaceholderImage } from "@/components/PlaceholderImage";
import type { MarketingMedia } from "@/content/marketing";
import { packageSlug } from "@/lib/packageSlug";
import { formatPackagePrice } from "@/lib/formatPackagePrice";

export interface PackageGroup {
  title: string;
  bullets: string[];
}

export interface PackageSection {
  title: string;
  cards: PackageGroup[];
}

export interface PackageItem {
  name: string;
  summary: string;
  /** Longer "Background information" shown on the package's own page; falls back to `summary`. */
  background?: string;
  /** The package page's full-width banner; falls back to the card image. */
  banner?: MarketingMedia;
  /** "What's included" on the package page: titled sections (Design, Planning, ...), each a row of
   * tick-list cards. Falls back to `groups` as a single section. */
  sections?: PackageSection[];
  priceMin?: number;
  currency?: string;
  /** Free-text override such as "By enquiry". Wins over min/max when set. */
  priceRange?: string;
  media: MarketingMedia;
  groups: PackageGroup[];
}

/** The packages as one row of equal-height cards on desktop — title, image, a short summary, the
 * starting price and a "More" button that opens that package's own page. Everything sits on a
 * single row (up to six across) so the section stays compact however many packages exist; images
 * shrink to make that work. Tablets show two across and phones one. A lone package becomes a wide
 * feature card. Long-form detail never appears here, so the page stays light. */
export function PackageShowcase({
  packages,
  startingFromLabel = "Starting from",
  moreLabel = "More",
}: {
  packages: PackageItem[];
  startingFromLabel?: string;
  moreLabel?: string;
}) {
  const count = packages.length;
  if (count === 0) return null;

  const featured = count === 1;
  const cols = Math.min(count, 6);
  const maxWidth = featured || count === 2 ? "max-w-4xl" : count === 3 ? "max-w-6xl" : "max-w-7xl";

  return (
    <div className="bg-bg px-6 pb-14 pt-2 sm:px-10 sm:pb-16">
      <div
        className={cn("mx-auto grid grid-cols-1 gap-5", maxWidth, !featured && "md:grid-cols-2 lg:[grid-template-columns:repeat(var(--cols),minmax(0,1fr))]")}
        style={{ "--cols": cols } as React.CSSProperties}
      >
        {packages.map((pkg) => (
          <article
            key={pkg.name}
            className={cn(
              "flex flex-col border border-ink/10 bg-white shadow-[0_10px_30px_rgba(30,30,30,0.06)]",
              featured && "md:flex-row",
            )}
          >
            <div className={cn("flex flex-col", featured && "md:w-1/2")}>
              <h2 className="bg-primary px-4 py-4 text-center font-display text-xl leading-tight text-white">{pkg.name}</h2>
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <PlaceholderImage image={pkg.media} className="absolute inset-0" />
              </div>
            </div>
            <div className={cn("flex flex-1 flex-col items-center px-5 py-6 text-center", featured && "justify-center md:w-1/2 md:px-10")}>
              <RichText html={pkg.summary} className={cn("!text-sm !leading-relaxed text-ink/75", !featured && "flex-1")} />
              {formatPackagePrice(pkg) ? (
                <div className="mt-4 w-full border-t border-ink/10 pt-3">
                  <p className="text-[10px] font-bold uppercase tracking-[.16em] text-primary">{startingFromLabel}</p>
                  <p className="mt-1 font-display text-xl">{formatPackagePrice(pkg)}</p>
                </div>
              ) : null}
              <Link
                to={`/our-planning-packages/${packageSlug(pkg.name)}`}
                className="mt-5 border border-ink bg-ink px-7 py-2.5 text-xs font-bold uppercase tracking-[.1em] text-bg hover:opacity-85"
              >
                {moreLabel}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
