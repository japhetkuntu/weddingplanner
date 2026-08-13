import { useEffect, useState } from "react";
import clsx from "clsx";
import { Badge, Button, Checkbox, Input, Label, Skeleton, Textarea, Toast } from "@ovutor/ui";
import { useCurrentClient } from "@/hooks/useCurrentClient";
import { getWebsiteSections, updateSectionStatus, getWebsiteContent, updateWebsiteContent, uploadWebsiteImage } from "@/lib/api";
import type {
  WebsiteContent,
  WebsiteDetailCard,
  WebsiteGalleryPhoto,
  WebsiteHero,
  WebsiteImage,
  WebsiteOurStory,
  WebsiteRsvpConfig,
  WebsiteScheduleEvent,
  WebsiteSection,
  WebsiteSectionKey,
  WebsiteSectionStatus,
  WebsiteStoryMoment,
  WebsiteTravelItem,
} from "@/types";

const STATUS_TONE: Record<WebsiteSectionStatus, "success" | "muted" | "warning"> = {
  published: "success",
  hidden: "muted",
  draft: "warning",
};

const STATUS_LABEL: Record<WebsiteSectionStatus, string> = {
  published: "Published",
  hidden: "Hidden",
  draft: "Draft",
};

function WebsiteEditorSkeleton() {
  return (
    <div className="ovutor-fade-in">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="mr-auto">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>
      <Skeleton className="mb-4 h-10 w-full" />
      <Skeleton className="mb-6 h-16 w-full" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px]">
        <div className="space-y-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <Skeleton className="h-[420px]" />
      </div>
    </div>
  );
}

export default function ClientWebsitePage() {
  const client = useCurrentClient();
  const [sections, setSections] = useState<WebsiteSection[]>([]);
  const [content, setContent] = useState<WebsiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedKey, setSelectedKey] = useState<WebsiteSectionKey>("hero");
  const [toast, setToast] = useState<string | null>(null);
  const [savingContent, setSavingContent] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);

  useEffect(() => {
    if (!client) return;
    setLoading(true);
    Promise.all([getWebsiteSections(client.id).then(setSections), getWebsiteContent(client.id).then(setContent)]).finally(() => setLoading(false));
  }, [client]);

  function flashToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  }

  if (!client) return null;
  if (loading || !content) return <WebsiteEditorSkeleton />;

  const siteUrl = `${import.meta.env.VITE_WEDDING_WEBSITE_URL}/${client.slug}`;
  const selected = sections.find((s) => s.key === selectedKey) ?? sections[0];

  async function setSectionStatus(key: WebsiteSectionKey, status: WebsiteSectionStatus) {
    const target = sections.find((s) => s.key === key);
    if (!target) return;
    setSavingStatus(true);
    try {
      const updated = await updateSectionStatus(target.id, status);
      setSections((prev) => prev.map((s) => (s.key === key ? updated : s)));
      flashToast(status === "published" ? "Section published — now visible to guests" : status === "hidden" ? "Section hidden from guests" : "Saved as draft");
    } finally {
      setSavingStatus(false);
    }
  }

  async function saveContent<K extends keyof WebsiteContent>(key: K, value: WebsiteContent[K]) {
    if (!client || !content) return;
    setSavingContent(true);
    try {
      const next = { ...content, [key]: value };
      const { clientId: _clientId, ...body } = next;
      const saved = await updateWebsiteContent(client.id, body);
      setContent(saved);
      flashToast("Saved");
    } finally {
      setSavingContent(false);
    }
  }

  return (
    <div className="ovutor-fade-in">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="mr-auto">
          <h1 className="font-display text-3xl">Website editor</h1>
          <p className="text-sm text-ink/60">Everything here is what guests will see on {client.coupleNames}'s wedding website.</p>
        </div>
        <a href={siteUrl} target="_blank" rel="noreferrer">
          <Button variant="outline" size="sm">
            Preview
          </Button>
        </a>
      </div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border border-[#ddd] bg-bg-warm px-4 py-2.5 text-sm">
        <span>{siteUrl}</span>
        <span className="flex gap-2 text-xs font-bold uppercase tracking-[.06em] text-primary">
          <button type="button" onClick={() => navigator.clipboard.writeText(siteUrl).then(() => flashToast("Link copied"))}>
            Copy
          </button>
          ·
          <a href={siteUrl} target="_blank" rel="noreferrer">
            Open
          </a>
        </span>
      </div>
      <p className="mb-6 border-l-[3px] border-primary bg-primary/5 px-4 py-3 text-sm text-ink/70">
        Every section starts filled in with example content — a guide for what to write and how it will look. Edit each field with the
        couple's real details, then publish when it's ready.
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px]">
        <div className="space-y-2">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setSelectedKey(section.key)}
              className={clsx(
                "flex w-full items-center gap-4 border border-[#ddd] bg-white px-4 py-3.5 text-left hover:bg-bg-warm",
                selectedKey === section.key && "border-primary",
              )}
            >
              <span className="font-display text-2xl text-ink/30">{String(section.order).padStart(2, "0")}</span>
              <div className="min-w-0 flex-1">
                <Badge tone={STATUS_TONE[section.status]} className="mb-1">
                  {STATUS_LABEL[section.status]}
                </Badge>
                <h3 className="font-display text-lg">{section.title}</h3>
                <p className="truncate text-sm text-ink/50">{section.description}</p>
              </div>
              <span className="shrink-0 text-xs font-bold uppercase tracking-[.06em] text-primary">Edit</span>
            </button>
          ))}
        </div>

        <aside className="h-fit border-t-[3px] border-primary bg-white p-5 shadow-card lg:sticky lg:top-6">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[.1em] text-primary">Selected section</p>
            <Badge tone={STATUS_TONE[selected.status]}>{STATUS_LABEL[selected.status]}</Badge>
          </div>
          <h2 className="mb-4 font-display text-xl">{selected.title}</h2>

          <SectionContentForm
            clientId={client.id}
            selected={selected}
            content={content}
            onSaveContent={saveContent}
            saving={savingContent}
          />

          <div className="mt-5 flex flex-wrap gap-2 border-t border-[#eee] pt-4">
            {selected.status !== "published" ? (
              <Button size="sm" onClick={() => setSectionStatus(selected.key, "published")} loading={savingStatus} loadingText="Publishing…">
                Publish section
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setSectionStatus(selected.key, "hidden")} loading={savingStatus} loadingText="Hiding…">
                Hide section
              </Button>
            )}
            {selected.status !== "draft" ? (
              <Button size="sm" variant="outline" onClick={() => setSectionStatus(selected.key, "draft")} disabled={savingStatus}>
                Move to draft
              </Button>
            ) : null}
          </div>
          {selected.status === "hidden" ? <p className="mt-3 text-xs text-ink/50">This section is built but won't appear on the live site until you publish it.</p> : null}
        </aside>
      </div>

      <Toast open={!!toast}>{toast}</Toast>
    </div>
  );
}

