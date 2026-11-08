import { Navigate } from 'react-router'

import type { Route } from './+types/customer-detail'

// M-13: a customer's page is their Identity account.
export default function AdminCustomerDetailRoute({ params }: Route.ComponentProps) {
  return <Navigate replace to={`/admin/accounts/${params.id}`} />
}
