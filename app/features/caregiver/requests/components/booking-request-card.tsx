import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { bookingTypeKey } from '~/entities/booking/booking-format'
import type { CaregiverBookingRequestRecord } from '~/shared/api/generated/contracts'
import { calendarDayOf, useFormat } from '~/shared/lib/format'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'

import { useCaregiverFormat } from '../../ui/caregiver-format'
import { cgCard } from '../../ui/caregiver-page'

/**
 * One booking a customer sent straight to the caregiver (CR-3): when, where (area only), for whom and how much, with
 * the answer deadline. The full care profile opens only after the customer pays.
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
  const format = useCaregiverFormat()
  const money = useFormat().money
  const [expanded, setExpanded] = useState(false)
  const visits = [...(request.occurrences ?? [])].sort((a, b) => a.startAt.localeCompare(b.startAt))
  const first = visits[0]
  const area = [request.ward, request.district, request.province].filter(Boolean).join(', ')
  // Gender is an enum: always through i18n, never the raw "FEMALE".
  const gender =
    request.recipientGender === 'MALE' || request.recipientGender === 'FEMALE' || request.recipientGender === 'OTHER'
      ? t(`caregiver.ui.gender.${request.recipientGender}`)
      : undefined
  const recipient =
    request.recipientAge !== undefined && gender
      ? t('caregiver.requests.recipientValue', { age: request.recipientAge, gender })
      : request.recipientAge !== undefined
        ? t('caregiver.requests.recipientAge', { age: request.recipientAge })
        : gender
  const dueSoon = request.acceptanceDueAt ? new Date(request.acceptanceDueAt).getTime() - now < 3 * 3_600_000 : false

  return (
    <article className={`${cgCard} p-4 sm:p-5`}>
      <header className='flex flex-wrap items-start justify-between gap-2'>
        <div className='min-w-0'>
          <p className='text-xs font-semibold text-on-surface-variant'>
            {request.bookingCode} · {t(bookingTypeKey(request))}
          </p>
          <h2 className='mt-0.5 text-base font-bold text-on-surface'>
            {first
              ? t('caregiver.requests.firstVisit', { date: format.shortDateTime(first.startAt) })
              : request.bookingCode}
          </h2>
          <p className='text-sm text-on-surface-variant'>
            {t('caregiver.requests.visits', { count: visits.length })}
            {first ? ` · ${format.clockRangeWithDuration(first.startAt, first.endAt)}` : ''}
          </p>
        </div>
        {request.acceptanceDueAt ? (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${dueSoon ? 'bg-warning-container text-on-warning-container' : 'bg-surface-container-low text-on-surface-variant'}`}
          >
            <Icon className='text-sm' name='schedule' />
            {t('caregiver.requests.answerBy', { time: format.shortDateTime(request.acceptanceDueAt) })}
          </span>
        ) : null}
      </header>

      <dl className='mt-4 grid gap-3 text-sm sm:grid-cols-2'>
        {area ? (
          <div>
            <dt className='text-xs font-semibold text-on-surface-variant'>{t('caregiver.requests.area')}</dt>
            <dd className='mt-0.5 flex items-start gap-1 text-on-surface'>
              <Icon className='text-base text-primary' name='location_on' />
              {area}
            </dd>
          </div>
        ) : null}
        {recipient ? (
          <div>
            <dt className='text-xs font-semibold text-on-surface-variant'>{t('caregiver.requests.recipient')}</dt>
            <dd className='mt-0.5 text-on-surface'>{recipient}</dd>
          </div>
        ) : null}
        {request.services?.length ? (
          <div>
            <dt className='text-xs font-semibold text-on-surface-variant'>{t('caregiver.requests.services')}</dt>
            <dd className='mt-0.5 text-on-surface'>
              {request.services.map((service) => service.serviceName).join(', ')}
            </dd>
          </div>
        ) : null}
        {request.totalAmount !== undefined ? (
          <div>
            <dt className='text-xs font-semibold text-on-surface-variant'>{t('caregiver.requests.total')}</dt>
            <dd className='mt-0.5 font-semibold text-on-surface tabular-nums'>{money(request.totalAmount)}</dd>
          </div>
        ) : null}
        {request.customerNote ? (
          <div className='sm:col-span-2'>
            <dt className='text-xs font-semibold text-on-surface-variant'>{t('caregiver.requests.note')}</dt>
            <dd className='mt-0.5 rounded-lg bg-surface-container-low p-2.5 text-on-surface'>{request.customerNote}</dd>
          </div>
        ) : null}
      </dl>

      {visits.length > 1 ? (
        <div className='mt-3'>
          <button
            aria-expanded={expanded}
            className='text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary'
            onClick={() => setExpanded((value) => !value)}
            type='button'
          >
            {expanded ? t('caregiver.requests.hideVisits') : t('caregiver.requests.showVisits')}
          </button>
          {expanded ? (
            <ul className='mt-2 grid gap-1.5 text-sm sm:grid-cols-2'>
              {visits.map((visit) => (
                <li className='rounded-lg bg-surface-container-low px-3 py-1.5 tabular-nums' key={visit.id}>
                  {format.shortDay(calendarDayOf(visit.startAt))} · {format.clockRange(visit.startAt, visit.endAt)}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <p className='mt-3 flex items-center gap-1.5 text-xs text-on-surface-variant'>
        <Icon className='text-sm' name='lock' />
        {t('caregiver.requests.privacy')}
      </p>

      <footer className='mt-4 flex flex-wrap justify-end gap-2'>
        <Button disabled={busy} onClick={onDecline} variant='outline'>
          {t('caregiver.requests.decline')}
        </Button>
        <Button leftIcon={<Icon className='text-lg' name='check' />} loading={busy} onClick={onAccept}>
          {t('caregiver.requests.accept')}
        </Button>
      </footer>
    </article>
  )
}
