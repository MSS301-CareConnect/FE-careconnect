import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { fetchPaymentHistory, paymentErrorKey, paymentKeys } from '~/entities/payment/payment-api'
import { useFormat } from '~/shared/lib/format'
import type { PaymentRecord } from '~/shared/api/generated/contracts'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'
import { StatusBadge } from '~/shared/ui/status-badge'

import type { BookingLabel } from '../hooks/use-booking-labels'
import { PaymentInvoiceDialog } from './payment-invoice-dialog'
import { MoneyRow, PAYMENT_STATUS_TONES, PaymentListSection } from './payments-ui'

const key = 'customer.payments' as const

/** The customer's own payments (deposit and remaining), newest first, with the amount refunded so far. */
export function PaymentHistorySection({ labels }: { labels: ReadonlyMap<string, BookingLabel> }) {
  const { t } = useTranslation()
  const format = useFormat()
  const [page, setPage] = useState(0)
  const [invoice, setInvoice] = useState<PaymentRecord | null>(null)
  const history = useQuery({
    queryKey: paymentKeys.history(page),
    queryFn: () => fetchPaymentHistory(page),
    retry: false
  })
  const items = history.data?.items ?? []
  return (
    <>
      <PaymentListSection
        empty={{ icon: 'receipt_long', title: t(`${key}.history.empty`) }}
        error={history.isError ? t(paymentErrorKey(history.error)) : null}
        id='payments-history'
        isEmpty={items.length === 0}
        isPending={history.isPending}
        onPageChange={setPage}
        onRetry={() => void history.refetch()}
        page={page}
        title={t(`${key}.history.title`)}
        totalPages={history.data?.totalPages ?? 0}
      >
        {items.map((payment) => (
          <MoneyRow
            amount={format.money(payment.amount)}
            aside={
              payment.status === 'SUCCESS' ? (
                <Button
                  leftIcon={<Icon name='receipt_long' />}
                  onClick={() => setInvoice(payment)}
                  size='sm'
                  variant='outline'
                >
                  {t(`${key}.history.viewInvoice`)}
                </Button>
              ) : undefined
            }
            booking={labels.get(payment.bookingId)}
            bookingId={payment.bookingId}
            icon={payment.paymentType === 'DEPOSIT' ? 'account_balance_wallet' : 'receipt_long'}
            key={payment.id}
            meta={[format.dateTime(payment.paidAt ?? payment.createdAt), t(`${key}.method`)]
              .filter(Boolean)
              .join(' · ')}
            status={
              <span className='flex flex-wrap items-center gap-2 sm:justify-end'>
                {payment.refundedAmount > 0 ? (
                  <span className='text-xs text-on-surface-variant tabular-nums'>
                    {t(`${key}.history.refunded`, { amount: format.money(payment.refundedAmount) })}
                  </span>
                ) : null}
                <StatusBadge tone={PAYMENT_STATUS_TONES[payment.status]}>
                  {t(`payment.status.${payment.status}`)}
                </StatusBadge>
              </span>
            }
            title={t(`payment.type.${payment.paymentType}`)}
          />
        ))}
      </PaymentListSection>
      {invoice ? <PaymentInvoiceDialog onClose={() => setInvoice(null)} payment={invoice} /> : null}
    </>
  )
}
