import { Link } from "react-router-dom";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { HeroMedia } from "@/components/marketing/HeroMedia";
import { HOME } from "@/content/marketing";

/** The landing page is deliberately a single section — a full-bleed image/video hero (the
 * thedestinationwedding.co inspiration), nothing else competing for attention. */
export default function HomePage() {
  const { hero } = HOME;
  return (
    <div className="ovutor-fade-in bg-bg font-sans text-ink">
      <MarketingNav />

      <HeroMedia media={hero.media} heightClassName="min-h-screen">
        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-24 pt-32 text-center text-white sm:px-10">
          <p className="text-[10px] font-bold uppercase tracking-[.24em] text-white/70">{hero.eyebrow}</p>
          <h1 className="mt-5 max-w-3xl whitespace-pre-line font-display text-5xl font-normal leading-[1.05] [text-shadow:0_2px_24px_rgba(0,0,0,0.5)] sm:text-7xl">
            {hero.title}
          </h1>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-white/80 sm:text-base">{hero.subtitle}</p>
          <Link
            to={hero.ctaTo}
            className="mt-9 border border-white px-8 py-4 text-xs font-bold uppercase tracking-[.14em] text-white hover:bg-white hover:text-ink"
          >
            {hero.ctaLabel}
          </Link>
        </div>
      </HeroMedia>

      <MarketingFooter />
    </div>
  );
}
