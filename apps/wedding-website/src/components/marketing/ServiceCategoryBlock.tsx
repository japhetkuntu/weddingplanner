import { Link } from "react-router-dom";

interface ServiceGroup {
  title: string;
  bullets: string[];
}

/** One category block from the middle of annelaureweddings.com/services: a centered heading +
 * description + CTA, a divider, then a label and a 2-column set of bulleted sub-groups. Repeats
 * once per service category on the Services page. */
export function ServiceCategoryBlock({
  name,
  heading,
  body,
  groups,
}: {
  name: string;
  heading: string;
  body: string;
  groups: ServiceGroup[];
}) {
  return (
    <div className="border-t border-white/15 py-16 sm:py-20">
      <div className="mx-auto max-w-2xl px-6 text-center sm:px-10">
        <h3 className="font-display text-2xl leading-snug text-white sm:text-3xl">{heading}</h3>
        <p className="mt-4 text-sm leading-relaxed text-white/75">{body}</p>
        <div className="mt-6 flex flex-col items-center gap-3">
          <p className="text-xs font-bold uppercase tracking-[.1em] text-white/50">Our work</p>
          <Link
            to="/contact"
            className="border border-white/70 px-6 py-3 text-xs font-bold uppercase tracking-[.1em] text-white hover:bg-white hover:text-ink"
          >
            Inquire for availability
          </Link>
        </div>
      </div>

      <p className="mt-14 text-center font-display text-xl italic text-white/60">{name}</p>
      <div className="mx-auto mt-6 grid max-w-3xl grid-cols-1 gap-10 px-6 sm:grid-cols-2 sm:px-10">
        {groups.map((g) => (
          <div key={g.title}>
            <h4 className="text-xs font-bold uppercase tracking-[.08em] text-white">{g.title}</h4>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-white/70">
              {g.bullets.map((b) => (
                <li key={b} className="flex gap-2">
                  <span className="text-white/40">&middot;</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
