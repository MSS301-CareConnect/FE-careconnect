import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { bookingKeys } from '~/entities/booking/booking-api'
import { BookingVisitTable, occurrenceVisits } from '~/entities/booking/booking-visit-table'
import { HoldCountdown } from '~/entities/booking/hold-countdown'
import { AssignedCaregiverCard } from '~/entities/provider/assigned-caregiver-card'
import { calendarDayOf, useFormat } from '~/shared/lib/format'
import { useClock } from '~/shared/lib/use-clock'
import { CopyButton } from '~/shared/ui/copy-button'

import type { BookingForm } from '../hooks/use-booking-form'
import { quoteFacts } from './booking-quote'
import { NextSteps } from './next-steps'
import { QuoteLines } from './quote-lines'

const primaryLink =
  'inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-5 font-semibold text-on-primary transition-[background-color,transform] hover:bg-primary-container active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
const secondaryLink =
  'inline-flex min-h-12 items-center justify-center rounded-lg border border-outline-variant bg-surface-container-lowest px-5 font-semibold text-on-surface transition-colors hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

/**
 * After sending (2026-11-09): every booking is held for 5 minutes while the customer pays the first part — a live
 * countdown on server time, the copyable code, who cares (chosen, picked by the system, or assigned after payment), the
 * visits as a readable table and the price recap.
 */
