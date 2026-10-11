import { useEffect, useState } from "react";
import { usePageSeo, useSiteSettings } from "@/lib/siteSettings";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { PlaceholderImage } from "@/components/PlaceholderImage";
import { RichText } from "@/components/RichText";
import { Fragment, type ReactNode } from "react";
import { orderPage } from "@/lib/pageLayout";
import type { MarketingPageDto } from "@/lib/marketingApi";
import { DynamicContentBlock } from "@/components/marketing/DynamicContentBlock";
import { Button, cn } from "@ovutor/ui";
import { CONNECT, STUDIO } from "@/content/marketing";
import { mergeMediaHero, mergeParagraphs, pick } from "@/content/mergeMarketing";
import {
  getContentBlock,
  getMarketingPage,
  submitEnquiry,
  type MarketingContactDetailsDto,
  type MarketingFeatureDto,
  type MarketingHeroDto,
  type MarketingParagraphsDto,
  type MarketingSectionDto,
} from "@/lib/marketingApi";

const FIELD_CLASS =
  "mt-1 w-full border-0 border-b border-white/30 bg-transparent pb-2 text-sm text-white placeholder:text-white/40 focus:border-white focus:outline-none";
const LABEL_CLASS = "block text-[10px] font-bold uppercase tracking-[.12em] text-white/60";

/** "Connect with Us" (formerly "Contact"). annelaureweddings.com/contact's split intro (photo +
 * "Let's Connect") plus its full-width enquiry form below — on the platform's own brand-pink
 * background instead of their cream. Submissions land in the Admin Portal's Enquiries list via
 * the public, unauthenticated `submitEnquiry` endpoint (studio-wide leads, distinct from a
 * couple's own RSVP API). The eyebrow/title/photo are the only admin-editable part —
 * CONNECT.media is a single photo rather than a carousel, so it's merged as a one-item array and
 * read back out below. */
