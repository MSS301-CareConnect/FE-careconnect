import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { ReportPhotoRecord } from '~/shared/api/generated/contracts'
import { ViewableImage } from '~/shared/ui/image-viewer'

export function CareReportPhotos({
  photos,
  onReload,
  reloading
}: {
  photos?: ReportPhotoRecord[]
  onReload: () => Promise<unknown>
  reloading: boolean
}) {
  const { t } = useTranslation()
  const [failedUrls, setFailedUrls] = useState<string[]>([])
  if (!photos?.length) return null

  const gallery = [...photos]
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    .flatMap((photo, index) =>
      photo.downloadUrl && !failedUrls.includes(photo.downloadUrl)
        ? [
            {
              id: photo.mediaFileId ?? index,
              src: photo.downloadUrl,
              alt: t('aftercare.report.photo', { number: index + 1 })
            }
          ]
        : []
    )

  return (
    <div className='mt-3 space-y-2'>
      <p className='text-sm font-semibold'>{t('aftercare.report.photos')}</p>
      {gallery.length > 0 ? (
        <ul aria-label={t('aftercare.report.photos')} className='flex flex-wrap gap-2'>
          {gallery.map((image, index) => (
            <li key={image.id}>
              <ViewableImage
                alt={image.alt}
                className='h-24 w-24 rounded-lg border border-outline-variant/60'
                gallery={gallery}
                index={index}
                src={image.src}
              >
                <img
                  alt={image.alt}
                  className='h-full w-full object-cover'
                  loading='lazy'
                  onError={() => setFailedUrls((urls) => [...urls, image.src])}
                  referrerPolicy='no-referrer'
                  src={image.src}
                />
              </ViewableImage>
            </li>
          ))}
        </ul>
      ) : null}
      {gallery.length < photos.length ? (
        <div className='flex flex-wrap items-center gap-2'>
          <p className='text-sm text-on-surface-variant' role='status'>
            {t('aftercare.report.photosUnavailable')}
          </p>
          <button
            className='min-h-11 rounded-lg border border-outline-variant px-3 text-sm font-semibold text-primary focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50'
            disabled={reloading}
            onClick={async () => {
              await onReload()
              setFailedUrls([])
            }}
            type='button'
          >
            {t('aftercare.report.reloadPhotos')}
          </button>
        </div>
      ) : null}
    </div>
  )
}
