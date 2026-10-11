import { useEffect, useState } from "react";
import { usePageSeo, useSiteSettings } from "@/lib/siteSettings";
import { cn } from "@ovutor/ui";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { HeroMedia } from "@/components/marketing/HeroMedia";
import { Fragment, type ReactNode } from "react";
import { orderPage } from "@/lib/pageLayout";
import type { MarketingPageDto } from "@/lib/marketingApi";
import { DynamicContentBlock } from "@/components/marketing/DynamicContentBlock";
import { StackedSection } from "@/components/marketing/StackedSection";
import { PlaceholderImage } from "@/components/PlaceholderImage";
import { RichText } from "@/components/RichText";
import { OUR_APPROACH, type MarketingMedia } from "@/content/marketing";
import { mergeMediaHero, mergeText, pick, pickList, toMarketingMedia } from "@/content/mergeMarketing";
import {
  getContentBlock,
  getMarketingPage,
  type MarketingHeroDto,
  type MarketingSectionDto,
  type MarketingStepsDto,
  type MarketingTextDto,
} from "@/lib/marketingApi";

interface Step {
  index: string;
  title: string;
  body: string;
  media?: MarketingMedia;
}

/** "Our Approach" — the process as stacking cards: each step's title pins to its own strip and the
 * next step slides up over it as you scroll. Inside a card the photo and text sit side by side,
 * alternating sides (photo right, then left, ...), vertically centred so there's never empty space
 * above the text, and the body is rich text so every paragraph, list and heading is the admin's choice. Every block starts as its static
 * OUR_APPROACH copy and upgrades in place once admin content loads — see mergeMarketing.ts. */
export default function OurApproachPage() {
  usePageSeo("our-approach", "Our Approach — Ovutor", "A process built around you.");
  const site = useSiteSettings();
  const [hero, setHero] = useState(OUR_APPROACH.hero);
  const [intro, setIntro] = useState(OUR_APPROACH.intro);
  const [steps, setSteps] = useState<Step[]>(OUR_APPROACH.steps as Step[]);
  const [sections, setSections] = useState<MarketingSectionDto[]>([]);
  const [layoutPage, setLayoutPage] = useState<MarketingPageDto | null>(null);
  const [introTitle, setIntroTitle] = useState("Our approach");

  useEffect(() => {
    getMarketingPage("our-approach")
      .then((data) => {
        setHero(mergeMediaHero(getContentBlock<MarketingHeroDto>(data, "hero"), OUR_APPROACH.hero));
        setIntroTitle(pick(getContentBlock<MarketingTextDto>(data, "intro")?.title, "Our approach"));
        setIntro(mergeText(getContentBlock<MarketingTextDto>(data, "intro"), OUR_APPROACH.intro));
        setSteps(
          pickList(getContentBlock<MarketingStepsDto>(data, "steps")?.items, OUR_APPROACH.steps as Step[], (item, i) => ({
            index: String(i + 1).padStart(2, "0"),
            title: item.title ?? "",
            body: item.body ?? "",
            media: item.image?.url ? toMarketingMedia(item.image) : undefined,
          })),
        );
        setLayoutPage(data);
        setSections(data.sections);
      })
      .catch(() => {});
  }, []);

  const blocks: Record<string, ReactNode> = {
    steps: (
      // Each step is a card that sticks near the top and gets piled over by the next as you scroll
      // (see StackedSection) — the relative wrapper is what makes sticky stack in sequence.
        <div className="relative mt-16">
          <StackedSection index={0} title={introTitle}>
            <div className="px-6 pb-14 pt-4 sm:px-10">
              <RichText html={intro} size="lg" align="center" className="mx-auto max-w-3xl text-ink/80" />
            </div>
          </StackedSection>

          {steps.map((step, i) => {
            const imageRight = i % 2 === 0;
            const hasImage = !!step.media?.src;
            return (
              <StackedSection key={step.index + i} index={i + 1} last={i === steps.length - 1} title={step.title}>
                <div className={cn("mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-8 px-6 pb-8 pt-2 sm:px-10", hasImage && "lg:grid-cols-2 lg:gap-14")}>
                  <div className={cn(imageRight ? "lg:order-1" : "lg:order-2", !hasImage && "mx-auto max-w-3xl")}>
                    <p className="font-display text-lg italic">{site.labels.numberPrefix} {step.index}</p>
                    <span className="mb-5 mt-3 block h-[3px] w-12 bg-ink/70" />
                    <RichText html={step.body} className="text-ink/85" />
                  </div>
                  {hasImage ? (
                    <div className={cn("relative aspect-[4/3] w-full overflow-hidden lg:aspect-auto lg:h-[40vh]", imageRight ? "lg:order-2" : "lg:order-1")}>
                      <PlaceholderImage image={step.media as MarketingMedia} className="absolute inset-0" />
                    </div>
                  ) : null}
                </div>
              </StackedSection>
            );
          })}
        </div>
    ),
  };

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

      {orderPage(layoutPage, sections, ["steps", "sections"]).map((item) =>
        item.section ? <DynamicContentBlock key={item.id} section={item.section} /> : <Fragment key={item.id}>{blocks[item.id]}</Fragment>,
      )}

      <MarketingFooter />
    </div>
  );
}
