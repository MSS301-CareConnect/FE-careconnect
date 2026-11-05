import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { useFormat } from '~/shared/lib/format'
import { CopyButton } from '~/shared/ui/copy-button'
import { Icon } from '~/shared/ui/icon'

import type { BookingForm } from '../hooks/use-booking-form'
import { quoteFacts } from './booking-quote'
import { NextSteps } from './next-steps'
import { QuoteLines } from './quote-lines'

const VISIBLE_VISITS = 5

const primaryLink =
  'inline-flex min-h-12 items-center justify-center rounded-lg bg-primary px-5 font-semibold text-on-primary transition-[background-color,transform] hover:bg-primary-container active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
const secondaryLink =
  'inline-flex min-h-12 items-center justify-center rounded-lg border border-outline-variant bg-surface-container-lowest px-5 font-semibold text-on-surface transition-colors hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

function visitMinutes(startAt?: string, endAt?: string) {
  if (!startAt || !endAt) return 0
  const diff = Date.parse(endAt) - Date.parse(startAt)
  return Number.isFinite(diff) && diff > 0 ? Math.round(diff / 60_000) : 0
}

/** After the request is sent: animated check, copyable code, full schedule & price recap and what happens next. */
export function BookingSuccess({ form }: { form: BookingForm }) {
  const { t } = useTranslation()
  const format = useFormat()
  const heading = useRef<HTMLHeadingElement>(null)
  const [allVisits, setAllVisits] = useState(false)
  const booking = form.create.data
  const facts = quoteFacts(form)

  useEffect(() => {
    heading.current?.focus()
  }, [])

  if (!booking) return null
  // SHIFT (2026-11-05): held at once on the caregiver's shift — the customer pays the first part now.
  const held = booking.status === 'AWAITING_INITIAL_PAYMENT'

  const totalAmount = booking.totalAmount ?? facts.total
  const depositPercent = booking.initialPaymentPercent ?? facts.depositPercent
  const depositAmount = booking.depositAmount ?? facts.deposit
  const payInFull = depositPercent === undefined || depositPercent >= 100
  const remainingAmount = depositAmount !== undefined ? Math.max(0, totalAmount - depositAmount) : facts.remaining
  const visits = allVisits ? facts.occurrences : facts.occurrences.slice(0, VISIBLE_VISITS)

  return (
    <div className='cc-fade-up mx-auto flex max-w-2xl flex-col items-center py-8 text-center sm:py-12'>
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
        {held
          ? t('customer.booking.success.heldDescription', {
              time: booking.depositDueAt ? format.dateTime(booking.depositDueAt) : '—'
            })
          : t('customer.booking.success.description')}
      </p>

      <div className='mt-5 flex w-full max-w-sm items-center justify-between gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest py-2 pr-2 pl-4 text-left'>
        <span className='min-w-0'>
          <span className='block text-xs text-on-surface-variant'>{t('customer.booking.success.code')}</span>
          <span className='block font-mono text-base font-semibold whitespace-nowrap text-on-surface sm:text-lg'>
            {booking.bookingCode}
          </span>
        </span>
        <CopyButton compact value={booking.bookingCode} />
      </div>

      {/* Recipient, Caregiver, Services & Schedule Details */}
      <dl className='mt-6 w-full divide-y divide-outline-variant rounded-xl border border-outline-variant bg-surface-container-lowest text-left text-sm'>
        <div className='flex justify-between gap-4 px-4 py-3 sm:px-5'>
          <dt className='text-on-surface-variant'>{t('customer.booking.summary.recipient')}</dt>
          <dd className='font-semibold text-on-surface'>{form.recipient?.fullName}</dd>
        </div>

        <div className='flex justify-between gap-4 px-4 py-3 sm:px-5'>
          <dt className='text-on-surface-variant'>{t('customer.booking.summary.caregiver')}</dt>
          <dd className='text-right font-medium text-on-surface'>
            {form.chosenCaregiver?.fullName ?? t('customer.booking.summary.letCenter')}
            {form.centerName ? <span className='block text-xs text-on-surface-variant'>{form.centerName}</span> : null}
          </dd>
        </div>

        {form.serviceOptions.length > 0 ? (
          <div className='flex justify-between gap-4 px-4 py-3 sm:px-5'>
            <dt className='shrink-0 text-on-surface-variant'>{t('customer.booking.summary.services')}</dt>
            <dd className='text-right text-on-surface'>
              <ul className='space-y-1'>
                {form.serviceOptions.map((service) => {
                  const unit = service.plan?.pricingUnit
                    ? t(`customer.booking.priceUnit.${service.plan.pricingUnit}`)
                    : ''
                  return (
                    <li key={service.offeringId}>
                      <span className='font-medium'>{service.name}</span>
                      {service.plan ? (
                        <span className='block text-xs text-on-surface-variant tabular-nums'>
                          {t('customer.booking.quote.plan', { name: service.plan.planName })}
                          {service.plan.basePrice !== undefined && unit
                            ? ` · ${t('customer.booking.quote.unitPrice')}: ${t('customer.booking.quote.unitPriceValue', { price: format.money(service.plan.basePrice), unit })}`
                            : ''}
                        </span>
                      ) : null}
                    </li>
                  )
                })}
              </ul>
            </dd>
          </div>
        ) : null}

        <div className='flex justify-between gap-4 px-4 py-3 sm:px-5'>
          <dt className='shrink-0 text-on-surface-variant'>{t('customer.booking.summary.schedule')}</dt>
          <dd className='text-right text-on-surface'>
            <p className='font-medium'>
              {t(`customer.booking.schedule.types.${form.schedule.bookingType}.title`)}
              {facts.occurrences.length > 0
                ? ` · ${t('customer.booking.summary.visits', { count: facts.occurrences.length })}`
                : ''}
            </p>
            {visits.length > 0 ? (
              <ul className='mt-1.5 space-y-1 text-xs text-on-surface-variant tabular-nums'>
                {visits.map((visit, index) => {
                  const mins = visitMinutes(visit.startAt, visit.endAt)
                  return (
                    <li key={`${visit.startAt}-${index}`}>
                      {format.visitRange(visit.startAt, visit.endAt)}
                      {mins > 0 ? ` (${format.duration(mins)})` : ''}
                      {form.multiService && visit.careServiceId
                        ? ` · ${form.serviceOfSlot(visit.careServiceId)?.name ?? ''}`
                        : ''}
                    </li>
                  )
                })}
              </ul>
            ) : null}
            {facts.occurrences.length > VISIBLE_VISITS ? (
              <button
                className='mt-1 text-xs font-semibold text-primary hover:underline'
                onClick={() => setAllVisits((value) => !value)}
                type='button'
              >
                {allVisits
                  ? t('customer.booking.review.showLess')
                  : t('customer.booking.review.showAll', { count: facts.occurrences.length })}
              </button>
            ) : null}
          </dd>
        </div>

        {form.customerNote.trim() ? (
          <div className='flex justify-between gap-4 px-4 py-3 sm:px-5'>
            <dt className='shrink-0 text-on-surface-variant'>{t('customer.booking.schedule.note')}</dt>
            <dd className='whitespace-pre-line text-right text-on-surface'>{form.customerNote.trim()}</dd>
          </div>
        ) : null}
      </dl>

      {/* Detailed Price Breakdown: Services, Unit Price, Duration, Line Amount, Total & Deposit */}
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

        {held ? null : (
          <p className='mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-primary'>
            <Icon className='text-sm' name='lock_clock' />
            {t('customer.booking.review.nothingNow')}
          </p>
        )}
      </section>

      <div className='mt-5 w-full rounded-xl border border-outline-variant bg-surface-container-lowest p-4 text-left sm:p-5'>
        <h2 className='font-semibold text-on-surface'>{t('customer.booking.review.nextTitle')}</h2>
        <NextSteps
          assign={!form.selectedCaregiverId}
          confirmMinutes={form.policy.data?.confirmationTimeoutMinutes}
          held={held}
        />
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
