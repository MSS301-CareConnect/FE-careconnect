import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import type { SessionRecord } from '~/shared/api/generated/contracts'

import { fetchWebSessions, revokeSession } from './security-api'

const webSessionsQueryKey = ['auth', 'web-sessions'] as const

function lastSeen(value: string | null | undefined, language: string): string | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat(language, { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

export function SecuritySessions() {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const [message, setMessage] = useState('')
  const sessions = useQuery({ queryKey: webSessionsQueryKey, queryFn: fetchWebSessions, retry: false })
  const revoke = useMutation({
    mutationFn: (session: SessionRecord) => revokeSession(session.sessionId),
    onSuccess: async (_, session) => {
      if (session.isCurrent) {
        window.location.replace('/login')
        return
      }
      setMessage(t('auth.security.sessionRevoked'))
      await queryClient.invalidateQueries({ queryKey: webSessionsQueryKey })
    },
    onError: () => setMessage(t('auth.security.sessionRevokeError'))
  })

  return (
    <section
      aria-labelledby='web-sessions-title'
      className='space-y-4 rounded-xl border border-outline-variant bg-white p-5'
    >
      <h2 className='text-lg font-semibold' id='web-sessions-title'>
        {t('auth.security.sessionsTitle')}
      </h2>
      {sessions.isPending ? <p role='status'>{t('auth.security.sessionsLoading')}</p> : null}
      {sessions.isError ? (
        <div role='alert'>
          <p>{t('auth.security.sessionsError')}</p>
          <button className='mt-2 text-primary underline' onClick={() => void sessions.refetch()} type='button'>
            {t('auth.security.sessionsRetry')}
          </button>
        </div>
      ) : null}
      {sessions.isSuccess && sessions.data.length === 0 ? <p>{t('auth.security.sessionsEmpty')}</p> : null}
      {sessions.isSuccess && sessions.data.length > 0 ? (
        <ul className='divide-y divide-outline-variant'>
          {sessions.data.map((session) => {
            const name = session.userAgent || session.deviceId || t('auth.security.unknownDevice')
            const activeAt = lastSeen(session.lastActiveAt, i18n.language)
            return (
              <li className='space-y-2 py-4 first:pt-0 last:pb-0' key={session.sessionId}>
                <div className='flex flex-wrap items-center gap-2'>
                  <p className='min-w-0 break-words font-medium'>{name}</p>
                  {session.isCurrent ? (
                    <span className='rounded-full bg-primary-container px-2 py-1 text-xs text-on-primary-container'>
                      {t('auth.security.currentSession')}
                    </span>
                  ) : null}
                </div>
                {session.ip ? (
                  <p className='text-sm text-on-surface-variant'>{t('auth.security.sessionIp', { ip: session.ip })}</p>
                ) : null}
                {activeAt ? (
                  <p className='text-sm text-on-surface-variant'>
                    {t('auth.security.sessionLastActive', { date: activeAt })}
                  </p>
                ) : null}
                <button
                  className='rounded-lg border border-error px-3 py-1.5 text-sm font-semibold text-error disabled:opacity-50'
                  disabled={revoke.isPending}
                  onClick={() => {
                    if (window.confirm(t('auth.security.confirmRevokeSession', { device: name }))) {
                      setMessage('')
                      revoke.mutate(session)
                    }
                  }}
                  type='button'
                >
                  {revoke.isPending && revoke.variables?.sessionId === session.sessionId
                    ? t('auth.security.processing')
                    : session.isCurrent
                      ? t('auth.security.signOutCurrent')
                      : t('auth.security.revokeSession')}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
      {message ? <p role='status'>{message}</p> : null}
    </section>
  )
}
