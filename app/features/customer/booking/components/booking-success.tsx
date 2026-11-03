import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { useFormat } from '~/shared/lib/format'
import { CopyButton } from '~/shared/ui/copy-button'

import type { BookingForm } from '../hooks/use-booking-form'
import { quoteFacts } from './booking-quote'
import { NextSteps } from './next-steps'

const primaryLink =
  'inline-flex min-h-12 items-center justify-center rounded-lg bg-primary px-5 font-semibold text-on-primary transition-[background-color,transform] hover:bg-primary-container active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
const secondaryLink =
  'inline-flex min-h-12 items-center justify-center rounded-lg border border-outline-variant bg-surface-container-lowest px-5 font-semibold text-on-surface transition-colors hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

/** After the request is sent: animated check, copyable code, a short recap and what happens next. */
export function BookingSuccess({ form }: { form: BookingForm }) {
  const { t } = useTranslation()
  const format = useFormat()
  const heading = useRef<HTMLHeadingElement>(null)
  const booking = form.create.data
  const facts = quoteFacts(form)

  useEffect(() => {
    heading.current?.focus()
  }, [])

  if (!booking) return null

  return (
    <div className='cc-fade-up mx-auto flex max-w-xl flex-col items-center py-10 text-center sm:py-14'>
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
      <h1 className='mt-5 text-2xl font-bold text-on-surface outline-none sm:text-[30px]' ref={heading} tabIndex={-1}>
        {t('customer.booking.success.title')}
      </h1>
      <p className='mt-2 text-on-surface-variant'>{t('customer.booking.success.description')}</p>

      <div className='mt-6 flex items-center gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-2'>
        <span className='text-sm text-on-surface-variant'>{t('customer.booking.success.code')}</span>
        <span className='font-mono text-lg font-semibold text-on-surface'>{booking.bookingCode}</span>
        <CopyButton value={booking.bookingCode} />
      </div>

      <dl className='mt-6 w-full divide-y divide-outline-variant rounded-xl border border-outline-variant bg-surface-container-lowest text-left text-sm'>
        <div className='flex justify-between gap-4 px-4 py-3'>
          <dt className='text-on-surface-variant'>{t('customer.booking.summary.recipient')}</dt>
          <dd className='font-medium text-on-surface'>{form.recipient?.fullName}</dd>
        </div>
        <div className='flex justify-between gap-4 px-4 py-3'>
          <dt className='text-on-surface-variant'>{t('customer.booking.summary.schedule')}</dt>
          <dd className='text-right font-medium text-on-surface'>
            {t(`customer.booking.schedule.types.${form.schedule.bookingType}.title`)}
            {facts.occurrences[0] ? (
              <span className='block font-normal text-on-surface-variant'>
                {format.dateTime(facts.occurrences[0].startAt)}
              </span>
            ) : null}
          </dd>
        </div>
        <div className='flex justify-between gap-4 px-4 py-3'>
          <dt className='text-on-surface-variant'>{t('customer.booking.summary.total')}</dt>
          <dd className='font-semibold text-on-surface tabular-nums'>
            {format.money(booking.totalAmount ?? facts.total)}
          </dd>
        </div>
      </dl>

      <div className='mt-6 w-full rounded-xl border border-outline-variant bg-surface-container-lowest p-4 text-left'>
        <h2 className='font-semibold text-on-surface'>{t('customer.booking.review.nextTitle')}</h2>
        <NextSteps assign={!form.selectedCaregiverId} confirmMinutes={form.policy.data?.confirmationTimeoutMinutes} />
      </div>

      <div className='mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center'>
        <Link className={primaryLink} to={`/customer/bookings/${booking.id}`}>
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
