import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'
import { ConfirmDialog } from '~/shared/ui/modal'

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
  const [removingMediaId, setRemovingMediaId] = useState<string | null>(null)
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
      setRemovingMediaId(null)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey }),
        queryClient.invalidateQueries({ queryKey: providerKeys.catalog })
      ])
    }
  })
  return (
    <section
      className={
        embedded
          ? 'space-y-4 border-t border-outline-variant/50 pt-4'
          : 'space-y-4 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-5 shadow-xs'
      }
    >
      {embedded ? (
        <h3 className='flex items-center gap-2 text-base font-bold text-on-surface'>
          <Icon className='text-primary' name='perm_media' />
          {t(titleKey[ownerType])}
        </h3>
      ) : (
        <h2 className='flex items-center gap-2 text-lg font-bold text-on-surface'>
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
      {media.isPending ? (
        <p className='text-sm text-on-surface-variant' role='status'>
          {t('common.providerMedia.loading')}
        </p>
      ) : null}
      {media.isError ? (
        <p className='text-sm text-error' role='alert'>
          {t('common.providerMedia.error')}
        </p>
      ) : null}
      {media.isSuccess && media.data.length === 0 ? (
        <p className='rounded-xl bg-surface-container-low p-4 text-sm text-outline'>
          {t('common.providerMedia.empty')}
        </p>
      ) : null}
      {media.isSuccess ? (
        <ul className='divide-y divide-outline-variant/30'>
          {media.data.map((item) => (
            <li className='flex flex-wrap items-center justify-between gap-3 py-3' key={item.mediaFileId}>
              <span className='flex min-w-0 flex-1 items-center gap-2.5 text-sm font-medium text-on-surface'>
                {item.downloadUrl && item.contentType?.startsWith('image/') ? (
                  <img
                    alt={item.originalFileName || t('common.providerMedia.image')}
                    className='h-12 w-12 shrink-0 rounded-lg border border-outline-variant/50 object-cover'
                    src={item.downloadUrl}
                  />
                ) : (
                  <Icon className='shrink-0 text-primary' name='attach_file' />
                )}
                <span className='min-w-0 truncate'>{item.originalFileName || item.mediaFileType}</span>
              </span>
              <div className='flex items-center gap-3'>
                {item.downloadUrl ? (
                  <a
                    className='inline-flex min-h-9 items-center rounded-lg px-2.5 text-sm font-semibold text-primary hover:bg-surface-container-low hover:underline'
                    href={item.downloadUrl}
                    rel='noreferrer'
                    target='_blank'
                  >
                    {t('common.providerMedia.open')}
                  </a>
                ) : null}
                <button
                  className='inline-flex min-h-9 items-center rounded-lg px-2.5 text-sm font-semibold text-error hover:bg-error-container/60 disabled:opacity-50'
                  disabled={remove.isPending}
                  onClick={() => setRemovingMediaId(item.mediaFileId)}
                  type='button'
                >
                  {t('common.providerMedia.remove')}
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
      <div className='flex flex-wrap items-center gap-3 rounded-xl border border-outline-variant/50 bg-surface-container-low p-4'>
        <input
          accept={ownerType === 'CERTIFICATE' ? '.pdf,.jpg,.jpeg,.png' : '.jpg,.jpeg,.png,.webp'}
          aria-label={t('common.providerMedia.upload')}
          className='min-w-0 flex-1 text-xs file:mr-3 file:rounded-lg file:border file:border-outline-variant file:bg-surface-container-lowest file:px-3 file:py-2 file:font-semibold file:text-primary'
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
        <Button
          disabled={files.length === 0 || upload.isPending}
          loading={upload.isPending}
          onClick={() => upload.mutate()}
          size='sm'
          variant='primary'
        >
          {t('common.providerMedia.upload')}
        </Button>
      </div>
      {fileError ? (
        <p className='text-sm text-error' role='alert'>
          {t(`common.providerMedia.validation.${fileError}`, { maxSize: ownerType === 'CERTIFICATE' ? 10 : 5 })}
        </p>
      ) : null}
      {upload.isError || remove.isError ? (
        <p className='text-sm text-error' role='alert'>
          {t('common.providerMedia.actionError')}
        </p>
      ) : null}
      <ConfirmDialog
        confirmLabel={t('common.providerMedia.remove')}
        danger
        description={t('common.providerMedia.confirmRemove')}
        loading={remove.isPending}
        onClose={() => setRemovingMediaId(null)}
        onConfirm={() => {
          if (removingMediaId) remove.mutate(removingMediaId)
        }}
        open={Boolean(removingMediaId)}
        title={t('common.providerMedia.remove')}
      />
    </section>
  )
}
