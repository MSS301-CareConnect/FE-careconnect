import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useLocation } from 'react-router'
import type { ReactNode } from 'react'

import { isForbiddenError, loadSession, sessionQueryKey } from './session-api'
import { homeForUser, type PortalRole } from './role-path'
import { AuthUserContext } from './auth-user-context'

export function PortalGuard({ children, role }: { children: ReactNode; role: PortalRole }) {
  const { t } = useTranslation()
  const location = useLocation()
  const session = useQuery({ queryKey: sessionQueryKey, queryFn: loadSession, retry: false, staleTime: 30_000 })

  if (session.isPending) {
    return (
      <main className='grid min-h-screen place-items-center p-6' role='status'>
        {t('auth.loading')}
      </main>
    )
  }

  if (session.isError) {
    if (isForbiddenError(session.error)) {
      return (
        <main className='grid min-h-screen place-items-center p-6'>
          <h1 className='text-2xl font-bold'>{t('auth.forbiddenTitle')}</h1>
        </main>
      )
    }
    return (
      <main className='grid min-h-screen place-items-center p-6'>
        <div className='max-w-md text-center'>
          <h1 className='text-2xl font-bold'>{t('auth.unavailableTitle')}</h1>
          <p className='mt-3 text-on-surface-variant'>{t('auth.unavailableDescription')}</p>
          <button
            className='mt-5 rounded-xl bg-primary px-5 py-3 font-semibold text-white'
            onClick={() => void session.refetch()}
            type='button'
          >
            {t('auth.retry')}
          </button>
        </div>
      </main>
    )
  }

  if (!session.data) {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate replace to={`/login?next=${next}`} />
  }

  if (session.data.status !== 'ACTIVE' || !session.data.roles?.includes(role)) {
    return (
      <main className='grid min-h-screen place-items-center p-6'>
        <div className='max-w-md text-center'>
          <h1 className='text-2xl font-bold'>{t('auth.forbiddenTitle')}</h1>
          <p className='mt-3 text-on-surface-variant'>{t('auth.forbiddenDescription')}</p>
          {homeForUser(session.data) && (
            <Link
              className='mt-5 inline-block rounded-xl bg-primary px-5 py-3 font-semibold text-white'
              to={homeForUser(session.data)!}
            >
              {t('auth.goToMyPortal')}
            </Link>
          )}
        </div>
      </main>
    )
  }

  return <AuthUserContext value={session.data}>{children}</AuthUserContext>
}
