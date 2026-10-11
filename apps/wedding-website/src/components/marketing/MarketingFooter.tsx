import { Link } from "react-router-dom";
import { Logo } from "@ovutor/ui";
import { useSiteSettings } from "@/lib/siteSettings";

export function MarketingFooter() {
  const site = useSiteSettings();
  const instagram = site.instagram;
  const info = { email: site.email, location: site.location, tagline: site.tagline };

  return (
    <footer className="border-t-[6px] border-primary bg-gold px-6 py-16 text-center text-ink sm:px-10">
      <div className="flex justify-center">
        <Logo className="h-20 sm:h-24" />
      </div>
      <p className="mt-1.5 text-sm text-ink/60">{info.tagline}</p>

      <nav className="mx-auto mt-8 flex max-w-md flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-bold uppercase tracking-[.1em] text-ink/70">
        {site.links.map((link) => (
          <Link key={link.to} to={link.to} className="hover:text-ink">
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="mx-auto mt-8 h-px w-10 bg-ink/20" />

      <p className="mt-6 text-sm text-ink/50">{info.location}</p>
      <p className="mt-1.5 text-sm">
        <a href={`mailto:${info.email}`} className="text-ink/70 hover:text-ink">
          {info.email}
        </a>
        <span className="mx-2 text-ink/30">&middot;</span>
        <a
          href={`https://instagram.com/${instagram.replace("@", "")}`}
          target="_blank"
          rel="noreferrer"
          aria-label="Ovutor on Instagram"
          className="inline-flex items-center gap-1.5 align-middle text-ink/70 hover:text-ink"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
          </svg>
          {instagram}
        </a>
      </p>
    </footer>
  );
}
