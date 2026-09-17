import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { HeroMedia } from "@/components/marketing/HeroMedia";
import { StackedSection } from "@/components/marketing/StackedSection";
import { OUR_APPROACH } from "@/content/marketing";

/** "Our Approach" — the process/methodology that used to live as a "How We Work" section at the
 * bottom of the old Services page, now its own destination. Same hero treatment as What We Do /
 * Our Planning Packages, then the same scroll-stacking experience as Our Planning Packages: each
 * step's title pins to its own header strip and stays visible as the next step stacks over it.
 * Unlike Planning Packages, there's nothing bulleted or itemized here — each step is a single
 * flowing paragraph, read more like a short passage than a checklist. */
export default function OurApproachPage() {
  const { hero, intro, steps } = OUR_APPROACH;
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
          <StackedSection key={step.index} index={i + 1} title={step.title}>
            <div className="px-6 pb-16 pt-4 text-center sm:px-10 sm:pb-20">
              <p className="mx-auto max-w-2xl text-sm leading-relaxed text-ink/70 sm:text-base">{step.body}</p>
            </div>
          </StackedSection>
        ))}
      </div>

      <MarketingFooter />
    </div>
  );
}
