import { Link } from "react-router-dom";

interface ServiceGroup {
  title: string;
  bullets: string[];
}

/** One "stacked" band exactly as annelaureweddings.com/services does it: a 2-column set of
 * bulleted sub-groups, then a centered "Our Work" label + a solid filled button — all on the same
 * flat cream background as the rest of the page. No color blocks, no per-band heading/paragraph.
 * The category's own name isn't rendered here — it's passed as `title` to the surrounding
 * `StackedSection`, which pins it to a header strip that stays visible once the next section
 * stacks over this one. Meant to be rendered inside a `StackedSection`, which supplies the
 * full-screen height, the sticky positioning, and the shadow that separates it from the next band
 * — this component only owns its own body content and padding. */
export function ServiceCategoryBlock({ groups }: { groups: ServiceGroup[] }) {
  return (
    <div className="px-6 py-14 sm:px-10 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          {groups.map((g) => (
            <div key={g.title}>
              <h4 className="text-xs font-bold uppercase tracking-[.08em] text-ink">{g.title}</h4>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink/70">
                {g.bullets.map((b) => (
                  <li key={b} className="flex gap-2">
                    <span className="text-ink/35">&middot;</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center gap-3">
          <p className="text-xs font-bold uppercase tracking-[.1em] text-ink/50">Our work</p>
          <Link to="/connect-with-us" className="border border-primary bg-primary px-6 py-3 text-xs font-bold uppercase tracking-[.1em] text-white hover:brightness-110">
            Inquire for availability
          </Link>
        </div>
      </div>
    </div>
  );
}
