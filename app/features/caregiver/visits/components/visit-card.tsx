import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { formatClock, formatDate } from '~/entities/booking/booking-format'
import { OccurrenceStatusBadge } from '~/entities/booking/booking-status-badge'
import type { CaregiverOccurrenceRecord } from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'

export function VisitCard({ visit }: { visit: CaregiverOccurrenceRecord }) {
  const { t, i18n } = useTranslation()
  const language = i18n.language

  return (
    <li className='group grid gap-4 rounded-xl bg-white p-5 shadow-sm sm:grid-cols-[150px_minmax(0,1fr)_auto] sm:items-center'>
      <div>
        <p className='text-lg font-bold text-on-surface'>
          {formatClock(visit.startAt, language)}–{formatClock(visit.endAt, language)}
        </p>
        <p className='text-sm text-on-surface-variant'>{formatDate(visit.startAt, language)}</p>
      </div>
      <div className='min-w-0'>
        <div className='flex flex-wrap items-center gap-2'>
          <h2 className='truncate font-bold text-on-surface'>
            {visit.recipientName ?? t('caregiver.visits.patientFallback')}
          </h2>
          <OccurrenceStatusBadge status={visit.status} />
          {visit.noShowReportedAt && !visit.noShowDecidedAt ? (
            <span className='rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800'>
              {t('caregiver.visits.noShowPending')}
            </span>
          ) : null}
        </div>
        {visit.serviceAddress ? (
          <p className='mt-1 flex items-start gap-1 text-sm text-on-surface-variant'>
            <Icon className='mt-0.5 text-base text-primary' name='home_pin' />
            <span className='truncate'>{visit.serviceAddress}</span>
          </p>
        ) : null}
        {visit.services?.length ? (
          <p className='mt-1 text-sm text-on-surface-variant'>
            {visit.services
              .map((service) => service.serviceName)
              .filter(Boolean)
              .join(' · ')}
          </p>
        ) : null}
      </div>
      <Link
        aria-label={t('caregiver.visits.openLabel', { name: visit.recipientName ?? '', number: visit.occurrenceNo })}
        className='inline-flex items-center justify-center gap-1.5 rounded-lg bg-surface-container px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-container-high'
        to={`/caregiver/visits/${visit.id}`}
      >
        {t('caregiver.visits.open')}
        <Icon className='text-lg transition-transform group-hover:translate-x-0.5' name='arrow_forward' />
      </Link>
    </li>
  )
}
