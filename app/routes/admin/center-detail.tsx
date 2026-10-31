import { CenterDetailPage } from '~/features/admin/centers/center-detail-page'

import type { Route } from './+types/center-detail'

export default function AdminCenterDetailRoute({ params }: Route.ComponentProps) {
  return <CenterDetailPage id={params.id} key={params.id} />
}
