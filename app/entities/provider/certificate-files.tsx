import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'
import { ViewableImage } from '~/shared/ui/image-viewer'

import { fetchProviderMedia, providerKeys } from './provider-api'

/**
 * Read-only photos and files of one certificate: images open in the viewer (gallery), other files (PDF) open in a new
 * tab. Used by the center manager confirmation (step 3) and the admin review dialog (step 5); uploads stay on the
 * caregiver's side because a new photo sends the certificate back to the center.
 */
export function CertificateFiles({ certificateId, large = false }: { certificateId: string; large?: boolean }) {
  const { t } = useTranslation()
  const media = useQuery({
    queryKey: providerKeys.media('CERTIFICATE', certificateId),
    queryFn: () => fetchProviderMedia('CERTIFICATE', certificateId),
    retry: false
  })
  if (media.isPending) return <p className='text-sm text-on-surface-variant'>{t('common.providerMedia.loading')}</p>
  if (media.isError) return <p className='text-sm text-error'>{t('common.providerMedia.error')}</p>
  if (!media.data?.length) return <p className='text-sm text-on-surface-variant'>{t('common.providerMedia.empty')}</p>
  const gallery = media.data.flatMap((file) =>
    file.downloadUrl && file.contentType?.startsWith('image/')
      ? [{ src: file.downloadUrl, alt: file.originalFileName || t('common.providerMedia.image') }]
      : []
  )
  return (
    <ul className={large ? 'grid grid-cols-2 gap-3' : 'flex flex-wrap gap-2'}>
      {media.data.map((file) => (
        <li key={file.mediaFileId}>
          {file.downloadUrl && file.contentType?.startsWith('image/') ? (
            <ViewableImage
              alt={file.originalFileName || t('common.providerMedia.image')}
              className={
                large
                  ? 'aspect-[4/3] w-full rounded-xl border border-outline-variant/50'
                  : 'h-20 w-20 rounded-lg border border-outline-variant/50'
              }
              gallery={gallery}
              index={gallery.findIndex((image) => image.src === file.downloadUrl)}
              src={file.downloadUrl}
            />
          ) : file.downloadUrl ? (
            <a
              className='inline-flex items-center gap-2 rounded-lg border border-outline-variant/50 bg-white px-3 py-2 text-sm font-medium text-primary hover:border-primary'
              href={file.downloadUrl}
              rel='noreferrer'
              target='_blank'
            >
              <Icon name='attach_file' />
              <span className='max-w-48 truncate'>{file.originalFileName || t('common.providerMedia.open')}</span>
              <Icon className='text-base' name='open_in_new' />
            </a>
          ) : (
            <span className='text-sm text-on-surface-variant'>{file.originalFileName || file.mediaFileType}</span>
          )}
        </li>
      ))}
    </ul>
  )
}
