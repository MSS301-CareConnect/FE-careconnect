import { ProviderSchedulePage } from '~/entities/provider/provider-schedule-page'
import { useAuthUser } from '~/features/shared/auth/auth-user-context'

export default function ManagerSchedulesRoute() {
  const centerId = useAuthUser()?.centerId ?? ''
  return <ProviderSchedulePage centerId={centerId} />
}
