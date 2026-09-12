import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { HeroMedia } from "@/components/marketing/HeroMedia";
import { ServiceCategoryBlock } from "@/components/marketing/ServiceCategoryBlock";
import { SERVICES } from "@/content/marketing";

/** Same hero treatment as the About page (video + overlapping title card), then the middle of
 * annelaureweddings.com/services — category blocks through "How We Work" — on one continuous
 * background in the platform's own brand red instead of their white-then-green. */
export default function ServicesPage() {
  const { hero, intro, categories, howWeWork } = SERVICES;
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

      <div className="bg-primary pt-24 sm:pt-28">
        <p className="mx-auto max-w-2xl px-6 text-center text-sm leading-relaxed text-white/85 sm:px-10 sm:text-base">
          {intro}
        </p>

        <div className="mt-4">
          {categories.map((c) => (
            <ServiceCategoryBlock key={c.name} name={c.name} heading={c.heading} body={c.body} groups={c.groups} />
          ))}
        </div>

        <div className="border-t border-white/15 px-6 py-20 text-center sm:px-10 sm:py-24">
          <h2 className="font-display text-3xl text-white sm:text-4xl">{howWeWork.heading}</h2>
          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-10 text-left sm:grid-cols-2 lg:grid-cols-4">
            {howWeWork.steps.map((step, i) => (
              <div key={step.title}>
                <p className="font-display text-2xl text-white/50">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-2 font-display text-lg text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <MarketingFooter />
    </div>
  );
}
