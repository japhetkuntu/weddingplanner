import { useEffect, useState } from "react";
import clsx from "clsx";
import { Badge, Button, Input, Label, Select, Skeleton, Textarea, Toast, Toggle } from "@ovutor/ui";
import {
  getMarketingContent,
  updateMarketingContent,
  getMarketingSections,
  createMarketingSection,
  updateMarketingSection,
  setMarketingSectionEnabled,
  reorderMarketingSections,
  deleteMarketingSection,
  uploadMarketingImage,
  errorMessage,
} from "@/lib/api";
import type {
  MarketingCategories,
  MarketingCategoryItem,
  MarketingContentBlock,
  MarketingFlow,
  MarketingFlowItem,
  MarketingHeadingBody,
  MarketingHero,
  MarketingImage,
  MarketingImageBlock,
  MarketingParagraphs,
  MarketingPostItem,
  MarketingPosts,
  MarketingSection,
  MarketingSectionLayout,
  MarketingStatement,
  MarketingStepItem,
  MarketingSteps,
  MarketingText,
} from "@/types";

type ContentBlockKind = "text" | "heading-body" | "statement" | "image-block" | "paragraphs" | "flow-list" | "steps-list" | "categories-list" | "posts-list";

interface ContentBlockConfig {
  key: string;
  label: string;
  kind: ContentBlockKind;
}

interface PageConfig {
  slug: string;
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
    contentBlocks: [],
  },
  {
    slug: "what-we-do",
    label: "What We Do",
    description: "The hero, the black-and-white statement, and the how-we-work flow.",
    hasSubtitle: false,
    hasCta: false,
    hasMedia: true,
    placeholders: { eyebrow: "About Ovutor", title: "The studio behind\nyour wedding day" },
    contentBlocks: [
      { key: "statement", label: "Statement", kind: "statement" },
      { key: "flow", label: "How we work", kind: "flow-list" },
    ],
  },
  {
    slug: "our-planning-packages",
    label: "Our Planning Packages",
    description: "The hero, intro text, divider photo, heading, and the category list.",
    hasSubtitle: false,
    hasCta: false,
    hasMedia: true,
    placeholders: { eyebrow: "Our planning packages", title: "Destination weddings,\ndesigned with intention" },
    contentBlocks: [
      { key: "intro", label: "Intro text", kind: "text" },
      { key: "divider", label: "Divider photo", kind: "image-block" },
      { key: "heading", label: "Heading before the categories", kind: "heading-body" },
      { key: "categories", label: "Categories", kind: "categories-list" },
    ],
  },
  {
    slug: "our-approach",
    label: "Our Approach",
    description: "The hero, intro text, and the four steps.",
    hasSubtitle: false,
    hasCta: false,
    hasMedia: true,
    placeholders: { eyebrow: "How we work", title: "A process built\naround you" },
    contentBlocks: [
      { key: "intro", label: "Intro text", kind: "text" },
      { key: "steps", label: "Steps", kind: "steps-list" },
    ],
  },
  {
    slug: "our-journal",
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
    contentBlocks: [{ key: "posts", label: "Journal posts", kind: "posts-list" }],
  },
  {
    slug: "connect-with-us",
    label: "Connect with Us",
    description: "The intro eyebrow, title and photo, plus the intro paragraphs.",
    hasSubtitle: false,
    hasCta: false,
    hasMedia: true,
    placeholders: { eyebrow: "Get in touch", title: "Let's connect" },
    contentBlocks: [{ key: "intro", label: "Intro paragraphs", kind: "paragraphs" }],
  },
];

const LAYOUT_LABEL: Record<MarketingSectionLayout, string> = {
  "text-only": "Text only",
  "image-left": "Image left",
  "image-right": "Image right",
  "image-full": "Full-bleed image",
};

const emptyBlock = (): MarketingContentBlock => ({ heading: "", body: "", image: undefined, layout: "text-only" });

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

