import type { ReactNode } from 'react'
import { Link } from 'react-router'

import { Icon } from '~/shared/ui/icon'

/** Content width and side padding shared by every caregiver page. */
export const cgContainer = 'mx-auto w-full max-w-[1240px] px-4 pt-4 pb-8 sm:px-6 sm:pt-6 lg:pt-6'

/** Bento card surface used across the caregiver portal ("Soft Bento", 2026-11-09): white, 24 px corners, soft shadow. */
export const cgCard =
  'rounded-2xl border border-forest-900/[0.06] bg-surface-container-lowest shadow-[var(--cg-shadow-1)]'

/** The dark accent block (hero of an overview, the next visit): deep forest with a mint glow, white text. */
export const cgForestCard =
  'relative isolate overflow-hidden rounded-2xl bg-forest-900 text-white shadow-[var(--shadow-float)] before:pointer-events-none before:absolute before:-top-24 before:-right-16 before:-z-10 before:h-64 before:w-64 before:rounded-full before:bg-mint-400/25 before:blur-3xl'

const pill =
  'cg-press inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50'

/** Main action on a light surface. */
export const cgForestAction = `${pill} bg-forest-900 text-white shadow-[var(--shadow-soft)] hover:bg-forest-800 focus-visible:outline-forest-900`

/** The one warm call to action of a screen (peach, dark text for AA contrast). */
export const cgPeachAction = `${pill} bg-peach-300 text-forest-950 shadow-[0_10px_24px_-12px_rgb(246_146_95/0.8)] hover:bg-peach-200 focus-visible:outline-peach-300`

/** Secondary action on a light surface. */
export const cgOutlineAction = `${pill} border border-forest-900/10 bg-white text-forest-900 hover:bg-mint-50 focus-visible:outline-forest-900`

/** Secondary action on a forest surface. */
export const cgGlassAction = `${pill} border border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/20 focus-visible:outline-white`

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
    <header className='mb-5 sm:mb-7'>
      {back ? (
        <Link
          className='cg-press group mb-3 inline-flex min-h-10 items-center gap-2 rounded-full bg-white/80 py-1 pr-4 pl-1 text-sm font-semibold text-forest-900 shadow-[var(--cg-shadow-1)] ring-1 ring-forest-900/5 hover:bg-white focus-visible:outline-2 focus-visible:outline-forest-900'
          to={back.to}
        >
          <span className='grid h-8 w-8 place-items-center rounded-full bg-mint-100 transition-transform duration-200 group-hover:-translate-x-0.5'>
            <Icon className='text-lg' name='arrow_back' />
          </span>
          {back.label}
        </Link>
      ) : null}
      <div className='flex flex-wrap items-end justify-between gap-x-4 gap-y-3'>
        <div className='min-w-0'>
          {eyebrow ? (
            <div className='mb-2 inline-flex items-center gap-2 rounded-full bg-white/75 px-3 py-1 text-[13px] font-semibold text-forest-700 ring-1 ring-forest-900/5'>
              <span aria-hidden='true' className='h-1.5 w-1.5 rounded-full bg-mint-400' />
              {eyebrow}
            </div>
          ) : null}
          {/* Phones already show a top-level page's name in the topbar, so its H1 stays for screen readers only. */}
          <h1 className={`text-[24px] leading-tight text-forest-950 sm:text-[34px] ${back ? '' : 'max-sm:sr-only'}`}>
            {title}
          </h1>
          {description ? (
            <p className='mt-1.5 max-w-2xl text-sm text-on-surface-variant sm:text-[15px]'>{description}</p>
          ) : null}
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
    <div className={`${cgCard} flex flex-col items-center gap-2 px-5 py-10 text-center ${className}`}>
      <span className='grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-mint-100 to-peach-100 text-forest-800 ring-8 ring-mint-50'>
        <Icon className='text-[26px]' name={icon} />
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
        <button className={cgOutlineAction} onClick={onRetry} type='button'>
          {retryLabel}
        </button>
      ) : null}
    </div>
  )
}
