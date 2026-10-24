import { useEffect, useState, type ReactNode } from "react";
import clsx from "clsx";
import { Badge, Button, Input, Label, Select, Skeleton, Textarea, Toast, Toggle } from "@ovutor/ui";
import {
  getMarketingContent,
  updateMarketingContent,
  getMarketingSections,
  createMarketingSection,
  updateMarketingSection,
  setMarketingSectionEnabled,
  deleteMarketingSection,
  uploadMarketingImage,
  errorMessage,
} from "@/lib/api";
import { CURRENCIES } from "@/lib/currency";
import { RichTextEditor } from "@/components/RichTextEditor";
import { SAMPLE_FLOW, SAMPLE_JOURNAL_CATEGORIES, SAMPLE_CONNECT_PARAGRAPHS, SAMPLE_PACKAGES, SAMPLE_POSTS, SAMPLE_STEPS } from "@/lib/samples";
import type {
  MarketingCategories,
  MarketingCategoryGroup,
  MarketingCategoryItem,
  MarketingContentBlock,
  MarketingFlow,
  MarketingFlowItem,
  MarketingHeadingBody,
  MarketingHero,
  MarketingImage,
  MarketingImageBlock,
  MarketingContactDetails,
  MarketingNavigation,
  MarketingSeo,
  MarketingSiteLabels,
  MarketingFeature,
  MarketingParagraphs,
  MarketingStringList,
  MarketingPostItem,
  MarketingPackageLabels,
  MarketingPackageSection,
  MarketingPosts,
  MarketingSection,
  MarketingSectionLayout,
  MarketingSocial,
  MarketingStatement,
  MarketingStepItem,
  MarketingSteps,
  MarketingDiagram,
  MarketingText,
} from "@/types";

type ContentBlockKind = "text" | "heading-body" | "statement" | "image-block" | "paragraphs" | "flow-list" | "steps-list" | "categories-list" | "package-labels" | "seo" | "string-list" | "diagram" | "contact-details" | "feature" | "posts-list";

interface ContentBlockConfig {
  key: string;
  label: string;
  kind: ContentBlockKind;
  /** Shows a small title field above a "text" block (e.g. the label on Our Approach's first card). */
  withTitle?: boolean;
}

interface PageConfig {
  slug: string;
  /** Public path on the website, for the "View live page" link. */
  path: string;
  label: string;
  description: string;
  hasSubtitle: boolean;
  hasCta: boolean;
  hasMedia: boolean;
  /** The current live copy — shown only as input placeholders, never as a real default value, so
   * an admin can see exactly what guests see today without that text ever being accidentally
   * submitted as their own content. Keep these in sync with apps/wedding-website's
   * src/content/marketing.ts when that static copy changes. */
  placeholders: { eyebrow: string; title: string; subtitle?: string; ctaLabel?: string; ctaTo?: string };
  /** Every other named fixed-content block this page defines beyond its hero — each gets its own
   * card below the Hero card, above Extra sections. */
  contentBlocks: ContentBlockConfig[];
}

const PAGES: PageConfig[] = [
  {
    slug: "home",
    path: "/",
    label: "Home",
    description: "The full-bleed hero carousel — nothing else on this page by design.",
    hasSubtitle: true,
    hasCta: true,
    hasMedia: true,
    placeholders: {
      eyebrow: "Ovutor Weddings",
      title: "Thoughtfully planned.\nBeautifully celebrated.",
      subtitle: "A boutique studio designing intimate, unforgettable weddings — from the first toast to the last dance.",
      ctaLabel: "Start planning your day",
      ctaTo: "/connect-with-us",
    },
    contentBlocks: [{ key: "seo", label: "Browser tab title and search description", kind: "seo" }],
  },
  {
    slug: "what-we-do",
    path: "/what-we-do",
    label: "What We Do",
    description: "The hero, the black-and-white statement, and the how-we-work flow.",
    hasSubtitle: false,
    hasCta: false,
    hasMedia: true,
    placeholders: { eyebrow: "About Ovutor", title: "The studio behind\nyour wedding day" },
    contentBlocks: [
      { key: "seo", label: "Browser tab title and search description", kind: "seo" },
      { key: "statement", label: "Statement", kind: "statement" },
      { key: "flow", label: "How we work", kind: "flow-list" },
    ],
  },
  {
    slug: "our-planning-packages",
    path: "/our-planning-packages",
    label: "Our Planning Packages",
    description: "The hero, intro text, divider photo, heading, and the category list.",
    hasSubtitle: false,
    hasCta: false,
    hasMedia: true,
    placeholders: { eyebrow: "Our planning packages", title: "Destination weddings,\ndesigned with intention" },
    contentBlocks: [
      { key: "seo", label: "Browser tab title and search description", kind: "seo" },
      { key: "intro", label: "Intro text", kind: "text" },
      { key: "divider", label: "Divider photo and overlay text", kind: "image-block" },
      { key: "heading", label: "Heading before the categories", kind: "heading-body" },
      { key: "categories", label: "Packages (cards and each package's own page)", kind: "categories-list" },
      { key: "package-labels", label: "Package wording (labels and button text)", kind: "package-labels" },
    ],
  },
  {
    slug: "our-approach",
    path: "/our-approach",
    label: "Our Approach",
    description: "The hero, intro text, and the four steps.",
    hasSubtitle: false,
    hasCta: false,
    hasMedia: true,
    placeholders: { eyebrow: "How we work", title: "A process built\naround you" },
    contentBlocks: [
      { key: "seo", label: "Browser tab title and search description", kind: "seo" },
      { key: "intro", label: "Intro text", kind: "text", withTitle: true },
      { key: "diagram", label: "Process diagram (the circles under the intro)", kind: "diagram" },
      { key: "steps", label: "Steps", kind: "steps-list" },
    ],
  },
  {
    slug: "our-journal",
    path: "/our-journal",
    label: "Our Journal",
    description: "The masthead text and the entire post list.",
    hasSubtitle: true,
    hasCta: false,
    hasMedia: false,
    placeholders: {
      eyebrow: "Our Journal — the stories we tell",
      title: "From every wedding, a story worth telling.",
      subtitle: "Real weddings we've planned, destination guides, and the odd bit of planning advice — from us to you.",
    },
    contentBlocks: [
      { key: "seo", label: "Browser tab title and search description", kind: "seo" },
      { key: "posts", label: "Journal posts", kind: "posts-list" },
      { key: "categories", label: "Categories (the filter tabs and the post category list)", kind: "string-list" },
    ],
  },
  {
    slug: "connect-with-us",
    path: "/connect-with-us",
    label: "Connect with Us",
    description: "The intro eyebrow, title and photo, plus the intro paragraphs.",
    hasSubtitle: false,
    hasCta: false,
    hasMedia: true,
    placeholders: { eyebrow: "Get in touch", title: "Let's connect" },
    contentBlocks: [
      { key: "seo", label: "Browser tab title and search description", kind: "seo" },
      { key: "intro", label: "Top section text", kind: "paragraphs" },
      { key: "details", label: "Top section contact details", kind: "contact-details" },
      { key: "before-form", label: "Extra section before the enquiry form", kind: "feature" },
    ],
  },
];

/** The movable built-in blocks of each page, in their built-in order — "sections" stands for the
 * admin-added extra sections. Must match the `defaults` each website page passes to orderPage().
 * The hero/top banner is not movable: it always comes first. */
const PAGE_LAYOUTS: Record<string, (string | { id: string; label: string })[]> = {
  home: ["sections"],
  "what-we-do": [{ id: "statement", label: "Statement" }, { id: "flow", label: "How we work" }, "sections"],
  "our-planning-packages": [
    { id: "intro", label: "Intro text" },
    { id: "divider", label: "Divider photo" },
    { id: "heading", label: "Heading before the packages" },
    { id: "packages", label: "Packages" },
    "sections",
  ],
  "our-approach": [{ id: "steps", label: "Intro and the stacked steps" }, "sections"],
  "our-journal": ["sections", { id: "posts", label: "Category tabs and the post list" }],
  "connect-with-us": [{ id: "feature", label: "Image-and-text section" }, { id: "form", label: "Enquiry form" }, "sections"],
};

/** Same resolution rule as the website's orderPage(): the saved order wins, anything missing goes to the
 * end, unknown ids are dropped. */
function resolveLayout(slug: string, sections: MarketingSection[], saved: string[]) {
  const labels = new Map<string, string>();
  const defaults: string[] = [];
  (PAGE_LAYOUTS[slug] ?? ["sections"]).forEach((d) => {
    if (d === "sections") {
      sections.forEach((s) => {
        const id = `section:${s.id}`;
        defaults.push(id);
        labels.set(id, `Extra section: ${s.content.heading || s.title || "Untitled"}`);
      });
    } else if (typeof d !== "string") {
      defaults.push(d.id);
      labels.set(d.id, d.label);
    }
  });
  const result = saved.filter((id, i) => defaults.includes(id) && saved.indexOf(id) === i);
  defaults.forEach((id) => {
    if (!result.includes(id)) result.push(id);
  });
  return { order: result, labels, defaults };
}

/** Which content blocks each movable built-in block of a page edits, and which blocks live in the
 * fixed banner card or the fixed cards at the bottom. Keys refer to PAGES[].contentBlocks. */
const PAGE_STRUCTURE: Record<
  string,
  { top: string[]; blocks: Record<string, { title: string; keys: string[]; note?: string }>; bottom: string[] }
