import { useState } from 'react'

import { Icon } from './icon'
import { ViewableImage } from './image-viewer'

export interface AvatarProps {
  src?: string
  /** Shown as initials when there is no image, and used as the image's alt text. */
  name: string
  /** Tailwind size and shape classes, e.g. `h-10 w-10 rounded-full`. */
  className?: string
  /** Fallback icon instead of initials. */
  icon?: string
  /** Called once when the image fails, e.g. a presigned URL that expired, so the owner can fetch a fresh URL. */
  onExpired?: () => void
  decorative?: boolean
  /** Alt text of the photo when it should say more than the name, e.g. "Profile photo of Lan". */
  alt?: string
  /** A real photo opens the image viewer when clicked (initials stay plain). */
  viewable?: boolean
}

/** Soft background / text pairs; one is picked from the name so a person keeps the same colour everywhere. */
const PALETTE = [
  ['#d6eadd', '#0b4a30'],
  ['#dbeafe', '#1e3a8a'],
  ['#fde68a', '#78350f'],
  ['#fbcfe8', '#831843'],
  ['#ccfbf1', '#134e4a'],
  ['#e9d5ff', '#4c1d95'],
  ['#fed7aa', '#7c2d12']
] as const

function paletteOf(name: string) {
  let hash = 0
  for (const char of name.trim().toLocaleLowerCase('vi')) hash = (hash * 31 + char.codePointAt(0)!) | 0
  return PALETTE[Math.abs(hash) % PALETTE.length]
}

/** Initials: the first letters of the last two words ("Nguyễn Thị Lan" → "TL"), the same rule everywhere. */
function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return parts
    .slice(-2)
    .map((part) => part[0]?.toLocaleUpperCase('vi'))
    .join('')
}

/** A profile photo or logo with a stable fallback; a broken URL asks for a refresh once before falling back. */
export function Avatar({
  src,
  name,
  className = 'h-10 w-10 rounded-full',
  icon,
  onExpired,
  decorative = false,
  alt,
  viewable = false
}: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const [refreshedFor, setRefreshedFor] = useState<string | null>(null)
  const showImage = Boolean(src) && failedSrc !== src
  const [background, foreground] = paletteOf(name)

  const asViewer = viewable && showImage && Boolean(src)
  const avatar = (
    <span
      aria-hidden={decorative || asViewer || undefined}
      className={`inline-grid shrink-0 place-items-center overflow-hidden bg-secondary-container text-sm font-bold text-primary ${asViewer ? 'h-full w-full' : ''} ${className}`}
      style={showImage || icon ? undefined : { backgroundColor: background, color: foreground }}
    >
      {showImage ? (
        <img
          alt={decorative ? '' : (alt ?? name)}
          className='h-full w-full object-cover'
          onError={() => {
            setFailedSrc(src ?? null)
            if (onExpired && refreshedFor !== src) {
              setRefreshedFor(src ?? null)
              onExpired()
            }
          }}
          src={src}
        />
      ) : icon || !initials(name) ? (
        <Icon className='text-[1.4em]' name={icon ?? 'person'} />
      ) : (
        initials(name)
      )}
    </span>
  )

  if (!asViewer || !src) return avatar
  return (
    <ViewableImage alt={alt ?? name} className={`inline-block shrink-0 ${className}`} src={src}>
      {avatar}
    </ViewableImage>
  )
}
