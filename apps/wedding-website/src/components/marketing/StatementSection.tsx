/** The bold "information" section inspired by juliaandevita.com/services — a big centered
 * serif statement over the brand's gold section color, a short supporting line, and (optionally)
 * a smaller italic accent line underneath, like a handwritten aside. */
export function StatementSection({ heading, body, script }: { heading: string; body: string; script?: string }) {
  return (
    <section className="bg-gold px-6 py-24 text-center text-ink sm:px-10 sm:py-32">
      <h2 className="mx-auto max-w-3xl font-display text-3xl leading-snug sm:text-4xl">{heading}</h2>
      <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-ink/70">{body}</p>
      {script ? <p className="mt-10 font-display text-3xl italic text-ink/90">{script}</p> : null}
    </section>
  );
}