> = {
  home: { top: [], blocks: {}, bottom: ["seo"] },
  "what-we-do": {
    top: [],
    blocks: { statement: { title: "Statement", keys: ["statement"] }, flow: { title: "How we work", keys: ["flow"] } },
    bottom: ["seo"],
  },
  "our-planning-packages": {
    top: [],
    blocks: {
      intro: { title: "Introduction", keys: ["intro"] },
      divider: { title: "Divider photo", keys: ["divider"] },
      heading: { title: "Heading before the packages", keys: ["heading"] },
      packages: { title: "Packages", keys: ["categories"] },
    },
    bottom: ["package-labels", "seo"],
  },
  "our-approach": { top: [], blocks: { steps: { title: "Introduction and steps", keys: ["intro", "diagram", "steps"] } }, bottom: ["seo"] },
  "our-journal": { top: [], blocks: { posts: { title: "Posts and categories", keys: ["posts", "categories"] } }, bottom: ["seo"] },
  "connect-with-us": {
    top: ["intro", "details"],
    blocks: {
      feature: { title: "Image-and-text section", keys: ["before-form"] },
      form: {
        title: "Enquiry form",
        keys: [],
        note: "The form's labels, button and messages are edited under Whole site → Navigation and wording.",
      },
    },
    bottom: ["seo"],
  },
};

/** A one-line summary shown on a collapsed card, so the list is scannable without opening anything. */
function blockHint(key: string, value: unknown): string {
  const v = (value ?? {}) as Record<string, unknown>;
  const n = (x: unknown) => (Array.isArray(x) ? x.length : 0);
  const plural = (c: number, word: string) => `${c} ${word}${c === 1 ? "" : "s"}`;
  switch (key) {
    case "diagram":
      return (v.image as { url?: string } | undefined)?.url ? "Your picture" : n(v.items) ? plural(n(v.items), "circle") : "Using built-in circles";
    case "steps":
      return n(v.items) ? plural(n(v.items), "step") : "Using built-in steps";
    case "flow":
      return n(v.items) ? plural(n(v.items), "row") : "Using built-in rows";
    case "posts":
      return n(v.items) ? plural(n(v.items), "post") : "Using built-in posts";
    case "categories":
      return n(v.items) ? plural(n(v.items), "item") : "Using built-in list";
    case "statement":
    case "heading":
      return String(v.heading ?? "") || "Using built-in text";
    case "details":
      return [v.email, v.phone].filter(Boolean).join(" · ") || "Using built-in details";
    case "before-form":
      return v.hidden ? "Hidden" : String(v.heading ?? "") || "Using built-in section";
    case "divider":
      return String(v.title ?? "") || ((v.image as { url?: string } | undefined)?.url ? "Custom photo" : "Using built-in photo");
    case "intro": {
      const text = String(v.title ?? v.text ?? (Array.isArray(v.paragraphs) ? (v.paragraphs as string[])[0] : "") ?? "");
      return text.replace(/<[^>]+>/g, " ").trim().slice(0, 60) || "Using built-in text";
    }
    case "seo":
      return String(v.title ?? "") || "Using the default title";
    default:
      return "";
  }
}

/** A fold-away card in the page editor. Header shows the title, a one-line hint, and the order
 * controls; only one card is open at a time (the page owns `open`). */
function BlockCard({
  title,
  hint,
  open,
  onToggle,
  onMoveUp,
  onMoveDown,
  accent = "primary",
  badge,
  children,
}: {
  title: string;
  hint?: string;
  open: boolean;
  onToggle: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  accent?: "primary" | "gold" | "ink";
  badge?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={clsx("border-l-[3px] bg-white shadow-card", accent === "gold" ? "border-gold" : accent === "ink" ? "border-ink/30" : "border-primary")}>
      <div className="flex items-center gap-2 px-4 py-3">
        <button type="button" onClick={onToggle} aria-expanded={open} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <span className={clsx("inline-block text-[10px] text-ink/40 transition-transform", open && "rotate-90")}>▶</span>
          <span className="min-w-0">
            <span className="block truncate font-display text-lg leading-tight">{title}</span>
            {hint ? <span className="block truncate text-xs text-ink/50">{hint}</span> : null}
          </span>
        </button>
        {badge}
        {onMoveUp || onMoveDown ? (
          <span className="flex shrink-0 items-center">
            <button type="button" disabled={!onMoveUp} onClick={onMoveUp} aria-label="Move up" className="px-2 py-1 text-sm font-bold text-ink/60 hover:text-ink disabled:opacity-20">
              ↑
            </button>
            <button type="button" disabled={!onMoveDown} onClick={onMoveDown} aria-label="Move down" className="px-2 py-1 text-sm font-bold text-ink/60 hover:text-ink disabled:opacity-20">
              ↓
            </button>
          </span>
        ) : null}
      </div>
      {/* Kept mounted while folded so half-typed edits survive closing the card. */}
      <div className={clsx("border-t border-[#eee] px-4 pb-5 pt-4", !open && "hidden")}>{children}</div>
    </div>
  );
}

const LAYOUT_LABEL: Record<MarketingSectionLayout, string> = {
  "text-only": "Text only",
  "image-left": "Image left",
  "image-right": "Image right",
  "image-full": "Full-bleed image",
};

const emptyBlock = (): MarketingContentBlock => ({ heading: "", body: "", image: undefined, layout: "text-only" });

/** A list item that folds away to a one-line header, so long lists stay manageable. New (empty)
 * items start open; everything else starts folded. */
function Collapsible({
  title,
  hint,
  onRemove,
  removeLabel = "Remove",
  defaultOpen = false,
  actions,
  children,
  className,
}: {
  title: string;
  hint?: string;
  onRemove?: () => void;
  removeLabel?: string;
  defaultOpen?: boolean;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={clsx("border border-[#ddd] bg-white", className)}>
      <div className="flex items-center gap-3 px-3 py-2.5">
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex min-w-0 flex-1 items-center gap-2 text-left">
          <span className={clsx("inline-block text-[10px] text-ink/50 transition-transform", open && "rotate-90")}>▶</span>
          <span className="truncate text-sm font-bold">{title || "Untitled"}</span>
          {hint ? <span className="hidden truncate text-xs text-ink/40 sm:inline">{hint}</span> : null}
        </button>
        {actions}
        {onRemove ? (
          <button type="button" onClick={onRemove} className="shrink-0 text-xs font-bold text-primary">
            {removeLabel}
          </button>
        ) : null}
      </div>
      {open ? <div className="border-t border-[#eee] p-3">{children}</div> : null}
    </div>
  );
}

/** Shown while a list is empty: fills it with the copy the public site currently falls back to, so
 * it can be edited, reordered or trimmed instead of retyped. Nothing is saved until Save is pressed. */
function LoadSamples({ label, onLoad }: { label: string; onLoad: () => void }) {
  return (
    <div className="mb-3 border border-dashed border-[#ccc] bg-bg-warm p-3">
      <p className="mb-2 text-xs text-ink/60">
        This list is empty, so the website is showing its built-in content. Load that content here to edit it.
      </p>
      <Button type="button" variant="outline" size="sm" onClick={onLoad}>
        {label}
      </Button>
    </div>
  );
}

function PageEditorSkeleton() {
  return (
    <div className="ovutor-fade-in">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="mt-2 h-4 w-96" />
      <Skeleton className="mt-6 h-[380px] w-full" />
      <Skeleton className="mt-6 h-40 w-full" />
    </div>
  );
}

/** Navigation, the Log in button and the wording used around the site (journal links, the enquiry
 * form's labels and messages). Stored under the same page-independent "studio" slug. Blank fields
 * keep the built-in wording. */
