import { ApiError } from "@/lib/api";

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

interface ApiEnvelope<T> {
  message: string;
  code: number;
  data: T | null;
}

export interface MarketingImageDto {
  url?: string | null;
  label?: string | null;
  focalPoint?: string | null;
}

export interface MarketingHeroDto {
  eyebrow?: string | null;
  title?: string | null;
  subtitle?: string | null;
  ctaLabel?: string | null;
  ctaTo?: string | null;
  media?: MarketingImageDto[] | null;
}

/** What We Do's black-and-white statement block. */
export interface MarketingStatementDto {
  heading?: string | null;
  body?: string | null;
  script?: string | null;
}

/** What We Do's 3-row "how we work" flow — a list field, replaced wholesale if the admin has
 * saved any items at all (same rule as hero.media). */
export interface MarketingFlowDto {
  items?: { title?: string | null; body?: string | null; meta?: string | null; image?: MarketingImageDto | null }[] | null;
}

/** A single block of plain text — Our Planning Packages' and Our Approach's intro paragraphs. */
export interface MarketingTextDto {
  text?: string | null;
}

/** A single { image } block — Our Planning Packages' divider photo. */
export interface MarketingImageBlockDto {
  image?: MarketingImageDto | null;
}

/** A heading + body pair — Our Planning Packages' pre-category heading. */
export interface MarketingHeadingBodyDto {
  heading?: string | null;
  body?: string | null;
}

/** Our Planning Packages' category list, each with its own bulleted sub-groups. */
export interface MarketingCategoriesDto {
  items?: { name?: string | null; groups?: { title?: string | null; bullets?: string[] | null }[] | null }[] | null;
}

/** Our Approach's 4-step list. */
export interface MarketingStepsDto {
  items?: { title?: string | null; body?: string | null }[] | null;
}

/** Our Journal's entire post list, photo galleries included. */
export interface MarketingPostsDto {
  items?:
    | {
        slug?: string | null;
        title?: string | null;
        location?: string | null;
        excerpt?: string | null;
        date?: string | null;
        category?: string | null;
        media?: MarketingImageDto | null;
        body?: string[] | null;
        photos?: MarketingImageDto[] | null;
      }[]
    | null;
}

/** Connect with Us's intro paragraphs and the note above the enquiry form. */
export interface MarketingParagraphsDto {
  paragraphs?: string[] | null;
  formNote?: string | null;
}

export interface MarketingSectionDto {
  id: string;
  type: string;
  heading?: string | null;
  body?: string | null;
  image?: MarketingImageDto | null;
  layout: "text-only" | "image-left" | "image-right" | "image-full";
}

export interface MarketingPageDto {
  /** Every named fixed-content block saved for this page, keyed the same way the admin editor
   * names them ("hero", "statement", "categories", ...). Pull a typed slice out with
   * `getContentBlock`. A key with nothing saved for it simply isn't present. */
  content: Record<string, unknown>;
  sections: MarketingSectionDto[];
}

/** Type-asserts one named block out of a fetched page's `content` dictionary — `null` when the
 * admin hasn't saved anything for that key yet, which every merge helper in mergeMarketing.ts
 * already treats the same as "fall back to static". */
export function getContentBlock<T>(page: MarketingPageDto, key: string): T | null {
  return (page.content[key] as T | undefined) ?? null;
}

/** Studio-authored content for one marketing page — the Ovutor studio's own site, not a couple's.
 * Never throws for "nothing admin-authored yet" (the backend returns an empty/null shape, which is
 * a normal state); throws only on a genuine network/server failure, which callers should treat the
 * same way as "nothing admin-authored" — fall back to static content, never break the page. */
export async function getMarketingPage(pageSlug: string): Promise<MarketingPageDto> {
  const res = await fetch(`${BASE_URL}/api/public/marketing/pages/${pageSlug}`);
  const body: ApiEnvelope<MarketingPageDto> = await res.json();
  if (!res.ok || body.code >= 400 || !body.data) throw new ApiError(body.message, body.code);
  return body.data;
}
