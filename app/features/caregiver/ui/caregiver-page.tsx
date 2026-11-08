import type { ReactNode } from 'react'
import { Link } from 'react-router'

import { Icon } from '~/shared/ui/icon'

/** Content width and side padding shared by every caregiver page. */
export const cgContainer = 'mx-auto w-full max-w-[1240px] px-4 pt-5 pb-8 sm:px-6 sm:pt-7 lg:pt-8'

/** Card surface used across the caregiver portal. */
export const cgCard = 'rounded-xl border border-outline-variant bg-surface-container-lowest shadow-[var(--cg-shadow-1)]'

/**
 * Compact page header: a short H1, one line of context and the page action. Top-level pages have no breadcrumb; a
 * detail page passes `back` for its parent.
 */
export function CaregiverPageHeader({
  title,
  description,
  actions,
  back,
  eyebrow
}: {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  back?: { to: string; label: string }
  eyebrow?: ReactNode
}) {
  return (
    <header className='mb-5 sm:mb-6'>
      {back ? (
        <Link
          className='cg-press -ml-2 mb-2 inline-flex min-h-10 items-center gap-1 rounded-lg px-2 text-sm font-semibold text-primary hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-primary'
          to={back.to}
        >
          <Icon className='text-lg' name='arrow_back' />
          {back.label}
        </Link>
      ) : null}
      <div className='flex flex-wrap items-end justify-between gap-x-4 gap-y-3'>
        <div className='min-w-0'>
          {eyebrow ? <div className='mb-1 text-sm font-medium text-on-surface-variant'>{eyebrow}</div> : null}
          {/* Phones already show a top-level page's name in the topbar, so its H1 stays for screen readers only. */}
          <h1 className={`text-[22px] font-bold text-on-surface sm:text-[28px] ${back ? '' : 'max-sm:sr-only'}`}>
            {title}
          </h1>
          {description ? <p className='mt-1 text-sm text-on-surface-variant sm:text-[15px]'>{description}</p> : null}
        </div>
        {actions ? <div className='flex shrink-0 flex-wrap items-center gap-2'>{actions}</div> : null}
      </div>
    </header>
  )
}

/** A short empty state with one next step, instead of a tall blank card. */
export function CaregiverEmpty({
  icon,
  title,
  description,
  action,
  className = ''
}: {
  icon: string
  title: string
  description?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={`${cgCard} flex flex-col items-center gap-2 px-5 py-8 text-center ${className}`}>
      <span className='grid h-11 w-11 place-items-center rounded-full bg-brand-50 text-primary'>
        <Icon className='text-2xl' name={icon} />
      </span>
      <p className='font-semibold text-on-surface'>{title}</p>
      {description ? <p className='max-w-sm text-sm text-on-surface-variant'>{description}</p> : null}
      {action ? <div className='mt-2'>{action}</div> : null}
    </div>
  )
}

/** A failed request with a retry. */
export function CaregiverError({
  message,
  retryLabel,
  onRetry
}: {
  message: string
  retryLabel: string
  onRetry?: () => void
}) {
  return (
    <div className={`${cgCard} flex flex-wrap items-center justify-between gap-3 border-error/25 p-4`} role='alert'>
      <p className='flex items-start gap-2 text-sm text-on-surface'>
        <Icon className='text-xl text-error' name='error' />
        {message}
      </p>
      {onRetry ? (
        <button
          className='cg-press min-h-10 rounded-lg border border-outline-variant bg-surface-container-lowest px-3.5 text-sm font-semibold text-primary hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-primary'
          onClick={onRetry}
          type='button'
        >
          {retryLabel}
        </button>
      ) : null}
    </div>
  )
}
