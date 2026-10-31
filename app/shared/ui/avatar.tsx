import { useState } from 'react'

import { Icon } from './icon'

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
}

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
  decorative = false
}: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const [refreshedFor, setRefreshedFor] = useState<string | null>(null)
  const showImage = Boolean(src) && failedSrc !== src

  return (
    <span
      aria-hidden={decorative || undefined}
      className={`inline-grid shrink-0 place-items-center overflow-hidden bg-secondary-container text-sm font-bold text-primary ${className}`}
    >
      {showImage ? (
        <img
          alt={decorative ? '' : name}
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
}
