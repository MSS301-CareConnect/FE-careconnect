import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { fetchRefundHistory, paymentErrorKey, paymentKeys } from '~/entities/payment/payment-api'
import { useFormat } from '~/shared/lib/format'
import { StatusBadge } from '~/shared/ui/status-badge'

import type { BookingLabel } from '../hooks/use-booking-labels'
import { MoneyRow, PaymentListSection, REFUND_STATUS_TONES } from './payments-ui'

const key = 'customer.payments' as const
const REASONS = [
  'CUSTOMER_CANCEL',
  'CENTER_REJECT',
  'CENTER_CANCEL',
  'CENTER_LOCKED',
  'CAREGIVER_MISSED',
  'EXPIRED',
  'COMPLAINT_ACCEPTED',
  'LATE_PAYMENT',
  'BOOKING_NOT_CONFIRMABLE',
  'DUPLICATE'
] as const

function reasonKey(reason: string) {
  return REASONS.find((item) => item === reason) ?? 'OTHER'
}

/** Refunds PaymentService made to the customer, with the cancellation fee it kept. */
export function RefundHistorySection({ labels }: { labels: ReadonlyMap<string, BookingLabel> }) {
  const { t } = useTranslation()
  const format = useFormat()
  const [page, setPage] = useState(0)
  const refunds = useQuery({
    queryKey: paymentKeys.refunds(page),
    queryFn: () => fetchRefundHistory(page),
    retry: false
  })
  const items = refunds.data?.items ?? []
  return (
    <PaymentListSection
      description={t(`${key}.refunds.description`)}
      empty={{ icon: 'currency_exchange', title: t(`${key}.refunds.empty`) }}
      error={refunds.isError ? t(paymentErrorKey(refunds.error)) : null}
      id='payments-refunds'
      isEmpty={items.length === 0}
      isPending={refunds.isPending}
      onPageChange={setPage}
      onRetry={() => void refunds.refetch()}
      page={page}
      title={t(`${key}.refunds.title`)}
      totalPages={refunds.data?.totalPages ?? 0}
    >
      {items.map((refund) => (
        <MoneyRow
          amount={format.money(refund.amount)}
          booking={labels.get(refund.bookingId)}
          bookingId={refund.bookingId}
          icon='currency_exchange'
          iconTone='refund'
          key={refund.id}
          meta={format.dateTime(refund.refundedAt ?? refund.createdAt)}
          status={
            <span className='flex flex-wrap items-center gap-2 sm:justify-end'>
              {refund.feeAmount > 0 ? (
                <span className='text-xs text-on-surface-variant tabular-nums'>
                  {t(`${key}.refunds.fee`, { amount: format.money(refund.feeAmount) })}
                </span>
              ) : null}
              {refund.channel === 'WALLET' ? (
                <StatusBadge tone='info'>{t('wallet.refundToWallet')}</StatusBadge>
              ) : null}
              <StatusBadge tone={REFUND_STATUS_TONES[refund.status]}>
                {t(`payment.refundStatus.${refund.status}`)}
              </StatusBadge>
            </span>
          }
          title={t(`payment.refundReason.${reasonKey(refund.reason)}`)}
        />
      ))}
    </PaymentListSection>
  )
}