function SiteSettingsCard() {
  const [nav, setNav] = useState<MarketingNavigation>({});
  const [labels, setLabels] = useState<MarketingSiteLabels>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getMarketingContent<MarketingNavigation>("studio", "navigation"), getMarketingContent<MarketingSiteLabels>("studio", "labels")])
      .then(([n, l]) => {
        setNav(n ?? {});
        setLabels(l ?? {});
      })
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const cleanLinks = (nav.links ?? []).filter((l) => l.label?.trim() && l.to?.trim());
      await updateMarketingContent("studio", "navigation", { ...nav, links: cleanLinks });
      await updateMarketingContent("studio", "labels", labels);
      setToast("Saved");
    } catch (e) {
      setToast(errorMessage(e, "Couldn't save — please try again."));
    } finally {
      setSaving(false);
      window.setTimeout(() => setToast(null), 2400);
    }
  }

  const links = nav.links ?? [];
  const fields: { key: keyof MarketingSiteLabels; label: string; placeholder: string; long?: boolean }[] = [
    { key: "readStory", label: "Journal: link under each post", placeholder: "Read the story" },
    { key: "numberPrefix", label: "Numbering prefix (“No. 01” on posts, rows and steps)", placeholder: "No." },
    { key: "backToJournal", label: "Journal post: back link", placeholder: "Back to Our Journal" },
    { key: "noPosts", label: "Journal: no posts message", placeholder: "No posts in this category yet." },
    { key: "enquiryHeading", label: "Enquiry form heading", placeholder: "Enquiry Form" },
    { key: "name", label: "Form: name label", placeholder: "Name*" },
    { key: "email", label: "Form: email label", placeholder: "Email*" },
    { key: "weddingDate", label: "Form: wedding date label", placeholder: "Wedding date" },
    { key: "location", label: "Form: location label", placeholder: "Wedding location" },
    { key: "guests", label: "Form: guests label", placeholder: "Number of guests" },
    { key: "budget", label: "Form: budget label", placeholder: "Budget" },
    { key: "message", label: "Form: message label", placeholder: "Your message" },
    { key: "send", label: "Form: send button", placeholder: "Send enquiry" },
    { key: "sending", label: "Form: sending text", placeholder: "Sending…" },
    { key: "success", label: "Form: thank-you message", placeholder: "Thank you — your enquiry has been received…", long: true },
    { key: "error", label: "Form: error message", placeholder: "Something went wrong…", long: true },
  ];

  return (
    <Collapsible title="Site settings — navigation, Log in button and interface wording" className="mt-4 border-t-[3px] border-gold shadow-card">
      {loading ? (
        <Skeleton className="h-24 w-full" />
      ) : (
        <>
          <h3 className="mb-1 text-sm font-bold">Navigation links</h3>
          <p className="mb-2 text-xs text-ink/50">Shown in the menu and the footer. Leave the list empty to keep the built-in links.</p>
          <div className="space-y-2">
            {links.map((l, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2">
                <Input
                  className="min-w-[160px] flex-1"
                  placeholder="Label"
                  value={l.label ?? ""}
                  onChange={(e) => setNav({ ...nav, links: links.map((x, idx) => (idx === i ? { ...x, label: e.target.value } : x)) })}
                />
                <Input
                  className="min-w-[160px] flex-1"
                  placeholder="/page or https://…"
                  value={l.to ?? ""}
                  onChange={(e) => setNav({ ...nav, links: links.map((x, idx) => (idx === i ? { ...x, to: e.target.value } : x)) })}
                />
                <button
                  type="button"
                  disabled={i === 0}
                  onClick={() => {
                    const next = [...links];
                    [next[i - 1], next[i]] = [next[i], next[i - 1]];
                    setNav({ ...nav, links: next });
                  }}
                  className="text-xs font-bold text-ink/50 disabled:opacity-30"
                >
                  Up
                </button>
                <button type="button" onClick={() => setNav({ ...nav, links: links.filter((_, idx) => idx !== i) })} className="text-xs font-bold text-primary">
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setNav({ ...nav, links: [...links, { label: "", to: "" }] })} className="mt-2 text-xs font-bold uppercase tracking-[.06em] text-primary">
            + Add link
          </button>

          <h3 className="mb-1 mt-6 text-sm font-bold">Log in button (in the menu)</h3>
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            <div>
              <Label>Button text</Label>
              <Input value={nav.loginLabel ?? ""} placeholder="Log in" onChange={(e) => setNav({ ...nav, loginLabel: e.target.value })} />
            </div>
            <div>
              <Label>Button link</Label>
              <Input value={nav.loginUrl ?? ""} placeholder="https://couples.ovutor.com" onChange={(e) => setNav({ ...nav, loginUrl: e.target.value })} />
            </div>
          </div>

          <h3 className="mb-1 mt-6 text-sm font-bold">Interface wording</h3>
          <p className="mb-2 text-xs text-ink/50">Leave a field blank to keep the current wording (shown as the placeholder).</p>
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            {fields.map((f) => (
              <div key={f.key} className={f.long ? "sm:col-span-2" : undefined}>
                <Label>{f.label}</Label>
                <Input value={labels[f.key] ?? ""} placeholder={f.placeholder} onChange={(e) => setLabels({ ...labels, [f.key]: e.target.value })} />
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center gap-3">
            <Button onClick={save} loading={saving} loadingText="Saving…">
              Save site settings
            </Button>
            {toast ? <span className="text-sm text-ink/60">{toast}</span> : null}
          </div>
        </>
      )}
    </Collapsible>
  );
}

/** Page-independent studio settings — kept out of the per-page tab switcher below (a "Studio"
 * tab would force an awkward Hero card with eyebrow/title fields that don't apply here) but
 * stored the same way, under pageSlug "studio" so the generic content endpoints need no change.
 * Shown in the wedding-website's nav and footer on every page. */
function StudioProfileCard() {
  const [social, setSocial] = useState<MarketingSocial>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    getMarketingContent<MarketingSocial>("studio", "social")
      .then((v) => setSocial(v ?? {}))
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const saved = await updateMarketingContent("studio", "social", social);
      setSocial(saved);
      setToast("Saved");
      window.setTimeout(() => setToast(null), 2200);
    } catch (e) {
      setToast(errorMessage(e, "Couldn't save — please try again."));
      window.setTimeout(() => setToast(null), 3200);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-4 border-t-[3px] border-gold bg-white p-5 shadow-card">
      <h2 className="mb-1 font-display text-xl">Studio profile</h2>
      <p className="mb-4 text-sm text-ink/60">Shown in the site's navigation and footer on every page.</p>
      {loading ? (
        <Skeleton className="h-11 w-full max-w-sm" />
      ) : (
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex-1 min-w-[220px] max-w-sm">
            <Label htmlFor="studio-instagram">Instagram handle</Label>
            <Input
              id="studio-instagram"
              placeholder="@ovutorweddings"
              value={social.instagram ?? ""}
              onChange={(e) => setSocial({ ...social, instagram: e.target.value })}
            />
            <Label htmlFor="studio-email" className="mt-3">Studio email</Label>
            <Input id="studio-email" placeholder="hello@ovutor.com" value={social.email ?? ""} onChange={(e) => setSocial({ ...social, email: e.target.value })} />
            <Label htmlFor="studio-location" className="mt-3">Location line</Label>
            <Input id="studio-location" value={social.location ?? ""} onChange={(e) => setSocial({ ...social, location: e.target.value })} />
            <Label htmlFor="studio-tagline" className="mt-3">Tagline</Label>
            <Input id="studio-tagline" value={social.tagline ?? ""} onChange={(e) => setSocial({ ...social, tagline: e.target.value })} />
          </div>
          <Button onClick={save} loading={saving} loadingText="Saving…">
            Save
          </Button>
        </div>
      )}
      <Toast open={!!toast}>{toast}</Toast>
    </div>
  );
}

export default function StudioWebsitePage() {
  const SITE = "__site";
  const [selectedSlug, setSelectedSlug] = useState<string>(PAGES[0].slug);
  const [openId, setOpenId] = useState<string | null>("hero");
  const page = PAGES.find((p) => p.slug === selectedSlug) ?? PAGES[0];
  const [hero, setHero] = useState<MarketingHero | null>(null);
  const [blockValues, setBlockValues] = useState<Record<string, unknown>>({});
  const [savedLayout, setSavedLayout] = useState<string[]>([]);
  const [sections, setSections] = useState<MarketingSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedSlug === SITE) {
      setLoading(false);
      return;
    }
    setOpenId("hero");
    setLoading(true);
    setHero(null);
    setBlockValues({});
    setSavedLayout([]);
    Promise.all([
      getMarketingContent<MarketingHero>(selectedSlug, "hero").then((h) => setHero(h ?? {})),
      getMarketingSections(selectedSlug).then(setSections),
      getMarketingContent<{ order?: string[] }>(selectedSlug, "layout").then((l) => setSavedLayout(l?.order ?? [])),
      Promise.all(page.contentBlocks.map((b) => getMarketingContent(selectedSlug, b.key).then((v) => [b.key, v] as const))).then((pairs) =>
        setBlockValues(Object.fromEntries(pairs)),
      ),
    ]).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSlug]);

  function flashToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  }

  function flashError(message: string) {
    setError(message);
    window.setTimeout(() => setError(null), 3200);
  }

  async function saveHero(next: MarketingHero) {
    try {
      const saved = await updateMarketingContent(selectedSlug, "hero", next);
      setHero(saved);
      flashToast("Saved");
    } catch (e) {
      flashError(errorMessage(e, "Couldn't save the hero section — please try again."));
    }
  }

  async function saveBlock(key: string, value: unknown) {
    try {
      const saved = await updateMarketingContent(selectedSlug, key, value);
      setBlockValues((prev) => ({ ...prev, [key]: saved }));
      flashToast("Saved");
    } catch (e) {
      flashError(errorMessage(e, "Couldn't save that — please try again."));
    }
  }

  async function addSection() {
    try {
      const created = await createMarketingSection(selectedSlug, "New section", emptyBlock());
      setSections((prev) => [...prev, created]);
      setOpenId(`section:${created.id}`);
      flashToast("Section added");
    } catch (e) {
      flashError(errorMessage(e, "Couldn't add a new section — please try again."));
    }
  }

  async function saveSection(id: string, title: string, content: MarketingContentBlock) {
    try {
      const saved = await updateMarketingSection(id, title, content);
      setSections((prev) => prev.map((s) => (s.id === id ? saved : s)));
      flashToast("Saved");
    } catch (e) {
      flashError(errorMessage(e, "Couldn't save that section — please try again."));
    }
  }

  async function toggleSection(id: string, isEnabled: boolean) {
    try {
      const saved = await setMarketingSectionEnabled(id, isEnabled);
      setSections((prev) => prev.map((s) => (s.id === id ? saved : s)));
    } catch (e) {
      flashError(errorMessage(e, "Couldn't update that section — please try again."));
    }
  }

  async function removeSection(id: string) {
    try {
      await deleteMarketingSection(id);
      setSections((prev) => prev.filter((s) => s.id !== id));
      flashToast("Section deleted");
    } catch (e) {
      flashError(errorMessage(e, "Couldn't delete that section — please try again."));
    }
  }

  async function moveItem(order: string[], index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= order.length) return;
    const next = [...order];
    [next[index], next[target]] = [next[target], next[index]];
    setSavedLayout(next);
    try {
      const saved = await updateMarketingContent(selectedSlug, "layout", { order: next });
      setSavedLayout(saved.order ?? next);
      flashToast("Order saved");
    } catch (e) {
      setSavedLayout(order);
      flashError(errorMessage(e, "Couldn't save the new order — please try again."));
    }
  }

  const structure = PAGE_STRUCTURE[selectedSlug] ?? { top: [], blocks: {}, bottom: ["seo"] };
  const blockConfig = (key: string) => page.contentBlocks.find((b) => b.key === key);
  const renderBlockForm = (key: string) => {
    const block = blockConfig(key);
    if (!block) return null;
    return (
      <div key={key} className="mt-5 first:mt-0">
        <h3 className="mb-2 text-xs font-bold uppercase tracking-[.08em] text-ink/50">{block.label}</h3>
        <ContentBlockForm pageSlug={selectedSlug} block={block} value={blockValues[key]} onSave={(v) => saveBlock(key, v)} />
      </div>
    );
  };
  const { order: layoutOrder } = resolveLayout(selectedSlug, sections, savedLayout);
  const siteBase = (import.meta.env.VITE_WEDDING_WEBSITE_URL as string | undefined) ?? "";

  return (
    <div className="ovutor-fade-in">
      <div className="mb-1">
        <h1 className="font-display text-3xl">Studio website</h1>
        <p className="text-sm text-ink/60">Every field falls back to our current live copy until you fill it in.</p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label="Website pages" className="lg:sticky lg:top-6 lg:self-start">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[.14em] text-ink/40">Pages</p>
          <div className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
            {PAGES.map((p) => (
              <button
                key={p.slug}
                type="button"
                onClick={() => setSelectedSlug(p.slug)}
                className={clsx(
                  "border-l-[3px] px-3 py-2 text-left text-sm font-bold",
                  p.slug === selectedSlug ? "border-gold bg-gold/25 text-ink" : "border-transparent text-ink/70 hover:bg-bg-warm",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          <p className="mb-2 mt-5 text-[10px] font-bold uppercase tracking-[.14em] text-ink/40">Whole site</p>
          <button
            type="button"
            onClick={() => setSelectedSlug(SITE)}
            className={clsx(
              "w-full border-l-[3px] px-3 py-2 text-left text-sm font-bold",
              selectedSlug === SITE ? "border-gold bg-gold/25 text-ink" : "border-transparent text-ink/70 hover:bg-bg-warm",
            )}
          >
            Brand, navigation and wording
          </button>
        </nav>

        <div className="min-w-0">
          {selectedSlug === SITE ? (
            <>
              <div className="mb-1">
                <h2 className="font-display text-2xl">Brand, navigation and wording</h2>
                <p className="text-sm text-ink/60">Things that appear on every page — the menu, footer details and the words around the site.</p>
              </div>
              <StudioProfileCard />
              <SiteSettingsCard />
            </>
          ) : (
            <>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl">{page.label}</h2>
                  <p className="text-sm text-ink/60">{page.description}</p>
                </div>
                {siteBase ? (
                  <a
                    href={`${siteBase.replace(/\/$/, "")}${page.path}`}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 border border-ink/30 px-3 py-2 text-xs font-bold uppercase tracking-[.08em] hover:border-ink"
                  >
                    View live page ↗
                  </a>
                ) : null}
              </div>
              <p className="mb-4 mt-2 text-xs text-ink/50">
                Blocks are listed in the order they appear on the page. Use the arrows to reorder; anything left empty keeps the built-in wording.
              </p>

              {loading || !hero ? (
                <PageEditorSkeleton />
              ) : (
                <div className="space-y-3">
                  <BlockCard
                    title="Top banner"
                    hint={hero.title ? hero.title.replace(/\n/g, " ") : page.placeholders.title.replace(/\n/g, " ")}
                    open={openId === "hero"}
                    onToggle={() => setOpenId(openId === "hero" ? null : "hero")}
                    accent="ink"
                    badge={<span className="hidden shrink-0 text-[10px] font-bold uppercase tracking-[.1em] text-ink/40 sm:inline">Always first</span>}
                  >
                    <HeroForm key={selectedSlug} page={page} hero={hero} onSave={saveHero} />
                    {structure.top.map(renderBlockForm)}
                  </BlockCard>

                  {layoutOrder.map((id, i) => {
                    const up = i > 0 ? () => moveItem(layoutOrder, i, -1) : undefined;
                    const down = i < layoutOrder.length - 1 ? () => moveItem(layoutOrder, i, 1) : undefined;
                    if (id.startsWith("section:")) {
                      const section = sections.find((s) => `section:${s.id}` === id);
                      if (!section) return null;
                      return (
                        <SectionEditor
                          key={id}
                          pageSlug={selectedSlug}
                          section={section}
                          open={openId === id}
                          onOpenChange={(o) => setOpenId(o ? id : null)}
                          onSave={(title, content) => saveSection(section.id, title, content)}
                          onToggle={(enabled) => toggleSection(section.id, enabled)}
                          onDelete={() => removeSection(section.id)}
                          onMoveUp={up}
                          onMoveDown={down}
                        />
                      );
                    }
                    const def = structure.blocks[id];
                    if (!def) return null;
                    return (
                      <BlockCard
                        key={id}
                        title={def.title}
                        hint={def.keys.map((k) => blockHint(k, blockValues[k])).filter(Boolean).join(" · ")}
                        open={openId === id}
                        onToggle={() => setOpenId(openId === id ? null : id)}
                        onMoveUp={up}
                        onMoveDown={down}
                      >
                        {def.note ? <p className="text-sm text-ink/60">{def.note}</p> : null}
                        {def.keys.map(renderBlockForm)}
                      </BlockCard>
                    );
                  })}

                  <button
                    type="button"
                    onClick={addSection}
                    className="flex w-full items-center justify-center gap-2 border border-dashed border-[#bbb] bg-white px-4 py-4 text-sm font-bold text-ink/60 hover:border-ink hover:text-ink"
                  >
                    + Add a section to this page
                  </button>

                  {structure.bottom.map((key) => {
                    const block = blockConfig(key);
                    if (!block) return null;
                    return (
                      <BlockCard
                        key={key}
                        accent="gold"
                        title={key === "seo" ? "Search and browser tab" : block.label}
                        hint={blockHint(key, blockValues[key])}
                        open={openId === key}
                        onToggle={() => setOpenId(openId === key ? null : key)}
                      >
                        <ContentBlockForm pageSlug={selectedSlug} block={block} value={blockValues[key]} onSave={(v) => saveBlock(key, v)} />
                      </BlockCard>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Toast open={!!toast}>{toast}</Toast>
      <Toast open={!!error} tone="error">
        {error}
      </Toast>
    </div>
  );
}

function ImageField({
  pageSlug,
  image,
  onChange,
  idPrefix,
}: {
  pageSlug: string;
  image?: MarketingImage;
  onChange: (image: MarketingImage) => void;
  idPrefix: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const value = image ?? {};

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const url = await uploadMarketingImage(pageSlug, file);
      onChange({ ...value, url, label: value.label || file.name });
    } catch {
      setError("Couldn't upload that photo — try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex gap-3">
      <div className="grid h-16 w-16 shrink-0 place-items-center border border-dashed border-[#ccc] bg-bg-warm text-center text-[10px] text-ink/40">
        {value.url ? (
          <img src={value.url} alt={value.label ?? ""} className="h-full w-full object-cover" loading="lazy" decoding="async" />
        ) : (
          <span className="px-1">No image</span>
        )}
      </div>
      <div className="flex-1 space-y-2">
        <Input placeholder="Photo label" value={value.label ?? ""} onChange={(e) => onChange({ ...value, label: e.target.value })} />
        <Label
          htmlFor={`${idPrefix}-file`}
          className={clsx(
            "mt-0 inline-block cursor-pointer border border-[#8e8985] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[.06em] text-ink/70 hover:border-ink",
            uploading && "pointer-events-none opacity-50",
          )}
        >
          {uploading ? "Uploading…" : "Choose file"}
          <input
            id={`${idPrefix}-file`}
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </Label>
        {value.url ? (
          <div className="flex gap-2">
            {(["top", "center", "bottom"] as const).map((point) => (
              <button
                key={point}
                type="button"
                onClick={() => onChange({ ...value, focalPoint: point })}
                className={clsx(
                  "flex-1 border px-2 py-1 text-[10px] font-bold uppercase tracking-[.06em]",
                  (value.focalPoint ?? "center") === point ? "border-primary text-primary" : "border-[#8e8985] text-ink/70 hover:border-ink",
                )}
              >
                {point}
              </button>
            ))}
          </div>
        ) : null}
        {error ? <p className="text-xs text-primary">{error}</p> : null}
      </div>
    </div>
  );
}

/** A plain add/remove list of single-line or multi-line text — journal post paragraphs, bulleted
 * groups, etc. `multiline` picks Textarea vs Input; that's the only variation between uses. */
function StringListEditor({
  items,
  onChange,
  placeholder,
  addLabel,
  multiline,
  rich,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  addLabel: string;
  multiline?: boolean;
  /** Each entry gets the rich-text editor (bold, links, lists…) instead of a plain box. */
  rich?: boolean;
}) {
  const Field = multiline ? Textarea : Input;
  return (
    <div>
      <div className="space-y-2">
        {items.map((value, i) => (
          <div key={i} className="flex gap-2">
            {rich ? (
              <div className="flex-1">
                <RichTextEditor minHeight={56} placeholder={placeholder} value={value} onChange={(v) => onChange(items.map((x, idx) => (idx === i ? v : x)))} />
              </div>
            ) : (
              <Field placeholder={placeholder} value={value} onChange={(e) => onChange(items.map((v, idx) => (idx === i ? e.target.value : v)))} className="flex-1" />
            )}
            <button type="button" onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="text-xs font-bold text-primary" aria-label="Remove">
              &times;
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => onChange([...items, ""])} className="mt-2 text-xs font-bold uppercase tracking-[.06em] text-primary">
        + {addLabel}
      </button>
    </div>
  );
}

function HeroForm({ page, hero, onSave }: { page: PageConfig; hero: MarketingHero; onSave: (hero: MarketingHero) => void }) {
  const [form, setForm] = useState(hero);
  const [saving, setSaving] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        await onSave(form);
        setSaving(false);
      }}
    >
      <Label htmlFor="hero-eyebrow">Eyebrow</Label>
      <Input id="hero-eyebrow" placeholder={page.placeholders.eyebrow} value={form.eyebrow ?? ""} onChange={(e) => setForm({ ...form, eyebrow: e.target.value })} />

      <Label htmlFor="hero-title">Title</Label>
      <Textarea id="hero-title" placeholder={page.placeholders.title} value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })} />

      {page.hasSubtitle ? (
        <>
          <Label htmlFor="hero-subtitle">Subtitle</Label>
          <RichTextEditor minHeight={90} placeholder={page.placeholders.subtitle} value={form.subtitle ?? ""} onChange={(subtitle) => setForm({ ...form, subtitle })} />
        </>
      ) : null}

      {page.hasCta ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="hero-cta-label">Button label</Label>
            <Input id="hero-cta-label" placeholder={page.placeholders.ctaLabel} value={form.ctaLabel ?? ""} onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="hero-cta-to">Button link</Label>
            <Input id="hero-cta-to" placeholder={page.placeholders.ctaTo} value={form.ctaTo ?? ""} onChange={(e) => setForm({ ...form, ctaTo: e.target.value })} />
          </div>
        </div>
      ) : null}

      {page.hasMedia ? (
        <>
          <Label>{page.slug === "connect-with-us" ? "Photo" : "Hero photos"}</Label>
          <div className="space-y-3">
            {(form.media ?? []).map((img, i) => (
              <div key={i} className="flex items-start gap-2 border border-[#eee] p-3">
                <div className="flex-1">
                  <ImageField
                    pageSlug={page.slug}
                    idPrefix={`hero-media-${i}`}
                    image={img}
                    onChange={(image) => setForm({ ...form, media: (form.media ?? []).map((m, idx) => (idx === i ? image : m)) })}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, media: (form.media ?? []).filter((_, idx) => idx !== i) })}
                  className="text-xs font-bold text-primary"
                  aria-label="Remove photo"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
          {page.slug !== "connect-with-us" || (form.media?.length ?? 0) === 0 ? (
            <button
              type="button"
              onClick={() => setForm({ ...form, media: [...(form.media ?? []), {}] })}
              className="mt-2 text-xs font-bold uppercase tracking-[.06em] text-primary"
            >
              + Add photo
            </button>
          ) : null}
          {(form.media?.length ?? 0) === 0 ? (
            <p className="mt-2 text-xs text-ink/50">No photos added yet — the current live photo{page.slug === "home" ? "s" : ""} will keep showing.</p>
          ) : null}
        </>
      ) : null}

      <Button type="submit" className="mt-5 w-full" loading={saving}>
        Save hero
      </Button>
    </form>
  );
}

/** Dispatches to the right form for a page's content block based on `kind` — the same pattern
 * ClientWebsitePage.tsx's SectionContentForm uses to switch on a couple-site section's key. Each
 * form below keeps its own local draft in state and only calls `onSave` on submit, exactly like
 * HeroForm and SectionEditor already do. */
function ContentBlockForm({
  pageSlug,
  block,
  value,
  onSave,
}: {
  pageSlug: string;
  block: ContentBlockConfig;
  value: unknown;
  onSave: (value: unknown) => Promise<void>;
}) {
  switch (block.kind) {
    case "text":
      return <TextForm value={value as MarketingText | null} onSave={onSave} withTitle={block.withTitle} />;
    case "heading-body":
      return <HeadingBodyForm value={value as MarketingHeadingBody | null} onSave={onSave} />;
    case "statement":
      return <StatementForm value={value as MarketingStatement | null} onSave={onSave} />;
    case "image-block":
      return <ImageBlockForm pageSlug={pageSlug} value={value as MarketingImageBlock | null} onSave={onSave} />;
    case "paragraphs":
      return <ParagraphsForm value={value as MarketingParagraphs | null} onSave={onSave} />;
    case "flow-list":
      return <FlowListForm pageSlug={pageSlug} value={value as MarketingFlow | null} onSave={onSave} />;
    case "steps-list":
      return <StepsListForm pageSlug={pageSlug} value={value as MarketingSteps | null} onSave={onSave} />;
    case "categories-list":
      return <CategoriesListForm pageSlug={pageSlug} value={value as MarketingCategories | null} onSave={onSave} />;
    case "seo":
      return <SeoForm value={value as MarketingSeo | null} onSave={onSave} />;
    case "diagram":
      return <DiagramForm pageSlug={pageSlug} value={value as MarketingDiagram | null} onSave={onSave} />;
    case "string-list":
      return <StringListForm value={value as MarketingStringList | null} onSave={onSave} />;
    case "contact-details":
      return <ContactDetailsForm value={value as MarketingContactDetails | null} onSave={onSave} />;
    case "feature":
      return <FeatureForm pageSlug={pageSlug} value={value as MarketingFeature | null} onSave={onSave} />;
    case "package-labels":
      return <PackageLabelsForm value={value as MarketingPackageLabels | null} onSave={onSave} />;
    case "posts-list":
      return <PostsListForm pageSlug={pageSlug} value={value as MarketingPosts | null} onSave={onSave} />;
    default:
      return null;
  }
}

function SaveButton({ saving }: { saving: boolean }) {
  return (
    <Button type="submit" className="mt-5 w-full" loading={saving}>
      Save
    </Button>
  );
}

function TextForm({ value, onSave, withTitle }: { value: MarketingText | null; onSave: (v: MarketingText) => Promise<void>; withTitle?: boolean }) {
  const [title, setTitle] = useState(value?.title ?? "");
  const [text, setText] = useState(value?.text ?? "");
  const [saving, setSaving] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        await onSave(withTitle ? { title, text } : { text });
        setSaving(false);
      }}
    >
      {withTitle ? (
        <>
          <Label>Card title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Our approach" />
          <Label className="mt-3">Text</Label>
        </>
      ) : null}
      <RichTextEditor value={text} onChange={setText} minHeight={140} />
      <SaveButton saving={saving} />
    </form>
  );
}

function HeadingBodyForm({ value, onSave }: { value: MarketingHeadingBody | null; onSave: (v: MarketingHeadingBody) => Promise<void> }) {
  const [heading, setHeading] = useState(value?.heading ?? "");
  const [body, setBody] = useState(value?.body ?? "");
  const [saving, setSaving] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        await onSave({ heading, body });
        setSaving(false);
      }}
    >
      <Label>Heading</Label>
      <Input value={heading} onChange={(e) => setHeading(e.target.value)} />
      <Label>Body</Label>
      <RichTextEditor value={body} onChange={setBody} minHeight={140} />
      <SaveButton saving={saving} />
    </form>
  );
}

function StatementForm({ value, onSave }: { value: MarketingStatement | null; onSave: (v: MarketingStatement) => Promise<void> }) {
  const [heading, setHeading] = useState(value?.heading ?? "");
  const [body, setBody] = useState(value?.body ?? "");
  const [script, setScript] = useState(value?.script ?? "");
  const [saving, setSaving] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        await onSave({ heading, body, script });
        setSaving(false);
      }}
    >
      <Label>Heading</Label>
      <Textarea value={heading} onChange={(e) => setHeading(e.target.value)} />
      <Label>Body</Label>
      <RichTextEditor value={body} onChange={setBody} minHeight={140} />
      <Label>Script line</Label>
      <Input value={script} onChange={(e) => setScript(e.target.value)} />
      <SaveButton saving={saving} />
    </form>
  );
}

