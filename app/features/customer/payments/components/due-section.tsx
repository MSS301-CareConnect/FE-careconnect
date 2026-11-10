import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { paymentErrorKey, redirectToCheckout, startInvoiceCheckout } from '~/entities/payment/payment-api'
import type { BookingSummaryRecord, RemainingInvoiceRecord } from '~/shared/api/generated/contracts'
import { useFormat } from '~/shared/lib/format'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'
import { StatusBadge } from '~/shared/ui/status-badge'

import type { BookingLabel } from '../hooks/use-booking-labels'
import { INVOICE_STATUS_TONES, MoneyRow, PaymentListSection } from './payments-ui'

const key = 'customer.payments' as const
const linkButton =
  'inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-peach-300 px-4 text-sm font-semibold text-forest-950 transition-[background-color,transform] hover:bg-peach-200 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-peach-400 shadow-[0_10px_24px_-12px_rgb(246_146_95/0.8)]'

/**
 * Everything the customer still has to pay: deposits of bookings the center accepted, then remaining-balance
 * invoices (overdue first). Each row pays through VNPay.
 */
export function DueSection({
  deposits,
  invoices,
  labels,
  isPending,
  error,
  onRetry
}: {
  deposits: BookingSummaryRecord[]
  invoices: RemainingInvoiceRecord[]
  labels: ReadonlyMap<string, BookingLabel>
  isPending: boolean
  error: string | null
  onRetry: () => void
}) {
  const { t } = useTranslation()
  const format = useFormat()
  const pay = useMutation({
    mutationFn: startInvoiceCheckout,
    onSuccess: (checkout) => redirectToCheckout(checkout.checkoutUrl)
  })

  return (
    <div className='flex flex-col gap-3'>
      {pay.isError ? (
        <p className='rounded-xl bg-error-container p-3 text-sm text-on-error-container' role='alert'>
          {t(paymentErrorKey(pay.error))}
        </p>
      ) : null}
      <PaymentListSection
        description={t(`${key}.due.description`)}
        empty={{
          icon: 'task_alt',
          title: t(`${key}.due.emptyTitle`),
          description: t(`${key}.due.empty`),
          action: (
            <Link className={linkButton} to='/customer/bookings'>
              {t(`${key}.due.toBookings`)}
            </Link>
          )
        }}
        error={error}
        id='payments-due'
        isEmpty={deposits.length === 0 && invoices.length === 0}
        isPending={isPending}
        onPageChange={() => undefined}
        onRetry={onRetry}
        page={0}
        title={t(`${key}.due.title`)}
        totalPages={0}
      >
        {deposits.map((booking) => (
          <MoneyRow
            aside={
              <Link className={linkButton} to={`/customer/bookings/${booking.id}/deposit`}>
                <Icon className='text-lg' name='account_balance_wallet' />
                {t(`${key}.due.payDeposit`)}
              </Link>
            }
            amount={t(`${key}.due.ofTotal`, { amount: format.money(booking.totalAmount) })}
            booking={{ code: booking.bookingCode, recipientName: booking.recipientName }}
            bookingId={booking.id}
            icon='account_balance_wallet'
            iconTone='attention'
            key={`deposit-${booking.id}`}
            status={<StatusBadge tone='caution'>{t('booking.status.AWAITING_INITIAL_PAYMENT')}</StatusBadge>}
            title={t('payment.type.DEPOSIT')}
          />
        ))}
        {invoices.map((invoice) => (
          <MoneyRow
            aside={
              <Button
                disabled={pay.isPending}
                loading={pay.isPending && pay.variables === invoice.id}
                onClick={() => pay.mutate(invoice.id)}
              >
                {t(`${key}.invoices.pay`)}
              </Button>
            }
            amount={format.money(invoice.amount)}
            booking={labels.get(invoice.bookingId)}
            bookingId={invoice.bookingId}
            icon='receipt_long'
            iconTone='attention'
            key={invoice.id}
            meta={t(`${key}.due.dueAt`, { time: format.dateTime(invoice.dueAt) })}
            status={
              <StatusBadge tone={INVOICE_STATUS_TONES[invoice.status]}>
                {t(`payment.invoiceStatus.${invoice.status}`)}
              </StatusBadge>
            }
            title={t('payment.type.REMAINING')}
          />
        ))}
      </PaymentListSection>
    </div>
  )
}
