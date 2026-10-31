import type { ReactNode } from 'react'

import { Button } from './button'
import { Icon } from './icon'

export interface FormAlertProps {
  /** `warning` for a business rule the user can act on, `error` for a system failure. */
  tone: 'warning' | 'error'
  children: ReactNode
  actionLabel?: string
  onAction?: () => void
  className?: string
}

/** The message at the end of a form, next to its submit button, for failures that do not belong to one input. */
export function FormAlert({ tone, children, actionLabel, onAction, className = '' }: FormAlertProps) {
  const box =
    tone === 'warning'
      ? 'border-warning/30 bg-warning-container text-on-warning-container'
      : 'border-error/30 bg-error-container text-on-error-container'
  return (
    <div
      className={`flex flex-wrap items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${box} ${className}`}
      role='alert'
    >
      <p className='flex min-w-0 flex-1 items-start gap-2.5 leading-5'>
        <Icon className='mt-0.5 shrink-0 text-lg' name={tone === 'warning' ? 'warning' : 'error'} />
        <span>{children}</span>
      </p>
      {actionLabel && onAction ? (
        <Button onClick={onAction} size='sm' variant='outline'>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