function SectionContentForm({
  clientId,
  selected,
  content,
  onSaveContent,
  saving,
}: {
  clientId: string;
  selected: WebsiteSection;
  content: WebsiteContent;
  onSaveContent: <K extends keyof WebsiteContent>(key: K, value: WebsiteContent[K]) => void;
  saving: boolean;
}) {
  switch (selected.key) {
    case "hero":
      return <HeroForm clientId={clientId} hero={content.hero} onSave={(v) => onSaveContent("hero", v)} saving={saving} />;
    case "our-story":
      return <OurStoryForm clientId={clientId} ourStory={content.ourStory} onSave={(v) => onSaveContent("ourStory", v)} saving={saving} />;
    case "details":
      return <DetailsForm details={content.details} onSave={(v) => onSaveContent("details", v)} saving={saving} />;
    case "schedule":
      return <ScheduleForm schedule={content.schedule} onSave={(v) => onSaveContent("schedule", v)} saving={saving} />;
    case "travel":
      return <TravelForm travel={content.travel} onSave={(v) => onSaveContent("travel", v)} saving={saving} />;
    case "gallery":
      return <GalleryForm clientId={clientId} gallery={content.gallery} onSave={(v) => onSaveContent("gallery", v)} saving={saving} />;
    case "rsvp":
      return <RsvpForm rsvp={content.rsvp} onSave={(v) => onSaveContent("rsvp", v)} saving={saving} />;
    default:
      return null;
  }
}

