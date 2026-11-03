import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { fetchRemainingInvoices, paymentErrorKey, paymentKeys } from '~/entities/payment/payment-api'
import { useFormat } from '~/shared/lib/format'
import { StatusBadge } from '~/shared/ui/status-badge'

import type { BookingLabel } from '../hooks/use-booking-labels'
import { INVOICE_STATUS_TONES, MoneyRow, PaymentListSection } from './payments-ui'

const key = 'customer.payments' as const

/** Every remaining-balance invoice of the customer, open or closed; open ones are paid from "To pay". */
export function InvoiceSection({ labels }: { labels: ReadonlyMap<string, BookingLabel> }) {
  const { t } = useTranslation()
  const format = useFormat()
  const [page, setPage] = useState(0)
  const invoices = useQuery({
    queryKey: paymentKeys.invoices(page),
    queryFn: () => fetchRemainingInvoices(page),
    retry: false
  })
  const items = invoices.data?.items ?? []
  return (
    <PaymentListSection
      description={t(`${key}.invoices.description`)}
      empty={{ icon: 'receipt_long', title: t(`${key}.invoices.empty`) }}
      error={invoices.isError ? t(paymentErrorKey(invoices.error)) : null}
      id='payments-invoices'
      isEmpty={items.length === 0}
      isPending={invoices.isPending}
      onPageChange={setPage}
      onRetry={() => void invoices.refetch()}
      page={page}
      title={t(`${key}.invoices.title`)}
      totalPages={invoices.data?.totalPages ?? 0}
    >
      {items.map((invoice) => (
        <MoneyRow
          amount={format.money(invoice.amount)}
          booking={labels.get(invoice.bookingId)}
          bookingId={invoice.bookingId}
          icon='receipt_long'
          key={invoice.id}
          meta={
            invoice.paidAt
              ? t(`${key}.invoices.paidAt`, { time: format.dateTime(invoice.paidAt) })
              : t(`${key}.due.dueAt`, { time: format.dateTime(invoice.dueAt) })
          }
          status={
            <StatusBadge tone={INVOICE_STATUS_TONES[invoice.status]}>
              {t(`payment.invoiceStatus.${invoice.status}`)}
            </StatusBadge>
          }
          title={t('payment.type.REMAINING')}
        />
      ))}
    </PaymentListSection>
  )
}
