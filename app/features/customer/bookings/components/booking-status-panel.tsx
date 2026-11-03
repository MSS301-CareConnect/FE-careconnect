import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { formatDateTime, formatMoney } from '~/entities/booking/booking-format'
import {
  fetchOpenInvoiceOfBooking,
  initialPaymentOf,
  paymentErrorKey,
  paymentKeys,
  redirectToCheckout,
  startInvoiceCheckout
} from '~/entities/payment/payment-api'
import type { BookingDetailRecord, BookingStatus } from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'

import { awaitsRemaining } from '../booking-lifecycle'

const primaryAction =
  'group mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary shadow-xs transition-[background-color,transform] hover:bg-primary-container active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:bg-outline'

// Statuses that wait on the customer get the attention colour; closed ones stay quiet.
const TONES: Partial<Record<BookingStatus, string>> = {
  AWAITING_INITIAL_PAYMENT: 'border-caution/40 bg-caution-container/40',
  REJECTED: 'border-outline-variant bg-surface-container-low',
  CANCELLED: 'border-outline-variant bg-surface-container-low',
  EXPIRED: 'border-outline-variant bg-surface-container-low'
}

const ICONS: Record<BookingStatus, string> = {
  PENDING_CENTER_CONFIRMATION: 'hourglass_top',
  PENDING_CAREGIVER_CONFIRMATION: 'how_to_reg',
  PENDING_CAREGIVER_ASSIGNMENT: 'person_search',
  AWAITING_INITIAL_PAYMENT: 'account_balance_wallet',
  CONFIRMED: 'event_available',
  IN_PROGRESS: 'vital_signs',
  COMPLETED: 'verified',
  REJECTED: 'block',
  CANCELLED: 'event_busy',
  EXPIRED: 'timer_off'
}

/**
 * What happens next for the customer, stated from the booking's own dates and amounts. A RECURRING / CUSTOM booking
 * still owes its remaining balance after the initial payment and must be paid in full before the first visit
 * (spec §9.1); PaymentService opens that invoice together with the initial payment.
 */
export function BookingStatusPanel({ booking }: { booking: BookingDetailRecord }) {
  const { t, i18n } = useTranslation()
  const language = i18n.language
  const deposit = initialPaymentOf(booking)
  // Without a known amount the copy still asks for the payment, just without a figure.
  const depositKnown = deposit.amount !== undefined
  const awaitingRemaining = awaitsRemaining(booking)
  const invoice = useQuery({
    queryKey: paymentKeys.bookingInvoice(booking.id),
    queryFn: () => fetchOpenInvoiceOfBooking(booking.id),
    enabled: awaitingRemaining,
    retry: false
  })
  const payRemaining = useMutation({
    mutationFn: (invoiceId: string) => startInvoiceCheckout(invoiceId),
    onSuccess: (checkout) => redirectToCheckout(checkout.checkoutUrl)
  })
  const values = {
    acceptanceDue: formatDateTime(booking.acceptanceDueAt, language),
    assignmentDue: formatDateTime(booking.assignmentDueAt, language),
    deposit: formatMoney(deposit.amount, language),
    depositDue: formatDateTime(booking.depositDueAt, language),
    remaining: formatMoney(invoice.data?.amount ?? deposit.remaining, language),
    remainingDue: formatDateTime(booking.remainingPaymentDueAt, language),
    reason: booking.rejectedReason ?? booking.cancelReason ?? '',
    refund: formatMoney(booking.refund?.totalRefund, language)
  }

  return (
    <section
      aria-labelledby='booking-next-title'
      className={`rounded-2xl border p-5 shadow-[var(--shadow-card)] ${TONES[booking.status] ?? (awaitingRemaining ? 'border-caution/40 bg-caution-container/40' : 'border-outline-variant bg-surface-container-lowest')}`}
    >
      <div className='flex items-start gap-3'>
        <span className='grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-50 text-primary'>
          <Icon className='text-xl' name={ICONS[booking.status]} />
        </span>
        <h2 className='pt-1.5 text-base leading-snug font-semibold text-on-surface' id='booking-next-title'>
          {t(`customer.bookingDetail.next.${booking.status}.title`)}
        </h2>
      </div>
      <div>
        <p className='mt-2 text-sm leading-6 text-on-surface-variant'>
          {booking.status === 'AWAITING_INITIAL_PAYMENT' && !depositKnown
            ? t('customer.bookingDetail.next.AWAITING_INITIAL_PAYMENT.bodyNoAmount', values)
            : awaitingRemaining
              ? t('customer.bookingDetail.next.CONFIRMED.bodyRemaining', values)
              : t(`customer.bookingDetail.next.${booking.status}.body`, values)}
        </p>
        {booking.refund?.totalRefund !== undefined ? (
          <p className='mt-2 text-sm font-semibold text-primary tabular-nums'>
            {t('customer.bookingDetail.refunded', values)}
          </p>
        ) : null}
        {awaitingRemaining && invoice.data ? (
          <button
            className={primaryAction}
            disabled={payRemaining.isPending}
            onClick={() => invoice.data && payRemaining.mutate(invoice.data.id)}
            type='button'
          >
            {payRemaining.isPending
              ? t('customer.bookingDetail.remaining.paying')
              : t('customer.bookingDetail.remaining.pay', values)}
            <Icon
              className='text-lg transition-transform duration-300 group-hover:translate-x-1'
              name='arrow_forward'
            />
          </button>
        ) : null}
        {awaitingRemaining && (invoice.isError || (invoice.isSuccess && !invoice.data)) ? (
          <Link className={primaryAction} to='/customer/payments'>
            {t('customer.bookingDetail.remaining.toPayments')}
          </Link>
        ) : null}
        {payRemaining.isError ? (
          <p className='mt-3 rounded-xl bg-error-container p-3 text-sm text-on-error-container' role='alert'>
            {t(paymentErrorKey(payRemaining.error))}
          </p>
        ) : null}
        {booking.status === 'AWAITING_INITIAL_PAYMENT' ? (
          <Link className={primaryAction} to={`/customer/bookings/${booking.id}/deposit`}>
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
