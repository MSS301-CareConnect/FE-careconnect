import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { bookingTypeKey } from '~/entities/booking/booking-format'
import type { CaregiverBookingRequestRecord } from '~/shared/api/generated/contracts'
import { useFormat } from '~/shared/lib/format'
import { Avatar } from '~/shared/ui/avatar'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'

import { cgCard } from '../../ui/caregiver-page'
import { useShiftLabel } from '../../ui/use-shift-label'
import { useRequestSummary } from '../hooks/use-request-summary'
import { AnswerDeadline } from './answer-deadline'
import { RequestVisitRow } from './request-visit-row'

const VISIBLE_VISITS = 3

/**
 * One booking a customer sent straight to the caregiver (CR-3): when (with the work shift of a SHIFT booking), who is
 * cared for and their main health warning, who booked, the first visits with service and price, the booking value and
 * the answer. "View details" opens everything the caregiver may see before the customer pays.
 */
export function BookingRequestCard({
  request,
  now,
  busy,
  onAccept,
  onDecline
}: {
  request: CaregiverBookingRequestRecord
  now: number
  busy: boolean
  onAccept: () => void
  onDecline: () => void
}) {
  const { t } = useTranslation()
  const money = useFormat().money
  const summary = useRequestSummary(request)
  const shift = useShiftLabel(summary.shiftScheduleId)
  const detail = `/caregiver/requests/${request.id}`
  const hidden = summary.visits.length - VISIBLE_VISITS

  return (
    <article className={`${cgCard} p-4 sm:p-5`}>
      <header className='flex flex-wrap items-start justify-between gap-2'>
        <div className='min-w-0'>
          <p className='text-xs font-semibold text-on-surface-variant'>
            {request.bookingCode} · {t(bookingTypeKey(request))}
          </p>
          <h3 className='mt-0.5 text-lg font-bold text-on-surface tabular-nums'>
            <Link className='hover:underline focus-visible:outline-2 focus-visible:outline-primary' to={detail}>
              {summary.when}
            </Link>
          </h3>
          <p className='text-sm text-on-surface-variant tabular-nums'>
            {t('caregiver.requests.visits', { count: summary.visits.length })} ·{' '}
            {t('caregiver.requests.totalTime', { time: summary.totalTime })}
          </p>
          {shift.label ? (
            <p className='mt-1 inline-flex items-center gap-1.5 rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold text-primary'>
              <Icon className='text-sm' name='work_history' />
              {shift.label}
            </p>
          ) : null}
        </div>
        <AnswerDeadline dueAt={request.acceptanceDueAt} now={now} />
      </header>

      <div className='mt-4 grid gap-3 sm:grid-cols-2'>
        <div className='flex min-w-0 items-center gap-3'>
          <Avatar className='h-10 w-10 shrink-0 rounded-full text-sm' decorative name={summary.recipientName} />
          <div className='min-w-0'>
            <p className='truncate font-semibold text-on-surface'>{summary.recipientName}</p>
            {summary.recipientMeta ? <p className='text-sm text-on-surface-variant'>{summary.recipientMeta}</p> : null}
          </div>
        </div>
        <dl className='grid gap-1 text-sm'>
          {request.customerName ? (
            <div className='flex gap-1.5'>
              <dt className='text-on-surface-variant'>{t('caregiver.requests.customer')}:</dt>
              <dd className='font-medium text-on-surface'>{request.customerName}</dd>
            </div>
          ) : null}
          {summary.area ? (
            <div className='flex items-start gap-1'>
              <dt className='sr-only'>{t('caregiver.requests.area')}</dt>
              <Icon className='text-base text-primary' name='location_on' />
              <dd className='text-on-surface'>{summary.area}</dd>
            </div>
          ) : null}
        </dl>
      </div>

      {request.allergies ? (
        <p className='mt-3 inline-flex max-w-full items-center gap-1.5 rounded-md bg-error-container px-2 py-1 text-xs font-semibold text-on-error-container'>
          <Icon className='text-sm' name='warning' />
          <span className='line-clamp-1'>{t('caregiver.requests.allergyAlert', { value: request.allergies })}</span>
        </p>
      ) : null}

      {summary.visits.length ? (
        <ul aria-label={t('caregiver.requests.schedule')} className='mt-4 flex flex-col gap-1.5'>
          {summary.visits.slice(0, VISIBLE_VISITS).map((visit, index) => (
            <RequestVisitRow index={index} key={visit.id} services={request.services} visit={visit} />
          ))}
        </ul>
      ) : null}
      {hidden > 0 ? (
        <Link
          className='mt-2 inline-flex text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary'
          to={detail}
        >
          {t('caregiver.requests.moreVisits', { count: hidden })}
        </Link>
      ) : null}

      {request.customerNote ? (
        <p className='mt-3 line-clamp-2 rounded-lg border border-outline-variant px-3 py-2 text-sm text-on-surface'>
          <span className='font-semibold text-on-surface-variant'>{t('caregiver.requests.note')}: </span>
          {request.customerNote}
        </p>
      ) : null}

      <footer className='mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant pt-4'>
        <div>
          <p className='text-xs font-semibold text-on-surface-variant'>{t('caregiver.requests.total')}</p>
          <p className='text-lg font-bold text-on-surface tabular-nums'>
            {request.totalAmount !== undefined ? money(request.totalAmount) : '—'}
          </p>
        </div>
        <div className='flex flex-wrap gap-2'>
          <Link
            className='cg-press inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-primary hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-primary'
            to={detail}
          >
            {t('caregiver.requests.viewDetail')}
            <Icon className='text-lg' name='chevron_right' />
          </Link>
          <Button disabled={busy} onClick={onDecline} variant='outline'>
            {t('caregiver.requests.decline')}
          </Button>
          <Button leftIcon={<Icon className='text-lg' name='check' />} loading={busy} onClick={onAccept}>
            {t('caregiver.requests.accept')}
          </Button>
        </div>
      </footer>
    </article>
  )
}
