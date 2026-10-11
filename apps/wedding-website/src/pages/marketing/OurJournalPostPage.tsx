import { useEffect, useState } from "react";
import { useSiteSettings } from "@/lib/siteSettings";
import { Link, Navigate, useParams } from "react-router-dom";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { HeroMedia } from "@/components/marketing/HeroMedia";
import { GalleryGrid } from "@/components/marketing/GalleryGrid";
import { RichText } from "@/components/RichText";
import { JOURNAL_POSTS } from "@/content/marketing";
import { mergeJournalPosts } from "@/content/mergeMarketing";
import { getContentBlock, getMarketingPage, type MarketingPostsDto } from "@/lib/marketingApi";

/** A post's detail page looks itself up by slug within the same merged post list the journal
 * index page builds (see mergeJournalPosts) — not just the static JOURNAL_POSTS — so an
 * admin-added post is reachable at its own URL, not just listed on the index. Starts from the
 * static list (so an existing post's page never waits on the network) and only redirects to the
 * journal index once the merged list has actually loaded and still doesn't contain this slug —
 * redirecting before that would incorrectly bounce a brand-new admin-added post that just hasn't
 * loaded yet. */
function formatDate(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

export default function OurJournalPostPage() {
  const site = useSiteSettings();
  const { postSlug } = useParams<{ postSlug: string }>();
  const [posts, setPosts] = useState(JOURNAL_POSTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getMarketingPage("our-journal")
      .then((data) => setPosts(mergeJournalPosts(getContentBlock<MarketingPostsDto>(data, "posts")?.items, JOURNAL_POSTS)))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const post = posts.find((p) => p.slug === postSlug);

  useEffect(() => {
    if (post?.title) document.title = `${post.title} — Ovutor`;
  }, [post?.title]);

  const blocks: { heading?: string; text: string; image?: { src?: string; label?: string } }[] = post
    ? post.blocks?.length
      ? post.blocks
      : post.body.map((text) => ({ text }))
    : [];
  const hasHeadings = blocks.some((b) => b.heading?.trim());

  if (!post) return loaded ? <Navigate to="/our-journal" replace /> : null;

  return (
    <div className="ovutor-fade-in bg-bg font-sans text-ink">
      <MarketingNav />

      <HeroMedia media={post.media} heightClassName="min-h-[70vh]" overlay="gradient">
        <div className="mt-auto w-full px-6 pb-14 text-white sm:px-10 sm:pb-20">
          <p className="text-[10px] font-bold uppercase tracking-[.2em] text-white/70">{post.category}</p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">{post.title}</h1>
          <p className="mt-2 max-w-md font-display text-lg italic text-white/70">{post.location}</p>
        </div>
      </HeroMedia>

      <div className="bg-gold/20 px-6 py-5 text-center sm:px-10">
        <p className="text-[11px] font-bold uppercase tracking-[.16em] text-ink/70">
          {[post.category, post.location, post.date ? formatDate(post.date) : ""].filter(Boolean).join("  ·  ")}
        </p>
      </div>

      <article className="px-6 py-14 sm:px-10 sm:py-20">
        <div className="mx-auto max-w-6xl">
          {blocks.map((block, i) => (
            <section
              key={i}
              className={
                hasHeadings
                  ? "grid grid-cols-1 gap-x-14 border-t border-ink/10 py-10 first:border-t-0 first:pt-0 lg:grid-cols-[250px_minmax(0,1fr)] lg:py-14"
                  : "py-4"
              }
            >
              {hasHeadings ? (
                <div className="mb-5 lg:mb-0">
                  {block.heading ? (
                    <h2 className="font-display text-2xl leading-tight text-ink sm:text-3xl lg:sticky lg:top-24">
                      <span className="mb-3 block h-[3px] w-10 bg-gold" />
                      {block.heading}
                    </h2>
                  ) : null}
                </div>
              ) : null}

              <div className={hasHeadings ? "min-w-0" : "mx-auto max-w-[820px]"}>
                <RichText html={block.text} size="lg" className="max-w-[820px] text-ink/85" />
                {block.image?.src ? (
                  <figure className="my-8 sm:my-10">
                    <img src={block.image.src} alt={block.image.label ?? ""} className="mx-auto block h-auto max-h-[78vh] w-auto max-w-full" loading="lazy" decoding="async" />
                  </figure>
                ) : null}
              </div>
            </section>
          ))}
        </div>
      </article>

      {post.photos?.length ? (
        <div className="pb-16 sm:pb-24">
          <GalleryGrid photos={post.photos} />
        </div>
      ) : null}

      <div className="px-6 pb-16 text-center sm:px-10">
        <Link to="/our-journal" className="inline-block text-xs font-bold uppercase tracking-[.1em] text-primary hover:underline">
          &larr; {site.labels.backToJournal}
        </Link>
      </div>

      <MarketingFooter />
    </div>
  );
}
