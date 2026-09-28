import type { Route } from './+types/care-report'
import { CustomerCareReportPage } from '~/features/customer/bookings/care-report-page'

export default function CustomerCareReportRoute({ params }: Route.ComponentProps) {
  return <CustomerCareReportPage code={params.code} />
}
