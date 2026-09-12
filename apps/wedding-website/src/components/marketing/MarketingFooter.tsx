import { Link } from "react-router-dom";
import { NAV_LINKS, STUDIO } from "@/content/marketing";

export function MarketingFooter() {
  return (
    <footer className="bg-ink px-6 py-16 text-center text-white sm:px-10">
      <div className="font-display text-2xl">
        {STUDIO.name} <span className="text-primary">&#9825;</span>
      </div>
      <p className="mt-1.5 text-sm text-white/60">{STUDIO.tagline}</p>

      <nav className="mx-auto mt-8 flex max-w-md flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-bold uppercase tracking-[.1em] text-white/70">
        {NAV_LINKS.map((link) => (
          <Link key={link.to} to={link.to} className="hover:text-white">
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="mx-auto mt-8 h-px w-10 bg-white/20" />

      <p className="mt-6 text-sm text-white/50">{STUDIO.location}</p>
      <p className="mt-1.5 text-sm">
        <a href={`mailto:${STUDIO.email}`} className="text-white/70 hover:text-white">
          {STUDIO.email}
        </a>
        <span className="mx-2 text-white/30">&middot;</span>
        <span className="text-white/70">{STUDIO.instagram}</span>
      </p>
    </footer>
  );
}
