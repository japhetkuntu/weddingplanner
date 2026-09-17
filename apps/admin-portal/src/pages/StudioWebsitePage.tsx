import { useEffect, useState } from "react";
import clsx from "clsx";
import { Badge, Button, Input, Label, Select, Skeleton, Textarea, Toast, Toggle } from "@ovutor/ui";
import {
  getMarketingHero,
  updateMarketingHero,
  getMarketingSections,
  createMarketingSection,
  updateMarketingSection,
  setMarketingSectionEnabled,
  reorderMarketingSections,
  deleteMarketingSection,
  uploadMarketingImage,
  errorMessage,
} from "@/lib/api";
import type { MarketingContentBlock, MarketingHero, MarketingImage, MarketingSection, MarketingSectionLayout } from "@/types";

const PAGE_SLUG = "home";

/** The current live copy for the Home hero — shown only as input placeholders below, never as a
 * real default value, so an admin can see exactly what guests see today without that text ever
 * being accidentally submitted as their own content. Keep this in sync with HOME.hero in
 * apps/wedding-website/src/content/marketing.ts when that static copy changes. */
const STATIC_HERO_PLACEHOLDERS = {
  eyebrow: "Ovutor Weddings",
  title: "Thoughtfully planned.\nBeautifully celebrated.",
  subtitle: "A boutique studio designing intimate, unforgettable weddings — from the first toast to the last dance.",
  ctaLabel: "Start planning your day",
  ctaTo: "/connect-with-us",
};

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
  const [hero, setHero] = useState<MarketingHero | null>(null);
  const [sections, setSections] = useState<MarketingSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([getMarketingHero(PAGE_SLUG).then(setHero), getMarketingSections(PAGE_SLUG).then(setSections)]).finally(() => setLoading(false));
  }, []);

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
      const saved = await updateMarketingHero(PAGE_SLUG, next);
      setHero(saved);
      flashToast("Saved");
    } catch (e) {
      flashError(errorMessage(e, "Couldn't save the hero section — please try again."));
    }
  }

  async function addSection() {
    try {
      const created = await createMarketingSection(PAGE_SLUG, "New section", emptyBlock());
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
        PAGE_SLUG,
        next.map((s) => s.id),
      );
      setSections(saved);
    } catch (e) {
      flashError(errorMessage(e, "Couldn't save the new order — please try again."));
    }
  }

  if (loading || !hero) return <PageEditorSkeleton />;

  return (
    <div className="ovutor-fade-in">
      <div className="mb-1">
        <h1 className="font-display text-3xl">Studio website</h1>
        <p className="text-sm text-ink/60">Home page — every field falls back to our current live copy until you fill it in.</p>
      </div>

      <div className="mt-6 border-t-[3px] border-primary bg-white p-5 shadow-card">
        <h2 className="mb-4 font-display text-xl">Hero</h2>
        <HeroForm hero={hero} onSave={saveHero} />
      </div>

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

      <Toast open={!!toast}>{toast}</Toast>
      <Toast open={!!error} tone="error">
        {error}
      </Toast>
    </div>
  );
}

function ImageField({ image, onChange, idPrefix }: { image?: MarketingImage; onChange: (image: MarketingImage) => void; idPrefix: string }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const value = image ?? {};

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const url = await uploadMarketingImage(PAGE_SLUG, file);
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
        <Input
          placeholder="Photo label"
          value={value.label ?? ""}
          onChange={(e) => onChange({ ...value, label: e.target.value })}
        />
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

function HeroForm({ hero, onSave }: { hero: MarketingHero; onSave: (hero: MarketingHero) => void }) {
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
      <Input id="hero-eyebrow" placeholder={STATIC_HERO_PLACEHOLDERS.eyebrow} value={form.eyebrow ?? ""} onChange={(e) => setForm({ ...form, eyebrow: e.target.value })} />

      <Label htmlFor="hero-title">Title</Label>
      <Textarea id="hero-title" placeholder={STATIC_HERO_PLACEHOLDERS.title} value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })} />

      <Label htmlFor="hero-subtitle">Subtitle</Label>
      <Textarea id="hero-subtitle" placeholder={STATIC_HERO_PLACEHOLDERS.subtitle} value={form.subtitle ?? ""} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="hero-cta-label">Button label</Label>
          <Input id="hero-cta-label" placeholder={STATIC_HERO_PLACEHOLDERS.ctaLabel} value={form.ctaLabel ?? ""} onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="hero-cta-to">Button link</Label>
          <Input id="hero-cta-to" placeholder={STATIC_HERO_PLACEHOLDERS.ctaTo} value={form.ctaTo ?? ""} onChange={(e) => setForm({ ...form, ctaTo: e.target.value })} />
        </div>
      </div>

      <Label>Hero photos</Label>
      <div className="space-y-3">
        {(form.media ?? []).map((img, i) => (
          <div key={i} className="flex items-start gap-2 border border-[#eee] p-3">
            <div className="flex-1">
              <ImageField
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
      <button
        type="button"
        onClick={() => setForm({ ...form, media: [...(form.media ?? []), {}] })}
        className="mt-2 text-xs font-bold uppercase tracking-[.06em] text-primary"
      >
        + Add photo
      </button>
      {(form.media?.length ?? 0) === 0 ? (
        <p className="mt-2 text-xs text-ink/50">No photos added yet — the current live hero photos will keep showing.</p>
      ) : null}

      <Button type="submit" className="mt-5 w-full" loading={saving}>
        Save hero
      </Button>
    </form>
  );
}

function SectionEditor({
  section,
  onSave,
  onToggle,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
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
            <ImageField idPrefix={`section-${section.id}-image`} image={content.image} onChange={(image) => setContent({ ...content, image })} />
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
