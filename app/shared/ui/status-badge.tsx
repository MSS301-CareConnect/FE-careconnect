import type { ReactNode } from 'react'

export type StatusTone = 'success' | 'active' | 'info' | 'warning' | 'caution' | 'danger' | 'error' | 'neutral'

const toneClasses: Record<StatusTone, string> = {
  success: 'bg-success-container text-on-success-container border-outline-variant/60',
  active: 'bg-active-container text-on-active-container border-active/20',
  info: 'bg-info-container text-on-info-container border-info/20',
  warning: 'bg-warning-container text-on-warning-container border-warning/25',
  caution: 'bg-caution-container text-on-caution-container border-caution/25',
  danger: 'bg-error-container text-on-error-container border-error/20',
  error: 'bg-error-container text-on-error-container border-error/20',
  neutral: 'bg-neutral-container text-on-neutral-container border-outline-variant/50'
}

const dotClasses: Record<StatusTone, string> = {
  success: 'bg-success',
  active: 'bg-active',
  info: 'bg-info',
  warning: 'bg-warning',
  caution: 'bg-caution',
  danger: 'bg-error',
  error: 'bg-error',
  neutral: 'bg-neutral'
}

export interface StatusBadgeProps {
  tone: StatusTone
  children: ReactNode
  dot?: boolean
  className?: string
}

export function StatusBadge({ tone, children, dot = false, className = '' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 py-1 text-xs font-semibold leading-none ${toneClasses[tone]} ${className}`}
    >
      {dot ? <span aria-hidden='true' className={`h-1.5 w-1.5 rounded-full ${dotClasses[tone]}`} /> : null}
      {children}
    </span>
  )
}
