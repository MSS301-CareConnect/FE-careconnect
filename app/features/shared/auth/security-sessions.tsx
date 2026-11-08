import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import type { SessionRecord } from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'
import { ConfirmDialog } from '~/shared/ui/modal'
import { StatusBadge } from '~/shared/ui/status-badge'

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
  const [pendingSession, setPendingSession] = useState<SessionRecord | null>(null)
  const sessions = useQuery({ queryKey: webSessionsQueryKey, queryFn: fetchWebSessions, retry: false })
  const revoke = useMutation({
    mutationFn: (session: SessionRecord) => revokeSession(session.sessionId),
    onSuccess: async (_, session) => {
      setPendingSession(null)
      if (session.isCurrent) {
        window.location.replace('/login')
        return
      }
      setMessage(t('auth.security.sessionRevoked'))
      await queryClient.invalidateQueries({ queryKey: webSessionsQueryKey })
    },
    onError: () => {
      setPendingSession(null)
      setMessage(t('auth.security.sessionRevokeError'))
    }
  })

  const pendingDeviceName = pendingSession?.userAgent || pendingSession?.deviceId || t('auth.security.unknownDevice')

  return (
    <section
      aria-labelledby='web-sessions-title'
      className='space-y-4 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-6 shadow-xs'
    >
      <div className='flex items-center gap-2.5'>
        <span className='grid h-9 w-9 place-items-center rounded-xl bg-primary-fixed/60 text-primary'>
          <Icon className='text-lg' name='devices' />
        </span>
        <h2 className='text-lg font-bold text-on-surface' id='web-sessions-title'>
          {t('auth.security.sessionsTitle')}
        </h2>
      </div>
      {sessions.isPending ? (
        <p className='text-sm text-on-surface-variant' role='status'>
          {t('auth.security.sessionsLoading')}
        </p>
      ) : null}
      {sessions.isError ? (
        <div
          className='rounded-xl border border-error/25 bg-error-container p-4 text-sm text-on-error-container'
          role='alert'
        >
          <p className='font-medium'>{t('auth.security.sessionsError')}</p>
          <button
            className='mt-2 font-semibold text-primary underline'
            onClick={() => void sessions.refetch()}
            type='button'
          >
            {t('auth.security.sessionsRetry')}
          </button>
        </div>
      ) : null}
      {sessions.isSuccess && sessions.data.length === 0 ? (
        <p className='text-sm text-on-surface-variant'>{t('auth.security.sessionsEmpty')}</p>
      ) : null}
      {sessions.isSuccess && sessions.data.length > 0 ? (
        <ul className='divide-y divide-outline-variant/40'>
          {sessions.data.map((session) => {
            const name = session.userAgent || session.deviceId || t('auth.security.unknownDevice')
            const activeAt = lastSeen(session.lastActiveAt, i18n.language)
            return (
              <li
                className='flex flex-col justify-between gap-3 py-4 first:pt-1 last:pb-0 sm:flex-row sm:items-center'
                key={session.sessionId}
              >
                <div className='min-w-0 space-y-1'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <p className='min-w-0 break-words text-sm font-semibold text-on-surface'>{name}</p>
                    {session.isCurrent ? (
                      <StatusBadge dot={false} tone='success'>
                        {t('auth.security.currentSession')}
                      </StatusBadge>
                    ) : null}
                  </div>
                  {session.ip ? (
                    <p className='text-xs text-on-surface-variant tabular-nums'>
                      {t('auth.security.sessionIp', { ip: session.ip })}
                    </p>
                  ) : null}
                  {activeAt ? (
                    <p className='text-xs text-on-surface-variant tabular-nums'>
                      {t('auth.security.sessionLastActive', { date: activeAt })}
                    </p>
                  ) : null}
                </div>
                <button
                  className='inline-flex min-h-9 shrink-0 items-center justify-center rounded-xl border border-error/40 bg-surface-container-lowest px-3.5 py-1.5 text-xs font-semibold text-error transition-colors hover:bg-error-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error disabled:opacity-50'
                  disabled={revoke.isPending}
                  onClick={() => setPendingSession(session)}
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
      {message ? (
        <p
          className='rounded-xl bg-surface-container-low px-3.5 py-2.5 text-sm font-medium text-on-surface'
          role='status'
        >
          {message}
        </p>
      ) : null}
      <ConfirmDialog
        confirmLabel={pendingSession?.isCurrent ? t('auth.security.signOutCurrent') : t('auth.security.revokeSession')}
        loading={revoke.isPending}
        onClose={() => setPendingSession(null)}
        onConfirm={() => {
          if (!pendingSession) return
          setMessage('')
          revoke.mutate(pendingSession)
        }}
        open={Boolean(pendingSession)}
        title={t('auth.security.confirmRevokeSession', { device: pendingDeviceName })}
        tone='danger'
      />
    </section>
  )
}
