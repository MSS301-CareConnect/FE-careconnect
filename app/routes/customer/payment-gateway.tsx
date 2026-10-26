import type { Route } from './+types/payment-gateway'

import { PaymentGatewayPage } from '~/features/customer/payment/payment-gateway-page'

export default function CustomerPaymentGatewayRoute({ params }: Route.ComponentProps) {
  return <PaymentGatewayPage paymentId={params.paymentId} />
}
