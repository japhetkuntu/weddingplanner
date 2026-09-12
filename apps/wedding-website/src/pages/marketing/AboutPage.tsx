import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { HeroMedia } from "@/components/marketing/HeroMedia";
import { StatementSection } from "@/components/marketing/StatementSection";
import { SplitRow } from "@/components/marketing/SplitRow";
import { ABOUT } from "@/content/marketing";

/** juliaandevita.com/services' video hero + overlapping title card, then its black-and-white
 * statement section — followed by annelaureweddings.com/love-notes' repeating split-row flow,
 * but on a vibrant wine background instead of their white. */
export default function AboutPage() {
  const { hero, statement, flow } = ABOUT;
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

      <div className="bg-[#4A0F14]">
        {flow.map((row, i) => (
          <SplitRow
            key={row.index}
            media={row.media}
            index={row.index}
            title={row.title}
            body={<p>{row.body}</p>}
            meta={row.meta}
            reverse={i % 2 === 1}
          />
        ))}
      </div>

      <MarketingFooter />
    </div>
  );
}
