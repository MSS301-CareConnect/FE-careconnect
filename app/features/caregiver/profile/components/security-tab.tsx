import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { toastError, toastSuccess } from '~/shared/ui/app-toast'

import { validPassword } from '~/entities/identity/password-rules'
import { PasswordField } from '~/features/shared/auth/password-field'
import { changePassword, fetchWebSessions, revokeSession } from '~/features/shared/auth/security-api'
import { apiRequestErrorKey } from '~/shared/api/error-details'
import type { SessionRecord } from '~/shared/api/generated/contracts'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'
import { ConfirmDialog } from '~/shared/ui/modal'
import { Skeleton, SkeletonGroup } from '~/shared/ui/skeleton'
import { StatusBadge } from '~/shared/ui/status-badge'

import { useCaregiverFormat } from '../../ui/caregiver-format'
import { CaregiverError, cgCard } from '../../ui/caregiver-page'
import { parseUserAgent } from '~/shared/lib/user-agent'

/** Same cache key as the shared security screen so both stay in step. */
const SESSIONS_KEY = ['auth', 'web-sessions'] as const
const SHOWN = 5

const RULES = [
  { key: 'length', test: (value: string) => value.length >= 8 },
  { key: 'lower', test: (value: string) => /[a-z]/.test(value) },
  { key: 'upper', test: (value: string) => /[A-Z]/.test(value) },
  { key: 'digit', test: (value: string) => /[0-9]/.test(value) },
  { key: 'symbol', test: (value: string) => /[^A-Za-z0-9]/.test(value) }
] as const
const STRENGTH = ['weak', 'weak', 'fair', 'good', 'good', 'strong'] as const
const STRENGTH_COLOR = { weak: 'bg-error', fair: 'bg-warning', good: 'bg-brand-400', strong: 'bg-primary' } as const