function ImageBlockForm({ pageSlug, value, onSave }: { pageSlug: string; value: MarketingImageBlock | null; onSave: (v: MarketingImageBlock) => Promise<void> }) {
  const [image, setImage] = useState<MarketingImage>(value?.image ?? {});
  const [title, setTitle] = useState(value?.title ?? "");
  const [saving, setSaving] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        await onSave({ image, title });
        setSaving(false);
      }}
    >
      <ImageField pageSlug={pageSlug} idPrefix="image-block" image={image} onChange={setImage} />
      <Label className="mt-3">Overlay text on the photo (optional)</Label>
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Our Services" />
      <SaveButton saving={saving} />
    </form>
  );
}

function ParagraphsForm({ value, onSave }: { value: MarketingParagraphs | null; onSave: (v: MarketingParagraphs) => Promise<void> }) {
  const [paragraphs, setParagraphs] = useState<string[]>(value?.paragraphs ?? []);
  const [formNote, setFormNote] = useState(value?.formNote ?? "");
  const [saving, setSaving] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        await onSave({ paragraphs, formNote });
        setSaving(false);
      }}
    >
      {paragraphs.length === 0 ? (
        <LoadSamples label="Load the current text" onLoad={() => setParagraphs(SAMPLE_CONNECT_PARAGRAPHS)} />
      ) : null}
      <Label>Text (each box is its own block — format freely)</Label>
      <div className="space-y-3">
        {paragraphs.map((p, i) => (
          <div key={i}>
            <RichTextEditor value={p} onChange={(v) => setParagraphs(paragraphs.map((x, idx) => (idx === i ? v : x)))} minHeight={110} />
            <button type="button" onClick={() => setParagraphs(paragraphs.filter((_, idx) => idx !== i))} className="mt-1 text-xs font-bold text-primary">
              Remove block
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => setParagraphs([...paragraphs, ""])} className="mt-2 text-xs font-bold uppercase tracking-[.06em] text-primary">
        + Add block
      </button>
      <Label className="mt-4">Note above the enquiry form</Label>
      <Input value={formNote} onChange={(e) => setFormNote(e.target.value)} />
      <SaveButton saving={saving} />
    </form>
  );
}

