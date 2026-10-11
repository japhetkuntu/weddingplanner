import { useEffect, useMemo, useState } from "react";
import { usePageSeo, useSiteSettings } from "@/lib/siteSettings";
import { Link } from "react-router-dom";
import { cn } from "@ovutor/ui";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { RichText } from "@/components/RichText";
import { SplitRow, splitTones } from "@/components/marketing/SplitRow";
import { Fragment, type ReactNode } from "react";
import { orderPage } from "@/lib/pageLayout";
import type { MarketingPageDto } from "@/lib/marketingApi";
import { DynamicContentBlock } from "@/components/marketing/DynamicContentBlock";
import { JOURNAL, JOURNAL_CATEGORIES, JOURNAL_POSTS } from "@/content/marketing";
import { mergeJournalPosts, mergeTextHero } from "@/content/mergeMarketing";
import { getContentBlock, getMarketingPage, type MarketingJournalCategoriesDto, type MarketingHeroDto, type MarketingPostsDto, type MarketingSectionDto } from "@/lib/marketingApi";

const ALL = "All Posts";

/** "Our Journal" (formerly "Journal"). Masthead + category tabs arranged like
 * nordicadventureweddings.eu/blog, but each entry in the list renders as the full split-row
 * editorial layout from juliaandevita.com/galleries instead of a small grid card. The masthead
 * text and the post list are both admin-editable — see mergeMarketing.ts. */
export default function OurJournalPage() {
  const site = useSiteSettings();
  usePageSeo("our-journal", "Our Journal — Ovutor", "Real weddings, destination guides and planning advice.");
  const [filter, setFilter] = useState(ALL);
  const [masthead, setMasthead] = useState(JOURNAL.masthead);
  const [journalPosts, setJournalPosts] = useState(JOURNAL_POSTS);
  const [categories, setCategories] = useState<string[]>(JOURNAL_CATEGORIES);
  const [sections, setSections] = useState<MarketingSectionDto[]>([]);
  const [layoutPage, setLayoutPage] = useState<MarketingPageDto | null>(null);
  const posts = useMemo(() => (filter === ALL ? journalPosts : journalPosts.filter((p) => p.category === filter)), [filter, journalPosts]);

  useEffect(() => {
    getMarketingPage("our-journal")
      .then((data) => {
        setMasthead(mergeTextHero(getContentBlock<MarketingHeroDto>(data, "hero"), JOURNAL.masthead));
        setJournalPosts(mergeJournalPosts(getContentBlock<MarketingPostsDto>(data, "posts")?.items, JOURNAL_POSTS));
        const cats = getContentBlock<MarketingJournalCategoriesDto>(data, "categories")?.items?.filter((c) => c.trim());
        if (cats?.length) setCategories([ALL, ...cats.filter((c) => c !== ALL)]);
        setLayoutPage(data);
        setSections(data.sections);
      })
      .catch(() => {});
  }, []);

  const blocks: Record<string, ReactNode> = {
    posts: (
      <>
        <div className="flex flex-wrap justify-center gap-2 border-b border-[#e6e2dc] px-6 pb-8 sm:px-10">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFilter(c)}
              className={cn(
                "border px-4 py-2 text-xs font-bold uppercase tracking-[.06em]",
                filter === c ? "border-gold bg-gold text-ink" : "border-ink/15 text-ink/60 hover:border-ink/40",
              )}
            >
              {c}
            </button>
          ))}
        </div>

        <div className={posts.length === 0 ? "bg-primary" : undefined}>
          {posts.map((post, i) => (
            <Link key={post.slug} to={`/our-journal/${post.slug}`} className="block">
              <SplitRow
                media={post.media}
                index={post.index}
                title={post.title}
                meta={post.location}
                reverse={i % 2 === 1}
                minHeight="min-h-[70vh]"
                tone={splitTones(posts.length)[i]}
                body={
                  <>
                    <RichText html={post.excerpt} className="!text-[inherit] !leading-[inherit]" />
                    <p className="mt-4 font-display text-base italic underline opacity-80 underline-offset-4">{site.labels.readStory}</p>
                  </>
                }
              />
            </Link>
          ))}
          {posts.length === 0 ? <p className="px-6 py-24 text-center text-white/60">{site.labels.noPosts}</p> : null}
        </div>
      </>
    ),
  };

  return (
    <div className="ovutor-fade-in bg-bg font-sans text-ink">
      <MarketingNav dark={false} />

      <section className="px-6 pb-14 pt-32 text-center sm:px-10 sm:pt-40">
        <p className="text-[10px] font-bold uppercase tracking-[.2em] text-primary">{masthead.eyebrow}</p>
        <h1 className="mx-auto mt-3 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">{masthead.title}</h1>
        <RichText html={masthead.subtitle} align="center" className="mx-auto mt-4 max-w-xl text-ink/60" />
      </section>

      {orderPage(layoutPage, sections, ["sections", "posts"]).map((item) =>
        item.section ? <DynamicContentBlock key={item.id} section={item.section} /> : <Fragment key={item.id}>{blocks[item.id]}</Fragment>,
      )}

      <MarketingFooter />
    </div>
  );
}