function ImageField({
  image,
  onChange,
  idPrefix,
  clientId,
}: {
  image: WebsiteImage;
  onChange: (image: WebsiteImage) => void;
  idPrefix: string;
  clientId: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const url = await uploadWebsiteImage(clientId, file);
      onChange({ ...image, url, label: image.label || file.name });
    } catch {
      setError("Couldn't upload that photo — try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex gap-3">
      <div className="grid h-16 w-16 shrink-0 place-items-center border border-dashed border-[#ccc] bg-bg-warm text-center text-[10px] text-ink/40">
        {image.url ? <img src={image.url} alt={image.label} className="h-full w-full object-cover" /> : <span className="px-1">{image.label || "No image"}</span>}
      </div>
      <div className="flex-1 space-y-2">
        <Input
          placeholder="Photo label (shown until a real photo is added)"
          value={image.label}
          onChange={(e) => onChange({ ...image, label: e.target.value })}
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
        {error ? <p className="text-xs text-primary">{error}</p> : null}
      </div>
    </div>
  );
}

function HeroForm({ clientId, hero, onSave, saving }: { clientId: string; hero: WebsiteHero; onSave: (hero: WebsiteHero) => void; saving: boolean }) {
  const [form, setForm] = useState(hero);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
    >
      <Label htmlFor="hero-eyebrow">Eyebrow</Label>
      <Input id="hero-eyebrow" value={form.eyebrow} onChange={(e) => setForm({ ...form, eyebrow: e.target.value })} />
      <Label htmlFor="hero-names">Couple names</Label>
      <Input id="hero-names" value={form.coupleNames} onChange={(e) => setForm({ ...form, coupleNames: e.target.value })} />
      <Label htmlFor="hero-date">Wedding date</Label>
      <Input id="hero-date" value={form.dateLabel} onChange={(e) => setForm({ ...form, dateLabel: e.target.value })} />
      <Label htmlFor="hero-venue">Venue location</Label>
      <Input id="hero-venue" value={form.venueLabel} onChange={(e) => setForm({ ...form, venueLabel: e.target.value })} />
      <Label>Hero photo</Label>
      <ImageField clientId={clientId} idPrefix="hero" image={form.image} onChange={(image) => setForm({ ...form, image })} />
      <Button type="submit" className="mt-5 w-full" loading={saving}>
        Save hero section
      </Button>
    </form>
  );
}