function FlowListForm({ pageSlug, value, onSave }: { pageSlug: string; value: MarketingFlow | null; onSave: (v: MarketingFlow) => Promise<void> }) {
  const [items, setItems] = useState<MarketingFlowItem[]>(value?.items ?? []);
  const [saving, setSaving] = useState(false);

  function update(i: number, patch: Partial<MarketingFlowItem>) {
    setItems(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        await onSave({ items });
        setSaving(false);
      }}
    >
      {items.length === 0 ? (
        <LoadSamples label="Load the current rows" onLoad={() => setItems(SAMPLE_FLOW as unknown as MarketingFlowItem[])} />
      ) : null}
      <div className="space-y-3">
        {items.map((item, i) => (
          <Collapsible
            key={i}
            title={item.title || `Row ${i + 1}`}
            hint={`Row ${i + 1}`}
            defaultOpen={!item.title}
            onRemove={() => setItems(items.filter((_, idx) => idx !== i))}
          >
            <Label>Title</Label>
            <Input value={item.title ?? ""} onChange={(e) => update(i, { title: e.target.value })} />
            <Label>Text</Label>
            <RichTextEditor value={item.body ?? ""} onChange={(body) => update(i, { body })} minHeight={140} />
            <Label>Meta label</Label>
            <Input value={item.meta ?? ""} onChange={(e) => update(i, { meta: e.target.value })} />
            <Label>Photo</Label>
            <ImageField pageSlug={pageSlug} idPrefix={`flow-${i}`} image={item.image} onChange={(image) => update(i, { image })} />
          </Collapsible>
        ))}
      </div>
      <button type="button" onClick={() => setItems([...items, { title: "", body: "", meta: "" }])} className="mt-3 text-xs font-bold uppercase tracking-[.06em] text-primary">
        + Add row
      </button>
      <SaveButton saving={saving} />
    </form>
  );
}

