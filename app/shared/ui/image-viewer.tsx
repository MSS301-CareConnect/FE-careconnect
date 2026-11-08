import { useEffect, useRef, useState, type PointerEvent, type ReactNode, type WheelEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { Icon } from './icon'

export interface ViewerImage {
  src: string
  alt: string
}

const MIN_ZOOM = 0.5
const MAX_ZOOM = 5
const STEP = 0.25

function clamp(value: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(value * 100) / 100))
}

/**
 * Full-screen image viewer on a native modal `<dialog>` (focus trapped, Escape closes). Zoom with the buttons, the
 * mouse wheel or the + / − / 0 keys; when zoomed, drag to move around. Arrow keys and the side buttons move through
 * a gallery. "Open original" opens the file in a new tab.
 */
export function ImageViewer({
  images,
  index,
  onIndexChange,
  onClose
}: {
  images: ViewerImage[]
  /** The image shown; null keeps the viewer closed. */
  index: number | null
  onIndexChange?: (index: number) => void
  onClose: () => void
}) {
  const { t } = useTranslation()
  const ref = useRef<HTMLDialogElement>(null)
  const drag = useRef<{ x: number; y: number; startX: number; startY: number } | null>(null)
  // A pan that just ended must not count as a click on the backdrop (which closes the viewer).
  const panned = useRef(false)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [shownIndex, setShownIndex] = useState(index)
  const open = index !== null && images[index] !== undefined

  // A different image starts unzoomed and centred.
  if (index !== shownIndex) {
    setShownIndex(index)
    setZoom(1)
    setOffset({ x: 0, y: 0 })
  }

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    else if (!open && dialog.open) dialog.close()
  }, [open])

  if (!open || index === null) return null
  const image = images[index]
  const gallery = images.length > 1

  function zoomTo(next: number) {
    const value = clamp(next)
    setZoom(value)
    if (value <= 1) setOffset({ x: 0, y: 0 })
  }

  function go(step: number) {
    if (!gallery || index === null) return
    onIndexChange?.((index + step + images.length) % images.length)
  }

  function onWheel(event: WheelEvent) {
    zoomTo(zoom + (event.deltaY < 0 ? STEP : -STEP))
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    panned.current = false
    if (zoom <= 1) return
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = { x: offset.x, y: offset.y, startX: event.clientX, startY: event.clientY }
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current) return
    if (Math.abs(event.clientX - drag.current.startX) + Math.abs(event.clientY - drag.current.startY) > 3)
      panned.current = true
    setOffset({
      x: drag.current.x + event.clientX - drag.current.startX,
      y: drag.current.y + event.clientY - drag.current.startY
    })
  }

  const toolButton =
    'grid h-11 w-11 place-items-center rounded-full text-white transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white disabled:opacity-40'

  return (
    <dialog
      aria-label={t('common.kit.viewer.label', { name: image.alt })}
      className='m-0 h-dvh max-h-none w-screen max-w-none bg-neutral-950/95 p-0 backdrop:bg-black/60'
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onKeyDown={(event) => {
        if (event.key === '+' || event.key === '=') zoomTo(zoom + STEP)
        else if (event.key === '-') zoomTo(zoom - STEP)
        else if (event.key === '0') zoomTo(1)
        else if (event.key === 'ArrowRight') go(1)
        else if (event.key === 'ArrowLeft') go(-1)
      }}
      ref={ref}
    >
      <div className='flex h-full flex-col text-white'>
        <div className='flex items-center gap-1 px-3 py-2 sm:px-4'>
          <p className='min-w-0 flex-1 truncate text-sm font-medium'>
            {image.alt}
            {gallery ? (
              <span className='ml-2 text-white/70 tabular-nums'>
                {t('common.kit.viewer.counter', { current: index + 1, total: images.length })}
              </span>
            ) : null}
          </p>
          <button
            aria-label={t('common.kit.viewer.zoomOut')}
            className={toolButton}
            disabled={zoom <= MIN_ZOOM}
            onClick={() => zoomTo(zoom - STEP)}
            type='button'
          >
            <Icon className='text-2xl' name='zoom_out' />
          </button>
          <button
            aria-label={t('common.kit.viewer.reset')}
            className='min-h-11 min-w-14 rounded-full px-2 text-sm font-semibold tabular-nums hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white'
            onClick={() => zoomTo(1)}
            type='button'
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            aria-label={t('common.kit.viewer.zoomIn')}
            className={toolButton}
            disabled={zoom >= MAX_ZOOM}
            onClick={() => zoomTo(zoom + STEP)}
            type='button'
          >
            <Icon className='text-2xl' name='zoom_in' />
          </button>
          <a
            aria-label={t('common.kit.viewer.open')}
            className={toolButton}
            href={image.src}
            rel='noreferrer'
            target='_blank'
          >
            <Icon className='text-2xl' name='open_in_new' />
          </a>
          <button
            aria-label={t('common.kit.viewer.close')}
            autoFocus
            className={toolButton}
            onClick={onClose}
            type='button'
          >
            <Icon className='text-2xl' name='close' />
          </button>
        </div>

        <div
          className={`relative flex min-h-0 flex-1 touch-none items-center justify-center overflow-hidden select-none ${zoom > 1 ? 'cursor-grab active:cursor-grabbing' : ''}`}
          onClick={(event) => {
            // Only a plain click on the dark area around an unzoomed image closes the viewer.
            if (event.target === event.currentTarget && zoom <= 1 && !panned.current) onClose()
          }}
          onDoubleClick={() => zoomTo(zoom > 1 ? 1 : 2)}
          onPointerCancel={() => (drag.current = null)}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={() => (drag.current = null)}
          onWheel={onWheel}
        >
          <img
            alt={image.alt}
            className='max-h-full max-w-full object-contain transition-transform duration-150 ease-out motion-reduce:transition-none'
            draggable={false}
            src={image.src}
            style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})` }}
          />
          {gallery ? (
            <>
              <button
                aria-label={t('common.kit.viewer.previous')}
                className={`${toolButton} absolute left-3 bg-black/40`}
                onClick={() => go(-1)}
                type='button'
              >
                <Icon className='text-2xl' name='chevron_left' />
              </button>
              <button
                aria-label={t('common.kit.viewer.next')}
                className={`${toolButton} absolute right-3 bg-black/40`}
                onClick={() => go(1)}
                type='button'
              >
                <Icon className='text-2xl' name='chevron_right' />
              </button>
            </>
          ) : null}
        </div>
        <p className='px-4 py-2 text-center text-xs text-white/70'>{t('common.kit.viewer.hint')}</p>
      </div>
    </dialog>
  )
}

/**
 * An image that opens the viewer when clicked or activated from the keyboard. Pass `gallery` and `index` to step
 * through sibling images (e.g. every page of a certificate).
 */
export function ViewableImage({
  src,
  alt,
  className = '',
  imgClassName = 'h-full w-full object-cover',
  gallery,
  index = 0,
  children
}: {
  src: string
  alt: string
  className?: string
  imgClassName?: string
  gallery?: ViewerImage[]
  index?: number
  /** Replaces the default `<img>`, e.g. an avatar; the button still opens the viewer. */
  children?: ReactNode
}) {
  const { t } = useTranslation()
  const images = gallery ?? [{ src, alt }]
  const [shown, setShown] = useState<number | null>(null)
  return (
    <>
      <button
        aria-label={t('common.kit.viewer.view', { name: alt })}
        className={`group relative block cursor-zoom-in overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${className}`}
        onClick={() => setShown(index)}
        type='button'
      >
        {children ?? <img alt={alt} className={imgClassName} loading='lazy' src={src} />}
        <span
          aria-hidden='true'
          className='absolute inset-0 grid place-items-center bg-black/0 text-white opacity-0 transition-[opacity,background-color] duration-200 group-hover:bg-black/25 group-hover:opacity-100 group-focus-visible:bg-black/25 group-focus-visible:opacity-100'
        >
          <Icon className='text-2xl' name='zoom_in' />
        </span>
      </button>
      <ImageViewer images={images} index={shown} onClose={() => setShown(null)} onIndexChange={setShown} />
    </>
  )
}
