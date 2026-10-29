import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { formatDateTime, formatMoney } from '~/entities/booking/booking-format'
import {
  fetchOutstandingDebt,
  fetchRemainingInvoices,
  paymentErrorKey,
  paymentKeys,
  redirectToCheckout,
  startInvoiceCheckout
} from '~/entities/payment/payment-api'

import { PaymentListSection, bodyCell, headCell, tableClass } from './payments-ui'

const OPEN = new Set(['PENDING', 'OVERDUE'])

/** Remaining-balance invoices; an overdue one is a debt that blocks new bookings until paid. */
export function InvoiceSection() {
  const { t, i18n } = useTranslation()
  const language = i18n.language
  const [page, setPage] = useState(0)
  const outstanding = useQuery({ queryKey: paymentKeys.outstanding, queryFn: fetchOutstandingDebt, retry: false })
  const invoices = useQuery({
    queryKey: paymentKeys.invoices(page),
    queryFn: () => fetchRemainingInvoices(page),
    retry: false
  })
  const pay = useMutation({
    mutationFn: startInvoiceCheckout,
    onSuccess: (checkout) => redirectToCheckout(checkout.checkoutUrl)
  })
  const items = invoices.data?.items ?? []
  return (
    <div className='flex flex-col gap-4'>
      {outstanding.data?.hasDebt ? (
        <p
          className='rounded-xl border border-[#f2c6c0] bg-[#fdecea] p-4 text-sm font-semibold text-[#93000a]'
          role='alert'
        >
          {t('customer.payments.invoices.debt')}
        </p>
      ) : null}
      {pay.isError ? (
        <p className='rounded-xl bg-[#fdecea] p-3 text-sm text-[#93000a]' role='alert'>
          {t(paymentErrorKey(pay.error))}
        </p>
      ) : null}
      <PaymentListSection
        emptyText={t('customer.payments.invoices.empty')}
        error={invoices.isError ? t(paymentErrorKey(invoices.error)) : null}
        id='payments-invoices'
        isEmpty={items.length === 0}
        isPending={invoices.isPending}
        onPageChange={setPage}
        page={page}
        title={t('customer.payments.invoices.title')}
        totalPages={invoices.data?.totalPages ?? 0}
      >
        <table className={tableClass}>
          <thead>
            <tr>
              <th className={headCell}>{t('customer.payments.columns.booking')}</th>
              <th className={headCell}>{t('customer.payments.columns.amount')}</th>
              <th className={headCell}>{t('customer.payments.columns.dueAt')}</th>
              <th className={headCell}>{t('customer.payments.columns.status')}</th>
              <th className={headCell}>
                <span className='sr-only'>{t('customer.payments.columns.action')}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((invoice) => (
              <tr key={invoice.id}>
                <td className={bodyCell}>
                  <Link
                    className='font-semibold text-[#075b31] hover:underline'
                    to={`/customer/bookings/${invoice.bookingId}`}
                  >
                    {t('customer.payments.viewBooking')}
                  </Link>
                </td>
                <td className={`${bodyCell} font-semibold tabular-nums`}>{formatMoney(invoice.amount, language)}</td>
                <td className={`${bodyCell} tabular-nums`}>{formatDateTime(invoice.dueAt, language)}</td>
                <td className={bodyCell}>{t(`payment.invoiceStatus.${invoice.status}`)}</td>
                <td className={`${bodyCell} text-right`}>
                  {OPEN.has(invoice.status) ? (
                    <button
                      className='rounded-lg bg-[#075b31] px-4 py-2 text-sm font-bold text-white hover:bg-[#064a29] disabled:bg-[#9fb5a4]'
                      disabled={pay.isPending}
                      onClick={() => pay.mutate(invoice.id)}
                      type='button'
                    >
                      {t('customer.payments.invoices.pay')}
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </PaymentListSection>
    </div>
  )
}