function StepsListForm({ pageSlug, value, onSave }: { pageSlug: string; value: MarketingSteps | null; onSave: (v: MarketingSteps) => Promise<void> }) {
  const [items, setItems] = useState<MarketingStepItem[]>(value?.items ?? []);
  const [saving, setSaving] = useState(false);

  function update(i: number, patch: Partial<MarketingStepItem>) {
    setItems(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        await onSave({ items });
        setSaving(false);
      }}
    >
      {items.length === 0 ? (
        <LoadSamples label="Load the current steps" onLoad={() => setItems(SAMPLE_STEPS as unknown as MarketingStepItem[])} />
      ) : null}
      <p className="mb-3 text-xs text-ink/50">Each step shows its photo on alternating sides of the page (right, left, right…).</p>
      <div className="space-y-3">
        {items.map((item, i) => (
          <Collapsible
            key={i}
            title={item.title || `Step ${i + 1}`}
            hint={`Step ${i + 1}`}
            defaultOpen={!item.title}
            onRemove={() => setItems(items.filter((_, idx) => idx !== i))}
          >
            <Label>Title</Label>
            <Input value={item.title ?? ""} onChange={(e) => update(i, { title: e.target.value })} />
            <Label>Text</Label>
            <RichTextEditor value={item.body ?? ""} onChange={(body) => update(i, { body })} minHeight={160} />
            <Label>Photo</Label>
            <ImageField pageSlug={pageSlug} idPrefix={`step-${i}`} image={item.image} onChange={(image) => update(i, { image })} />
          </Collapsible>
        ))}
      </div>
      <button type="button" onClick={() => setItems([...items, { title: "", body: "" }])} className="mt-3 text-xs font-bold uppercase tracking-[.06em] text-primary">
        + Add step
      </button>
      <SaveButton saving={saving} />
    </form>
  );
}

function SeoForm({ value, onSave }: { value: MarketingSeo | null; onSave: (v: MarketingSeo) => Promise<void> }) {
  const [v, setV] = useState<MarketingSeo>(value ?? {});
  const [saving, setSaving] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        await onSave(v);
        setSaving(false);
      }}
    >
      <Label>Browser tab title</Label>
      <Input value={v.title ?? ""} placeholder="Leave blank to use the default" onChange={(e) => setV({ ...v, title: e.target.value })} />
      <Label className="mt-3">Search description (shown under the title in Google)</Label>
      <Textarea rows={3} value={v.description ?? ""} onChange={(e) => setV({ ...v, description: e.target.value })} />
      <SaveButton saving={saving} />
    </form>
  );
}

function StringListForm({ value, onSave }: { value: MarketingStringList | null; onSave: (v: MarketingStringList) => Promise<void> }) {
  const [items, setItems] = useState<string[]>(value?.items ?? []);
  const [saving, setSaving] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        await onSave({ items: items.map((x) => x.trim()).filter(Boolean) });
        setSaving(false);
      }}
    >
      {items.length === 0 ? <LoadSamples label="Load the current categories" onLoad={() => setItems(SAMPLE_JOURNAL_CATEGORIES)} /> : null}
      <p className="mb-2 text-xs text-ink/50">"All Posts" is always shown first. Add, rename or remove categories freely; posts pick from this list.</p>
      <StringListEditor items={items} onChange={setItems} addLabel="Add category" />
      <SaveButton saving={saving} />
    </form>
  );
}

/** The diagram under Our Approach's intro: an uploaded picture wins; without one the page draws
 * circles from the labels below. */
function DiagramForm({ pageSlug, value, onSave }: { pageSlug: string; value: MarketingDiagram | null; onSave: (v: MarketingDiagram) => Promise<void> }) {
  const [image, setImage] = useState<MarketingImage>(value?.image ?? {});
  const [items, setItems] = useState<string[]>(value?.items ?? []);
  const [saving, setSaving] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        await onSave({ image, items: items.map((x) => x.trim()).filter(Boolean) });
        setSaving(false);
      }}
    >
      <Label>Diagram picture</Label>
      <p className="mb-2 text-xs text-ink/50">Upload your own diagram and it shows in full, uncropped, under the intro text. Remove it to go back to the drawn circles.</p>
      <ImageField pageSlug={pageSlug} idPrefix="diagram" image={image} onChange={setImage} />
      <Label className="mt-5">Circle labels (used when there's no picture)</Label>
      <p className="mb-2 text-xs text-ink/50">One circle per line, joined by arrows and alternating gold and pink. Leave empty for the built-in four.</p>
      <StringListEditor items={items} onChange={setItems} addLabel="Add a step" />
      <SaveButton saving={saving} />
    </form>
  );
}

function ContactDetailsForm({ value, onSave }: { value: MarketingContactDetails | null; onSave: (v: MarketingContactDetails) => Promise<void> }) {
  const [v, setV] = useState<MarketingContactDetails>(value ?? {});
  const [saving, setSaving] = useState(false);
  const field = (key: keyof MarketingContactDetails, label: string, placeholder: string) => (
    <div key={key}>
      <Label>{label}</Label>
      <Input value={v[key] ?? ""} placeholder={placeholder} onChange={(e) => setV({ ...v, [key]: e.target.value })} />
    </div>
  );
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        await onSave(v);
        setSaving(false);
      }}
    >
      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        {field("email", "Email", "hello@ovutor.com")}
        {field("phone", "Phone / WhatsApp", "+233 …")}
        {field("location", "Location", "Accra, Ghana")}
        {field("hours", "Hours or response time", "We reply within two working days")}
      </div>
      <SaveButton saving={saving} />
    </form>
  );
}

function FeatureForm({ pageSlug, value, onSave }: { pageSlug: string; value: MarketingFeature | null; onSave: (v: MarketingFeature) => Promise<void> }) {
  const [v, setV] = useState<MarketingFeature>(value ?? {});
  const [saving, setSaving] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        await onSave(v);
        setSaving(false);
      }}
    >
      <label className="mb-3 flex items-center gap-2 text-sm font-bold">
        <input type="checkbox" checked={!v.hidden} onChange={(e) => setV({ ...v, hidden: !e.target.checked })} />
        Show this section on the page
      </label>
      <p className="mb-2 text-xs text-ink/50">
        Sits between the introduction and the enquiry form. Anything you leave empty keeps the built-in wording or photo.
      </p>
      <Label>Heading</Label>
      <Input value={v.heading ?? ""} placeholder="Every love story begins with a conversation" onChange={(e) => setV({ ...v, heading: e.target.value })} />
      <Label className="mt-3">Text</Label>
      <RichTextEditor value={v.body ?? ""} onChange={(body) => setV({ ...v, body })} minHeight={180} placeholder="Tell us about the day you're imagining…" />
      <Label className="mt-3">Image (leave empty to keep the built-in photo)</Label>
      <ImageField pageSlug={pageSlug} idPrefix="feature" image={v.image} onChange={(image) => setV({ ...v, image })} />
      {v.image?.url ? (
        <button type="button" onClick={() => setV({ ...v, image: undefined })} className="mt-2 text-xs font-bold text-primary">
          Remove image
        </button>
      ) : null}
      <SaveButton saving={saving} />
    </form>
  );
}

function PackageLabelsForm({ value, onSave }: { value: MarketingPackageLabels | null; onSave: (v: MarketingPackageLabels) => Promise<void> }) {
  const [v, setV] = useState<MarketingPackageLabels>(value ?? {});
  const [saving, setSaving] = useState(false);
  const fields: { key: keyof MarketingPackageLabels; label: string; placeholder: string }[] = [
    { key: "startingFromLabel", label: "Price label", placeholder: "Starting from" },
    { key: "moreLabel", label: "Card button", placeholder: "More" },
    { key: "backgroundTitle", label: "Package page: background heading", placeholder: "Background information" },
    { key: "includedTitle", label: "Package page: what's included heading", placeholder: "What's included" },
    { key: "ctaTitle", label: "Package page: closing heading", placeholder: "Ready to begin?" },
    { key: "ctaLabel", label: "Package page: closing button", placeholder: "Inquire for availability" },
    { key: "allPackagesLabel", label: "Package page: back link", placeholder: "All packages" },
  ];
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        await onSave(v);
        setSaving(false);
      }}
    >
      <p className="mb-3 text-xs text-ink/50">Leave a field blank to keep the current wording (shown as the placeholder).</p>
      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.key}>
            <Label>{f.label}</Label>
            <Input value={v[f.key] ?? ""} placeholder={f.placeholder} onChange={(e) => setV({ ...v, [f.key]: e.target.value })} />
          </div>
        ))}
      </div>
      <SaveButton saving={saving} />
    </form>
  );
}

