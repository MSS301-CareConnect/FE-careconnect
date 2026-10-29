import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { formatDateTime, formatMoney } from '~/entities/booking/booking-format'
import { fetchRefundHistory, paymentErrorKey, paymentKeys } from '~/entities/payment/payment-api'

import { PaymentListSection, bodyCell, headCell, tableClass } from './payments-ui'

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
export function RefundHistorySection() {
  const { t, i18n } = useTranslation()
  const language = i18n.language
  const [page, setPage] = useState(0)
  const refunds = useQuery({
    queryKey: paymentKeys.refunds(page),
    queryFn: () => fetchRefundHistory(page),
    retry: false
  })
  const items = refunds.data?.items ?? []
  return (
    <PaymentListSection
      emptyText={t('customer.payments.refunds.empty')}
      error={refunds.isError ? t(paymentErrorKey(refunds.error)) : null}
      id='payments-refunds'
      isEmpty={items.length === 0}
      isPending={refunds.isPending}
      onPageChange={setPage}
      page={page}
      title={t('customer.payments.refunds.title')}
      totalPages={refunds.data?.totalPages ?? 0}
    >
      <table className={tableClass}>
        <thead>
          <tr>
            <th className={headCell}>{t('customer.payments.columns.createdAt')}</th>
            <th className={headCell}>{t('customer.payments.columns.reason')}</th>
            <th className={headCell}>{t('customer.payments.columns.amount')}</th>
            <th className={headCell}>{t('customer.payments.columns.fee')}</th>
            <th className={headCell}>{t('customer.payments.columns.status')}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((refund) => (
            <tr key={refund.id}>
              <td className={`${bodyCell} tabular-nums`}>
                {refund.createdAt ? formatDateTime(refund.createdAt, language) : '—'}
              </td>
              <td className={bodyCell}>{t(`payment.refundReason.${reasonKey(refund.reason)}`)}</td>
              <td className={`${bodyCell} font-semibold tabular-nums`}>{formatMoney(refund.amount, language)}</td>
              <td className={`${bodyCell} tabular-nums`}>{formatMoney(refund.feeAmount, language)}</td>
              <td className={bodyCell}>{t(`payment.refundStatus.${refund.status}`)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </PaymentListSection>
  )
}
