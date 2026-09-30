import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SectionCard } from '~/shared/ui/section-card'
import { LocalFilePreview } from '~/shared/ui/local-file-preview'
import { Icon } from '~/shared/ui/icon'
import type { ReportEditor } from '../hooks/use-care-report-draft'

const samplePhotos = [
  {
    key: 'evidenceDevice',
    icon: 'monitor_heart',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvLbSB1RltoCZ-faWOYkFGBXpnyXQE3Dhlpw7kjTs5DDJJG-Got_xzJcKfk0aftqQ1kAsKvWYYY78U2S9LZHWVZvfjVMXAVAwREk0M3sR8_cRLbFWjXrd2whYXgCZ0hVpgIlY9FiVAhWb9KdyUlML1CntMnS-umOt48fnqn4qnVZVfCcv3D0BVMCjusaN99QNDDZFgD5RWenKa7naXRiyZV2Y7bzvOwyaqaSP0qFzJ6NfXTNINUeTFZg'
  },
  {
    key: 'evidenceWalk',
    icon: 'nordic_walking',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYHsazgwP59RC1rHid4mzdo7CZ2_T_NU9glyPHPp1WV-498xGJmmcAxezFW67-z5lYjCo7EHevbCCmM9YOsuXRXf8sOCMD8Ffi7-ttlQjhhMz4AlXz1qdIK3sgXH0pKbgPM7YxvCROciRhHchCvqgt_SHgr8i-1QTjsWsHHMHjTffr_TovqZ3icZHG6UGkGay-LW0DQRXN3Bhi2CTAkMLyasb7lONgJYzkVXPNe_W0Z0QDA3LYG_M5VQ'
  }
] as const

export function ReportNotes({ editor }: { editor: ReportEditor }) {
  const { t } = useTranslation()
  const [invalid, setInvalid] = useState(false)
  const photos = editor.draft.record.code === 'BK-8821' ? samplePhotos : []
  return (
    <SectionCard title={t('caregiver.careReport.notes')} icon='edit_note'>
      <div className='space-y-5'>
        <label className='block text-xs font-bold'>
          {t('caregiver.careReport.nursingNotes')}
          <textarea
            aria-label={t('caregiver.careReport.nursingNotes')}
            className='mt-3 min-h-40 w-full rounded-xl border border-outline-variant/40 bg-surface-container-low p-4 text-sm font-normal leading-7 print:hidden'
            maxLength={5000}
            onChange={(event) => editor.update({ notes: event.target.value })}
            placeholder={t('caregiver.careReport.noNotes')}
            value={editor.draft.notes}
          />
          <p className='hidden whitespace-pre-wrap py-3 text-sm font-normal leading-7 print:block'>
            {editor.draft.notes}
          </p>
        </label>
        <label className='block rounded-xl bg-amber-50 p-4 text-xs font-bold text-amber-900'>
          <span className='flex items-center gap-2'>
            <Icon className='text-lg' name='tips_and_updates' />
            {t('caregiver.careReport.advice')}
          </span>
          <textarea
            aria-label={t('caregiver.careReport.advice')}
            className='mt-3 min-h-28 w-full rounded-lg border border-amber-200 bg-white/60 p-3 text-sm font-normal leading-6 print:hidden'
            maxLength={3000}
            onChange={(event) => editor.update({ advice: event.target.value })}
            value={editor.draft.advice}
          />
          <p className='hidden whitespace-pre-wrap py-3 text-sm font-normal leading-6 print:block'>
            {editor.draft.advice}
          </p>
        </label>
        <div>
          <h3 className='flex items-center gap-2 text-sm font-bold'>
            <Icon className='text-primary' name='photo_camera' />
            {t('caregiver.careReport.evidence')}
          </h3>
          <p className='my-3 text-xs text-outline'>{t('caregiver.careReport.evidenceHint')}</p>
          <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
            {photos.map((photo) => (
              <figure className='overflow-hidden rounded-xl bg-surface-container-low' key={photo.key}>
                <div className='relative flex h-32 items-center justify-center text-primary'>
                  <Icon className='text-4xl' name={photo.icon} />
                  <img
                    alt={t('caregiver.careReport.photoAlt', { name: t(`caregiver.careReport.${photo.key}`) })}
                    className='absolute inset-0 h-full w-full object-cover'
                    onError={(event) => {
                      event.currentTarget.hidden = true
                    }}
                    src={photo.url}
                  />
                </div>
                <figcaption className='p-3 text-[10px] font-semibold'>
                  {t(`caregiver.careReport.${photo.key}`)}
                </figcaption>
              </figure>
            ))}
            {editor.draft.files.map((file, index) => (
              <div className='min-w-0' key={`${file.name}-${index}`}>
                <LocalFilePreview file={file} image label={file.name} />
                <button
                  aria-label={t('caregiver.careReport.removePhoto', { name: file.name })}
                  className='mt-2 w-full truncate text-xs text-error print:hidden'
                  onClick={() =>
                    editor.update({ files: editor.draft.files.filter((_, position) => position !== index) })
                  }
                  type='button'
                >
                  {t('caregiver.careReport.removePhoto', { name: file.name })}
                </button>
              </div>
            ))}
            <label className='relative flex min-h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-outline-variant p-3 text-center text-primary focus-within:ring-2 focus-within:ring-primary print:hidden'>
              <Icon name='add_a_photo' />
              <span className='text-xs font-bold'>{t('caregiver.careReport.addPhoto')}</span>
              <span className='text-[10px] text-outline'>{t('caregiver.careReport.photoLimit')}</span>
              <input
                accept='image/jpeg,image/png,image/webp'
                aria-label={t('caregiver.careReport.addPhoto')}
                className='absolute inset-0 h-full w-full cursor-pointer opacity-0'
                multiple
                onChange={(event) => {
                  const files = Array.from(event.target.files ?? [])
                  const bad =
                    files.some(
                      (file) =>
                        !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024
                    ) || editor.draft.files.length + photos.length + files.length > 5
                  setInvalid(bad)
                  if (!bad) editor.update({ files: [...editor.draft.files, ...files] })
                  event.target.value = ''
                }}
                type='file'
              />
            </label>
          </div>
          {invalid && (
            <p className='mt-3 text-xs text-error' role='alert'>
              {t('caregiver.careReport.invalidPhoto')}
            </p>
          )}
        </div>
      </div>
    </SectionCard>
  )
}
