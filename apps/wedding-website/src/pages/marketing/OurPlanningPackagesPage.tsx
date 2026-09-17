import { Link } from "react-router-dom";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { HeroMedia } from "@/components/marketing/HeroMedia";
import { PlaceholderImage } from "@/components/PlaceholderImage";
import { ServiceCategoryBlock } from "@/components/marketing/ServiceCategoryBlock";
import { StackedSection } from "@/components/marketing/StackedSection";
import { PLANNING_PACKAGES } from "@/content/marketing";

/** "Our Planning Packages" (formerly "Services") — matches the content/experience of
 * annelaureweddings.com/services (flat cream background, a full-bleed photo + script-text divider,
 * one overarching heading before the category list), plus a scroll-driven "stacking cards" effect
 * on top of that: the main heading section and each category band `position: sticky` at the top of
 * the viewport with an increasing z-index, so as you scroll each one slides up and visibly piles on
 * top of the one before it, instead of just scrolling past. */
export default function OurPlanningPackagesPage() {
  const { hero, intro, dividerPhoto, heading, body, categories } = PLANNING_PACKAGES;
  return (
    <div className="ovutor-fade-in bg-bg font-sans text-ink">
      <MarketingNav />

      <HeroMedia media={hero.media} heightClassName="h-[85vh]" overlay="dark" dotsClassName="bottom-32 sm:bottom-36" />
      <div className="relative z-20 mx-auto -mt-24 max-w-lg px-6 sm:-mt-28">
        <div className="bg-bg px-8 py-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.25)] sm:px-12 sm:py-12">
          <p className="text-[10px] font-bold uppercase tracking-[.2em] text-primary">{hero.eyebrow}</p>
          <h1 className="mt-3 whitespace-pre-line font-display text-3xl uppercase leading-tight tracking-wide sm:text-4xl">
            {hero.title}
          </h1>
        </div>
      </div>

      <div className="px-6 pb-16 pt-16 text-center sm:px-10 sm:pb-20 sm:pt-20">
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-ink/70 sm:text-base">{intro}</p>
      </div>

      <div className="relative aspect-[16/10] w-full overflow-hidden sm:aspect-[21/9]">
        <PlaceholderImage image={dividerPhoto} className="absolute inset-0" />
        <div className="absolute inset-0 bg-ink/20" />
        <div className="absolute inset-0 flex items-end justify-center pb-6 sm:pb-10">
          <p className="font-display text-5xl italic text-white sm:text-7xl">Our Services</p>
        </div>
      </div>

      {/* From here down, each section sticks and stacks on top of the last as you scroll — see
       * StackedSection for how. The relative wrapper matters: sticky positioning is relative to
       * the nearest scrolling ancestor, and without a shared parent here each section would try to
       * stick relative to <body> and they'd all just overlap immediately instead of stacking in
       * sequence as you scroll through them. */}
      <div className="relative">
        <StackedSection index={0} title={heading}>
          <div className="px-6 pb-16 pt-4 text-center sm:px-10 sm:pb-20">
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-ink/70">{body}</p>
            <div className="mt-8 flex flex-col items-center gap-3">
              <p className="text-xs font-bold uppercase tracking-[.1em] text-ink/50">Our work</p>
              <Link
                to="/connect-with-us"
                className="border border-primary bg-primary px-6 py-3 text-xs font-bold uppercase tracking-[.1em] text-white hover:brightness-110"
              >
                Inquire for availability
              </Link>
            </div>
          </div>
        </StackedSection>

        {categories.map((c, i) => (
          <StackedSection key={c.name} index={i + 1} title={c.name}>
            <ServiceCategoryBlock groups={c.groups} />
          </StackedSection>
        ))}
      </div>

      <MarketingFooter />
    </div>
  );
}
