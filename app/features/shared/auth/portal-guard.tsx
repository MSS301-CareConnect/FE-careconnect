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
      <main
        className='grid min-h-screen place-items-center bg-surface p-6 text-sm font-medium text-on-surface-variant'
        role='status'
      >
        {t('auth.loading')}
      </main>
    )
  }

  if (session.isError) {
    if (isForbiddenError(session.error)) {
      return (
        <main className='grid min-h-screen place-items-center bg-surface p-6'>
          <div className='max-w-md rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-8 text-center shadow-sm'>
            <h1 className='text-2xl font-bold text-on-surface'>{t('auth.forbiddenTitle')}</h1>
          </div>
        </main>
      )
    }
    return (
      <main className='grid min-h-screen place-items-center bg-surface p-6'>
        <div className='max-w-md rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-8 text-center shadow-sm'>
          <h1 className='text-2xl font-bold text-on-surface'>{t('auth.unavailableTitle')}</h1>
          <p className='mt-3 text-sm leading-6 text-on-surface-variant'>{t('auth.unavailableDescription')}</p>
          <button
            className='mt-5 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-container'
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
      <main className='grid min-h-screen place-items-center bg-surface p-6'>
        <div className='max-w-md rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-8 text-center shadow-sm'>
          <h1 className='text-2xl font-bold text-on-surface'>{t('auth.forbiddenTitle')}</h1>
          <p className='mt-3 text-sm leading-6 text-on-surface-variant'>{t('auth.forbiddenDescription')}</p>
          {homeForUser(session.data) && (
            <Link
              className='mt-5 inline-block rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-container'
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
