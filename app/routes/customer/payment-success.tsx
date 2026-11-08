import type { Route } from './+types/payment-success'

import { PaymentResultPage } from '~/features/customer/payment/payment-result-page'

export default function CustomerPaymentSuccessRoute({ params }: Route.ComponentProps) {
  return <PaymentResultPage key='success' outcome='success' paymentId={params.paymentId} />
}
