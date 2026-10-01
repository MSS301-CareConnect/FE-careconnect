import { useTranslation } from 'react-i18next'
import { Icon } from '~/shared/ui/icon'
import type { ComplaintPreview } from '../complaints-preview'

const key = 'admin.reviewsComplaintsPage' as const

export function ComplaintCard({ complaint, onSelect }: { complaint: ComplaintPreview; onSelect: () => void }) {
  const { t } = useTranslation()
  const detail = t(`${key}.caseDetails.${complaint.kind}.statement`)
  const critical = complaint.level === 'critical'
  return (
    <article
      className={`rounded-xl border bg-white p-5 shadow-sm ${critical ? 'border-error/35' : 'border-outline-variant/25'}`}
    >
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${critical ? 'bg-error-container text-on-error-container' : complaint.status === 'resolved' ? 'bg-secondary-container/40 text-primary' : 'bg-amber-100 text-amber-800'}`}
        >
          <Icon
            className='text-sm'
            name={critical ? 'crisis_alert' : complaint.status === 'resolved' ? 'check_circle' : 'stethoscope'}
          />
          {t(`${key}.levels.${complaint.level}`)}
        </span>
        <span className='text-xs font-semibold text-outline'>{t(`${key}.statuses.${complaint.status}`)}</span>
      </div>
      <div className='mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm'>
        <strong className='text-base'>{complaint.id}</strong>
        <span className='text-on-surface-variant'>
          {t(`${key}.booking`)}: #{complaint.booking}
        </span>
      </div>
      <div className='mt-4 grid gap-3 rounded-lg bg-surface-container-low p-4 sm:grid-cols-2'>
        <div className='flex items-center gap-2'>
          <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white'>
            {complaint.initials}
          </span>
          <div className='min-w-0 text-sm'>
            <span className='block text-xs text-outline'>{t(`${key}.customer`)}</span>
            <strong>{complaint.customer}</strong>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <Icon className='text-xl text-primary' name='medical_services' />
          <div className='min-w-0 text-sm'>
            <span className='block text-xs text-outline'>{t(`${key}.caregiver`)}</span>
            <strong>{complaint.caregiver}</strong>
          </div>
        </div>
      </div>
      <p className='mt-4 border-l-2 border-primary/50 pl-3 text-sm leading-6 text-on-surface-variant'>{detail}</p>
      <div className='mt-4 flex flex-wrap gap-2 border-t border-outline-variant/25 pt-4'>
        <button
          className='rounded-lg bg-surface-container-low px-3 py-2 text-xs font-semibold text-primary hover:bg-surface-container'
          onClick={onSelect}
          type='button'
        >
          {t(`${key}.selectCase`)}
        </button>
        {(complaint.kind === 'delay'
          ? ['replace', 'refund', 'discipline']
          : complaint.kind === 'clinical'
            ? ['medical', 'resolve']
            : ['record']
        ).map((action) => (
          <button
            className='rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white opacity-50'
            disabled
            key={action}
            title={t(`${key}.unavailable`)}
            type='button'
          >
            {t(
              `${key}.caseActions.${action as 'replace' | 'refund' | 'discipline' | 'medical' | 'resolve' | 'record'}`
            )}
          </button>
        ))}
      </div>
    </article>
  )
}
