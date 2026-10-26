import type { Route } from './+types/booking-payment'

import { DepositPage } from '~/features/customer/payment/deposit-page'

export default function CustomerBookingPaymentRoute({ params }: Route.ComponentProps) {
  return <DepositPage bookingId={params.id} />
}
