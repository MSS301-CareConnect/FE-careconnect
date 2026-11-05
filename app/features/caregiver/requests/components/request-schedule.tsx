import { useTranslation } from 'react-i18next'

import { bookingTypeKey, weekdayKey } from '~/entities/booking/booking-format'
import type { CaregiverBookingRequestRecord } from '~/shared/api/generated/contracts'

import { hhmm, useCaregiverFormat } from '../../ui/caregiver-format'
import { cgCard } from '../../ui/caregiver-page'
import { useShiftLabel } from '../../ui/use-shift-label'
import { useRequestSummary } from '../hooks/use-request-summary'
import { RequestVisitRow } from './request-visit-row'

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className='min-w-0'>
      <dt className='text-xs font-semibold text-on-surface-variant'>{label}</dt>
      <dd className='mt-0.5 text-[15px] font-medium text-on-surface tabular-nums'>{value}</dd>
    </div>
  )
}

/** The schedule of a request: type, dates, work shift or repeat rule, totals, then every visit with service and price. */
export function RequestSchedule({ request }: { request: CaregiverBookingRequestRecord }) {
  const { t } = useTranslation()
  const format = useCaregiverFormat()
  const summary = useRequestSummary(request)
  const shift = useShiftLabel(summary.shiftScheduleId)

  const period =
    request.startDate === request.endDate
      ? format.shortDay(request.startDate)
      : t('caregiver.requests.dateRange', {
          from: format.date(request.startDate),
          to: format.date(request.endDate)
        })
  const weekdays = (request.daysOfWeek ?? [])
    .map(weekdayKey)
    .filter((key) => key !== undefined)
    .map((key) => t(`booking.weekdays.${key}`))
    .join(', ')
  const repeat =
    request.bookingType === 'RECURRING' && request.startTime && request.endTime
      ? t('caregiver.requests.detail.schedule.repeatValue', {
          days: weekdays || t(bookingTypeKey(request)),
          time: `${hhmm(request.startTime)}–${hhmm(request.endTime)}`
        })
      : undefined

  return (
    <section aria-labelledby='request-schedule' className={`${cgCard} p-4 sm:p-5`}>
      <h2 className='text-base font-semibold text-on-surface' id='request-schedule'>
        {t('caregiver.requests.detail.schedule.title')}
      </h2>
      <dl className='mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
        <Fact label={t('caregiver.requests.detail.schedule.type')} value={t(bookingTypeKey(request))} />
        <Fact label={t('caregiver.requests.detail.schedule.period')} value={period} />
        {summary.shiftScheduleId ? (
          <Fact
            label={t('caregiver.requests.detail.schedule.shift')}
            value={shift.label ?? (shift.loading ? t('caregiver.requests.shiftLoading') : '—')}
          />
        ) : null}
        {repeat ? <Fact label={t('caregiver.requests.detail.schedule.repeat')} value={repeat} /> : null}
        <Fact
          label={t('caregiver.requests.detail.schedule.visits')}
          value={t('caregiver.requests.visits', { count: summary.visits.length })}
        />
        <Fact label={t('caregiver.requests.detail.schedule.hours')} value={summary.totalTime} />
        {request.createdAt ? (
          <Fact label={t('caregiver.requests.detail.schedule.sent')} value={format.shortDateTime(request.createdAt)} />
        ) : null}
      </dl>

      {summary.visits.length ? (
        <>
          <h3 className='mt-5 text-sm font-semibold text-on-surface'>
            {t('caregiver.requests.detail.visits.title', { count: summary.visits.length })}
          </h3>
          <ul className='mt-2 flex flex-col gap-1.5'>
            {summary.visits.map((visit, index) => (
              <RequestVisitRow index={index} key={visit.id} services={request.services} visit={visit} />
            ))}
          </ul>
        </>
      ) : null}
    </section>
  )
}
