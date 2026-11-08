import { CenterManagerLayout } from '~/features/center-manager/layout/center-manager-layout'
import { PortalGuard } from '~/features/shared/auth/portal-guard'
export default function CenterManagerLayoutRoute() {
  return (
    <PortalGuard role='CENTER_MANAGER'>
      <CenterManagerLayout />
    </PortalGuard>
  )
}
