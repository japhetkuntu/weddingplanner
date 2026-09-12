import { useState } from "react";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { PlaceholderImage } from "@/components/PlaceholderImage";
import { Button } from "@ovutor/ui";
import { CONTACT, STUDIO } from "@/content/marketing";

const FIELD_CLASS =
  "mt-1 w-full border-0 border-b border-white/30 bg-transparent pb-2 text-sm text-white placeholder:text-white/40 focus:border-white focus:outline-none";
const LABEL_CLASS = "block text-[10px] font-bold uppercase tracking-[.12em] text-white/60";

/** annelaureweddings.com/contact's split intro (photo + "Let's Connect") plus its full-width
 * enquiry form below — on a vibrant wine background instead of their cream. This form isn't
 * wired to a backend yet; it just confirms receipt locally. Swap handleSubmit for a real
 * endpoint once one exists for studio-wide enquiries (distinct from a couple's own RSVP API). */
export default function ContactPage() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="ovutor-fade-in bg-[#4A0F14] font-sans text-ink">
      <MarketingNav />

      <div className="grid grid-cols-1 pt-24 lg:grid-cols-2 lg:pt-0">
        <div className="relative aspect-[4/3] lg:aspect-auto">
          <PlaceholderImage image={CONTACT.media} className="absolute inset-0" />
        </div>
        <div className="flex flex-col justify-center px-6 py-14 sm:px-12 sm:py-20 lg:px-16">
          <p className="text-[10px] font-bold uppercase tracking-[.2em] text-white/60">{CONTACT.eyebrow}</p>
          <h1 className="mt-3 font-display text-4xl italic text-white sm:text-5xl">{CONTACT.title}</h1>
          {CONTACT.paragraphs.map((p) => (
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
        <h2 className="mb-10 text-center font-display text-3xl italic text-white sm:text-4xl">Enquiry Form</h2>

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

      <MarketingFooter />
    </div>
  );
}
