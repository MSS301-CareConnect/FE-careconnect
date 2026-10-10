import { CaregiverLayout } from '~/features/caregiver/layout/caregiver-layout'
import { PortalGuard } from '~/features/shared/auth/portal-guard'

export default function CaregiverLayoutRoute() {
  return (
    <PortalGuard role='CAREGIVER'>
      <CaregiverLayout />
    </PortalGuard>
  )
}
