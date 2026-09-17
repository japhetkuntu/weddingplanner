import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { NAV_LINKS, STUDIO } from "@/content/marketing";

export function MarketingFooter() {
  return (
    <footer className="bg-gold px-6 py-16 text-center text-ink sm:px-10">
      <div className="flex justify-center">
        <Logo className="text-3xl" />
      </div>
      <p className="mt-1.5 text-sm text-ink/60">{STUDIO.tagline}</p>

      <nav className="mx-auto mt-8 flex max-w-md flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-bold uppercase tracking-[.1em] text-ink/70">
        {NAV_LINKS.map((link) => (
          <Link key={link.to} to={link.to} className="hover:text-ink">
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="mx-auto mt-8 h-px w-10 bg-ink/20" />

      <p className="mt-6 text-sm text-ink/50">{STUDIO.location}</p>
      <p className="mt-1.5 text-sm">
        <a href={`mailto:${STUDIO.email}`} className="text-ink/70 hover:text-ink">
          {STUDIO.email}
        </a>
        <span className="mx-2 text-ink/30">&middot;</span>
        <span className="text-ink/70">{STUDIO.instagram}</span>
      </p>
    </footer>
  );
}
