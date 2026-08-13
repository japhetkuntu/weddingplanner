import { Button } from "@ovutor/ui";

const MARKETING_URL = "https://ovutor.com";

const PILLARS = [
  {
    mark: (
      <path
        d="M12 20.5s-8-4.9-8-11.2A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8 3.2c0 6.3-8 11.2-8 11.2Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    ),
    title: "Plan together",
    body: "Checklists, timelines, and decisions in one shared home for the couple and their planner.",
  },
  {
    mark: (
      <path
        d="M4 12h16M4 12l4-4M4 12l4 4M20 12l-4-4M20 12l-4 4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    title: "Track every detail",
    body: "Budgets, vendors, and guest RSVPs stay organized and up to date, right up to the big day.",
  },
  {
    mark: (
      <path
        d="M4 6h16v13H4V6Zm0 3h16M8 4v3m8-3v3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    title: "A beautiful website",
    body: "A custom wedding site guests can visit — the story, the schedule, and a simple way to RSVP.",
  },
];

/** Shown whenever a guest lands on a link that isn't (yet) a real wedding site — missing slug,
 * unknown slug, or a site with nothing published. Doubles as a small introduction to Ovutor so
 * the moment still feels branded and useful rather than a dead end. */
export function OvutorLanding({ eyebrow, title, message }: { eyebrow: string; title: string; message: string }) {
  return (
    <div className="ovutor-fade-in min-h-screen bg-bg font-sans text-ink">
      <section className="grid min-h-screen place-items-center bg-ink px-6 py-20 text-center text-white sm:px-10">
        <div className="flex max-w-lg flex-col items-center">
          <svg width="56" height="50" viewBox="0 0 100 90" fill="none" aria-hidden="true">
            <path
              d="M50 86C50 86 6 58 6 28C6 12 18 4 32 4C42 4 50 12 50 22C50 12 58 4 68 4C82 4 94 12 94 28C94 58 50 86 50 86Z"
              stroke="#C1281B"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="mt-5 text-[10px] font-bold uppercase tracking-[.2em] text-white/50">{eyebrow}</p>
          <h1 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">{title}</h1>
          <p className="mt-4 max-w-sm leading-relaxed text-white/70">{message}</p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href={MARKETING_URL}>
              <Button>Visit ovutor.com</Button>
            </a>
            <a
              href={MARKETING_URL}
              className="text-xs font-bold uppercase tracking-[.1em] text-white/60 hover:text-white"
            >
              Start planning your wedding &rarr;
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16 sm:px-10 sm:py-20">
        <p className="text-center text-[10px] font-bold uppercase tracking-[.14em] text-primary">What is Ovutor?</p>
        <h2 className="mx-auto mt-3 max-w-xl text-center font-display text-3xl leading-tight">
          A calm, shared home for every couple planning their wedding.
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-center leading-relaxed text-ink/60">
          Ovutor pairs couples with a planner and gives them one place to organize checklists, budgets, guests, and a
          wedding website guests will love visiting.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {PILLARS.map((p) => (
            <div key={p.title} className="text-center">
              <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full border border-primary/25 bg-bg-warm text-primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  {p.mark}
                </svg>
              </div>
              <h3 className="font-display text-lg">{p.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink/60">{p.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 flex justify-center">
          <a href={MARKETING_URL}>
            <Button variant="outline">Learn more at ovutor.com</Button>
          </a>
        </div>
      </section>

      <footer className="border-t border-[#eee] px-6 py-8 text-center">
        <p className="font-display text-lg">
          Ovutor <span className="text-primary">&#9825;</span>
        </p>
        <p className="mt-1 text-xs text-ink/40">Thoughtfully planned. Beautifully celebrated.</p>
      </footer>
    </div>
  );
}
