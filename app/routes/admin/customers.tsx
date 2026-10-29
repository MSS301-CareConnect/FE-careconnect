import { Navigate } from 'react-router'

// M-13: customers are real Identity accounts; the former illustrative customer snapshot was removed.
export default function AdminCustomersRoute() {
  return <Navigate replace to='/admin/accounts?role=CUSTOMER' />
}
