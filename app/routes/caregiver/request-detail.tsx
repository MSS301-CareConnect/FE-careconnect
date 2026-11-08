import type { Route } from './+types/request-detail'

import { CaregiverRequestDetailPage } from '~/features/caregiver/requests/caregiver-request-detail-page'

export default function CaregiverRequestDetailRoute({ params }: Route.ComponentProps) {
  return <CaregiverRequestDetailPage id={params.id} />
}
