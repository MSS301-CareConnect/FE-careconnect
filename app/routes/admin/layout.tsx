import { AdminLayout } from '~/features/admin/layout/admin-layout'
import { PortalGuard } from '~/features/shared/auth/portal-guard'

export default function AdminLayoutRoute() {
  return (
    <PortalGuard role='ADMIN'>
      <AdminLayout />
    </PortalGuard>
  )
}
