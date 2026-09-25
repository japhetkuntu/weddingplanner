import { useEffect, useState } from "react";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { HeroMedia } from "@/components/marketing/HeroMedia";
import { StackedSection } from "@/components/marketing/StackedSection";
import { DynamicContentBlock } from "@/components/marketing/DynamicContentBlock";
import { OUR_APPROACH } from "@/content/marketing";
import { mergeMediaHero, mergeText, pickList } from "@/content/mergeMarketing";
import {
  getContentBlock,
  getMarketingPage,
  type MarketingHeroDto,
  type MarketingSectionDto,
  type MarketingStepsDto,
  type MarketingTextDto,
} from "@/lib/marketingApi";

/** "Our Approach" — the process/methodology that used to live as a "How We Work" section at the
 * bottom of the old Services page, now its own destination. Same hero treatment as What We Do /
 * Our Planning Packages, then the same scroll-stacking experience as Our Planning Packages: each
 * step's title pins to its own header strip and stays visible as the next step stacks over it.
 * Unlike Planning Packages, there's nothing bulleted or itemized here — each step is a single
 * flowing paragraph, read more like a short passage than a checklist. Every block on this page
 * starts as its static OUR_APPROACH copy and upgrades in place, field by field, once any
 * admin-authored content loads — see mergeMarketing.ts. */
export default function OurApproachPage() {
  const [hero, setHero] = useState(OUR_APPROACH.hero);
  const [intro, setIntro] = useState(OUR_APPROACH.intro);
  const [steps, setSteps] = useState(OUR_APPROACH.steps);
  const [sections, setSections] = useState<MarketingSectionDto[]>([]);

  useEffect(() => {
    getMarketingPage("our-approach")
      .then((data) => {
        setHero(mergeMediaHero(getContentBlock<MarketingHeroDto>(data, "hero"), OUR_APPROACH.hero));
        setIntro(mergeText(getContentBlock<MarketingTextDto>(data, "intro"), OUR_APPROACH.intro));
        setSteps(
          pickList(getContentBlock<MarketingStepsDto>(data, "steps")?.items, OUR_APPROACH.steps, (item, i) => ({
            index: String(i + 1).padStart(2, "0"),
            title: item.title ?? "",
            body: item.body ?? "",
          })),
        );
        setSections(data.sections);
      })
      .catch(() => {});
  }, []);

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

      <div className="relative">
        <StackedSection index={0} title="Our approach">
          <div className="px-6 pb-16 pt-4 text-center sm:px-10 sm:pb-20">
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-ink/70 sm:text-base">{intro}</p>
          </div>
        </StackedSection>

        {steps.map((step, i) => (
          <StackedSection key={step.index} index={i + 1} last={i === steps.length - 1} title={step.title}>
            <div className="px-6 pb-16 pt-4 text-center sm:px-10 sm:pb-20">
              <p className="mx-auto max-w-2xl text-sm leading-relaxed text-ink/70 sm:text-base">{step.body}</p>
            </div>
          </StackedSection>
        ))}
      </div>

      {sections.map((section) => (
        <DynamicContentBlock key={section.id} section={section} />
      ))}

      <MarketingFooter />
    </div>
  );
}
