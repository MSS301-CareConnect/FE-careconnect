import { useSyncExternalStore, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from './button'
import { Icon } from './icon'

export function SkeletonBlock({
  rows = 3,
  label,
  className = ''
}: {
  rows?: number
  label: string
  className?: string
}) {
  return (
    <div
      aria-busy='true'
      className={`space-y-3 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-6 shadow-xs ${className}`}
      role='status'
    >
      <span className='sr-only'>{label}</span>
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          aria-hidden='true'
          className='h-5 animate-pulse rounded-lg bg-surface-container'
          key={idx}
          style={{ width: idx === rows - 1 ? '65%' : '100%' }}
        />
      ))}
    </div>
  )
}

export function EmptyState({
  icon = 'inbox',
  title,
  description,
  action,
  className = ''
}: {
  icon?: string
  title: string
  description?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={`flex flex-col items-center rounded-2xl border border-outline-variant/60 bg-surface-container-lowest px-6 py-12 text-center shadow-xs ${className}`}
    >
      <span
        aria-hidden='true'
        className='grid h-14 w-14 place-items-center rounded-full bg-secondary-container text-primary'
      >
        <Icon className='text-3xl' name={icon} />
      </span>
      <h2 className='mt-4 text-lg font-bold text-on-surface'>{title}</h2>
      {description ? <p className='mt-1.5 max-w-md text-sm leading-6 text-on-surface-variant'>{description}</p> : null}
      {action ? <div className='mt-5'>{action}</div> : null}
    </div>
  )
}

export function ErrorState({
  message,
  retryLabel,
  onRetry,
  className = ''
}: {
  message: string
  retryLabel?: string
  onRetry?: () => void
  className?: string
}) {
  const { t } = useTranslation()

  return (
    <div
      className={`flex flex-col items-start gap-3 rounded-2xl border border-error/25 bg-surface-container-lowest p-6 shadow-xs ${className}`}
      role='alert'
    >
      <div className='flex items-start gap-2.5 text-sm font-medium text-error'>
        <Icon className='mt-0.5 shrink-0 text-lg' name='error_outline' />
        <p className='leading-6'>{message}</p>
      </div>
      {onRetry ? (
        <Button onClick={onRetry} size='sm' variant='outline'>
          {retryLabel ?? t('common.ui.retry')}
        </Button>
      ) : null}
    </div>
  )
}

export function ForbiddenState({
  title,
  description,
  action,
  className = ''
}: {
  title?: string
  description?: string
  action?: ReactNode
  className?: string
}) {
  const { t } = useTranslation()

  return (
    <div
      className={`flex flex-col items-center rounded-2xl border border-outline-variant/60 bg-surface-container-lowest px-6 py-12 text-center shadow-xs ${className}`}
      role='alert'
    >
      <span
        aria-hidden='true'
        className='grid h-14 w-14 place-items-center rounded-full bg-warning-container text-on-warning-container'
      >
        <Icon className='text-3xl' name='lock' />
      </span>
      <h2 className='mt-4 text-lg font-bold text-on-surface'>{title ?? t('common.ui.forbiddenTitle')}</h2>
      <p className='mt-1.5 max-w-md text-sm leading-6 text-on-surface-variant'>
        {description ?? t('common.ui.forbiddenDescription')}
      </p>
      {action ? <div className='mt-5'>{action}</div> : null}
    </div>
  )
}

function subscribeNetworkStatus(onStoreChange: () => void) {
  window.addEventListener('online', onStoreChange)
  window.addEventListener('offline', onStoreChange)
  return () => {
    window.removeEventListener('online', onStoreChange)
    window.removeEventListener('offline', onStoreChange)
  }
}

export function OfflineBanner({ className = '' }: { className?: string }) {
  const { t } = useTranslation()
  const offline = useSyncExternalStore(
    subscribeNetworkStatus,
    () => !navigator.onLine,
    () => false
  )

  if (!offline) return null

  return (
    <div
      className={`border-b border-warning/30 bg-warning-container px-4 py-2.5 text-xs font-semibold text-on-warning-container ${className}`}
      role='status'
    >
      <div className='mx-auto flex max-w-7xl items-center gap-2'>
        <Icon className='text-base' name='wifi_off' />
        <span>
          <strong>{t('common.ui.offlineTitle')}:</strong> {t('common.ui.offlineDescription')}
        </span>
      </div>
    </div>
  )
}
