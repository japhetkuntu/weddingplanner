/** The first thing every guest sees while their couple's site loads — worth making memorable.
 * A heart mark draws itself in, then a thin rule expands beneath an italic "You're invited"
 * line. Kept on the same dark ink tone as the hero section below it, so the eventual cross-fade
 * into the real page feels continuous rather than a jarring background swap. */
export function WeddingLoader() {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink">
      <div className="flex flex-col items-center px-6 text-center">
        <svg width="72" height="64" viewBox="0 0 100 90" fill="none" aria-hidden="true">
          <path
            d="M50 86C50 86 6 58 6 28C6 12 18 4 32 4C42 4 50 12 50 22C50 12 58 4 68 4C82 4 94 12 94 28C94 58 50 86 50 86Z"
            stroke="#C1281B"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="ovutor-draw"
          />
        </svg>
        <p
          className="ovutor-fade-in mt-6 font-display text-2xl italic text-white"
          style={{ animationDelay: "0.3s" }}
        >
          You&rsquo;re invited
        </p>
        <div
          className="ovutor-fade-in mt-4 h-px w-16 bg-white/30"
          style={{ animationDelay: "0.6s" }}
        />
        <p
          className="ovutor-fade-in mt-4 text-[10px] font-bold uppercase tracking-[.2em] text-white/50"
          style={{ animationDelay: "0.8s" }}
        >
          Loading the celebration
        </p>
      </div>
    </div>
  );
}
