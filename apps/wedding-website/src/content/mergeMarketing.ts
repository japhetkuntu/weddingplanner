import type { JournalPost, MarketingMedia } from "@/content/marketing";
import type { FocalPoint } from "@/types";
import type { MarketingHeroDto, MarketingImageDto, MarketingPostsDto } from "@/lib/marketingApi";

/** Per-field fallback: an admin-authored value overrides the static one only when actually
 * present (non-empty). Everything the admin hasn't touched keeps showing the studio's own
 * static copy — this is the one rule the whole merge module exists to enforce, so every field
 * goes through this same helper rather than ad hoc `||` checks scattered around callers. */
export function pick(adminValue: string | null | undefined, staticValue: string): string {
  return adminValue && adminValue.trim() ? adminValue : staticValue;
}

/** The same "whole list, wholesale" rule `hero.media` already uses, generalized: if the admin
 * has saved any items at all for a list-shaped block (flow steps, categories, journal posts, ...),
 * their whole list replaces the static one — there's no per-item fallback within a list, only
 * whole-block fallback. `mapItem` converts one admin-authored item into the page's own static
 * item shape (auto-generating anything the admin DTO doesn't carry, like a display index). */
export function pickList<A, S>(adminItems: A[] | null | undefined, staticItems: S[], mapItem: (item: A, index: number) => S): S[] {
  return adminItems?.length ? adminItems.map(mapItem) : staticItems;
}

export function toMarketingMedia(dto: MarketingImageDto): MarketingMedia {
  return {
    src: dto.url ?? undefined,
    label: dto.label ?? "",
    focalPoint: (dto.focalPoint as FocalPoint) ?? "center",
  };
}

function mergeMedia(admin: MarketingImageDto[] | null | undefined, staticMedia: MarketingMedia[]): MarketingMedia[] {
  return admin?.length ? admin.map(toMarketingMedia) : staticMedia;
}

/** Merges admin-authored hero content over Home's static hero, field by field. Home is the only
 * page with a full hero — eyebrow, title, subtitle, a CTA, and a photo carousel — everything
 * else uses the lighter mergeMediaHero/mergeTextHero below. The media array is treated as one
 * field: if the admin has added any photo at all, their whole array replaces the static one. */
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
    media: mergeMedia(admin?.media, staticHero.media),
  };
}

/** For pages whose hero is just an eyebrow, a title, and a photo (or photo carousel) — What We
 * Do, Our Planning Packages, Our Approach, and Connect with Us (whose single photo is passed in
 * as a one-item array and read back out by the caller). No subtitle or CTA to merge. */
export function mergeMediaHero<T extends { eyebrow: string; title: string; media: MarketingMedia[] }>(admin: MarketingHeroDto | null, staticHero: T): T {
  return {
    ...staticHero,
    eyebrow: pick(admin?.eyebrow, staticHero.eyebrow),
    title: pick(admin?.title, staticHero.title),
    media: mergeMedia(admin?.media, staticHero.media),
  };
}

/** For a page whose masthead is text-only — Our Journal, which has no hero photo. */
export function mergeTextHero<T extends { eyebrow: string; title: string; subtitle: string }>(admin: MarketingHeroDto | null, staticHero: T): T {
  return {
    ...staticHero,
    eyebrow: pick(admin?.eyebrow, staticHero.eyebrow),
    title: pick(admin?.title, staticHero.title),
    subtitle: pick(admin?.subtitle, staticHero.subtitle),
  };
}

/** What We Do's statement block. */
export function mergeStatement<T extends { heading: string; body: string; script: string }>(
  admin: { heading?: string | null; body?: string | null; script?: string | null } | null,
  staticVal: T,
): T {
  return {
    ...staticVal,
    heading: pick(admin?.heading, staticVal.heading),
    body: pick(admin?.body, staticVal.body),
    script: pick(admin?.script, staticVal.script),
  };
}

/** A plain heading + body pair — Our Planning Packages' pre-category heading. */
export function mergeHeadingBody<T extends { heading: string; body: string }>(
  admin: { heading?: string | null; body?: string | null } | null,
  staticVal: T,
): T {
  return { ...staticVal, heading: pick(admin?.heading, staticVal.heading), body: pick(admin?.body, staticVal.body) };
}

/** A single block of plain text — intro paragraphs on Our Planning Packages / Our Approach. */
export function mergeText(admin: { text?: string | null } | null, staticText: string): string {
  return pick(admin?.text, staticText);
}

/** A single { image } block — Our Planning Packages' divider photo. */
export function mergeImageBlock<T extends MarketingMedia>(admin: { image?: MarketingImageDto | null } | null, staticImage: T): T {
  return admin?.image?.url ? (toMarketingMedia(admin.image) as T) : staticImage;
}

/** Our Journal's entire post list — replaced wholesale if the admin has saved any posts at all
 * (same rule as every other list block), used by both the journal index and a post's own detail
 * page (which finds its post by slug within this same merged list, so an admin-added post is
 * reachable at its own URL too). */
export function mergeJournalPosts(admin: MarketingPostsDto["items"], staticPosts: JournalPost[]): JournalPost[] {
  return pickList(admin, staticPosts, (item, i) => ({
    slug: item.slug || `post-${i + 1}`,
    index: String(i + 1).padStart(2, "0"),
    title: item.title ?? "",
    location: item.location ?? "",
    excerpt: item.excerpt ?? "",
    date: item.date ?? "",
    category: item.category ?? "Real Weddings",
    media: item.media?.url ? toMarketingMedia(item.media) : { label: item.title ?? "" },
    body: item.body?.length ? item.body : [],
    photos: item.photos?.length ? item.photos.map(toMarketingMedia) : undefined,
  }));
}

/** Connect with Us's intro paragraphs + the note above the enquiry form — the paragraph list is
 * replaced wholesale if the admin has saved any at all, same rule as every other list block. */
export function mergeParagraphs(
  admin: { paragraphs?: string[] | null; formNote?: string | null } | null,
  staticParagraphs: string[],
  staticFormNote: string,
): { paragraphs: string[]; formNote: string } {
  return {
    paragraphs: admin?.paragraphs?.length ? admin.paragraphs : staticParagraphs,
    formNote: pick(admin?.formNote, staticFormNote),
  };
}
