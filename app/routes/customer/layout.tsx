import { CustomerLayout } from '~/features/customer/layout/customer-layout'
import { PortalGuard } from '~/features/shared/auth/portal-guard'

export default function CustomerLayoutRoute() {
  return (
    <PortalGuard role='CUSTOMER'>
      <CustomerLayout />
    </PortalGuard>
  )
}
