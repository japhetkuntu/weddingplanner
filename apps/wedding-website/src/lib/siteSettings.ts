import { useEffect, useState } from "react";
import { NAV_LINKS, STUDIO } from "@/content/marketing";
import { pick } from "@/content/mergeMarketing";
import { getContentBlock, getMarketingPage, type MarketingNavigationDto, type MarketingSiteLabelsDto, type MarketingSocialDto, type MarketingSeoDto } from "@/lib/marketingApi";

export interface SiteLabels {
  readStory: string;
  numberPrefix: string;
  backToJournal: string;
  noPosts: string;
  enquiryHeading: string;
  name: string;
  email: string;
  weddingDate: string;
  location: string;
  guests: string;
  budget: string;
  message: string;
  send: string;
  sending: string;
  success: string;
  error: string;
}

export const DEFAULT_LABELS: SiteLabels = {
  readStory: "Read the story",
  numberPrefix: "No.",
  backToJournal: "Back to Our Journal",
  noPosts: "No posts in this category yet.",
  enquiryHeading: "Enquiry Form",
  name: "Name*",
  email: "Email*",
  weddingDate: "Wedding date",
  location: "Wedding location",
  guests: "Number of guests",
  budget: "Budget",
  message: "Your message",
  send: "Send enquiry",
  sending: "Sending…",
  success: "Thank you — your enquiry has been received. We'll be in touch within a few days.",
  error: "Something went wrong sending your enquiry — please try again, or email us directly.",
};

export interface SiteSettings {
  links: { label: string; to: string }[];
  loginLabel: string;
  loginUrl: string;
  labels: SiteLabels;
  instagram: string;
  email: string;
  location: string;
  tagline: string;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  links: NAV_LINKS,
  loginLabel: "Log in",
  loginUrl: "https://couples.ovutor.com",
  labels: DEFAULT_LABELS,
  instagram: STUDIO.instagram,
  email: STUDIO.email,
  location: STUDIO.location,
  tagline: STUDIO.tagline,
};

/** Site-wide editable settings (navigation, the Log in button, interface wording, studio contact
 * line) — one shared "studio" content page, fetched once and reused by every component. Starts from
 * the built-in defaults so nothing flashes or breaks if the request is slow or fails. */
export function useSiteSettings(): SiteSettings {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    let alive = true;
    getMarketingPage("studio")
      .then((data) => {
        if (!alive) return;
        const nav = getContentBlock<MarketingNavigationDto>(data, "navigation");
        const lab = getContentBlock<MarketingSiteLabelsDto>(data, "labels");
        const social = getContentBlock<MarketingSocialDto>(data, "social");
        const links = (nav?.links ?? []).filter((l) => l.label?.trim() && l.to?.trim()).map((l) => ({ label: l.label as string, to: l.to as string }));
        const labels = { ...DEFAULT_LABELS };
        (Object.keys(DEFAULT_LABELS) as (keyof SiteLabels)[]).forEach((k) => {
          labels[k] = pick((lab as Record<string, string | null | undefined> | null)?.[k], DEFAULT_LABELS[k]);
        });
        setSettings({
          links: links.length ? links : NAV_LINKS,
          loginLabel: pick(nav?.loginLabel, DEFAULT_SETTINGS.loginLabel),
          loginUrl: pick(nav?.loginUrl, DEFAULT_SETTINGS.loginUrl),
          labels,
          instagram: pick(social?.instagram, STUDIO.instagram),
          email: pick(social?.email, STUDIO.email),
          location: pick(social?.location, STUDIO.location),
          tagline: pick(social?.tagline, STUDIO.tagline),
        });
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return settings;
}

/** Sets the browser tab title and search description for a marketing page from its editable "seo"
 * block, falling back to the built-in defaults. */
export function usePageSeo(pageSlug: string, fallbackTitle: string, fallbackDescription = "") {
  useEffect(() => {
    document.title = fallbackTitle;
    setMeta(fallbackDescription);
    let alive = true;
    getMarketingPage(pageSlug)
      .then((data) => {
        if (!alive) return;
        const seo = getContentBlock<MarketingSeoDto>(data, "seo");
        document.title = pick(seo?.title, fallbackTitle);
        setMeta(pick(seo?.description, fallbackDescription));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [pageSlug, fallbackTitle, fallbackDescription]);
}

function setMeta(description: string) {
  let el = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
  if (!description) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("meta");
    el.name = "description";
    document.head.appendChild(el);
  }
  el.content = description;
}
