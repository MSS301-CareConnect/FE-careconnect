import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { Icon } from './icon'

export type ToastTone = 'success' | 'error' | 'warning' | 'info'

const toneClasses: Record<ToastTone, { box: string; icon: string }> = {
  success: {
    box: 'border-outline-variant bg-success-container text-on-success-container',
    icon: 'check_circle'
  },
  error: {
    box: 'border-error/30 bg-error-container text-on-error-container',
    icon: 'error'
  },
  warning: {
    box: 'border-warning/30 bg-warning-container text-on-warning-container',
    icon: 'warning'
  },
  info: {
    box: 'border-info/30 bg-info-container text-on-info-container',
    icon: 'info'
  }
}

export interface ToastBannerProps {
  tone?: ToastTone
  children: ReactNode
  onDismiss?: () => void
  className?: string
}

export function ToastBanner({ tone = 'success', children, onDismiss, className = '' }: ToastBannerProps) {
  const { t } = useTranslation()
  const config = toneClasses[tone]
  const role = tone === 'error' || tone === 'warning' ? 'alert' : 'status'

  return (
    <div
      className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-xs ${config.box} ${className}`}
      role={role}
    >
      <div className='flex items-start gap-2.5'>
        <Icon className='mt-0.5 shrink-0 text-lg' name={config.icon} />
        <div className='leading-5'>{children}</div>
      </div>
      {onDismiss ? (
        <button
          aria-label={t('common.ui.Dismiss')}
          className='grid h-7 w-7 shrink-0 place-items-center rounded-lg opacity-80 hover:bg-black/5 hover:opacity-100'
          onClick={onDismiss}
          type='button'
        >
          <Icon className='text-base' name='close' />
        </button>
      ) : null}
    </div>
  )
}
