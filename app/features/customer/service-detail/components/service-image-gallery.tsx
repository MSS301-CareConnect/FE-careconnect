import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'

const key = 'customer.serviceDetail.gallery' as const

export type ServiceGalleryImage = { id: string; url: string; alt: string }

type Props = {
  categoryIcon: string
  images?: readonly ServiceGalleryImage[]
}

/** Gallery shell for service photos; pass media records here when the service media API is ready. */
export function ServiceImageGallery({ categoryIcon, images = [] }: Props) {
  const { t } = useTranslation()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const activeIndex = Math.min(selectedIndex, Math.max(images.length - 1, 0))
  const activeImage = images[activeIndex]

  return (
    <section
      aria-label={t(`${key}.title`)}
      className='rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-3 shadow-xs sm:p-4'
    >
      <div className='relative overflow-hidden rounded-xl'>
        {activeImage ? (
          <img alt={activeImage.alt} className='aspect-[1.55/1] w-full object-cover' src={activeImage.url} />
        ) : (
          <div
            aria-label={t(`${key}.emptyImage`)}
            className='relative flex aspect-[1.55/1] items-center justify-center overflow-hidden rounded-xl bg-surface-container-low px-6 text-center'
            role='img'
          >
            <div className='relative z-10 flex max-w-sm flex-col items-center'>
              <span className='grid size-16 place-items-center rounded-2xl border border-white/70 bg-white/75 text-primary shadow-sm backdrop-blur-sm sm:size-20'>
                <Icon className='text-4xl sm:text-5xl' name={categoryIcon} />
              </span>
              <h2 className='mt-5 text-base font-bold text-on-surface sm:text-lg'>{t(`${key}.title`)}</h2>
              <p className='mt-1.5 text-sm leading-6 text-on-surface-variant'>{t(`${key}.emptyHint`)}</p>
            </div>
            <span aria-hidden='true' className='absolute -left-12 -top-20 size-56 rounded-full bg-white/45 blur-2xl' />
            <span
              aria-hidden='true'
              className='absolute -bottom-28 -right-8 size-72 rounded-full bg-primary-fixed/60 blur-3xl'
            />
          </div>
        )}
        {activeImage ? (
          <span className='absolute bottom-3 right-3 rounded-full bg-on-surface/65 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm'>
            {t(`${key}.position`, { current: activeIndex + 1, total: images.length })}
          </span>
        ) : null}
      </div>

      {images.length > 0 ? (
        <div aria-label={t(`${key}.thumbnails`)} className='mt-3 flex gap-2 overflow-x-auto pb-0.5' role='group'>
          {images.map((image, index) => (
            <button
              aria-label={t(`${key}.selectImage`, { number: index + 1 })}
              aria-pressed={activeIndex === index}
              className={`size-[4.5rem] shrink-0 overflow-hidden rounded-lg border-2 transition-colors sm:size-20 ${
                activeIndex === index ? 'border-primary' : 'border-outline-variant/60 hover:border-primary/50'
              }`}
              key={image.id}
              onClick={() => setSelectedIndex(index)}
              type='button'
            >
              <img alt='' className='size-full object-cover' src={image.url} />
            </button>
          ))}
        </div>
      ) : (
        <div aria-hidden='true' className='mt-3 flex gap-2 overflow-hidden'>
          {Array.from({ length: 4 }, (_, index) => (
            <span
              className={`grid size-[4.5rem] shrink-0 place-items-center rounded-lg border bg-surface-container-low sm:size-20 ${
                index === 0 ? 'border-primary/50' : 'border-outline-variant/60'
              }`}
              key={index}
            >
              <Icon className='text-xl text-on-surface-variant/55' name='image' />
            </span>
          ))}
        </div>
      )}
    </section>
  )
}
