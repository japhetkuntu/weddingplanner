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

export interface MarketingSectionDto {
  id: string;
  type: string;
  heading?: string | null;
  body?: string | null;
  image?: MarketingImageDto | null;
  layout: "text-only" | "image-left" | "image-right" | "image-full";
}

export interface MarketingPageDto {
  hero: MarketingHeroDto | null;
  sections: MarketingSectionDto[];
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
