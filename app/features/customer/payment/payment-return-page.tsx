import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useSearchParams } from 'react-router'

import { paymentErrorKey, paymentKeys, verifyReturn } from '~/entities/payment/payment-api'
import { useDocumentTitle } from '~/shared/lib/use-document-title'

import { PaymentShell, paymentPanel, secondaryAction } from './components/payment-shell'

const VNPAY_SUCCESS = '00'

/**
 * VNPay sends the browser here (VNPAY_RETURN_URL). PaymentService verifies the signed query and names the payment;
 * the result page then polls it because the IPN, not this redirect, records the money.
 */
export function PaymentReturnPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const params = Object.fromEntries(searchParams.entries())
  const query = searchParams.toString()
  useDocumentTitle(t('customer.payment.return.documentTitle'))
  const verification = useQuery({
    queryKey: paymentKeys.vnPayReturn(query),
    queryFn: () => verifyReturn(Object.fromEntries(new URLSearchParams(query).entries())),
    enabled: query.length > 0,
    retry: false,
    staleTime: Infinity
  })

  if (verification.data) {
    const outcome = params.vnp_ResponseCode === VNPAY_SUCCESS ? 'success' : 'failure'
    return <Navigate replace to={`/customer/payments/${verification.data.paymentId}/${outcome}`} />
  }
  return (
    <PaymentShell
      crumb={t('customer.payment.return.title')}
      subtitle={t('customer.payment.return.subtitle')}
      title={t('customer.payment.return.title')}
    >
      <section className={`${paymentPanel} mx-auto flex max-w-2xl flex-col items-start gap-4`}>
        {verification.isError || query.length === 0 ? (
          <>
            <p className='text-sm text-[#93000a]' role='alert'>
              {query.length === 0 ? t('customer.payment.return.missing') : t(paymentErrorKey(verification.error))}
            </p>
            <Link className={secondaryAction} to='/customer/payments'>
              {t('customer.payment.return.toPayments')}
            </Link>
          </>
        ) : (
          <p className='text-sm text-[#637469]' role='status'>
            {t('customer.payment.return.verifying')}
          </p>
        )}
      </section>
    </PaymentShell>
  )
}