export default function StudioWebsitePage() {
  const [selectedSlug, setSelectedSlug] = useState(PAGES[0].slug);
  const page = PAGES.find((p) => p.slug === selectedSlug) ?? PAGES[0];
  const [hero, setHero] = useState<MarketingHero | null>(null);
  const [blockValues, setBlockValues] = useState<Record<string, unknown>>({});
  const [sections, setSections] = useState<MarketingSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setHero(null);
    setBlockValues({});
    Promise.all([
      getMarketingContent<MarketingHero>(selectedSlug, "hero").then((h) => setHero(h ?? {})),
      getMarketingSections(selectedSlug).then(setSections),
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

  async function moveSection(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    [next[index], next[target]] = [next[target], next[index]];
    setSections(next);
    try {
      const saved = await reorderMarketingSections(
        selectedSlug,
        next.map((s) => s.id),
      );
      setSections(saved);
    } catch (e) {
      flashError(errorMessage(e, "Couldn't save the new order — please try again."));
    }
  }

  return (
    <div className="ovutor-fade-in">
      <div className="mb-1">
        <h1 className="font-display text-3xl">Studio website</h1>
        <p className="text-sm text-ink/60">Every field falls back to our current live copy until you fill it in.</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {PAGES.map((p) => (
          <button
            key={p.slug}
            type="button"
            onClick={() => setSelectedSlug(p.slug)}
            className={clsx(
              "border px-3 py-1.5 text-xs font-bold uppercase tracking-[.06em]",
              p.slug === selectedSlug ? "border-primary bg-primary text-white" : "border-[#8e8985] text-ink/70 hover:border-ink",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-ink/50">{page.description}</p>

      {loading || !hero ? (
        <PageEditorSkeleton />
      ) : (
        <>
          <div className="mt-6 border-t-[3px] border-primary bg-white p-5 shadow-card">
            <h2 className="mb-4 font-display text-xl">Hero</h2>
            <HeroForm key={selectedSlug} page={page} hero={hero} onSave={saveHero} />
          </div>

          {page.contentBlocks.map((block) => (
            <div key={block.key} className="mt-6 border-t-[3px] border-primary bg-white p-5 shadow-card">
              <h2 className="mb-4 font-display text-xl">{block.label}</h2>
              <ContentBlockForm pageSlug={selectedSlug} block={block} value={blockValues[block.key]} onSave={(v) => saveBlock(block.key, v)} />
            </div>
          ))}

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-xl">Extra sections</h2>
              <Button size="sm" variant="outline" onClick={addSection}>
                + Add section
              </Button>
            </div>
            {sections.length === 0 ? (
              <p className="border border-dashed border-[#ccc] p-6 text-center text-sm text-ink/50">
                Nothing here yet — add a section to show extra content below the hero.
              </p>
            ) : (
              <div className="space-y-4">
                {sections.map((section, i) => (
                  <SectionEditor
                    key={section.id}
                    pageSlug={selectedSlug}
                    section={section}
                    onSave={(title, content) => saveSection(section.id, title, content)}
                    onToggle={(enabled) => toggleSection(section.id, enabled)}
                    onDelete={() => removeSection(section.id)}
                    onMoveUp={i > 0 ? () => moveSection(i, -1) : undefined}
                    onMoveDown={i < sections.length - 1 ? () => moveSection(i, 1) : undefined}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

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
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  addLabel: string;
  multiline?: boolean;
}) {
  const Field = multiline ? Textarea : Input;
  return (
    <div>
      <div className="space-y-2">
        {items.map((value, i) => (
          <div key={i} className="flex gap-2">
            <Field placeholder={placeholder} value={value} onChange={(e) => onChange(items.map((v, idx) => (idx === i ? e.target.value : v)))} className="flex-1" />
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
          <Textarea id="hero-subtitle" placeholder={page.placeholders.subtitle} value={form.subtitle ?? ""} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
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
      return <TextForm value={value as MarketingText | null} onSave={onSave} />;
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
      return <StepsListForm value={value as MarketingSteps | null} onSave={onSave} />;
    case "categories-list":
      return <CategoriesListForm value={value as MarketingCategories | null} onSave={onSave} />;
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

function TextForm({ value, onSave }: { value: MarketingText | null; onSave: (v: MarketingText) => Promise<void> }) {
  const [text, setText] = useState(value?.text ?? "");
  const [saving, setSaving] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        await onSave({ text });
        setSaving(false);
      }}
    >
      <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} />
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
      <Textarea value={body} onChange={(e) => setBody(e.target.value)} />
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
      <Textarea value={body} onChange={(e) => setBody(e.target.value)} />
      <Label>Script line</Label>
      <Input value={script} onChange={(e) => setScript(e.target.value)} />
      <SaveButton saving={saving} />
    </form>
  );
}

function ImageBlockForm({ pageSlug, value, onSave }: { pageSlug: string; value: MarketingImageBlock | null; onSave: (v: MarketingImageBlock) => Promise<void> }) {
  const [image, setImage] = useState<MarketingImage>(value?.image ?? {});
  const [saving, setSaving] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        await onSave({ image });
        setSaving(false);
      }}
    >
      <ImageField pageSlug={pageSlug} idPrefix="image-block" image={image} onChange={setImage} />
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
      <Label>Paragraphs</Label>
      <StringListEditor items={paragraphs} onChange={setParagraphs} addLabel="Add paragraph" multiline />
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
      {items.length === 0 ? <p className="text-xs text-ink/50">No rows added yet — the current live steps will keep showing.</p> : null}
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="border border-[#eee] p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[.06em] text-ink/50">Row {i + 1}</span>
              <button type="button" onClick={() => setItems(items.filter((_, idx) => idx !== i))} className="text-xs font-bold text-primary">
                Remove
              </button>
            </div>
            <Label>Title</Label>
            <Input value={item.title ?? ""} onChange={(e) => update(i, { title: e.target.value })} />
            <Label>Body</Label>
            <Textarea value={item.body ?? ""} onChange={(e) => update(i, { body: e.target.value })} />
            <Label>Meta label</Label>
            <Input value={item.meta ?? ""} onChange={(e) => update(i, { meta: e.target.value })} />
            <Label>Photo</Label>
            <ImageField pageSlug={pageSlug} idPrefix={`flow-${i}`} image={item.image} onChange={(image) => update(i, { image })} />
          </div>
        ))}
      </div>
      <button type="button" onClick={() => setItems([...items, { title: "", body: "", meta: "" }])} className="mt-3 text-xs font-bold uppercase tracking-[.06em] text-primary">
        + Add row
      </button>
      <SaveButton saving={saving} />
    </form>
  );
}

function StepsListForm({ value, onSave }: { value: MarketingSteps | null; onSave: (v: MarketingSteps) => Promise<void> }) {
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
      {items.length === 0 ? <p className="text-xs text-ink/50">No steps added yet — the current live steps will keep showing.</p> : null}
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="border border-[#eee] p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[.06em] text-ink/50">Step {i + 1}</span>
              <button type="button" onClick={() => setItems(items.filter((_, idx) => idx !== i))} className="text-xs font-bold text-primary">
                Remove
              </button>
            </div>
            <Label>Title</Label>
            <Input value={item.title ?? ""} onChange={(e) => update(i, { title: e.target.value })} />
            <Label>Body</Label>
            <Textarea value={item.body ?? ""} onChange={(e) => update(i, { body: e.target.value })} />
          </div>
        ))}
      </div>
      <button type="button" onClick={() => setItems([...items, { title: "", body: "" }])} className="mt-3 text-xs font-bold uppercase tracking-[.06em] text-primary">
        + Add step
      </button>
      <SaveButton saving={saving} />
    </form>
  );
}

function CategoriesListForm({ value, onSave }: { value: MarketingCategories | null; onSave: (v: MarketingCategories) => Promise<void> }) {
  const [items, setItems] = useState<MarketingCategoryItem[]>(value?.items ?? []);
  const [saving, setSaving] = useState(false);

  function updateCategory(i: number, patch: Partial<MarketingCategoryItem>) {
    setItems(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }

  function updateGroups(i: number, groups: MarketingCategoryItem["groups"]) {
    updateCategory(i, { groups });
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
      {items.length === 0 ? <p className="text-xs text-ink/50">No categories added yet — the current live categories will keep showing.</p> : null}
      <div className="space-y-5">
        {items.map((category, i) => {
          const groups = category.groups ?? [];
          return (
            <div key={i} className="border border-[#ddd] p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[.06em] text-ink/50">Category {i + 1}</span>
                <button type="button" onClick={() => setItems(items.filter((_, idx) => idx !== i))} className="text-xs font-bold text-primary">
                  Remove category
                </button>
              </div>
              <Label>Name</Label>
              <Input value={category.name ?? ""} onChange={(e) => updateCategory(i, { name: e.target.value })} />

              <Label className="mt-3">Sub-groups</Label>
              <div className="space-y-3">
                {groups.map((group, gi) => (
                  <div key={gi} className="border border-[#eee] p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-[.06em] text-ink/40">Group {gi + 1}</span>
                      <button
                        type="button"
                        onClick={() => updateGroups(i, groups.filter((_, idx) => idx !== gi))}
                        className="text-xs font-bold text-primary"
                      >
                        Remove group
                      </button>
                    </div>
                    <Label>Group title</Label>
                    <Input value={group.title ?? ""} onChange={(e) => updateGroups(i, groups.map((g, idx) => (idx === gi ? { ...g, title: e.target.value } : g)))} />
                    <Label>Bullets</Label>
                    <StringListEditor
                      items={group.bullets ?? []}
                      onChange={(bullets) => updateGroups(i, groups.map((g, idx) => (idx === gi ? { ...g, bullets } : g)))}
                      addLabel="Add bullet"
                    />
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => updateGroups(i, [...groups, { title: "", bullets: [] }])}
                className="mt-2 text-xs font-bold uppercase tracking-[.06em] text-primary"
              >
                + Add group
              </button>
            </div>
          );
        })}
      </div>
      <button type="button" onClick={() => setItems([...items, { name: "", groups: [] }])} className="mt-3 text-xs font-bold uppercase tracking-[.06em] text-primary">
        + Add category
      </button>
      <SaveButton saving={saving} />
    </form>
  );
}

function PostsListForm({ pageSlug, value, onSave }: { pageSlug: string; value: MarketingPosts | null; onSave: (v: MarketingPosts) => Promise<void> }) {
  const [items, setItems] = useState<MarketingPostItem[]>(value?.items ?? []);
  const [saving, setSaving] = useState(false);

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
      {items.length === 0 ? <p className="text-xs text-ink/50">No posts added yet — the current live posts will keep showing.</p> : null}
      <div className="space-y-6">
        {items.map((post, i) => {
          const photos = post.photos ?? [];
          const body = post.body ?? [];
          return (
            <div key={i} className="border border-[#ddd] p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-bold">{post.title || `Post ${i + 1}`}</span>
                <button type="button" onClick={() => setItems(items.filter((_, idx) => idx !== i))} className="text-xs font-bold text-primary">
                  Remove post
                </button>
              </div>

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
              <Textarea value={post.excerpt ?? ""} onChange={(e) => update(i, { excerpt: e.target.value })} />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label>Date</Label>
                  <Input type="date" value={post.date ?? ""} onChange={(e) => update(i, { date: e.target.value })} />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={post.category ?? "Real Weddings"} onChange={(e) => update(i, { category: e.target.value })}>
                    <option value="Real Weddings">Real Weddings</option>
                    <option value="Destinations">Destinations</option>
                    <option value="Planning Tips">Planning Tips</option>
                  </Select>
                </div>
              </div>

              <Label>Cover photo</Label>
              <ImageField pageSlug={pageSlug} idPrefix={`post-${i}-media`} image={post.media} onChange={(media) => update(i, { media })} />

              <Label className="mt-3">Body paragraphs</Label>
              <StringListEditor items={body} onChange={(b) => update(i, { body: b })} addLabel="Add paragraph" multiline />

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
            </div>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => setItems([...items, { title: "", slug: "", location: "", excerpt: "", date: "", category: "Real Weddings", body: [], photos: [] }])}
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
}: {
  pageSlug: string;
  section: MarketingSection;
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

  return (
    <div className="border border-[#ddd] bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Badge tone={section.isEnabled ? "success" : "muted"}>{section.isEnabled ? "Enabled" : "Disabled"}</Badge>
        <span className="mr-auto text-sm font-bold">{section.title}</span>
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

        <Label htmlFor={`section-${section.id}-body`}>Body</Label>
        <Textarea id={`section-${section.id}-body`} value={content.body ?? ""} onChange={(e) => setContent({ ...content, body: e.target.value })} />

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
