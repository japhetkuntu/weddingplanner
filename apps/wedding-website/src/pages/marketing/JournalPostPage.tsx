import { Link, Navigate, useParams } from "react-router-dom";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { HeroMedia } from "@/components/marketing/HeroMedia";
import { GalleryGrid } from "@/components/marketing/GalleryGrid";
import { JOURNAL_POSTS } from "@/content/marketing";

export default function JournalPostPage() {
  const { postSlug } = useParams<{ postSlug: string }>();
  const post = JOURNAL_POSTS.find((p) => p.slug === postSlug);

  if (!post) return <Navigate to="/journal" replace />;

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

      <article className="mx-auto max-w-2xl px-6 py-16 sm:px-10 sm:py-24">
        {post.body.map((p) => (
          <p key={p} className="mb-5 leading-relaxed text-ink/80">
            {p}
          </p>
        ))}
      </article>

      {post.photos?.length ? (
        <div className="pb-16 sm:pb-24">
          <GalleryGrid photos={post.photos} />
        </div>
      ) : null}

      <div className="px-6 pb-16 text-center sm:px-10">
        <Link to="/journal" className="inline-block text-xs font-bold uppercase tracking-[.1em] text-primary hover:underline">
          &larr; Back to the Journal
        </Link>
      </div>

      <MarketingFooter />
    </div>
  );
}
