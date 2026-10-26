import { useQuery } from '@tanstack/react-query'

import type { Route } from './+types/home'
import { CustomerLayout } from '~/features/customer/layout/customer-layout'
import { HomePage } from '~/features/home/home-page'
import { AuthUserContext } from '~/features/shared/auth/auth-user-context'
import { loadSession, sessionQueryKey } from '~/features/shared/auth/session-api'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'CareConnect' }]
}

export default function Home() {
  const session = useQuery({ queryKey: sessionQueryKey, queryFn: loadSession, retry: false, staleTime: 30_000 })
  const customer = session.data?.status === 'ACTIVE' && session.data.roles?.includes('CUSTOMER') ? session.data : null

  return (
    <AuthUserContext value={customer}>
      <CustomerLayout audience={customer ? 'customer' : 'public'}>
        <HomePage audience={customer ? 'customer' : 'public'} />
      </CustomerLayout>
    </AuthUserContext>
  )
}
