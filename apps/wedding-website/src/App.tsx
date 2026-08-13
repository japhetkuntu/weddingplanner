import { useEffect, useState } from "react";
import { Button, Input, Label } from "@ovutor/ui";
import { getSite, submitRsvp, ApiError } from "@/lib/api";
import { PlaceholderImage } from "@/components/PlaceholderImage";
import { WeddingLoader } from "@/components/WeddingLoader";
import { OvutorLanding } from "@/components/OvutorLanding";
import type { SiteConfig } from "@/types";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Our Story", href: "#story" },
  { label: "Details", href: "#details" },
  { label: "Schedule", href: "#schedule" },
  { label: "Travel", href: "#travel" },
  { label: "Gallery", href: "#gallery" },
];

function getSlug() {
  return window.location.pathname.replace(/^\/+|\/+$/g, "");
}

export default function App() {
  const [slug] = useState(getSlug);
  const [site, setSite] = useState<SiteConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      setError("This link is missing a wedding website address.");
      setLoading(false);
      return;
    }
    getSite(slug)
      .then((data) => {
        setSite(data);
        document.title = `${data.coupleNames} — ${new Date(data.date).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}`;
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "We couldn't load this wedding website."))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <WeddingLoader />;
  }

  if (error || !site) {
    return (
      <OvutorLanding
        eyebrow={slug ? "Page not found" : "Invalid link"}
        title={error ?? "We couldn't find this wedding website."}
        message={
          slug
            ? "This link may be outdated, or the site may have moved. Double-check the link your couple shared with you."
            : "The link you followed doesn't include a wedding to look up. Here's what Ovutor is all about, in case you're planning one of your own."
        }
      />
    );
  }

  const c = site;
  const isPublished = (key: string) => c.publishedSections.includes(key);

  if (c.publishedSections.length === 0) {
    return (
      <OvutorLanding
        eyebrow={c.coupleNames}
        title="This wedding website is being set up."
        message="The couple's planner is putting the finishing touches on it — check back soon. In the meantime, here's a bit about Ovutor."
      />
    );
  }

  return (
    <div className="ovutor-fade-in bg-bg font-sans text-ink">
      <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-6 py-5 text-white sm:px-10">
        <div className="font-display text-2xl">
          Ovutor <span className="text-primary">&#9825;</span>
        </div>
        <nav className="hidden gap-6 text-xs font-bold uppercase tracking-[.1em] lg:flex">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="hover:opacity-70">
              {link.label}
            </a>
          ))}
        </nav>
        {isPublished("rsvp") ? (
          <a href="#rsvp" className="border border-white px-4 py-2.5 text-xs font-bold uppercase tracking-[.1em] hover:bg-white hover:text-ink">
            RSVP
          </a>
        ) : null}
      </header>

      {isPublished("hero") ? (
        <section id="home" className="relative flex min-h-[560px] items-end bg-ink sm:min-h-[670px]">
          <div className="absolute inset-0">
            <PlaceholderImage image={c.hero.image} className="opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/10" />
          </div>
          <div className="relative z-10 w-full px-6 pb-16 pt-32 text-white sm:px-10 sm:pb-24">
            <p className="text-[11px] font-bold uppercase tracking-[.16em] text-white/80">{c.hero.eyebrow}</p>
            <h1 className="my-4 font-display text-6xl leading-[0.95] sm:text-[70px]">
              {c.hero.coupleNames.split(" & ")[0]}
              <br />
              &amp; {c.hero.coupleNames.split(" & ")[1]}
            </h1>
            <p className="max-w-md leading-relaxed text-white/90">
              {c.hero.date}
              <br />
              {c.hero.venue}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {isPublished("rsvp") ? (
                <a href="#rsvp" className="border border-primary bg-primary px-6 py-3.5 text-xs font-bold uppercase tracking-[.12em] text-white hover:brightness-110">
                  RSVP
                </a>
              ) : null}
              {isPublished("details") ? (
                <a href="#details" className="border border-white px-6 py-3.5 text-xs font-bold uppercase tracking-[.12em] text-white hover:bg-white hover:text-ink">
                  View details
                </a>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      <main className="mx-auto max-w-[1160px] px-6 sm:px-10">
        {isPublished("our-story") ? <OurStory site={c} /> : null}
        {isPublished("details") ? <Details site={c} /> : null}
        {isPublished("schedule") ? <Schedule site={c} /> : null}
        {isPublished("travel") ? <Travel site={c} /> : null}
        {isPublished("gallery") ? <Gallery site={c} /> : null}
      </main>

      {isPublished("rsvp") ? <RsvpBlock site={c} slug={slug} /> : null}

      {isPublished("rsvp") ? (
        <a href="#rsvp" className="fixed inset-x-0 bottom-0 z-30 block bg-primary py-4 text-center text-xs font-bold uppercase tracking-[.12em] text-white sm:hidden">
          RSVP
        </a>
      ) : null}

      <footer className="bg-ink px-6 py-12 text-center text-white sm:px-10">
        <div className="font-display text-xl">{c.coupleNames}</div>
        <p className="mt-1.5 text-sm text-white/70">
          {new Date(c.date).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
        </p>

        <div className="mx-auto mt-8 h-px w-10 bg-white/20" />

        {/* Small, deliberately quiet — this is the couple's site, Ovutor gets a credit line, not a stage. */}
        <a
          href="https://ovutor.com"
          className="mt-6 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[.1em] text-white/50 transition-colors hover:text-white"
        >
          Made with Ovutor <span className="text-primary">&#9825;</span>
        </a>
        <p className="mt-1.5 text-xs text-white/35">
          Planning your own wedding?{" "}
          <a href="https://ovutor.com" className="underline decoration-white/30 underline-offset-2 hover:text-white/70">
            Start at ovutor.com
          </a>
        </p>
      </footer>
    </div>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold uppercase tracking-[.14em] text-primary">{children}</p>;
}

function OurStory({ site }: { site: SiteConfig }) {
  const { ourStory } = site;
  return (
    <section id="story" className="grid grid-cols-1 gap-10 py-16 sm:py-24 lg:grid-cols-2 lg:gap-16">
      <div className="grid grid-cols-2 gap-3">
        {ourStory.images.map((img) => (
          <div key={img.label} className="aspect-[3/4] overflow-hidden bg-ink/10">
            <PlaceholderImage image={img} />
          </div>
        ))}
      </div>
      <div className="flex flex-col justify-center">
        <SectionEyebrow>{ourStory.eyebrow}</SectionEyebrow>
        <h2 className="my-3 font-display text-4xl leading-tight sm:text-5xl">{ourStory.title}</h2>
        {ourStory.paragraphs.map((p) => (
          <p key={p} className="mb-3 max-w-[550px] leading-relaxed text-ink/70">
            {p}
          </p>
        ))}
        <p className="mt-4 text-sm font-bold uppercase tracking-[.06em] text-ink/50">
          {ourStory.moments.map((m) => `${m.label} · ${m.year}`).join("      ")}
        </p>
      </div>
    </section>
  );
}

function Details({ site }: { site: SiteConfig }) {
  const { details } = site;
  return (
    <section id="details" className="border-t border-[#e6e2dc] py-16 sm:py-24">
      <SectionEyebrow>The Details</SectionEyebrow>
      <h2 className="my-3 font-display text-4xl sm:text-5xl">Plan your arrival.</h2>
      <p className="mb-10 max-w-[550px] leading-relaxed text-ink/70">Everything you need to be there, settle in, and celebrate with us.</p>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {details.map((d) => (
          <article key={d.eyebrow}>
            <p className="text-[10px] font-bold uppercase tracking-[.1em] text-ink/50">{d.eyebrow}</p>
            <h3 className="my-2 font-display text-2xl">{d.heading}</h3>
            {d.body ? (
              <p className="whitespace-pre-line text-sm leading-relaxed">
                {d.body.split("\n").map((line, i) => (i === 0 ? <b key={line}>{line}</b> : <span key={line}><br />{line}</span>))}
              </p>
            ) : null}
            {d.note ? <p className="mt-1.5 text-sm text-ink/60">{d.note}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function Schedule({ site }: { site: SiteConfig }) {
  const { schedule } = site;
  return (
    <section id="schedule" className="border-t border-[#e6e2dc] py-16 sm:py-24">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <SectionEyebrow>The day</SectionEyebrow>
          <h2 className="my-3 font-display text-4xl sm:text-5xl">A day to remember.</h2>
          <p className="max-w-[550px] leading-relaxed text-ink/70">We've planned a little time for every toast, embrace, and song.</p>
        </div>
        <div>
          {schedule.map((event) => (
            <div key={event.time} className="flex gap-6 border-t border-[#e6e2dc] py-4 first:border-t-0">
              <div className="w-20 shrink-0 text-sm font-bold text-primary">{event.time}</div>
              <div>
                <b>{event.title}</b>
                <p className="text-sm text-ink/60">{event.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Travel({ site }: { site: SiteConfig }) {
  const { travel } = site;
  return (
    <section id="travel" className="border-t border-[#e6e2dc] py-16 sm:py-24">
      <SectionEyebrow>Travel &amp; Stay</SectionEyebrow>
      <h2 className="my-3 font-display text-4xl sm:text-5xl">Getting here &amp; staying over.</h2>
      <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
        {travel.map((t) => (
          <div key={t.heading}>
            <h3 className="mb-2 font-display text-xl">{t.heading}</h3>
            <p className="text-sm leading-relaxed text-ink/70">{t.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Gallery({ site }: { site: SiteConfig }) {
  const { gallery } = site;
  return (
    <section id="gallery" className="border-t border-[#e6e2dc] py-16 sm:py-24">
      <SectionEyebrow>A few favorites</SectionEyebrow>
      <h2 className="my-3 font-display text-4xl sm:text-5xl">The places that made us.</h2>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {gallery.map((photo) => (
          <figure key={photo.caption} className="group relative aspect-square overflow-hidden bg-ink/10">
            <PlaceholderImage image={photo} className="transition-transform duration-300 group-hover:scale-105" />
            <figcaption className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-ink/80 to-transparent p-3 text-xs text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              {photo.caption}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

interface StoredRsvp {
  fullName: string;
  attendanceCount?: number;
  dietary?: string;
  submittedAt: string;
}

function rsvpStorageKey(slug: string) {
  return `ovutor:rsvp:${slug}`;
}

function getStoredRsvp(slug: string): StoredRsvp | null {
  try {
    const raw = localStorage.getItem(rsvpStorageKey(slug));
    return raw ? (JSON.parse(raw) as StoredRsvp) : null;
  } catch {
    // Private browsing or storage disabled — worst case, we fall back to always showing the form.
    return null;
  }
}

function storeRsvp(slug: string, record: StoredRsvp) {
  try {
    localStorage.setItem(rsvpStorageKey(slug), JSON.stringify(record));
  } catch {
    // Nothing to do — the submission itself already succeeded server-side.
  }
}

function RsvpBlock({ site, slug }: { site: SiteConfig; slug: string }) {
  const { rsvp } = site;
  const [stored, setStored] = useState<StoredRsvp | null>(() => getStoredRsvp(slug));
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showForm = !stored || editing;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const fullName = String(form.get("guest-name") ?? "").trim();
    if (!fullName) return;

    const record: StoredRsvp = {
      fullName,
      attendanceCount: Number(form.get("guest-count")) || 1,
      dietary: String(form.get("dietary") ?? "") || undefined,
      submittedAt: new Date().toISOString(),
    };

    setSubmitting(true);
    try {
      await submitRsvp(slug, { fullName: record.fullName, attending: true, attendanceCount: record.attendanceCount, dietary: record.dietary });
      storeRsvp(slug, record);
      setStored(record);
      setEditing(false);
    } catch {
      setError("We couldn't submit your RSVP — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="rsvp" className="bg-ink px-6 py-16 text-center text-white sm:px-10 sm:py-24">
      <p className="text-[10px] font-bold uppercase tracking-[.14em] text-white/70">{rsvp.eyebrow}</p>
      <h2 className="my-3 font-display text-4xl sm:text-5xl">{rsvp.title}</h2>
      <p className="mx-auto max-w-[550px] leading-relaxed text-white/80">{rsvp.body}</p>

      <div className="mx-auto mt-10 max-w-[440px] bg-white p-6 text-left text-ink sm:p-8">
        {!showForm && stored ? (
          <div className="py-6 text-center">
            <p className="font-display text-2xl">Thank you!</p>
            <p className="mt-2 text-ink/60">{rsvp.confirmationMessage}</p>
            <p className="mt-4 border-t border-[#eee] pt-4 text-sm text-ink/50">
              You RSVP'd as <b className="text-ink">{stored.fullName}</b>
              {stored.attendanceCount ? `, ${stored.attendanceCount} attending` : ""}.
            </p>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="mt-2 text-xs font-bold uppercase tracking-[.06em] text-primary hover:underline"
            >
              Need to make a change?
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <Label htmlFor="guest-name">Full name</Label>
            <Input id="guest-name" name="guest-name" placeholder="As it appears on your invitation" defaultValue={stored?.fullName} required />

            {rsvp.collectPlusOne ? (
              <>
                <Label htmlFor="guest-count">Number attending</Label>
                <Input id="guest-count" name="guest-count" type="number" min={1} defaultValue={stored?.attendanceCount ?? 1} />
              </>
            ) : null}

            {rsvp.collectDietary ? (
              <>
                <Label htmlFor="dietary">Dietary requirements</Label>
                <Input id="dietary" name="dietary" placeholder="Optional" defaultValue={stored?.dietary} />
              </>
            ) : null}

            {error ? <p className="mt-2 border-l-[3px] border-primary bg-[#fff2f0] p-2.5 text-sm text-[#5d2924]">{error}</p> : null}

            <p className="mt-4 text-xs text-ink/50">Please reply by {new Date(rsvp.deadline).toLocaleDateString(undefined, { month: "long", day: "numeric" })}.</p>
            <Button type="submit" className="mt-4 w-full" loading={submitting} loadingText="Sending…">
              {stored ? "Update RSVP" : "Send RSVP"}
            </Button>
            {stored ? (
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="mt-3 block w-full text-center text-xs font-bold uppercase tracking-[.06em] text-ink/50 hover:text-ink"
              >
                Cancel
              </button>
            ) : null}
          </form>
        )}
      </div>
    </section>
  );
}
