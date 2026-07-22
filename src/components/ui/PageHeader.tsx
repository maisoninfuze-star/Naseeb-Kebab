import Picture from '@/components/ui/Picture'

/**
 * Shared interior-page masthead.
 *
 * Deliberately shorter than the homepage hero (58svh vs 100svh) — an interior
 * page's job is to get you to the content, not to perform. The image sits
 * behind a heavy scrim so the type is always legible regardless of which
 * frame is passed in.
 */
export default function PageHeader({
  eyebrow,
  title,
  lede,
  image,
}: {
  eyebrow: string
  title: string
  lede?: string
  image?: string
}) {
  return (
    <header className="relative flex min-h-[46svh] items-end overflow-hidden pb-14 pt-40 md:min-h-[58svh]">
      {image && (
        <>
          <Picture
            id={image}
            crop="wide"
            fill
            alt=""
            priority
            sizes="100vw"
            className="absolute inset-0 -z-20"
          />
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(11,11,11,0.96),rgba(11,11,11,0.68)_55%,rgba(11,11,11,0.45))]"
          />
        </>
      )}

      <div className="gutter relative w-full">
        <span className="eyebrow flex items-center gap-3 text-ember">
          <span className="h-px w-8 bg-ember" aria-hidden />
          {eyebrow}
        </span>
        <h1 className="mt-5 max-w-3xl text-[length:var(--text-display)] text-cream">{title}</h1>
        {lede && <p className="mt-6 max-w-lg text-[length:var(--text-lede)] text-cream/75">{lede}</p>}
      </div>
    </header>
  )
}
