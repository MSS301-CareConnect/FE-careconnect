import { useState, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '~/shared/ui/icon'
import { LocalFilePreview } from '~/shared/ui/local-file-preview'
import { SectionCard } from '~/shared/ui/section-card'

export function ProfileCredentials() {
  const { t } = useTranslation()
  const [files, setFiles] = useState<File[]>([])
  const [invalid, setInvalid] = useState(false)
  function selectFiles(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (
      files.length + selected.length > 5 ||
      selected.some(
        (file) => !['application/pdf', 'image/jpeg', 'image/png'].includes(file.type) || file.size > 15 * 1024 * 1024
      )
    ) {
      setInvalid(true)
      return
    }
    setInvalid(false)
    setFiles([...files, ...selected])
  }
  return (
    <SectionCard icon='workspace_premium' id='certificates' title={t('caregiver.profile.certificatesTitle')}>
      <p className='mb-5 text-xs leading-5 text-outline'>{t('caregiver.profile.certificatesHint')}</p>
      <div className='grid gap-4 sm:grid-cols-2'>
        {(['license', 'degree', 'lifeSupport', 'elderly'] as const).map((key) => (
          <article className='flex flex-col items-start rounded-xl border border-outline-variant/30 p-4' key={key}>
            <div className='mb-3 flex w-full items-center justify-between gap-2'>
              <Icon className='text-3xl text-primary' name={key === 'degree' ? 'school' : 'description'} />
              <span className='rounded-full bg-surface-container-low px-2 py-1 text-[10px] text-outline'>
                {t('caregiver.profile.pending')}
              </span>
            </div>
            <h3 className='text-sm font-bold leading-6'>{t(`caregiver.profile.certificateList.${key}.title`)}</h3>
            <p className='mt-2 text-xs leading-5 text-outline'>
              {t(`caregiver.profile.certificateList.${key}.issuer`)}
            </p>
            {key === 'lifeSupport' && <p className='mt-2 text-xs text-amber-800'>{t('caregiver.profile.expired')}</p>}
            <button
              className='mt-auto pt-4 text-xs font-semibold text-outline disabled:cursor-not-allowed print:hidden'
              disabled
              title={t('caregiver.unavailable')}
              type='button'
            >
              {t('caregiver.profile.viewPdf')}
            </button>
          </article>
        ))}
      </div>
      <label className='mt-5 flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-outline-variant/50 p-6 text-center transition hover:border-primary focus-within:ring-2 focus-within:ring-primary print:hidden'>
        <Icon className='mb-2 text-3xl text-primary' name='upload_file' />
        <span className='text-sm font-bold text-primary'>{t('caregiver.profile.upload')}</span>
        <span className='mt-2 text-xs leading-5 text-outline'>{t('caregiver.profile.uploadHint')}</span>
        <input
          accept='application/pdf,image/jpeg,image/png'
          aria-label={t('caregiver.profile.upload')}
          className='sr-only'
          multiple
          onChange={selectFiles}
          type='file'
        />
      </label>
      {invalid && (
        <p className='mt-3 text-sm text-error' role='alert'>
          {t('caregiver.profile.uploadError')}
        </p>
      )}
      {files.length > 0 && (
        <ul className='mt-4 space-y-3'>
          {files.map((file, index) => (
            <li
              className='flex items-center justify-between gap-3 rounded-xl bg-surface-container-low p-3'
              key={`${file.name}-${index}`}
            >
              <div className='min-w-0 break-words text-sm text-primary underline'>
                <LocalFilePreview file={file} label={t('caregiver.profile.previewFile', { name: file.name })} />
              </div>
              <button
                aria-label={t('caregiver.profile.remove', { name: file.name })}
                className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-outline hover:bg-white print:hidden'
                onClick={() => setFiles(files.filter((_, fileIndex) => fileIndex !== index))}
                type='button'
              >
                <Icon name='close' />
              </button>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  )
}