export default function ConnectWithUsPage() {
  const site = useSiteSettings();
  const L = site.labels;
  usePageSeo("connect-with-us", "Connect with Us — Ovutor", "Tell us about your wedding and we'll be in touch.");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hero, setHero] = useState({ eyebrow: CONNECT.eyebrow, title: CONNECT.title, media: [CONNECT.media] });
  const [intro, setIntro] = useState({ paragraphs: CONNECT.paragraphs, formNote: CONNECT.formNote });
  const [sections, setSections] = useState<MarketingSectionDto[]>([]);
  const [layoutPage, setLayoutPage] = useState<MarketingPageDto | null>(null);
  const [details, setDetails] = useState<MarketingContactDetailsDto>({});
  const [feature, setFeature] = useState<MarketingFeatureDto | null>(null);
  const featureView = {
    show: !feature?.hidden,
    heading: pick(feature?.heading, CONNECT.feature.heading),
    body: pick(feature?.body, CONNECT.feature.body),
    image: feature?.image?.url
      ? { src: feature.image.url, label: feature.image.label ?? "", focalPoint: "center" as const }
      : CONNECT.feature.media,
  };

  useEffect(() => {
    getMarketingPage("connect-with-us")
      .then((data) => {
        setHero(mergeMediaHero(getContentBlock<MarketingHeroDto>(data, "hero"), { eyebrow: CONNECT.eyebrow, title: CONNECT.title, media: [CONNECT.media] }));
        setIntro(mergeParagraphs(getContentBlock<MarketingParagraphsDto>(data, "intro"), CONNECT.paragraphs, CONNECT.formNote));
        setDetails(getContentBlock<MarketingContactDetailsDto>(data, "details") ?? {});
        setFeature(getContentBlock<MarketingFeatureDto>(data, "before-form"));
        setLayoutPage(data);
        setSections(data.sections);
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const guestCount = form.get("guestCount");
    setSubmitting(true);
    setError(null);
    try {
      await submitEnquiry({
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        weddingDate: String(form.get("weddingDate") ?? "") || undefined,
        location: String(form.get("location") ?? "") || undefined,
        guestCount: guestCount ? Number(guestCount) : undefined,
        budget: String(form.get("budget") ?? "") || undefined,
        message: String(form.get("message") ?? "") || undefined,
      });
      setSent(true);
    } catch {
      setError(L.error);
    } finally {
      setSubmitting(false);
    }
  }

  const blocks: Record<string, ReactNode> = {
    feature: (
      <>
        {featureView.show ? (
          <section className={cn("grid grid-cols-1 bg-bg", featureView.image && "lg:grid-cols-2")}>
            {featureView.image ? (
              <div className="relative aspect-[4/3] w-full lg:order-2 lg:aspect-auto lg:min-h-[480px]">
                <PlaceholderImage image={featureView.image} className="absolute inset-0" />
              </div>
            ) : null}
            <div className="flex items-center px-6 py-16 sm:px-12 sm:py-20 lg:order-1 lg:px-20">
              <div className={cn("w-full", !featureView.image && "mx-auto max-w-3xl text-center")}>
                <span className={cn("mb-5 block h-[3px] w-12 bg-gold", !featureView.image && "mx-auto")} />
                {featureView.heading ? <h2 className="font-display text-3xl leading-tight sm:text-4xl">{featureView.heading}</h2> : null}
                <RichText html={featureView.body} size="lg" className="mt-5 text-ink/80" align={featureView.image ? undefined : "center"} />
              </div>
            </div>
          </section>
        ) : null}
      </>
    ),
    form: (
      <div className="bg-primary px-6 py-16 sm:px-10 sm:py-24">
          <h2 className="mb-3 text-center font-display text-3xl italic text-white sm:text-4xl">{L.enquiryHeading}</h2>
          {intro.formNote ? <p className="mx-auto mb-10 max-w-md text-center text-sm text-white/70">{intro.formNote}</p> : null}

          {sent ? (
            <p className="mx-auto max-w-md text-center leading-relaxed text-white/80">
              {L.success}
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mx-auto grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className={LABEL_CLASS}>{L.name}</span>
                <input required name="name" className={FIELD_CLASS} />
              </label>
              <label>
                <span className={LABEL_CLASS}>{L.email}</span>
                <input required type="email" name="email" className={FIELD_CLASS} />
              </label>
              <label>
                <span className={LABEL_CLASS}>{L.weddingDate}</span>
                <input type="date" name="weddingDate" className={FIELD_CLASS} />
              </label>
              <label>
                <span className={LABEL_CLASS}>{L.location}</span>
                <input name="location" className={FIELD_CLASS} />
              </label>
              <label>
                <span className={LABEL_CLASS}>{L.guests}</span>
                <input type="number" min={0} name="guestCount" className={FIELD_CLASS} />
              </label>
              <label className="sm:col-span-2">
                <span className={LABEL_CLASS}>{L.budget}</span>
                <input name="budget" className={FIELD_CLASS} />
              </label>
              <label className="sm:col-span-2">
                <span className={LABEL_CLASS}>{L.message}</span>
                <textarea name="message" rows={4} className={FIELD_CLASS} />
              </label>
              {error ? <p className="text-sm text-white sm:col-span-2">{error}</p> : null}
              <div className="sm:col-span-2">
                <Button type="submit" className="w-full sm:w-auto" loading={submitting} loadingText={L.sending}>
                  {L.send}
                </Button>
              </div>
            </form>
          )}
        </div>
    ),
  };

  return (
    <div className="ovutor-fade-in bg-bg font-sans text-ink">
      <MarketingNav />

      <div className="grid grid-cols-1 bg-gold pt-24 lg:grid-cols-2 lg:pt-0">
        <div className="relative aspect-[4/3] lg:aspect-auto">
          <PlaceholderImage image={hero.media[0]} className="absolute inset-0" />
        </div>
        <div className="flex flex-col justify-center px-6 py-14 sm:px-12 sm:py-20 lg:px-16">
          <p className="text-[10px] font-bold uppercase tracking-[.2em] text-ink/60">{hero.eyebrow}</p>
          <h1 className="mt-3 font-display text-4xl italic text-ink sm:text-5xl">{hero.title}</h1>
          {intro.paragraphs.map((p, i) => (
            <RichText key={i} html={p} className="mt-4 max-w-lg text-ink/80" />
          ))}
          <div className="mt-8 space-y-1.5 text-sm text-ink/80">
            <p>
              <a href={`mailto:${details.email || STUDIO.email}`} className="font-semibold underline underline-offset-4 hover:text-ink">
                {details.email || STUDIO.email}
              </a>
            </p>
            {details.phone ? <p>{details.phone}</p> : null}
            {details.location ? <p>{details.location}</p> : null}
            {details.hours ? <p className="text-ink/60">{details.hours}</p> : null}
          </div>
        </div>
      </div>

      {orderPage(layoutPage, sections, ["feature", "form", "sections"]).map((item) =>
        item.section ? <DynamicContentBlock key={item.id} section={item.section} /> : <Fragment key={item.id}>{blocks[item.id]}</Fragment>,
      )}

      <MarketingFooter />
    </div>
  );
}
