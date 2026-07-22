/**
 * Long-form text column for the legal pages.
 *
 * Measure is capped near 68 characters — the point at which continuous prose
 * stops being comfortable to read. Styling is scoped here rather than pulled
 * from a typography plugin so the legal pages inherit the same type system as
 * the rest of the site.
 */
export default function Prose({ children }: { children: React.ReactNode }) {
  return (
    <section className="gutter py-16 md:py-24">
      <div
        className="
          max-w-[68ch] text-cream/80
          [&_h2]:mt-12 [&_h2]:text-[length:var(--text-heading)] [&_h2]:text-cream
          [&_p]:mt-4 [&_p]:leading-relaxed
          [&_p.lede]:text-[length:var(--text-lede)] [&_p.lede]:text-cream/90
          [&_ul]:mt-4 [&_ul]:space-y-2 [&_ul]:pl-5
          [&_li]:list-disc [&_li]:leading-relaxed [&_li]:marker:text-ember
          [&_a]:text-ember [&_a]:underline [&_a]:underline-offset-4
          [&_address]:mt-4 [&_address]:not-italic [&_address]:leading-relaxed
          [&_strong]:text-brass
        "
      >
        {children}
      </div>
    </section>
  )
}
