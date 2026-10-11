import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { cn } from "@ovutor/ui";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { RichText } from "@/components/RichText";
import { HeroMedia } from "@/components/marketing/HeroMedia";
import type { PackageSection } from "@/components/marketing/PackageShowcase";
import { formatPackagePrice } from "@/lib/formatPackagePrice";
import { packageSlug } from "@/lib/packageSlug";
import { usePlanningPackages } from "@/lib/usePlanningPackages";

function Tick() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="mt-[3px] shrink-0 text-primary">
      <path d="M3 8.5l3.2 3.2L13 4.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** One package's own page: a full-width banner, the package title and starting price, background
 * information, then "What's included" — titled sections (Design, Planning, Coordination...), each a
 * row of tick-list cards. Gold leads the page: solid and light-gold bands alternate, with a pink closing
 * band that separates the content from the gold footer. */
export default function PlanningPackagePage() {
  const { packageSlug: slug } = useParams();
  const { categories, labels, loaded } = usePlanningPackages();
  const pkg = categories.find((c) => packageSlug(c.name) === slug);

  useEffect(() => {
    if (pkg?.name) document.title = `${pkg.name} — Ovutor`;
  }, [pkg?.name]);

  if (!pkg) {
    return (
      <div className="ovutor-fade-in min-h-screen bg-bg font-sans text-ink">
        <MarketingNav dark={false} />
        <div className="mx-auto max-w-3xl px-6 pb-24 pt-40 text-center">
          {loaded ? (
            <>
              <h1 className="font-display text-3xl">We couldn't find that package.</h1>
              <Link to="/our-planning-packages" className="mt-6 inline-block text-xs font-bold uppercase tracking-[.1em] text-primary">
                &larr; See all packages
              </Link>
            </>
          ) : null}
        </div>
        <MarketingFooter />
      </div>
    );
  }

  const sections: PackageSection[] = pkg.sections?.length
    ? pkg.sections
    : pkg.groups.length
      ? [{ title: "", cards: pkg.groups }]
      : [];
  const price = formatPackagePrice(pkg);

  return (
    <div className="ovutor-fade-in bg-bg font-sans text-ink">
      <MarketingNav />

      <HeroMedia media={pkg.banner ?? pkg.media} heightClassName="h-[60vh] min-h-[380px]" overlay="dark" />
      <div className="relative z-20 mx-auto -mt-20 max-w-xl px-6">
        <div className="bg-bg px-8 py-9 text-center shadow-[0_20px_60px_rgba(0,0,0,0.25)] sm:px-12 sm:py-10">
          <p className="text-[10px] font-bold uppercase tracking-[.2em] text-primary">Our planning packages</p>
          <h1 className="mt-3 font-display text-3xl uppercase leading-tight tracking-wide sm:text-4xl">{pkg.name}</h1>
          {price ? (
            <p className="mt-4 text-sm text-ink/70">
              <span className="text-[10px] font-bold uppercase tracking-[.16em]">{labels.startingFromLabel}</span>
              <span className="ml-2 font-display text-xl text-ink">{price}</span>
            </p>
          ) : null}
        </div>
      </div>

      <section className="mt-16 bg-gold px-6 py-16 text-center sm:px-10 sm:py-20">
        <h2 className="font-display text-2xl italic text-ink/60">{labels.backgroundTitle}</h2>
        <RichText html={pkg.background || pkg.summary} size="lg" align="center" className="mx-auto mt-5 max-w-3xl text-ink/85" />
      </section>

      {sections.length > 0 ? (
        <>
          <div className="bg-gold/20 px-6 pb-2 pt-16 text-center sm:px-10">
            <h2 className="font-display text-3xl sm:text-4xl">{labels.includedTitle}</h2>
          </div>
          {sections.map((section, i) => {
            const gold = i % 2 === 1;
            const cols = Math.min(section.cards.length, 3);
            return (
              <section key={section.title + i} className={cn("px-6 py-14 sm:px-10 sm:py-16", gold ? "bg-gold" : "bg-gold/20")}>
                {section.title ? <h3 className="mb-8 text-center font-display text-2xl sm:text-3xl">{section.title}</h3> : null}
                <div
                  className={cn(
                    "mx-auto grid max-w-6xl grid-cols-1 gap-5",
                    cols === 1 && "max-w-xl",
                    cols === 2 && "max-w-4xl md:grid-cols-2",
                    cols === 3 && "md:grid-cols-2 lg:grid-cols-3",
                  )}
                >
                  {section.cards.map((card) => (
                    <div key={card.title} className="border border-ink/10 bg-white p-6 shadow-[0_10px_30px_rgba(30,30,30,0.06)]">
                      <h4 className="text-xs font-bold uppercase tracking-[.08em] text-ink">{card.title}</h4>
                      <ul className="mt-4 space-y-3 text-sm leading-relaxed text-ink/75">
                        {card.bullets.map((b) => (
                          <li key={b} className="flex gap-3">
                            <Tick />
                            <RichText html={b} className="!text-[inherit] !leading-[inherit]" />
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </>
      ) : null}

      <section className="bg-primary px-6 py-16 text-center text-white sm:px-10 sm:py-20">
        <h2 className="font-display text-2xl sm:text-3xl">{labels.ctaTitle}</h2>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/connect-with-us"
            className="border border-gold bg-gold px-7 py-3 text-xs font-bold uppercase tracking-[.1em] text-ink hover:brightness-90"
          >
            {labels.ctaLabel}
          </Link>
          <Link to="/our-planning-packages" className="text-xs font-bold uppercase tracking-[.1em] text-white/80 hover:text-white hover:underline">
            &larr; {labels.allPackagesLabel}
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
