import { AdminBookingDetailPage } from '~/features/admin/bookings/admin-booking-detail-page'

import type { Route } from './+types/booking-detail'

export default function AdminBookingDetailRoute({ params }: Route.ComponentProps) {
  return <AdminBookingDetailPage id={params.id} />
}
