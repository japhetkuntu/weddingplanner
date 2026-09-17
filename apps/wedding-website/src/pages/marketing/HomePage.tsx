import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { HeroMedia } from "@/components/marketing/HeroMedia";
import { DynamicContentBlock } from "@/components/marketing/DynamicContentBlock";
import { HOME } from "@/content/marketing";
import { mergeHero } from "@/content/mergeMarketing";
import { getContentBlock, getMarketingPage, type MarketingHeroDto, type MarketingSectionDto } from "@/lib/marketingApi";

/** The landing page is deliberately a single section by default — a full-bleed image/video hero
 * (the thedestinationwedding.co inspiration), nothing else competing for attention. Every field
 * below starts out as the static `HOME.hero` copy (so the page never waits on the network, and
 * degrades perfectly if the API is slow or down) and is upgraded in place, field by field, once
 * any admin-authored content loads — see mergeHero. Admin-added extra sections, if any, render
 * after the hero. */
export default function HomePage() {
  const [hero, setHero] = useState(HOME.hero);
  const [sections, setSections] = useState<MarketingSectionDto[]>([]);

  useEffect(() => {
    getMarketingPage("home")
      .then((data) => {
        setHero(mergeHero(getContentBlock<MarketingHeroDto>(data, "hero"), HOME.hero));
        setSections(data.sections);
      })
      .catch(() => {
        // Nothing admin-authored, or the API is unreachable — both resolve to "keep showing
        // the static content already on screen", so there's nothing to do here.
      });
  }, []);

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

      {sections.map((section) => (
        <DynamicContentBlock key={section.id} section={section} />
      ))}

      <MarketingFooter />
    </div>
  );
}
