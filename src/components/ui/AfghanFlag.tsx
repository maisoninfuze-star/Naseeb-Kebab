/**
 * The flag of Afghanistan — the black · red · green vertical tricolour with the
 * national emblem centred.
 *
 * This is the flag the Afghan diaspora in Canada overwhelmingly identifies
 * with, and the one a Laval Afghan restaurant means when it says "Afghan".
 * The emblem (a mosque with its mihrab niche and mimbar steps, framed by two
 * curved sheaves of wheat) is drawn in simplified white so it stays legible at
 * the ~30px sizes this is used at — the full emblem carries Arabic-script text
 * that is unreadable and visually muddy at that scale.
 *
 * Decorative, so aria-hidden by default; pass a `title` to give it a label.
 */
export default function AfghanFlag({
  className = '',
  title,
}: {
  className?: string
  title?: string
}) {
  return (
    <svg
      viewBox="0 0 90 60"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      {title && <title>{title}</title>}

      {/* Three vertical bands */}
      <rect x="0" y="0" width="30" height="60" fill="#000000" />
      <rect x="30" y="0" width="30" height="60" fill="#be0000" />
      <rect x="60" y="0" width="30" height="60" fill="#007a36" />

      {/* National emblem, simplified, in white on the red band */}
      <g fill="#ffffff" transform="translate(45 30)">
        {/* Two wheat sheaves curving up either side */}
        <path
          d="M-11 9 C-13 2 -12 -5 -8 -9 C-11 -3 -11 3 -9 8 Z"
          opacity="0.95"
        />
        <path
          d="M11 9 C13 2 12 -5 8 -9 C11 -3 11 3 9 8 Z"
          opacity="0.95"
        />
        {/* Mosque base */}
        <rect x="-6" y="2" width="12" height="7" rx="0.6" />
        {/* Mihrab arch (the niche) */}
        <path d="M-4 2 C-4 -3 4 -3 4 2 Z" />
        {/* Mimbar — the small stepped pulpit beside the niche */}
        <rect x="-1.2" y="-1.5" width="2.4" height="3.5" />
        {/* A slender finial above, standing in for the flags on the emblem */}
        <rect x="-0.4" y="-7" width="0.8" height="4" />
      </g>
    </svg>
  )
}
