import type { Route } from './+types/payment-failure'

import { PaymentResultPage } from '~/features/customer/payment/payment-result-page'

export default function CustomerPaymentFailureRoute({ params }: Route.ComponentProps) {
  return <PaymentResultPage key='failure' outcome='failure' paymentId={params.paymentId} />
}
