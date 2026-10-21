import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Icon } from '~/shared/ui/icon'

import { fetchProviderMedia, providerKeys, removeMedia, uploadMedia, type ProviderMediaOwner } from './provider-api'

export function ProviderMediaPanel({ ownerType, ownerId }: { ownerType: ProviderMediaOwner; ownerId: string }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [files, setFiles] = useState<File[]>([])
  const queryKey = providerKeys.media(ownerType, ownerId)
  const media = useQuery({ queryKey, queryFn: () => fetchProviderMedia(ownerType, ownerId), retry: false })
  const upload = useMutation({
    mutationFn: () => uploadMedia(ownerType, ownerId, files),
    onSuccess: async () => {
      setFiles([])
      await queryClient.invalidateQueries({ queryKey })
    }
  })
  const remove = useMutation({
    mutationFn: (mediaFileId: string) => removeMedia(ownerType, ownerId, mediaFileId),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey })
  })
  return (
    <section className='space-y-4 rounded-2xl bg-white p-5 shadow-sm'>
      <h2 className='flex items-center gap-2 text-lg font-bold'>
        <Icon className='text-primary' name='perm_media' />
        {t('common.providerMedia.title')}
      </h2>
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
              <span className='flex min-w-0 items-center gap-2 text-sm font-medium'>
                <Icon className='shrink-0 text-primary' name='attach_file' />
                <span className='truncate'>{item.originalFileName || item.mediaFileType}</span>
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
          aria-label={t('common.providerMedia.upload')}
          className='min-w-0 flex-1 text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-2 file:font-semibold file:text-primary'
          multiple
          onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
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
      {upload.isError || remove.isError ? <p role='alert'>{t('common.providerMedia.actionError')}</p> : null}
    </section>
  )
}
