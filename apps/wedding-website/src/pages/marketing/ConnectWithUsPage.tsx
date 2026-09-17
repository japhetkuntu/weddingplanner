import { useEffect, useState } from "react";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { PlaceholderImage } from "@/components/PlaceholderImage";
import { DynamicContentBlock } from "@/components/marketing/DynamicContentBlock";
import { Button } from "@ovutor/ui";
import { CONNECT, STUDIO } from "@/content/marketing";
import { mergeMediaHero, mergeParagraphs } from "@/content/mergeMarketing";
import { getContentBlock, getMarketingPage, type MarketingHeroDto, type MarketingParagraphsDto, type MarketingSectionDto } from "@/lib/marketingApi";

const FIELD_CLASS =
  "mt-1 w-full border-0 border-b border-white/30 bg-transparent pb-2 text-sm text-white placeholder:text-white/40 focus:border-white focus:outline-none";
const LABEL_CLASS = "block text-[10px] font-bold uppercase tracking-[.12em] text-white/60";

/** "Connect with Us" (formerly "Contact"). annelaureweddings.com/contact's split intro (photo +
 * "Let's Connect") plus its full-width enquiry form below — on the platform's own brand-pink
 * background instead of their cream. This form isn't wired to a backend yet; it just confirms
 * receipt locally. Swap handleSubmit for a real endpoint once one exists for studio-wide
 * enquiries (distinct from a couple's own RSVP API). The eyebrow/title/photo are the only
 * admin-editable part — CONNECT.media is a single photo rather than a carousel, so it's merged
 * as a one-item array and read back out below. */
export default function ConnectWithUsPage() {
  const [sent, setSent] = useState(false);
  const [hero, setHero] = useState({ eyebrow: CONNECT.eyebrow, title: CONNECT.title, media: [CONNECT.media] });
  const [intro, setIntro] = useState({ paragraphs: CONNECT.paragraphs, formNote: CONNECT.formNote });
  const [sections, setSections] = useState<MarketingSectionDto[]>([]);

  useEffect(() => {
    getMarketingPage("connect-with-us")
      .then((data) => {
        setHero(mergeMediaHero(getContentBlock<MarketingHeroDto>(data, "hero"), { eyebrow: CONNECT.eyebrow, title: CONNECT.title, media: [CONNECT.media] }));
        setIntro(mergeParagraphs(getContentBlock<MarketingParagraphsDto>(data, "intro"), CONNECT.paragraphs, CONNECT.formNote));
        setSections(data.sections);
      })
      .catch(() => {});
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="ovutor-fade-in bg-primary font-sans text-ink">
      <MarketingNav />

      <div className="grid grid-cols-1 pt-24 lg:grid-cols-2 lg:pt-0">
        <div className="relative aspect-[4/3] lg:aspect-auto">
          <PlaceholderImage image={hero.media[0]} className="absolute inset-0" />
        </div>
        <div className="flex flex-col justify-center px-6 py-14 sm:px-12 sm:py-20 lg:px-16">
          <p className="text-[10px] font-bold uppercase tracking-[.2em] text-white/60">{hero.eyebrow}</p>
          <h1 className="mt-3 font-display text-4xl italic text-white sm:text-5xl">{hero.title}</h1>
          {intro.paragraphs.map((p) => (
            <p key={p} className="mt-4 max-w-md text-sm leading-relaxed text-white/75">
              {p}
            </p>
          ))}
          <p className="mt-6 text-sm text-white/70">
            <a href={`mailto:${STUDIO.email}`} className="hover:text-white">
              {STUDIO.email}
            </a>
          </p>
        </div>
      </div>

      <div className="border-t border-white/15 px-6 py-16 sm:px-10 sm:py-24">
        <h2 className="mb-3 text-center font-display text-3xl italic text-white sm:text-4xl">Enquiry Form</h2>
        {intro.formNote ? <p className="mx-auto mb-10 max-w-md text-center text-sm text-white/70">{intro.formNote}</p> : null}

        {sent ? (
          <p className="mx-auto max-w-md text-center leading-relaxed text-white/80">
            Thank you — your enquiry has been received. We'll be in touch within a few days.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mx-auto grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className={LABEL_CLASS}>Name*</span>
              <input required name="name" className={FIELD_CLASS} />
            </label>
            <label>
              <span className={LABEL_CLASS}>Email*</span>
              <input required type="email" name="email" className={FIELD_CLASS} />
            </label>
            <label>
              <span className={LABEL_CLASS}>Wedding date</span>
              <input type="date" name="weddingDate" className={FIELD_CLASS} />
            </label>
            <label>
              <span className={LABEL_CLASS}>Wedding location</span>
              <input name="location" className={FIELD_CLASS} />
            </label>
            <label>
              <span className={LABEL_CLASS}>Number of guests</span>
              <input type="number" min={0} name="guestCount" className={FIELD_CLASS} />
            </label>
            <label className="sm:col-span-2">
              <span className={LABEL_CLASS}>Budget</span>
              <input name="budget" className={FIELD_CLASS} />
            </label>
            <label className="sm:col-span-2">
              <span className={LABEL_CLASS}>Your message</span>
              <textarea name="message" rows={4} className={FIELD_CLASS} />
            </label>
            <div className="sm:col-span-2">
              <Button type="submit" className="w-full sm:w-auto">
                Send enquiry
              </Button>
            </div>
          </form>
        )}
      </div>

      {sections.map((section) => (
        <DynamicContentBlock key={section.id} section={section} />
      ))}

      <MarketingFooter />
    </div>
  );
}
