import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Icon } from '~/shared/ui/icon'

import { fetchProviderMedia, providerKeys, removeMedia, uploadMedia, type ProviderMediaOwner } from './provider-api'

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const CERTIFICATE_TYPES = ['application/pdf', 'image/jpeg', 'image/png']
const MAX_FILES = 10
const MEGABYTE = 1024 * 1024

export function validateProviderFiles(ownerType: ProviderMediaOwner, files: File[]): 'count' | 'type' | 'size' | null {
  if (files.length > MAX_FILES) return 'count'
  const allowed = ownerType === 'CERTIFICATE' ? CERTIFICATE_TYPES : IMAGE_TYPES
  if (files.some((file) => !allowed.includes(file.type))) return 'type'
  const maxBytes = (ownerType === 'CERTIFICATE' ? 10 : 5) * MEGABYTE
  if (files.some((file) => file.size === 0 || file.size > maxBytes)) return 'size'
  return null
}

export function ProviderMediaPanel({
  ownerType,
  ownerId,
  embedded = false
}: {
  ownerType: ProviderMediaOwner
  ownerId: string
  embedded?: boolean
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [files, setFiles] = useState<File[]>([])
  const [fileError, setFileError] = useState<'count' | 'type' | 'size' | null>(null)
  const [inputKey, setInputKey] = useState(0)
  const titleKey = {
    CARE_CENTER: 'common.providerMedia.centerTitle',
    CAREGIVER_PROFILE: 'common.providerMedia.caregiverTitle',
    CERTIFICATE: 'common.providerMedia.certificateTitle'
  } as const
  const queryKey = providerKeys.media(ownerType, ownerId)
  const media = useQuery({ queryKey, queryFn: () => fetchProviderMedia(ownerType, ownerId), retry: false })
  const upload = useMutation({
    mutationFn: () => uploadMedia(ownerType, ownerId, files),
    onSuccess: async () => {
      setFiles([])
      setInputKey((current) => current + 1)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey }),
        queryClient.invalidateQueries({ queryKey: providerKeys.catalog })
      ])
    }
  })
  const remove = useMutation({
    mutationFn: (mediaFileId: string) => removeMedia(ownerType, ownerId, mediaFileId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey }),
        queryClient.invalidateQueries({ queryKey: providerKeys.catalog })
      ])
    }
  })
  return (
    <section
      className={
        embedded ? 'space-y-4 border-t border-primary/15 pt-4' : 'space-y-4 rounded-2xl bg-white p-5 shadow-sm'
      }
    >
      {embedded ? (
        <h3 className='flex items-center gap-2 text-base font-bold'>
          <Icon className='text-primary' name='perm_media' />
          {t(titleKey[ownerType])}
        </h3>
      ) : (
        <h2 className='flex items-center gap-2 text-lg font-bold'>
          <Icon className='text-primary' name='perm_media' />
          {t(titleKey[ownerType])}
        </h2>
      )}
      {ownerType === 'CAREGIVER_PROFILE' ? (
        <p className='text-sm text-on-surface-variant'>{t('common.providerMedia.caregiverHint')}</p>
      ) : null}
      {ownerType === 'CARE_CENTER' ? (
        <p className='text-sm text-on-surface-variant'>{t('common.providerMedia.centerHint')}</p>
      ) : null}
      {media.isPending ? <p role='status'>{t('common.providerMedia.loading')}</p> : null}
      {media.isError ? <p role='alert'>{t('common.providerMedia.error')}</p> : null}
      {media.isSuccess && media.data.length === 0 ? (
        <p className='rounded-xl bg-surface-container-low p-4 text-sm text-outline'>
          {t('common.providerMedia.empty')}
        </p>
      ) : null}
      {media.isSuccess ? (
        <ul className='divide-y divide-outline-variant/20'>
          {media.data.map((item) => (
            <li className='flex flex-wrap items-center justify-between gap-3 py-3' key={item.mediaFileId}>
              <span className='flex min-w-0 flex-1 items-center gap-2 text-sm font-medium'>
                {item.downloadUrl && item.contentType?.startsWith('image/') ? (
                  <img
                    alt={item.originalFileName || t('common.providerMedia.image')}
                    className='h-12 w-12 shrink-0 rounded-lg object-cover'
                    src={item.downloadUrl}
                  />
                ) : (
                  <Icon className='shrink-0 text-primary' name='attach_file' />
                )}
                <span className='min-w-0 truncate'>{item.originalFileName || item.mediaFileType}</span>
              </span>
              <div className='flex gap-3'>
                {item.downloadUrl ? (
                  <a
                    className='text-sm font-semibold text-primary hover:underline'
                    href={item.downloadUrl}
                    rel='noreferrer'
                    target='_blank'
                  >
                    {t('common.providerMedia.open')}
                  </a>
                ) : null}
                <button
                  className='text-sm font-semibold text-error hover:underline disabled:opacity-50'
                  disabled={remove.isPending}
                  onClick={() => {
                    if (window.confirm(t('common.providerMedia.confirmRemove'))) remove.mutate(item.mediaFileId)
                  }}
                  type='button'
                >
                  {t('common.providerMedia.remove')}
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
      <div className='flex flex-wrap items-center gap-3 rounded-xl bg-surface-container-low p-4'>
        <input
          accept={ownerType === 'CERTIFICATE' ? '.pdf,.jpg,.jpeg,.png' : '.jpg,.jpeg,.png,.webp'}
          aria-label={t('common.providerMedia.upload')}
          className='min-w-0 flex-1 text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-2 file:font-semibold file:text-primary'
          key={inputKey}
          multiple
          onChange={(event) => {
            const selected = Array.from(event.target.files ?? [])
            const error = validateProviderFiles(ownerType, selected)
            setFileError(error)
            setFiles(error ? [] : selected)
            if (error) event.target.value = ''
          }}
          type='file'
        />
        <button
          className='rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-container disabled:opacity-50'
          disabled={files.length === 0 || upload.isPending}
          onClick={() => upload.mutate()}
          type='button'
        >
          {t('common.providerMedia.upload')}
        </button>
      </div>
      {fileError ? (
        <p role='alert'>
          {t(`common.providerMedia.validation.${fileError}`, { maxSize: ownerType === 'CERTIFICATE' ? 10 : 5 })}
        </p>
      ) : null}
      {upload.isError || remove.isError ? <p role='alert'>{t('common.providerMedia.actionError')}</p> : null}
    </section>
  )
}