function PasswordCard() {
  const { t } = useTranslation()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const change = useMutation({
    mutationFn: () => changePassword({ currentPassword: current, newPassword: next }),
    onSuccess: () => window.location.replace('/login')
  })
  const passed = RULES.filter((rule) => rule.test(next)).length
  const strength = STRENGTH[next ? passed : 0]
  const mismatch = confirm !== '' && confirm !== next

  function submit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    if (!current || !validPassword(next) || next !== confirm) return
    change.mutate()
  }

  return (
    <section aria-labelledby='password-title' className={`${cgCard} p-4 sm:p-5`}>
      <h2 className='text-base font-semibold text-on-surface' id='password-title'>
        {t('caregiver.me.security.passwordTitle')}
      </h2>
      <p className='mt-0.5 text-sm text-on-surface-variant'>{t('caregiver.me.security.passwordHint')}</p>
      <form className='mt-4 flex flex-col gap-4' noValidate onSubmit={submit}>
        <PasswordField
          autoComplete='current-password'
          id='caregiver-current-password'
          label={t('caregiver.me.security.current')}
          onChange={setCurrent}
          value={current}
        />
        <div>
          <PasswordField
            autoComplete='new-password'
            id='caregiver-new-password'
            label={t('caregiver.me.security.next')}
            onChange={setNext}
            value={next}
          />
          <div aria-live='polite' className='mt-2'>
            <div className='flex items-center gap-2'>
              <div aria-hidden='true' className='grid flex-1 grid-cols-5 gap-1'>
                {RULES.map((rule, index) => (
                  <span
                    className={`h-1.5 rounded-full transition-colors duration-200 ${next && index < passed ? STRENGTH_COLOR[strength] : 'bg-surface-container-high'}`}
                    key={rule.key}
                  />
                ))}
              </div>
              <span className='w-24 text-right text-xs font-semibold text-on-surface-variant'>
                {next
                  ? `${t('caregiver.me.security.strength.label')}: ${t(`caregiver.me.security.strength.${strength}`)}`
                  : ''}
              </span>
            </div>
            <ul className='mt-2 grid gap-1 text-sm sm:grid-cols-2'>
              {RULES.map((rule) => {
                const ok = rule.test(next)
                return (
                  <li
                    className={`flex items-center gap-1.5 ${ok ? 'text-success' : 'text-on-surface-variant'}`}
                    key={rule.key}
                  >
                    <Icon className='text-base' filled={ok} name={ok ? 'check_circle' : 'radio_button_unchecked'} />
                    {t(`caregiver.me.security.rules.${rule.key}`)}
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
        <div>
          <PasswordField
            autoComplete='new-password'
            id='caregiver-confirm-password'
            label={t('caregiver.me.security.confirm')}
            onChange={setConfirm}
            value={confirm}
          />
          {mismatch ? <p className='mt-1 text-sm text-error'>{t('caregiver.me.security.mismatch')}</p> : null}
        </div>
        {submitted && next && !validPassword(next) ? (
          <p className='text-sm text-error' role='alert'>
            {t('caregiver.me.security.invalid')}
          </p>
        ) : null}
        {change.isError ? (
          <p className='rounded-lg bg-error-container p-3 text-sm text-on-error-container' role='alert'>
            {t(apiRequestErrorKey(change.error, 'auth.security.actionError'))}
          </p>
        ) : null}
        <Button
          className='self-start'
          disabled={!current || !next || !confirm}
          loading={change.isPending}
          type='submit'
        >
          {t('caregiver.me.security.submit')}
        </Button>
      </form>
    </section>
  )
}

function DevicesCard() {
  const { t } = useTranslation()
  const format = useCaregiverFormat()
  const queryClient = useQueryClient()
  const [showAll, setShowAll] = useState(false)
  const [pending, setPending] = useState<SessionRecord | 'others' | null>(null)
  const [now] = useState(() => Date.now())
  const sessions = useQuery({ queryKey: SESSIONS_KEY, queryFn: fetchWebSessions, retry: false })
  const revoke = useMutation({
    mutationFn: async (target: SessionRecord | 'others') => {
      const list = target === 'others' ? (sessions.data ?? []).filter((item) => !item.isCurrent) : [target]
      for (const item of list) await revokeSession(item.sessionId)
      return target
    },
    onSuccess: async (target) => {
      toastSuccess(t(target === 'others' ? 'caregiver.me.security.signedOutOthers' : 'caregiver.me.security.signedOut'))
      setPending(null)
      await queryClient.invalidateQueries({ queryKey: SESSIONS_KEY })
    },
    onError: () => {
      setPending(null)
      toastError(t('caregiver.me.security.actionError'))
    }
  })

  const list = [...(sessions.data ?? [])].sort(
    (first, second) =>
      Number(second.isCurrent) - Number(first.isCurrent) ||
      (second.lastActiveAt ?? '').localeCompare(first.lastActiveAt ?? '')
  )
  const others = list.filter((item) => !item.isCurrent).length
  const visible = showAll ? list : list.slice(0, SHOWN)
  const nameOf = (session: SessionRecord) => {
    const device = parseUserAgent(session.userAgent)
    return device
      ? t('caregiver.me.security.browserOn', { browser: device.browser, os: device.os })
      : t('caregiver.me.security.unknownDevice')
  }

  return (
    <section aria-labelledby='devices-title' className={`${cgCard} p-4 sm:p-5`}>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <h2 className='text-base font-semibold text-on-surface' id='devices-title'>
            {t('caregiver.me.security.devicesTitle')}
          </h2>
          <p className='mt-0.5 text-sm text-on-surface-variant'>{t('caregiver.me.security.devicesHint')}</p>
        </div>
        {others > 0 ? (
          <Button className='text-error' onClick={() => setPending('others')} size='sm' variant='outline'>
            {t('caregiver.me.security.signOutOthers')}
          </Button>
        ) : null}
      </div>

      {sessions.isPending ? (
        <SkeletonGroup className='mt-4 flex flex-col gap-2' label={t('caregiver.ui.states.loading')}>
          <Skeleton className='h-16 rounded-lg' />
          <Skeleton className='h-16 rounded-lg' />
        </SkeletonGroup>
      ) : null}
      {sessions.isError ? (
        <div className='mt-4'>
          <CaregiverError
            message={t('caregiver.me.security.loadError')}
            onRetry={() => void sessions.refetch()}
            retryLabel={t('caregiver.ui.actions.retry')}
          />
        </div>
      ) : null}
      {sessions.isSuccess ? (
        <ul className='mt-3 divide-y divide-outline-variant'>
          {visible.map((session) => {
            const device = parseUserAgent(session.userAgent)
            return (
              <li className='flex items-center gap-3 py-3' key={session.sessionId}>
                <span className='grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-surface-container-low text-on-surface-variant'>
                  <Icon name={device?.mobile ? 'smartphone' : 'computer'} />
                </span>
                <div className='min-w-0 flex-1'>
                  <p className='flex flex-wrap items-center gap-2 font-medium text-on-surface'>
                    {nameOf(session)}
                    {session.isCurrent ? (
                      <StatusBadge dot tone='success'>
                        {t('caregiver.me.security.thisDevice')}
                      </StatusBadge>
                    ) : null}
                  </p>
                  <p className='text-sm text-on-surface-variant tabular-nums'>
                    {[
                      session.ip ? t('caregiver.me.security.ip', { ip: session.ip }) : null,
                      session.lastActiveAt
                        ? t('caregiver.me.security.activeAgo', { time: format.relativeTime(session.lastActiveAt, now) })
                        : null
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
                {session.isCurrent ? null : (
                  <Button onClick={() => setPending(session)} size='sm' variant='ghost'>
                    {t('caregiver.me.security.signOut')}
                  </Button>
                )}
              </li>
            )
          })}
        </ul>
      ) : null}
      {list.length > SHOWN ? (
        <Button className='mt-1' onClick={() => setShowAll((value) => !value)} size='sm' variant='ghost'>
          {showAll ? t('caregiver.me.security.showLess') : t('caregiver.me.security.showAll', { count: list.length })}
        </Button>
      ) : null}

      <ConfirmDialog
        confirmLabel={
          pending === 'others' ? t('caregiver.me.security.signOutOthers') : t('caregiver.me.security.signOut')
        }
        description={
          pending === 'others'
            ? t('caregiver.me.security.signOutOthersDescription')
            : pending
              ? t('caregiver.me.security.signOutDescription', { device: nameOf(pending) })
              : undefined
        }
        loading={revoke.isPending}
        onClose={() => setPending(null)}
        onConfirm={() => {
          if (pending) revoke.mutate(pending)
        }}
        open={pending !== null}
        title={
          pending === 'others' ? t('caregiver.me.security.signOutOthersTitle') : t('caregiver.me.security.signOutTitle')
        }
        tone='danger'
      />
    </section>
  )
}

/** Password change with live rules and strength, and the signed-in devices with readable names. */
export function SecurityTab() {
  return (
    <div className='grid items-start gap-4 lg:grid-cols-2'>
      <PasswordCard />
      <DevicesCard />
    </div>
  )
}
