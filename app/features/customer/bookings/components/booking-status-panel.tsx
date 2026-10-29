import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { formatDateTime, formatMoney } from '~/entities/booking/booking-format'
import { useDepositAmount } from '~/entities/payment/payment-api'
import type { BookingDetailRecord, BookingStatus } from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'

const ICONS: Record<BookingStatus, string> = {
  PENDING: 'hourglass_top',
  AWAITING_DEPOSIT: 'account_balance_wallet',
  CONFIRMED: 'event_available',
  IN_PROGRESS: 'vital_signs',
  COMPLETED: 'verified',
  REJECTED: 'block',
  CANCELLED: 'event_busy',
  EXPIRED: 'timer_off'
}

/** What happens next for the customer, stated from the booking's own dates and amounts. */
export function BookingStatusPanel({ booking }: { booking: BookingDetailRecord }) {
  const { t, i18n } = useTranslation()
  const language = i18n.language
  const deposit = useDepositAmount(booking)
  // Without a known amount the copy still asks for the deposit, just without a figure.
  const depositKnown = deposit.amount !== undefined
  const values = {
    acceptanceDue: formatDateTime(booking.acceptanceDueAt, language),
    deposit: formatMoney(deposit.amount, language),
    depositDue: formatDateTime(booking.depositDueAt, language),
    reason: booking.rejectedReason ?? booking.cancelReason ?? '',
    refund: formatMoney(booking.refund?.totalRefund, language)
  }

  return (
    <section className='flex items-start gap-4 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-5 shadow-xs sm:p-6'>
      <span className='grid h-12 w-12 shrink-0 place-items-center rounded-full bg-secondary-container text-primary'>
        <Icon className='text-2xl' name={ICONS[booking.status]} />
      </span>
      <div className='min-w-0'>
        <h2 className='text-lg font-bold text-on-surface'>
          {t(`customer.bookingDetail.next.${booking.status}.title`)}
        </h2>
        <p className='mt-1 text-sm leading-6 text-on-surface-variant'>
          {booking.status === 'AWAITING_DEPOSIT' && !depositKnown
            ? t('customer.bookingDetail.next.AWAITING_DEPOSIT.bodyNoAmount', values)
            : t(`customer.bookingDetail.next.${booking.status}.body`, values)}
        </p>
        {booking.refund?.totalRefund !== undefined ? (
          <p className='mt-2 text-sm font-semibold text-primary tabular-nums'>
            {t('customer.bookingDetail.refunded', values)}
          </p>
        ) : null}
        {booking.status === 'AWAITING_DEPOSIT' ? (
          <Link
            className='group mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-on-primary shadow-xs transition-colors hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
            to={`/customer/bookings/${booking.id}/deposit`}
          >
            {depositKnown
              ? t('customer.bookingDetail.payDeposit', values)
              : t('customer.bookingDetail.payDepositNoAmount')}
            <Icon
              className='text-lg transition-transform duration-300 group-hover:translate-x-1'
              name='arrow_forward'
            />
          </Link>
        ) : null}
      </div>
    </section>
  )
}
