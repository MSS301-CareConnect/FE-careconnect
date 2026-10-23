import { useQuery } from '@tanstack/react-query'

import { CustomerLayout } from '~/features/customer/layout/customer-layout'
import { AuthUserContext } from '~/features/shared/auth/auth-user-context'
import { loadSession, sessionQueryKey } from '~/features/shared/auth/session-api'

export default function CustomerBrowseLayoutRoute() {
  const session = useQuery({ queryKey: sessionQueryKey, queryFn: loadSession, retry: false, staleTime: 30_000 })
  const customer = session.data?.status === 'ACTIVE' && session.data.roles?.includes('CUSTOMER') ? session.data : null

  return (
    <AuthUserContext value={customer}>
      <CustomerLayout audience={customer ? 'customer' : 'public'} />
    </AuthUserContext>
  )
}
