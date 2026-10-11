import { useEffect, useState } from "react";
import { usePageSeo } from "@/lib/siteSettings";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { HeroMedia } from "@/components/marketing/HeroMedia";
import { RichText } from "@/components/RichText";
import { PlaceholderImage } from "@/components/PlaceholderImage";
import { PackageShowcase } from "@/components/marketing/PackageShowcase";
import { usePlanningPackages } from "@/lib/usePlanningPackages";
import { Fragment, type ReactNode } from "react";
import { orderPage } from "@/lib/pageLayout";
import type { MarketingPageDto } from "@/lib/marketingApi";
import { DynamicContentBlock } from "@/components/marketing/DynamicContentBlock";
import { PLANNING_PACKAGES } from "@/content/marketing";
import { pick, mergeHeadingBody, mergeImageBlock, mergeMediaHero, mergeText } from "@/content/mergeMarketing";
import {
  getContentBlock,
  getMarketingPage,
  type MarketingHeadingBodyDto,
  type MarketingHeroDto,
  type MarketingImageBlockDto,
  type MarketingSectionDto,
  type MarketingTextDto,
} from "@/lib/marketingApi";

/** "Our Planning Packages" (formerly "Services") — matches the content/experience of
 * annelaureweddings.com/services (flat cream background, a full-bleed photo + script-text divider,
 * one overarching heading before the package list). Packages are side-by-side cards — title,
 * image, short summary and a "More" button that opens that package's own page (see PackageShowcase). Every block on this page starts as its
 * static PLANNING_PACKAGES copy and upgrades in place, field by field, once any admin-authored
 * content loads — see mergeMarketing.ts. */
export default function OurPlanningPackagesPage() {
  usePageSeo("our-planning-packages", "Our Planning Packages — Ovutor", "Destination weddings, designed with intention.");
  const [hero, setHero] = useState(PLANNING_PACKAGES.hero);
  const [intro, setIntro] = useState(PLANNING_PACKAGES.intro);
  const [dividerPhoto, setDividerPhoto] = useState(PLANNING_PACKAGES.dividerPhoto);
  const [dividerTitle, setDividerTitle] = useState("Our Services");
  const [headingBlock, setHeadingBlock] = useState({ heading: PLANNING_PACKAGES.heading, body: PLANNING_PACKAGES.body });
  const { categories, labels } = usePlanningPackages();
  const [sections, setSections] = useState<MarketingSectionDto[]>([]);
  const [layoutPage, setLayoutPage] = useState<MarketingPageDto | null>(null);

  useEffect(() => {
    getMarketingPage("our-planning-packages")
      .then((data) => {
        setHero(mergeMediaHero(getContentBlock<MarketingHeroDto>(data, "hero"), PLANNING_PACKAGES.hero));
        setIntro(mergeText(getContentBlock<MarketingTextDto>(data, "intro"), PLANNING_PACKAGES.intro));
        setDividerTitle(pick(getContentBlock<MarketingImageBlockDto>(data, "divider")?.title, "Our Services"));
        setDividerPhoto(mergeImageBlock(getContentBlock<MarketingImageBlockDto>(data, "divider"), PLANNING_PACKAGES.dividerPhoto));
        setHeadingBlock(
          mergeHeadingBody(getContentBlock<MarketingHeadingBodyDto>(data, "heading"), {
            heading: PLANNING_PACKAGES.heading,
            body: PLANNING_PACKAGES.body,
          }),
        );
        setLayoutPage(data);
        setSections(data.sections);
      })
      .catch(() => {});
  }, []);

  const blocks: Record<string, ReactNode> = {
    intro: (
      <div className="px-6 pb-16 pt-16 text-center sm:px-10 sm:pb-20 sm:pt-20">
          <RichText html={intro} size="lg" align="center" className="mx-auto max-w-3xl text-ink/75" />
        </div>
    ),
    divider: (
      <div className="relative aspect-[16/10] w-full overflow-hidden sm:aspect-[21/9]">
          <PlaceholderImage image={dividerPhoto} className="absolute inset-0" />
          <div className="absolute inset-0 bg-ink/20" />
          <div className="absolute inset-0 flex items-end justify-center pb-6 sm:pb-10">
            <p className="font-display text-5xl italic text-white sm:text-7xl">{dividerTitle}</p>
          </div>
        </div>
    ),
    heading: (
      <div className="bg-bg px-6 py-16 text-center sm:px-10 sm:py-20">
          <h2 className="mx-auto max-w-3xl font-display text-3xl leading-snug sm:text-4xl">{headingBlock.heading}</h2>
          <RichText html={headingBlock.body} size="lg" align="center" className="mx-auto mt-5 max-w-3xl text-ink/75" />
        </div>
    ),
    packages: (
      <PackageShowcase packages={categories} startingFromLabel={labels.startingFromLabel} moreLabel={labels.moreLabel} />
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

      {orderPage(layoutPage, sections, ["intro", "divider", "heading", "packages", "sections"]).map((item) =>
        item.section ? <DynamicContentBlock key={item.id} section={item.section} /> : <Fragment key={item.id}>{blocks[item.id]}</Fragment>,
      )}

      <MarketingFooter />
    </div>
  );
}
