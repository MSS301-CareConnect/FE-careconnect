import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'

import { fetchOutstandingDebt, paymentErrorKey, paymentKeys } from '~/entities/payment/payment-api'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'
import { CustomerPageHeader } from '~/features/customer/ui/customer-page-header'
import { Tabs, tabId, tabPanelId } from '~/shared/ui/tabs'

import { DueSection } from './components/due-section'
import { InvoiceSection } from './components/invoice-section'
import { PaymentHistorySection } from './components/payment-history-section'
import { RefundHistorySection } from './components/refund-history-section'
import { useBookingLabels } from './hooks/use-booking-labels'

const key = 'customer.payments' as const
const TABS = ['due', 'history', 'refunds'] as const
type PaymentsTab = (typeof TABS)[number]
const TABS_ID = 'customer-payments'

/**
 * Customer money overview in three tabs (PAY-16): what is still to pay (deposits and open remaining-balance
 * invoices), the payment and invoice history, and refunds. The tab lives in `?tab=`.
 */
export function PaymentsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t(`${key}.documentTitle`))
  const [params, setParams] = useSearchParams()
  const tab = TABS.find((item) => item === params.get('tab')) ?? 'due'
  const { bookings, labels } = useBookingLabels()
  const outstanding = useQuery({ queryKey: paymentKeys.outstanding, queryFn: fetchOutstandingDebt, retry: false })

  const deposits = (bookings.data?.items ?? []).filter((booking) => booking.status === 'AWAITING_INITIAL_PAYMENT')
  const openInvoices = [...(outstanding.data?.overdueInvoices ?? []), ...(outstanding.data?.pendingInvoices ?? [])]
  const dueReady = bookings.isSuccess && outstanding.isSuccess
  const dueCount = dueReady ? deposits.length + openInvoices.length : undefined
  const dueError = outstanding.isError
    ? t(paymentErrorKey(outstanding.error))
    : bookings.isError
      ? t(`${key}.due.bookingsError`)
      : null

  function selectTab(value: PaymentsTab) {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        if (value === 'due') next.delete('tab')
        else next.set('tab', value)
        return next
      },
      { replace: true }
    )
  }

  return (
    <div>
      <CustomerPageHeader description={t(`${key}.subtitle`)} title={t(`${key}.title`)} />

      {outstanding.data?.hasDebt ? (
        <div
          className='mb-5 flex items-start gap-3 rounded-2xl border border-error/30 bg-error-container p-4 text-sm text-on-error-container'
          role='alert'
        >
          <Icon className='mt-0.5 shrink-0 text-xl' name='error' />
          <p className='font-medium'>{t(`${key}.invoices.debt`)}</p>
        </div>
      ) : null}

      <Tabs
        idBase={TABS_ID}
        items={TABS.map((value) => ({
          value,
          label: t(`${key}.tabs.${value}`),
          badge: value === 'due' ? dueCount : undefined,
          badgeTone: 'attention'
        }))}
        label={t(`${key}.tabs.label`)}
        onChange={selectTab}
        value={tab}
      />

      <div
        aria-labelledby={tabId(TABS_ID, tab)}
        className='cc-fade-up mt-6 flex flex-col gap-10'
        id={tabPanelId(TABS_ID)}
        key={tab}
        role='tabpanel'
      >
        {tab === 'due' ? (
          <DueSection
            deposits={deposits}
            error={dueError}
            invoices={openInvoices}
            isPending={!dueReady && !dueError}
            labels={labels}
            onRetry={() => {
              void outstanding.refetch()
              void bookings.refetch()
            }}
          />
        ) : null}
        {tab === 'history' ? (
          <>
            <PaymentHistorySection labels={labels} />
            <InvoiceSection labels={labels} />
          </>
        ) : null}
        {tab === 'refunds' ? <RefundHistorySection labels={labels} /> : null}
      </div>
    </div>
  )
}
