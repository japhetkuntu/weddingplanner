import { useEffect, useState } from "react";
import { PLANNING_PACKAGES, type MarketingMedia } from "@/content/marketing";
import { pick, pickList, toMarketingMedia } from "@/content/mergeMarketing";
import { getContentBlock, getMarketingPage, type MarketingCategoriesDto, type MarketingPackageLabelsDto } from "@/lib/marketingApi";
import type { PackageItem } from "@/components/marketing/PackageShowcase";

export interface PackageLabels {
  startingFromLabel: string;
  moreLabel: string;
  backgroundTitle: string;
  includedTitle: string;
  ctaTitle: string;
  ctaLabel: string;
  allPackagesLabel: string;
}

export const DEFAULT_PACKAGE_LABELS: PackageLabels = {
  startingFromLabel: "Starting from",
  moreLabel: "More",
  backgroundTitle: "Background information",
  includedTitle: "What's included",
  ctaTitle: "Ready to begin?",
  ctaLabel: "Inquire for availability",
  allPackagesLabel: "All packages",
};

/** The package list (static copy, replaced wholesale once the admin has saved any) plus the shared
 * wording — used by the packages listing page and each package's own page so both always agree. */
export function usePlanningPackages() {
  const [categories, setCategories] = useState<PackageItem[]>(PLANNING_PACKAGES.categories as PackageItem[]);
  const [labels, setLabels] = useState<PackageLabels>(DEFAULT_PACKAGE_LABELS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getMarketingPage("our-planning-packages")
      .then((data) => {
        setCategories(
          pickList(getContentBlock<MarketingCategoriesDto>(data, "categories")?.items, PLANNING_PACKAGES.categories as PackageItem[], (item) => ({
            name: item.name ?? "",
            summary: item.summary ?? "",
            background: item.background ?? "",
            priceRange: item.priceRange ?? "",
            priceMin: item.priceMin ?? undefined,
            currency: item.currency ?? undefined,
            media: (item.image ? toMarketingMedia(item.image) : { label: "", focalPoint: "center" }) as MarketingMedia,
            banner: item.banner ? toMarketingMedia(item.banner) : undefined,
            sections: (item.sections ?? []).map((s) => ({
              title: s.title ?? "",
              cards: (s.cards ?? []).map((c) => ({ title: c.title ?? "", bullets: c.bullets ?? [] })),
            })),
            groups: (item.groups ?? []).map((g) => ({ title: g.title ?? "", bullets: g.bullets ?? [] })),
          })),
        );
        const l = getContentBlock<MarketingPackageLabelsDto>(data, "package-labels");
        const d = DEFAULT_PACKAGE_LABELS;
        setLabels({
          startingFromLabel: pick(l?.startingFromLabel, d.startingFromLabel),
          moreLabel: pick(l?.moreLabel, d.moreLabel),
          backgroundTitle: pick(l?.backgroundTitle, d.backgroundTitle),
          includedTitle: pick(l?.includedTitle, d.includedTitle),
          ctaTitle: pick(l?.ctaTitle, d.ctaTitle),
          ctaLabel: pick(l?.ctaLabel, d.ctaLabel),
          allPackagesLabel: pick(l?.allPackagesLabel, d.allPackagesLabel),
        });
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  return { categories, labels, loaded };
}
