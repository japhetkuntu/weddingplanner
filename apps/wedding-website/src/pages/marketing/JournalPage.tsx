import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@ovutor/ui";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { SplitRow } from "@/components/marketing/SplitRow";
import { JOURNAL_CATEGORIES, JOURNAL_POSTS } from "@/content/marketing";

const ALL = "All Posts";

/** Masthead + category tabs arranged like nordicadventureweddings.eu/blog, but each entry in the
 * list renders as the full split-row editorial layout from juliaandevita.com/galleries instead of
 * a small grid card. */
export default function JournalPage() {
  const [filter, setFilter] = useState(ALL);
  const posts = useMemo(() => (filter === ALL ? JOURNAL_POSTS : JOURNAL_POSTS.filter((p) => p.category === filter)), [filter]);

  return (
    <div className="ovutor-fade-in bg-bg font-sans text-ink">
      <MarketingNav dark={false} />

      <section className="px-6 pb-14 pt-32 text-center sm:px-10 sm:pt-40">
        <p className="text-[10px] font-bold uppercase tracking-[.2em] text-primary">Journal &mdash; the stories we tell</p>
        <h1 className="mx-auto mt-3 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">From every wedding, a story worth telling.</h1>
        <p className="mx-auto mt-4 max-w-lg leading-relaxed text-ink/60">
          Real weddings we've planned, destination guides, and the odd bit of planning advice — from us to you.
        </p>
      </section>

      <div className="flex flex-wrap justify-center gap-2 border-b border-[#e6e2dc] px-6 pb-8 sm:px-10">
        {JOURNAL_CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setFilter(c)}
            className={cn(
              "border px-4 py-2 text-xs font-bold uppercase tracking-[.06em]",
              filter === c ? "border-primary bg-primary text-white" : "border-ink/15 text-ink/60 hover:border-ink/40",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="bg-[#4A0F14]">
        {posts.map((post, i) => (
          <Link key={post.slug} to={`/journal/${post.slug}`} className="block">
            <SplitRow
              media={post.media}
              index={post.index}
              title={post.title}
              meta={post.location}
              reverse={i % 2 === 1}
              minHeight="min-h-[70vh]"
              body={
                <>
                  <p>{post.excerpt}</p>
                  <p className="mt-4 font-display text-base italic text-white/80 underline underline-offset-4">Read the story</p>
                </>
              }
            />
          </Link>
        ))}
        {posts.length === 0 ? <p className="px-6 py-24 text-center text-white/60">No posts in this category yet.</p> : null}
      </div>

      <MarketingFooter />
    </div>
  );
}
