import { AdminCaregiverProfilePage } from '~/features/admin/caregiver-queue/admin-caregiver-profile-page'

import type { Route } from './+types/caregiver-detail'

export default function AdminCaregiverDetailRoute({ params }: Route.ComponentProps) {
  return <AdminCaregiverProfilePage id={params.id} />
}
