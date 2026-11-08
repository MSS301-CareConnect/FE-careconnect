import type { Route } from './+types/visit-detail'

import { CaregiverVisitDetailPage } from '~/features/caregiver/visits/caregiver-visit-detail-page'

export default function CaregiverVisitDetailRoute({ params }: Route.ComponentProps) {
  return <CaregiverVisitDetailPage id={params.id} />
}