function OurStoryForm({
  clientId,
  ourStory,
  onSave,
  saving,
}: {
  clientId: string;
  ourStory: WebsiteOurStory;
  onSave: (ourStory: WebsiteOurStory) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState(ourStory);

  function updateParagraph(i: number, value: string) {
    setForm({ ...form, paragraphs: form.paragraphs.map((p, idx) => (idx === i ? value : p)) });
  }
  function addParagraph() {
    setForm({ ...form, paragraphs: [...form.paragraphs, ""] });
  }
  function removeParagraph(i: number) {
    setForm({ ...form, paragraphs: form.paragraphs.filter((_, idx) => idx !== i) });
  }

  function updateMoment(i: number, patch: Partial<WebsiteStoryMoment>) {
    setForm({ ...form, moments: form.moments.map((m, idx) => (idx === i ? { ...m, ...patch } : m)) });
  }
  function addMoment() {
    setForm({ ...form, moments: [...form.moments, { label: "", year: "" }] });
  }
  function removeMoment(i: number) {
    setForm({ ...form, moments: form.moments.filter((_, idx) => idx !== i) });
  }

  function updateImage(i: number, image: WebsiteImage) {
    setForm({ ...form, images: form.images.map((img, idx) => (idx === i ? image : img)) });
  }
  function addImage() {
    setForm({ ...form, images: [...form.images, { label: "New photo" }] });
  }
  function removeImage(i: number) {
    setForm({ ...form, images: form.images.filter((_, idx) => idx !== i) });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
    >
      <Label htmlFor="story-eyebrow">Eyebrow</Label>
      <Input id="story-eyebrow" value={form.eyebrow} onChange={(e) => setForm({ ...form, eyebrow: e.target.value })} />
      <Label htmlFor="story-title">Title</Label>
      <Input id="story-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />

      <Label>Story paragraphs</Label>
      <div className="space-y-2">
        {form.paragraphs.map((p, i) => (
          <div key={i} className="flex gap-2">
            <Textarea value={p} onChange={(e) => updateParagraph(i, e.target.value)} className="flex-1" />
            <button type="button" onClick={() => removeParagraph(i)} className="text-xs font-bold text-primary" aria-label="Remove paragraph">
              &times;
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={addParagraph} className="mt-2 text-xs font-bold uppercase tracking-[.06em] text-primary">
        + Add paragraph
      </button>

      <Label>Story moments</Label>
      <div className="space-y-2">
        {form.moments.map((m, i) => (
          <div key={i} className="flex gap-2">
            <Input placeholder="Moment, e.g. First date" value={m.label} onChange={(e) => updateMoment(i, { label: e.target.value })} className="flex-1" />
            <Input placeholder="Year" value={m.year} onChange={(e) => updateMoment(i, { year: e.target.value })} className="w-20" />
            <button type="button" onClick={() => removeMoment(i)} className="text-xs font-bold text-primary" aria-label="Remove moment">
              &times;
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={addMoment} className="mt-2 text-xs font-bold uppercase tracking-[.06em] text-primary">
        + Add moment
      </button>

      <Label>Photos</Label>
      <div className="space-y-3">
        {form.images.map((img, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="flex-1">
              <ImageField clientId={clientId} idPrefix={`story-${i}`} image={img} onChange={(image) => updateImage(i, image)} />
            </div>
            <button type="button" onClick={() => removeImage(i)} className="mt-1 text-xs font-bold text-primary" aria-label="Remove photo">
              &times;
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={addImage} className="mt-2 text-xs font-bold uppercase tracking-[.06em] text-primary">
        + Add photo
      </button>

      <Button type="submit" className="mt-5 w-full" loading={saving}>
        Save Our Story
      </Button>
    </form>
  );
}

function DetailsForm({ details, onSave, saving }: { details: WebsiteDetailCard[]; onSave: (details: WebsiteDetailCard[]) => void; saving: boolean }) {
  const [form, setForm] = useState(details);

  function updateCard(i: number, patch: Partial<WebsiteDetailCard>) {
    setForm(form.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
    >
      <p className="mb-3 text-sm text-ink/60">These four cards make up the Details section guests see.</p>
      <div className="space-y-5">
        {form.map((card, i) => (
          <div key={card.eyebrow} className="border border-[#eee] p-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[.08em] text-primary">{card.eyebrow}</p>
            <Label htmlFor={`detail-${i}-heading`}>Heading</Label>
            <Input id={`detail-${i}-heading`} value={card.heading} onChange={(e) => updateCard(i, { heading: e.target.value })} />
            <Label htmlFor={`detail-${i}-body`}>Body</Label>
            <Textarea id={`detail-${i}-body`} placeholder="Venue name and address, one per line" value={card.body} onChange={(e) => updateCard(i, { body: e.target.value })} />
            <Label htmlFor={`detail-${i}-note`}>Note</Label>
            <Input id={`detail-${i}-note`} value={card.note ?? ""} onChange={(e) => updateCard(i, { note: e.target.value })} />
          </div>
        ))}
      </div>
      <Button type="submit" className="mt-5 w-full" loading={saving}>
        Save details
      </Button>
    </form>
  );
}

function ScheduleForm({ schedule, onSave, saving }: { schedule: WebsiteScheduleEvent[]; onSave: (schedule: WebsiteScheduleEvent[]) => void; saving: boolean }) {
  const [form, setForm] = useState(schedule);

  function update(i: number, patch: Partial<WebsiteScheduleEvent>) {
    setForm(form.map((e, idx) => (idx === i ? { ...e, ...patch } : e)));
  }
  function add() {
    setForm([...form, { time: "", title: "", detail: "" }]);
  }
  function remove(i: number) {
    setForm(form.filter((_, idx) => idx !== i));
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
    >
      <div className="space-y-3">
        {form.map((event, i) => (
          <div key={i} className="flex items-start gap-2 border border-[#eee] p-3">
            <div className="flex-1 space-y-2">
              <Input placeholder="Time, e.g. 4:30 PM" value={event.time} onChange={(e) => update(i, { time: e.target.value })} />
              <Input placeholder="Event, e.g. Ceremony" value={event.title} onChange={(e) => update(i, { title: e.target.value })} />
              <Input placeholder="Location or detail" value={event.detail} onChange={(e) => update(i, { detail: e.target.value })} />
            </div>
            <button type="button" onClick={() => remove(i)} className="text-xs font-bold text-primary" aria-label="Remove event">
              &times;
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={add} className="mt-2 text-xs font-bold uppercase tracking-[.06em] text-primary">
        + Add event
      </button>
      <Button type="submit" className="mt-5 w-full" loading={saving}>
        Save schedule
      </Button>
    </form>
  );
}

function TravelForm({ travel, onSave, saving }: { travel: WebsiteTravelItem[]; onSave: (travel: WebsiteTravelItem[]) => void; saving: boolean }) {
  const [form, setForm] = useState(travel);

  function update(i: number, patch: Partial<WebsiteTravelItem>) {
    setForm(form.map((t, idx) => (idx === i ? { ...t, ...patch } : t)));
  }
  function add() {
    setForm([...form, { heading: "", body: "" }]);
  }
  function remove(i: number) {
    setForm(form.filter((_, idx) => idx !== i));
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
    >
      <div className="space-y-3">
        {form.map((item, i) => (
          <div key={i} className="flex items-start gap-2 border border-[#eee] p-3">
            <div className="flex-1 space-y-2">
              <Input placeholder="Heading, e.g. Hotel block" value={item.heading} onChange={(e) => update(i, { heading: e.target.value })} />
              <Textarea placeholder="Details for guests" value={item.body} onChange={(e) => update(i, { body: e.target.value })} />
            </div>
            <button type="button" onClick={() => remove(i)} className="text-xs font-bold text-primary" aria-label="Remove item">
              &times;
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={add} className="mt-2 text-xs font-bold uppercase tracking-[.06em] text-primary">
        + Add travel item
      </button>
      <Button type="submit" className="mt-5 w-full" loading={saving}>
        Save travel &amp; stay
      </Button>
    </form>
  );
}

function GalleryForm({
  clientId,
  gallery,
  onSave,
  saving,
}: {
  clientId: string;
  gallery: WebsiteGalleryPhoto[];
  onSave: (gallery: WebsiteGalleryPhoto[]) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState(gallery);

  function update(i: number, patch: Partial<WebsiteGalleryPhoto>) {
    setForm(form.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  }
  function add() {
    setForm([...form, { label: "New photo", caption: "" }]);
  }
  function remove(i: number) {
    setForm(form.filter((_, idx) => idx !== i));
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
    >
      <div className="space-y-3">
        {form.map((photo, i) => (
          <div key={i} className="border border-[#eee] p-3">
            <ImageField clientId={clientId} idPrefix={`gallery-${i}`} image={photo} onChange={(image) => update(i, image)} />
            <Label htmlFor={`gallery-${i}-caption`}>Caption</Label>
            <div className="flex gap-2">
              <Input id={`gallery-${i}-caption`} value={photo.caption} onChange={(e) => update(i, { caption: e.target.value })} className="flex-1" />
              <button type="button" onClick={() => remove(i)} className="text-xs font-bold text-primary" aria-label="Remove photo">
                &times;
              </button>
            </div>
          </div>
        ))}
      </div>
      <button type="button" onClick={add} className="mt-2 text-xs font-bold uppercase tracking-[.06em] text-primary">
        + Add photo
      </button>
      <Button type="submit" className="mt-5 w-full" loading={saving}>
        Save gallery
      </Button>
    </form>
  );
}

function RsvpForm({ rsvp, onSave, saving }: { rsvp: WebsiteRsvpConfig; onSave: (rsvp: WebsiteRsvpConfig) => void; saving: boolean }) {
  const [form, setForm] = useState(rsvp);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
    >
      <Label htmlFor="rsvp-deadline">RSVP deadline</Label>
      <Input id="rsvp-deadline" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
      <Label htmlFor="rsvp-confirmation">Confirmation message</Label>
      <Textarea id="rsvp-confirmation" value={form.confirmationMessage} onChange={(e) => setForm({ ...form, confirmationMessage: e.target.value })} />
      <div className="mt-4 space-y-2.5">
        <Checkbox id="rsvp-dietary" label="Collect dietary requirements" checked={form.collectDietary} onChange={(e) => setForm({ ...form, collectDietary: e.target.checked })} />
        <Checkbox id="rsvp-plusone" label="Allow plus-one requests" checked={form.collectPlusOne} onChange={(e) => setForm({ ...form, collectPlusOne: e.target.checked })} />
      </div>
      <Button type="submit" className="mt-5 w-full" loading={saving}>
        Save RSVP settings
      </Button>
    </form>
  );
}