function CategoriesListForm({ pageSlug, value, onSave }: { pageSlug: string; value: MarketingCategories | null; onSave: (v: MarketingCategories) => Promise<void> }) {
  // A package saved in the older flat shape (just `groups`) is edited as one untitled section.
  const [items, setItems] = useState<MarketingCategoryItem[]>(
    (value?.items ?? []).map((it) => (it.sections?.length || !it.groups?.length ? it : { ...it, sections: [{ title: "", cards: it.groups }] })),
  );
  const [saving, setSaving] = useState(false);

  function updatePackage(i: number, patch: Partial<MarketingCategoryItem>) {
    setItems(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }

  function updateSections(i: number, sections: MarketingPackageSection[]) {
    updatePackage(i, { sections });
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        await onSave({ items: items.map(({ groups: _legacy, ...rest }) => rest) });
        setSaving(false);
      }}
    >
      {items.length === 0 ? (
        <LoadSamples label="Load the current packages" onLoad={() => setItems(SAMPLE_PACKAGES as unknown as MarketingCategoryItem[])} />
      ) : null}
      <div className="space-y-6">
        {items.map((pkg, i) => {
          const sections = pkg.sections ?? [];
          return (
            <Collapsible
              key={i}
              title={pkg.name || `Package ${i + 1}`}
              hint={pkg.currency && pkg.priceMin != null ? `${pkg.currency} ${pkg.priceMin}` : undefined}
              defaultOpen={!pkg.name}
              onRemove={() => setItems(items.filter((_, idx) => idx !== i))}
              removeLabel="Remove package"
              actions={
                <button
                  type="button"
                  disabled={i === 0}
                  onClick={() => {
                    const next = [...items];
                    [next[i - 1], next[i]] = [next[i], next[i - 1]];
                    setItems(next);
                  }}
                  className="text-xs font-bold text-ink/50 disabled:opacity-30"
                >
                  Move up
                </button>
              }
            >

              <p className="mb-2 text-[10px] font-bold uppercase tracking-[.1em] text-ink/40">On the packages list</p>
              <Label>Name</Label>
              <Input value={pkg.name ?? ""} onChange={(e) => updatePackage(i, { name: e.target.value })} />

              <Label className="mt-3">Short summary (about 3 sentences)</Label>
              <RichTextEditor minHeight={90} value={pkg.summary ?? ""} onChange={(summary) => updatePackage(i, { summary })} />

              <Label className="mt-3">Card image</Label>
              <ImageField pageSlug={pageSlug} idPrefix={`package-${i}`} image={pkg.image} onChange={(image) => updatePackage(i, { image })} />

              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label>Currency</Label>
                  <Select value={pkg.currency ?? "GHS"} onChange={(e) => updatePackage(i, { currency: e.target.value })}>
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>Starting price</Label>
                  <Input
                    type="number"
                    min={0}
                    value={pkg.priceMin ?? ""}
                    onChange={(e) => updatePackage(i, { priceMin: e.target.value === "" ? undefined : Number(e.target.value) })}
                  />
                </div>
              </div>
              <Label className="mt-3">Or custom price text (replaces the number, e.g. "By enquiry")</Label>
              <Input value={pkg.priceRange ?? ""} onChange={(e) => updatePackage(i, { priceRange: e.target.value })} />

              <div className="my-5 h-px bg-[#eee]" />
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[.1em] text-ink/40">On the package's own page</p>

              <Label>Banner image (full width)</Label>
              <ImageField pageSlug={pageSlug} idPrefix={`package-banner-${i}`} image={pkg.banner} onChange={(banner) => updatePackage(i, { banner })} />

              <Label className="mt-3">Background information</Label>
              <RichTextEditor minHeight={180} value={pkg.background ?? ""} onChange={(background) => updatePackage(i, { background })} />

              <Label className="mt-3">What's included — sections</Label>
              <div className="space-y-4">
                {sections.map((section, si) => {
                  const cards = section.cards ?? [];
                  const setCards = (next: MarketingCategoryGroup[]) =>
                    updateSections(i, sections.map((s, idx) => (idx === si ? { ...s, cards: next } : s)));
                  return (
                    <div key={si} className="border border-[#ddd] bg-bg-warm p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-[.06em] text-ink/50">Section {si + 1}</span>
                        <button type="button" onClick={() => updateSections(i, sections.filter((_, idx) => idx !== si))} className="text-xs font-bold text-primary">
                          Remove section
                        </button>
                      </div>
                      <Label>Section title (e.g. Design, Planning)</Label>
                      <Input
                        value={section.title ?? ""}
                        onChange={(e) => updateSections(i, sections.map((s, idx) => (idx === si ? { ...s, title: e.target.value } : s)))}
                      />

                      <Label className="mt-3">Cards</Label>
                      <div className="space-y-3">
                        {cards.map((card, ci) => (
                          <div key={ci} className="border border-[#eee] bg-white p-3">
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase tracking-[.06em] text-ink/40">Card {ci + 1}</span>
                              <button type="button" onClick={() => setCards(cards.filter((_, idx) => idx !== ci))} className="text-xs font-bold text-primary">
                                Remove card
                              </button>
                            </div>
                            <Label>Card title</Label>
                            <Input value={card.title ?? ""} onChange={(e) => setCards(cards.map((c, idx) => (idx === ci ? { ...c, title: e.target.value } : c)))} />
                            <Label>Ticked items</Label>
                            <StringListEditor
                              items={card.bullets ?? []}
                              onChange={(bullets) => setCards(cards.map((c, idx) => (idx === ci ? { ...c, bullets } : c)))}
                              addLabel="Add item"
                              rich
                            />
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => setCards([...cards, { title: "", bullets: [] }])}
                        className="mt-2 text-xs font-bold uppercase tracking-[.06em] text-primary"
                      >
                        + Add card
                      </button>
                    </div>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => updateSections(i, [...sections, { title: "", cards: [] }])}
                className="mt-3 text-xs font-bold uppercase tracking-[.06em] text-primary"
              >
                + Add section
              </button>
            </Collapsible>
          );
        })}
      </div>
      <button type="button" onClick={() => setItems([...items, { name: "", sections: [] }])} className="mt-4 text-xs font-bold uppercase tracking-[.06em] text-primary">
        + Add package
      </button>
      <SaveButton saving={saving} />
    </form>
  );
}

function PostsListForm({ pageSlug, value, onSave }: { pageSlug: string; value: MarketingPosts | null; onSave: (v: MarketingPosts) => Promise<void> }) {
  const [items, setItems] = useState<MarketingPostItem[]>(value?.items ?? []);
  const [saving, setSaving] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState<string[]>(["Real Weddings", "Destinations", "Planning Tips"]);

  useEffect(() => {
    getMarketingContent<MarketingStringList>(pageSlug, "categories").then((c) => {
      const list = (c?.items ?? []).filter((x) => x.trim());
      if (list.length) setCategoryOptions(list);
    });
  }, [pageSlug]);

  function update(i: number, patch: Partial<MarketingPostItem>) {
    setItems(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        await onSave({ items });
        setSaving(false);
      }}
    >
      {items.length === 0 ? (
        <LoadSamples label="Load the current posts" onLoad={() => setItems(SAMPLE_POSTS as unknown as MarketingPostItem[])} />
      ) : null}
      <div className="space-y-3">
        {items.map((post, i) => {
          const photos = post.photos ?? [];
          const blocks: { heading?: string; text?: string; image?: MarketingImage }[] = post.blocks?.length
            ? post.blocks
            : (post.body ?? []).map((text) => ({ text }));
          const setBlocks = (next: { heading?: string; text?: string; image?: MarketingImage }[]) =>
            update(i, { blocks: next, body: next.map((b) => b.text ?? "") });
          const categoryList = post.category && !categoryOptions.includes(post.category) ? [...categoryOptions, post.category] : categoryOptions;
          return (
            <Collapsible
              key={i}
              title={post.title || `Post ${i + 1}`}
              hint={[post.category, post.date].filter(Boolean).join(" · ")}
              defaultOpen={!post.title}
              onRemove={() => setItems(items.filter((_, idx) => idx !== i))}
              removeLabel="Remove post"
            >

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label>Title</Label>
                  <Input value={post.title ?? ""} onChange={(e) => update(i, { title: e.target.value })} />
                </div>
                <div>
                  <Label>Slug (URL)</Label>
                  <Input value={post.slug ?? ""} placeholder="e.g. amara-and-kwame" onChange={(e) => update(i, { slug: e.target.value })} />
                </div>
              </div>

              <Label>Location line</Label>
              <Input value={post.location ?? ""} onChange={(e) => update(i, { location: e.target.value })} />

              <Label>Excerpt</Label>
              <RichTextEditor minHeight={90} value={post.excerpt ?? ""} onChange={(excerpt) => update(i, { excerpt })} />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label>Date</Label>
                  <Input type="date" value={post.date ?? ""} onChange={(e) => update(i, { date: e.target.value })} />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={post.category ?? categoryList[0]} onChange={(e) => update(i, { category: e.target.value })}>
                    {categoryList.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <Label>Cover photo</Label>
              <ImageField pageSlug={pageSlug} idPrefix={`post-${i}-media`} image={post.media} onChange={(media) => update(i, { media })} />

              <Label className="mt-3">Story — sections of text, each with an optional heading and image</Label>
              <p className="mb-2 text-xs text-ink/50">
                Format each part freely: headings, bold, bullet lists, alignment. Give each part of a long story its own section so you can place an image after it.
              </p>
              <div className="space-y-3">
                {blocks.map((block, bi) => (
                  <Collapsible
                    key={bi}
                    className="bg-bg-warm"
                    title={block.heading || `Part ${bi + 1}`}
                    hint={(block.text ?? "").replace(/<[^>]+>/g, " ").slice(0, 60)}
                    defaultOpen={!block.text}
                    onRemove={() => setBlocks(blocks.filter((_, idx) => idx !== bi))}
                    actions={
                      <button
                        type="button"
                        disabled={bi === 0}
                        onClick={() => {
                          const next = [...blocks];
                          [next[bi - 1], next[bi]] = [next[bi], next[bi - 1]];
                          setBlocks(next);
                        }}
                        className="text-xs font-bold text-ink/50 disabled:opacity-30"
                      >
                        Move up
                      </button>
                    }
                  >
                    <Label>Section heading (optional)</Label>
                    <Input value={block.heading ?? ""} onChange={(e) => setBlocks(blocks.map((b, idx) => (idx === bi ? { ...b, heading: e.target.value } : b)))} />
                    <Label className="mt-3">Text</Label>
                    <RichTextEditor
                      value={block.text ?? ""}
                      onChange={(text) => setBlocks(blocks.map((b, idx) => (idx === bi ? { ...b, text } : b)))}
                      minHeight={220}
                    />
                    <Label className="mt-3">Image after this section (optional)</Label>
                    <ImageField
                      pageSlug={pageSlug}
                      idPrefix={`post-${i}-block-${bi}`}
                      image={block.image}
                      onChange={(image) => setBlocks(blocks.map((b, idx) => (idx === bi ? { ...b, image } : b)))}
                    />
                    {block.image?.url ? (
                      <button
                        type="button"
                        onClick={() => setBlocks(blocks.map((b, idx) => (idx === bi ? { ...b, image: undefined } : b)))}
                        className="mt-2 text-xs font-bold text-primary"
                      >
                        Remove image
                      </button>
                    ) : null}
                  </Collapsible>
                ))}
              </div>
              <button type="button" onClick={() => setBlocks([...blocks, { text: "" }])} className="mt-2 text-xs font-bold uppercase tracking-[.06em] text-primary">
                + Add section
              </button>

              <Label className="mt-3">Photo gallery</Label>
              <div className="space-y-3">
                {photos.map((photo, pi) => (
                  <div key={pi} className="flex items-start gap-2 border border-[#eee] p-3">
                    <div className="flex-1">
                      <ImageField
                        pageSlug={pageSlug}
                        idPrefix={`post-${i}-photo-${pi}`}
                        image={photo}
                        onChange={(img) => update(i, { photos: photos.map((p, idx) => (idx === pi ? img : p)) })}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => update(i, { photos: photos.filter((_, idx) => idx !== pi) })}
                      className="text-xs font-bold text-primary"
                      aria-label="Remove photo"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => update(i, { photos: [...photos, {}] })} className="mt-2 text-xs font-bold uppercase tracking-[.06em] text-primary">
                + Add photo
              </button>
            </Collapsible>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => setItems([...items, { title: "", slug: "", location: "", excerpt: "", date: "", category: categoryOptions[0], body: [], photos: [] }])}
        className="mt-3 text-xs font-bold uppercase tracking-[.06em] text-primary"
      >
        + Add post
      </button>
      <SaveButton saving={saving} />
    </form>
  );
}

function SectionEditor({
  pageSlug,
  section,
  onSave,
  onToggle,
  onDelete,
  onMoveUp,
  onMoveDown,
  open: openProp,
  onOpenChange,
}: {
  pageSlug: string;
  section: MarketingSection;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSave: (title: string, content: MarketingContentBlock) => void;
  onToggle: (enabled: boolean) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) {
  const [title, setTitle] = useState(section.title);
  const [content, setContent] = useState<MarketingContentBlock>(section.content);
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [openLocal, setOpenLocal] = useState(!section.content.heading && !section.content.body);
  const open = openProp ?? openLocal;
  const setOpen = (fn: (o: boolean) => boolean) => {
    const next = fn(open);
    if (onOpenChange) onOpenChange(next);
    else setOpenLocal(next);
  };

  return (
    <div className="border-l-[3px] border-gold bg-white p-4 shadow-card">
      <div className={clsx("flex flex-wrap items-center gap-2", open && "mb-3")}>
        <Badge tone={section.isEnabled ? "success" : "muted"}>{section.isEnabled ? "Enabled" : "Disabled"}</Badge>
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="mr-auto flex min-w-0 items-center gap-2 text-left">
          <span className={clsx("inline-block text-[10px] text-ink/50 transition-transform", open && "rotate-90")}>▶</span>
          <span className="truncate text-sm font-bold">{section.title}</span>
        </button>
        {onMoveUp ? (
          <button type="button" onClick={onMoveUp} className="text-xs font-bold uppercase tracking-[.06em] text-ink/60 hover:text-ink" aria-label="Move up">
            ↑
          </button>
        ) : null}
        {onMoveDown ? (
          <button type="button" onClick={onMoveDown} className="text-xs font-bold uppercase tracking-[.06em] text-ink/60 hover:text-ink" aria-label="Move down">
            ↓
          </button>
        ) : null}
        <Toggle checked={section.isEnabled} onChange={onToggle} label="Enabled" />
      </div>

      <form
        className={clsx(!open && "hidden")}
        onSubmit={async (e) => {
          e.preventDefault();
          setSaving(true);
          await onSave(title, content);
          setSaving(false);
        }}
      >
        <Label htmlFor={`section-${section.id}-title`}>Internal label</Label>
        <Input id={`section-${section.id}-title`} value={title} onChange={(e) => setTitle(e.target.value)} />

        <Label htmlFor={`section-${section.id}-heading`}>Heading</Label>
        <Input id={`section-${section.id}-heading`} value={content.heading ?? ""} onChange={(e) => setContent({ ...content, heading: e.target.value })} />

        <Label>Text</Label>
        <RichTextEditor value={content.body ?? ""} onChange={(body) => setContent({ ...content, body })} minHeight={180} />

        <Label htmlFor={`section-${section.id}-layout`}>Layout</Label>
        <Select
          id={`section-${section.id}-layout`}
          value={content.layout}
          onChange={(e) => setContent({ ...content, layout: e.target.value as MarketingSectionLayout })}
        >
          {(Object.keys(LAYOUT_LABEL) as MarketingSectionLayout[]).map((layout) => (
            <option key={layout} value={layout}>
              {LAYOUT_LABEL[layout]}
            </option>
          ))}
        </Select>

        {content.layout !== "text-only" ? (
          <>
            <Label>Image</Label>
            <ImageField pageSlug={pageSlug} idPrefix={`section-${section.id}-image`} image={content.image} onChange={(image) => setContent({ ...content, image })} />
          </>
        ) : null}

        <p className="mb-1 mt-5 text-[10px] font-bold uppercase tracking-[.1em] text-ink/40">How it looks</p>
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <div>
            <Label>Background</Label>
            <Select value={content.background ?? "light-gold"} onChange={(e) => setContent({ ...content, background: e.target.value as MarketingContentBlock["background"] })}>
              <option value="light-gold">Light gold</option>
              <option value="gold">Gold</option>
              <option value="pink">Pink</option>
              <option value="cream">Cream</option>
              <option value="white">White</option>
            </Select>
          </div>
          <div>
            <Label>Text alignment</Label>
            <Select value={content.align ?? ""} onChange={(e) => setContent({ ...content, align: (e.target.value || undefined) as MarketingContentBlock["align"] })}>
              <option value="">Automatic (centred, or left beside a photo)</option>
              <option value="left">Left</option>
              <option value="center">Centred</option>
            </Select>
          </div>
          <div>
            <Label>Text width</Label>
            <Select value={content.width ?? "medium"} onChange={(e) => setContent({ ...content, width: e.target.value as MarketingContentBlock["width"] })}>
              <option value="narrow">Narrow</option>
              <option value="medium">Medium</option>
              <option value="wide">Wide</option>
              <option value="full">Full width</option>
            </Select>
          </div>
          <div>
            <Label>Text columns</Label>
            <Select value={String(content.columns ?? 1)} onChange={(e) => setContent({ ...content, columns: Number(e.target.value) })}>
              <option value="1">One column</option>
              <option value="2">Two columns (long text)</option>
            </Select>
          </div>
          {content.layout === "image-left" || content.layout === "image-right" ? (
            <div>
              <Label>Photo shape</Label>
              <Select value={content.imageRatio ?? "landscape"} onChange={(e) => setContent({ ...content, imageRatio: e.target.value as MarketingContentBlock["imageRatio"] })}>
                <option value="landscape">Landscape</option>
                <option value="portrait">Portrait</option>
                <option value="square">Square</option>
              </Select>
            </div>
          ) : null}
        </div>

        <p className="mb-1 mt-5 text-[10px] font-bold uppercase tracking-[.1em] text-ink/40">Button (optional)</p>
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <div>
            <Label>Button text</Label>
            <Input value={content.buttonLabel ?? ""} placeholder="Inquire for availability" onChange={(e) => setContent({ ...content, buttonLabel: e.target.value })} />
          </div>
          <div>
            <Label>Button link</Label>
            <Input value={content.buttonUrl ?? ""} placeholder="/connect-with-us or https://…" onChange={(e) => setContent({ ...content, buttonUrl: e.target.value })} />
          </div>
        </div>

        <p className="mb-1 mt-5 text-[10px] font-bold uppercase tracking-[.1em] text-ink/40">Extra photos under the text (optional, up to 3)</p>
        <div className="space-y-2">
          {(content.gallery ?? []).map((g, gi) => (
            <div key={gi} className="flex items-start gap-2">
              <div className="flex-1">
                <ImageField
                  pageSlug={pageSlug}
                  idPrefix={`section-${section.id}-gallery-${gi}`}
                  image={g}
                  onChange={(img) => setContent({ ...content, gallery: (content.gallery ?? []).map((x, idx) => (idx === gi ? img : x)) })}
                />
              </div>
              <button type="button" onClick={() => setContent({ ...content, gallery: (content.gallery ?? []).filter((_, idx) => idx !== gi) })} className="text-xs font-bold text-primary">
                Remove
              </button>
            </div>
          ))}
        </div>
        {(content.gallery ?? []).length < 3 ? (
          <button type="button" onClick={() => setContent({ ...content, gallery: [...(content.gallery ?? []), {}] })} className="mt-2 text-xs font-bold uppercase tracking-[.06em] text-primary">
            + Add photo
          </button>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2">
          <Button type="submit" loading={saving}>
            Save section
          </Button>
          {confirmingDelete ? (
            <>
              <Button type="button" variant="outline" onClick={onDelete}>
                Confirm delete
              </Button>
              <Button type="button" variant="outline" onClick={() => setConfirmingDelete(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <Button type="button" variant="outline" onClick={() => setConfirmingDelete(true)}>
              Delete section
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