export function BookingSuccess({ form }: { form: BookingForm }) {
  const { t } = useTranslation()
  const format = useFormat()
  const queryClient = useQueryClient()
  const heading = useRef<HTMLHeadingElement>(null)
  const now = useClock(60_000)
  const booking = form.create.data
  const facts = quoteFacts(form)

  useEffect(() => {
    heading.current?.focus()
  }, [])

  if (!booking) return null
  const held = booking.status === 'AWAITING_INITIAL_PAYMENT'
  const today = calendarDayOf(new Date(now))

  const totalAmount = booking.totalAmount ?? facts.total
  const depositPercent = booking.initialPaymentPercent ?? facts.depositPercent
  const depositAmount = booking.depositAmount ?? facts.deposit
  const payInFull = depositPercent === undefined || depositPercent >= 100
  const remainingAmount = depositAmount !== undefined ? Math.max(0, totalAmount - depositAmount) : facts.remaining

  return (
    <div className='cc-fade-up mx-auto flex max-w-3xl flex-col items-center py-8 text-center sm:py-12'>
      <svg aria-hidden='true' className='h-20 w-20' viewBox='0 0 52 52'>
        <circle className='fill-brand-50 stroke-primary' cx='26' cy='26' r='24' strokeWidth='2' />
        <path
          className='cc-check-draw stroke-primary'
          d='M15 27 l7 7 l15 -15'
          fill='none'
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='4'
        />
      </svg>
      <h1 className='mt-4 text-2xl font-bold text-on-surface outline-none sm:text-[30px]' ref={heading} tabIndex={-1}>
        {held ? t('customer.booking.success.heldTitle') : t('customer.booking.success.title')}
      </h1>
      <p className='mt-1.5 text-on-surface-variant'>
        {held ? t('customer.booking.success.heldDescription') : t('customer.booking.success.description')}
      </p>

      {held && booking.depositDueAt ? (
        <div className='mt-5 w-full max-w-md text-left'>
          <HoldCountdown
            dueAt={booking.depositDueAt}
            onExpire={() => void queryClient.invalidateQueries({ queryKey: bookingKeys.detail(booking.id) })}
          />
        </div>
      ) : null}

      <div className='mt-5 flex w-full max-w-sm items-center justify-between gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest py-2 pr-2 pl-4 text-left'>
        <span className='min-w-0'>
          <span className='block text-xs text-on-surface-variant'>{t('customer.booking.success.code')}</span>
          <span className='block font-mono text-base font-semibold whitespace-nowrap text-on-surface sm:text-lg'>
            {booking.bookingCode}
          </span>
        </span>
        <CopyButton compact value={booking.bookingCode} />
      </div>

      <dl className='mt-6 w-full divide-y divide-outline-variant rounded-xl border border-outline-variant bg-surface-container-lowest text-left text-sm'>
        <div className='flex justify-between gap-4 px-4 py-3 sm:px-5'>
          <dt className='text-on-surface-variant'>{t('customer.booking.summary.recipient')}</dt>
          <dd className='font-semibold text-on-surface'>{form.recipient?.fullName}</dd>
        </div>

        <div className='flex flex-col gap-2 px-4 py-3 sm:flex-row sm:justify-between sm:gap-4 sm:px-5'>
          <dt className='shrink-0 text-on-surface-variant'>{t('customer.booking.summary.caregiver')}</dt>
          <dd className='min-w-0 text-on-surface sm:text-right'>
            {form.chosenCaregiver ? (
              <span className='font-medium'>{form.chosenCaregiver.fullName}</span>
            ) : booking.caregiverId ? (
              <span className='flex flex-col gap-1.5 sm:items-end'>
                <span className='text-xs font-semibold text-primary'>
                  {t('customer.booking.success.caregiverAuto')}
                </span>
                <AssignedCaregiverCard caregiverId={booking.caregiverId} />
              </span>
            ) : (
              <span className='font-medium'>{t('customer.booking.success.caregiverLater')}</span>
            )}
            {form.centerName ? <span className='block text-xs text-on-surface-variant'>{form.centerName}</span> : null}
          </dd>
        </div>

        <div className='flex justify-between gap-4 px-4 py-3 sm:px-5'>
          <dt className='text-on-surface-variant'>{t('customer.booking.summary.schedule')}</dt>
          <dd className='text-right font-medium text-on-surface'>
            {t(`customer.booking.schedule.types.${form.schedule.bookingType}.title`)}
            {booking.occurrences?.length
              ? ` · ${t('customer.booking.summary.visits', { count: booking.occurrences.length })}`
              : ''}
          </dd>
        </div>

        {form.customerNote.trim() ? (
          <div className='flex justify-between gap-4 px-4 py-3 sm:px-5'>
            <dt className='shrink-0 text-on-surface-variant'>{t('customer.booking.schedule.note')}</dt>
            <dd className='text-right whitespace-pre-line text-on-surface'>{form.customerNote.trim()}</dd>
          </div>
        ) : null}
      </dl>

      {booking.occurrences?.length ? (
        <section
          aria-labelledby='success-visits-title'
          className='mt-5 w-full rounded-xl border border-outline-variant bg-surface-container-lowest p-4 text-left sm:p-5'
        >
          <h2 className='mb-3 font-semibold text-on-surface' id='success-visits-title'>
            {t('customer.booking.review.visitsTitle')}
          </h2>
          <BookingVisitTable
            compact
            services={booking.services}
            today={today}
            visits={occurrenceVisits(booking.occurrences)}
          />
        </section>
      ) : null}

      <section
        aria-labelledby='success-price-title'
        className='mt-5 w-full rounded-xl border border-outline-variant bg-surface-container-lowest p-4 text-left sm:p-5'
      >
        <h2 className='font-semibold text-on-surface' id='success-price-title'>
          {t('customer.booking.review.priceTitle')}
        </h2>

        {facts.lines.length > 0 ? (
          <div className='mt-3'>
            <QuoteLines lines={facts.lines} />
          </div>
        ) : null}

        <dl
          className={`flex flex-col gap-2 text-sm ${facts.lines.length > 0 ? 'mt-4 border-t border-outline-variant pt-4' : 'mt-3'}`}
        >
          <div className='flex justify-between gap-4 text-base font-bold text-on-surface'>
            <dt>{t('customer.booking.summary.total')}</dt>
            <dd className='tabular-nums'>{format.money(totalAmount)}</dd>
          </div>

          {payInFull ? (
            <div className='flex justify-between gap-4 text-on-surface-variant'>
              <dt>{t('customer.booking.review.payFullAfter')}</dt>
              <dd className='font-semibold text-on-surface tabular-nums'>
                {format.money(depositAmount ?? totalAmount)}
              </dd>
            </div>
          ) : (
            <>
              <div className='flex justify-between gap-4 text-on-surface'>
                <dt className='font-medium'>{t('customer.booking.review.depositNow', { percent: depositPercent })}</dt>
                <dd className='font-semibold text-primary tabular-nums'>{format.money(depositAmount)}</dd>
              </div>
              <div className='flex justify-between gap-4 text-on-surface-variant'>
                <dt>
                  {facts.remainingDue
                    ? t('customer.booking.review.remainingDue', { time: format.dateTime(facts.remainingDue) })
                    : t('customer.booking.review.remainingLater')}
                </dt>
                <dd className='font-medium text-on-surface tabular-nums'>{format.money(remainingAmount)}</dd>
              </div>
            </>
          )}
        </dl>
      </section>

      <div className='mt-5 w-full rounded-xl border border-outline-variant bg-surface-container-lowest p-4 text-left sm:p-5'>
        <h2 className='font-semibold text-on-surface'>{t('customer.booking.review.nextTitle')}</h2>
        <NextSteps assign={!booking.caregiverId} />
      </div>

      <div className='mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center'>
        {held ? (
          <Link className={primaryLink} to={`/customer/bookings/${booking.id}/deposit`}>
            {t('customer.booking.success.payNow')}
          </Link>
        ) : null}
        <Link className={held ? secondaryLink : primaryLink} to={`/customer/bookings/${booking.id}`}>
          {t('customer.booking.success.viewBooking')}
        </Link>
        <Link className={secondaryLink} to='/customer/bookings'>
          {t('customer.booking.success.viewBookings')}
        </Link>
        <Link className={secondaryLink} to='/customer'>
          {t('customer.booking.success.home')}
        </Link>
      </div>
    </div>
  )
}
