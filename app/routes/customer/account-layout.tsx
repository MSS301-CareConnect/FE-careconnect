import { Outlet } from 'react-router'

import { CustomerAccountShell } from '~/features/customer/layout/account-shell'

export default function CustomerAccountLayoutRoute() {
  return (
    <CustomerAccountShell>
      <Outlet />
    </CustomerAccountShell>
  )
}
