import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '~/shared/ui/icon'
import type { ComplaintPreview } from '../complaints-preview'

const key = 'admin.reviewsComplaintsPage' as const

export function ComplaintDialog({ complaint, onClose }: { complaint: ComplaintPreview; onClose: () => void }) {
  const { t } = useTranslation()
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])
  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-on-surface/50 p-4'
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      role='presentation'
    >
      <section
        aria-label={t(`${key}.detailTitle`)}
        aria-modal='true'
        className='max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl'
        role='dialog'
      >
        <div className='flex items-start justify-between gap-3'>
          <div>
            <h2 className='text-xl font-bold'>{t(`${key}.detailTitle`)}</h2>
            <p className='mt-1 text-sm text-outline'>
              {complaint.id} · #{complaint.booking}
            </p>
          </div>
          <button
            aria-label={t(`${key}.close`)}
            className='rounded-lg p-1 hover:bg-surface-container-low'
            onClick={onClose}
            type='button'
          >
            <Icon name='close' />
          </button>
        </div>
        <p className='mt-4 rounded-lg bg-error-container p-3 text-xs text-on-error-container'>{t(`${key}.sample`)}</p>
        <dl className='mt-4 space-y-3 text-sm'>
          {(
            [
              [t(`${key}.customer`), complaint.customer],
              [t(`${key}.caregiver`), complaint.caregiver],
              [t(`${key}.filters.severity`), t(`${key}.levels.${complaint.level}`)],
              [t(`${key}.filters.status`), t(`${key}.statuses.${complaint.status}`)]
            ] as const
          ).map(([label, value]) => (
            <div className='flex justify-between gap-3 border-b border-outline-variant/25 pb-2' key={label}>
              <dt className='text-outline'>{label}</dt>
              <dd className='text-right font-semibold'>{value}</dd>
            </div>
          ))}
        </dl>
        <p className='mt-4 text-sm text-on-surface-variant'>
          {t(`${key}.caseDetails.${complaint.kind}.context`)} · {t(`${key}.caseDetails.${complaint.kind}.center`)}
        </p>
        <p className='mt-4 text-sm leading-6'>{t(`${key}.caseDetails.${complaint.kind}.statement`)}</p>
        <h3 className='mt-5 font-bold'>{t(`${key}.evidence`)}</h3>
        <p className='mt-1 text-sm leading-6 text-on-surface-variant'>
          {t(`${key}.caseDetails.${complaint.kind}.evidence`)}
        </p>
        <h3 className='mt-5 font-bold'>{t(`${key}.outcome`)}</h3>
        <p className='mt-1 text-sm leading-6 text-on-surface-variant'>
          {t(`${key}.caseDetails.${complaint.kind}.outcome`)}
        </p>
        <div className='mt-6 text-right'>
          <button
            className='rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white'
            onClick={onClose}
            type='button'
          >
            {t(`${key}.close`)}
          </button>
        </div>
      </section>
    </div>
  )
}
