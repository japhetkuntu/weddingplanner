import { useEffect, useState } from "react";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { HeroMedia } from "@/components/marketing/HeroMedia";
import { StatementSection } from "@/components/marketing/StatementSection";
import { SplitRow, splitTones } from "@/components/marketing/SplitRow";
import { DynamicContentBlock } from "@/components/marketing/DynamicContentBlock";
import { WHAT_WE_DO } from "@/content/marketing";
import { mergeMediaHero, mergeStatement, pickList, toMarketingMedia } from "@/content/mergeMarketing";
import {
  getContentBlock,
  getMarketingPage,
  type MarketingFlowDto,
  type MarketingHeroDto,
  type MarketingSectionDto,
  type MarketingStatementDto,
} from "@/lib/marketingApi";

/** "What We Do" (formerly "About"). juliaandevita.com/services' video hero + overlapping title
 * card, then its black-and-white statement section — followed by annelaureweddings.com/love-notes'
 * repeating split-row flow, but on the platform's own brand-pink background instead of their white.
 * Every block on this page starts as its static WHAT_WE_DO copy and upgrades in place, field by
 * field, once any admin-authored content loads — see mergeMarketing.ts. */
export default function WhatWeDoPage() {
  const [hero, setHero] = useState(WHAT_WE_DO.hero);
  const [statement, setStatement] = useState(WHAT_WE_DO.statement);
  const [flow, setFlow] = useState(WHAT_WE_DO.flow);
  const [sections, setSections] = useState<MarketingSectionDto[]>([]);

  useEffect(() => {
    getMarketingPage("what-we-do")
      .then((data) => {
        setHero(mergeMediaHero(getContentBlock<MarketingHeroDto>(data, "hero"), WHAT_WE_DO.hero));
        setStatement(mergeStatement(getContentBlock<MarketingStatementDto>(data, "statement"), WHAT_WE_DO.statement));
        setFlow(
          pickList(getContentBlock<MarketingFlowDto>(data, "flow")?.items, WHAT_WE_DO.flow, (item, i) => ({
            index: String(i + 1).padStart(2, "0"),
            title: item.title ?? "",
            body: item.body ?? "",
            meta: item.meta ?? "",
            media: item.image?.url ? toMarketingMedia(item.image) : (WHAT_WE_DO.flow[i]?.media ?? { label: item.title ?? "" }),
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

      <div className="pt-16 sm:pt-20">
        <StatementSection heading={statement.heading} body={statement.body} script={statement.script} />
      </div>

      <div>
        {flow.map((row, i) => (
          <SplitRow
            key={row.index}
            media={row.media}
            index={row.index}
            title={row.title}
            body={<p>{row.body}</p>}
            meta={row.meta}
            reverse={i % 2 === 1}
            tone={splitTones(flow.length, true)[i]}
          />
        ))}
      </div>

      {sections.map((section) => (
        <DynamicContentBlock key={section.id} section={section} />
      ))}

      <MarketingFooter />
    </div>
  );
}
