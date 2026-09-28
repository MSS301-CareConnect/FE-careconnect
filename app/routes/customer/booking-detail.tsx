import type { Route } from './+types/booking-detail'

import { CustomerBookingDetailPage } from '~/features/customer/bookings/booking-detail-page'

export default function CustomerBookingDetailRoute({ params }: Route.ComponentProps) {
  return <CustomerBookingDetailPage code={params.code} />
}
