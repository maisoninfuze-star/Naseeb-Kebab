import { srcSet, fallbackSrc, lqip, ASPECT, type Crop } from '@/lib/utils'
import { cn } from '@/lib/utils'

/**
 * Art-directed <picture> over the processed derivatives.
 *
 * Next/Image is deliberately not used: the pipeline already emits fixed AVIF +
 * WebP crops at known widths, so routing them through the Next optimiser would
 * re-encode assets that are already optimal and add a server hop for no gain.
 * The LQIP paints as a CSS background, so there is no layout shift and no
 * second request.
 *
 * Two modes:
 *   default — the element takes the crop's own aspect ratio
 *   fill    — the element fills its positioned parent, no ratio imposed.
 *             Full-bleed heroes MUST use this; forcing 16/9 inside a 100svh
 *             box makes the browser cover-crop twice and the result is a
 *             macro shot of whatever happened to be centre-frame.
 *
 * In fill mode a portrait viewport is served the 9:16 crop instead of 16:9 —
 * on a phone, a 16:9 frame stretched to fill a tall screen throws away most
 * of the photograph.
 */
export default function Picture({
  id,
  crop = 'ed',
  alt,
  sizes = '100vw',
  priority = false,
  fill = false,
  portraitCrop = 'tall',
  className,
  imgClassName,
}: {
  id: string
  crop?: Crop
  alt: string
  sizes?: string
  priority?: boolean
  /** Fill the positioned parent instead of imposing the crop's aspect ratio. */
  fill?: boolean
  /** Crop served to portrait viewports when `fill` is set. */
  portraitCrop?: Crop
  className?: string
  imgClassName?: string
}) {
  return (
    <picture
      className={cn('block overflow-hidden bg-charcoal', fill && 'h-full w-full', className)}
      style={{
        ...(fill ? {} : { aspectRatio: ASPECT[crop] }),
        backgroundImage: `url(${lqip(id)})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Art direction by viewport SHAPE, not by a binary portrait/landscape
          flag. A 3:4 tablet and a 9:19 phone are both "portrait" but want very
          different crops — serving 9:16 to the tablet throws away half the
          plate. Narrowest first, since the browser takes the first match. */}
      {fill && (
        <>
          <source
            media="(max-aspect-ratio: 0.7)"
            type="image/avif"
            srcSet={srcSet(id, portraitCrop, 'avif')}
            sizes={sizes}
          />
          <source
            media="(max-aspect-ratio: 0.7)"
            type="image/webp"
            srcSet={srcSet(id, portraitCrop, 'webp')}
            sizes={sizes}
          />
          <source
            media="(max-aspect-ratio: 1.3)"
            type="image/avif"
            srcSet={srcSet(id, 'ed', 'avif')}
            sizes={sizes}
          />
          <source
            media="(max-aspect-ratio: 1.3)"
            type="image/webp"
            srcSet={srcSet(id, 'ed', 'webp')}
            sizes={sizes}
          />
        </>
      )}
      <source type="image/avif" srcSet={srcSet(id, crop, 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(id, crop, 'webp')} sizes={sizes} />
      <img
        src={fallbackSrc(id, crop)}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        className={cn('h-full w-full object-cover', imgClassName)}
      />
    </picture>
  )
}
