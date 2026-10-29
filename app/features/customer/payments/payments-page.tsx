import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { useDocumentTitle } from '~/shared/lib/use-document-title'

import { InvoiceSection } from './components/invoice-section'
import { PaymentHistorySection } from './components/payment-history-section'
import { RefundHistorySection } from './components/refund-history-section'

/** Customer money overview: open remaining invoices (debt), payment history and refund history (PAY-16). */
export function PaymentsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('customer.payments.documentTitle'))
  return (
    <div className='flex w-full flex-1 flex-col bg-surface text-on-surface'>
      <section className='border-b border-outline-variant/60 bg-surface-container-low'>
        <div className='mx-auto w-full max-w-[1440px] px-5 pt-6 pb-8 sm:px-8 lg:px-12 lg:pt-8 lg:pb-10'>
          <nav aria-label={t('customer.payments.breadcrumb')} className='text-sm text-on-surface-variant'>
            <Link className='hover:text-primary' to='/customer'>
              {t('customer.payments.home')}
            </Link>
          </nav>
          <h1 className='mt-4 text-3xl font-extrabold tracking-[-0.045em] sm:text-4xl'>
            {t('customer.payments.title')}
          </h1>
          <p className='mt-3 max-w-2xl text-base leading-7 text-on-surface-variant'>
            {t('customer.payments.subtitle')}
          </p>
        </div>
      </section>
      <div className='mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-5 py-10 sm:px-8 lg:px-12 lg:py-12'>
        <InvoiceSection />
        <PaymentHistorySection />
        <RefundHistorySection />
      </div>
    </div>
  )
}
