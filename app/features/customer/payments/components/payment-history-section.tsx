import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { formatDateTime, formatMoney } from '~/entities/booking/booking-format'
import { fetchPaymentHistory, paymentErrorKey, paymentKeys } from '~/entities/payment/payment-api'

import { PaymentListSection, bodyCell, headCell, tableClass } from './payments-ui'

/** The customer's own payments (deposit and remaining) with the amount refunded so far. */
export function PaymentHistorySection() {
  const { t, i18n } = useTranslation()
  const language = i18n.language
  const [page, setPage] = useState(0)
  const history = useQuery({
    queryKey: paymentKeys.history(page),
    queryFn: () => fetchPaymentHistory(page),
    retry: false
  })
  const items = history.data?.items ?? []
  return (
    <PaymentListSection
      emptyText={t('customer.payments.history.empty')}
      error={history.isError ? t(paymentErrorKey(history.error)) : null}
      id='payments-history'
      isEmpty={items.length === 0}
      isPending={history.isPending}
      onPageChange={setPage}
      page={page}
      title={t('customer.payments.history.title')}
      totalPages={history.data?.totalPages ?? 0}
    >
      <table className={tableClass}>
        <thead>
          <tr>
            <th className={headCell}>{t('customer.payments.columns.createdAt')}</th>
            <th className={headCell}>{t('customer.payments.columns.type')}</th>
            <th className={headCell}>{t('customer.payments.columns.amount')}</th>
            <th className={headCell}>{t('customer.payments.columns.refunded')}</th>
            <th className={headCell}>{t('customer.payments.columns.status')}</th>
            <th className={headCell}>{t('customer.payments.columns.booking')}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((payment) => (
            <tr key={payment.id}>
              <td className={`${bodyCell} tabular-nums`}>
                {payment.createdAt ? formatDateTime(payment.createdAt, language) : '—'}
              </td>
              <td className={bodyCell}>{t(`payment.type.${payment.paymentType}`)}</td>
              <td className={`${bodyCell} font-semibold tabular-nums`}>{formatMoney(payment.amount, language)}</td>
              <td className={`${bodyCell} tabular-nums`}>{formatMoney(payment.refundedAmount, language)}</td>
              <td className={bodyCell}>{t(`payment.status.${payment.status}`)}</td>
              <td className={bodyCell}>
                <Link
                  className='font-semibold text-[#075b31] hover:underline'
                  to={`/customer/bookings/${payment.bookingId}`}
                >
                  {t('customer.payments.viewBooking')}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </PaymentListSection>
  )
}
