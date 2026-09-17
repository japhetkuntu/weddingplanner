import type { MarketingMedia } from "@/content/marketing";
import type { FocalPoint } from "@/types";
import type { MarketingHeroDto, MarketingImageDto } from "@/lib/marketingApi";

/** Per-field fallback: an admin-authored value overrides the static one only when actually
 * present (non-empty). Everything the admin hasn't touched keeps showing the studio's own
 * static copy — this is the one rule the whole merge module exists to enforce, so every field
 * goes through this same helper rather than ad hoc `||` checks scattered around callers. */
function pick(adminValue: string | null | undefined, staticValue: string): string {
  return adminValue && adminValue.trim() ? adminValue : staticValue;
}

function toMarketingMedia(dto: MarketingImageDto): MarketingMedia {
  return {
    src: dto.url ?? undefined,
    label: dto.label ?? "",
    focalPoint: (dto.focalPoint as FocalPoint) ?? "center",
  };
}

/** Merges admin-authored hero content over a page's static hero, field by field. The media array
 * is treated as one field: if the admin has added any hero photo at all, their whole array
 * replaces the static one; otherwise the static photos are used untouched. */
export function mergeHero<T extends { eyebrow: string; title: string; subtitle: string; ctaLabel: string; ctaTo: string; media: MarketingMedia[] }>(
  admin: MarketingHeroDto | null,
  staticHero: T,
): T {
  return {
    ...staticHero,
    eyebrow: pick(admin?.eyebrow, staticHero.eyebrow),
    title: pick(admin?.title, staticHero.title),
    subtitle: pick(admin?.subtitle, staticHero.subtitle),
    ctaLabel: pick(admin?.ctaLabel, staticHero.ctaLabel),
    ctaTo: pick(admin?.ctaTo, staticHero.ctaTo),
    media: admin?.media?.length ? admin.media.map(toMarketingMedia) : staticHero.media,
  };
}
