import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Icon } from './icon'
import { ImageViewer } from './image-viewer'

/**
 * Preview of a file the user picked but has not uploaded yet. An image can be opened in the viewer to check it before
 * sending; any other file is a link that opens it in a new tab. The object URL is revoked when the file changes.
 */
export function LocalFilePreview({
  file,
  label,
  image = false,
  className = 'h-32 w-full rounded-xl'
}: {
  file: File
  label: string
  image?: boolean
  className?: string
}) {
  const { t } = useTranslation()
  const imageRef = useRef<HTMLImageElement>(null)
  const linkRef = useRef<HTMLAnchorElement>(null)
  const [viewing, setViewing] = useState<string | null>(null)
  useEffect(() => {
    const url = URL.createObjectURL(file)
    if (imageRef.current) imageRef.current.src = url
    if (linkRef.current) linkRef.current.href = url
    return () => URL.revokeObjectURL(url)
  }, [file])
  return image ? (
    <>
      <button
        aria-label={t('common.kit.viewer.view', { name: label })}
        className={`group relative block cursor-zoom-in overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${className}`}
        onClick={() => setViewing(imageRef.current?.src ?? null)}
        type='button'
      >
        <img alt={label} className='h-full w-full object-cover' ref={imageRef} />
        <span
          aria-hidden='true'
          className='absolute inset-0 grid place-items-center bg-black/0 text-white opacity-0 transition-[opacity,background-color] duration-200 group-hover:bg-black/25 group-hover:opacity-100'
        >
          <Icon className='text-2xl' name='zoom_in' />
        </span>
      </button>
      <ImageViewer
        images={viewing ? [{ src: viewing, alt: label }] : []}
        index={viewing ? 0 : null}
        onClose={() => setViewing(null)}
      />
    </>
  ) : (
    <a
      ref={linkRef}
      className='break-all text-sm font-semibold text-primary underline'
      rel='noopener noreferrer'
      target='_blank'
    >
      {label}
    </a>
  )
}
