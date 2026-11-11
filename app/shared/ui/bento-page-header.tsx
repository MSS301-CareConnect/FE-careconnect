import type { ReactNode } from 'react'
import { Link } from 'react-router'

import { Icon } from './icon'
import type { Crumb } from './page-header'

/** Content width and side padding of the operations portals (Center Manager, Admin; "Soft Bento", 2026-11-09). */
export const bentoContainer = 'mx-auto w-full max-w-[1280px] space-y-5 px-4 pb-10 sm:px-6'

/** A "back to the list" link as a white pill (use with an `arrow_back` icon first). */
export const bentoBackLink =
  'inline-flex min-h-10 w-fit items-center gap-2 rounded-full bg-white/85 px-4 py-1.5 text-sm font-semibold text-forest-900 shadow-[var(--shadow-card)] ring-1 ring-forest-900/5 transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-forest-900'

/** Tab row drawn as a white pill track whose current tab is a dark forest pill (for hand-written tablists). */
export const bentoTabList =
  'cc-no-scrollbar inline-flex w-fit max-w-full gap-1 overflow-x-auto rounded-full bg-white/85 p-1 shadow-[var(--shadow-card)] ring-1 ring-forest-900/5'

export function bentoTabClass(selected: boolean) {
  return `inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold whitespace-nowrap transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-forest-900 ${selected ? 'bg-forest-900 text-white shadow-[0_8px_18px_-10px_rgb(12_43_37/0.8)]' : 'text-on-surface-variant hover:bg-mint-50 hover:text-forest-900'}`
}

/** Bento card surface of the operations portals: white, 24 px corners, soft shadow. */
export const bentoCard =
  'rounded-2xl border border-forest-900/[0.06] bg-surface-container-lowest shadow-[var(--shadow-card)]'

/**
 * The page title block of the operations portals (Center Manager, Admin): breadcrumb as small pills, an optional eyebrow chip, a large title, one
 * line of description, a meta line and the page actions. `variant='hero'` draws it as the deep-forest bento block of
 * the reference (overview pages without actions: statistics, wallet, policy, feedback), with the page icon on a mint
 * circle and a soft mint glow.
 */
export function BentoPageHeader({
  title,
  description,
  breadcrumb,
  breadcrumbLabel,
  actions,
  meta,
  eyebrow,
  icon,
  variant = 'plain',
  className = ''
}: {
  title: string
  description?: ReactNode
  breadcrumb?: Crumb[]
  breadcrumbLabel?: string
  actions?: ReactNode
  meta?: ReactNode
  eyebrow?: ReactNode
  icon?: string
  variant?: 'plain' | 'hero'
  className?: string
}) {
  const hero = variant === 'hero'
  const crumbs =
    breadcrumb && breadcrumb.length > 0 ? (
      <nav aria-label={breadcrumbLabel} className='mb-3'>
        <ol className='flex flex-wrap items-center gap-1 text-sm'>
          {breadcrumb.map((crumb, index) => (
            <li className='flex items-center gap-1' key={`${crumb.label}-${index}`}>
              {index > 0 ? (
                <Icon className={`text-base ${hero ? 'text-white/40' : 'text-outline'}`} name='chevron_right' />
              ) : null}
              {crumb.to ? (
                <Link
                  className={`rounded-full px-2.5 py-1 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-primary ${hero ? 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white' : 'bg-white/75 text-on-surface-variant ring-1 ring-forest-900/5 hover:bg-white hover:text-forest-900'}`}
                  to={crumb.to}
                >
                  {crumb.label}
                </Link>
              ) : (
                <span aria-current='page' className={`px-1.5 font-semibold ${hero ? 'text-white' : 'text-forest-900'}`}>
                  {crumb.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    ) : null

  if (hero) {
    return (
      <header
        className={`relative isolate mt-2 overflow-hidden rounded-[1.75rem] bg-forest-900 p-6 text-white shadow-[var(--shadow-float)] sm:p-8 ${className}`}
      >
        <span
          aria-hidden='true'
          className='pointer-events-none absolute -top-24 -right-10 -z-10 h-72 w-72 rounded-full bg-mint-400/25 blur-3xl'
        />
        <span
          aria-hidden='true'
          className='pointer-events-none absolute -bottom-28 left-1/3 -z-10 h-56 w-56 rounded-full bg-peach-300/15 blur-3xl'
        />
        {crumbs}
        <div className='flex flex-wrap items-center justify-between gap-x-6 gap-y-4'>
          <div className='flex min-w-0 items-start gap-4'>
            {icon ? (
              <span
                aria-hidden='true'
                className='hidden h-14 w-14 shrink-0 place-items-center rounded-full bg-mint-300 text-forest-950 shadow-[0_12px_26px_-12px_rgb(132_214_185/0.9)] sm:grid'
              >
                <Icon className='text-[28px]' name={icon} />
              </span>
            ) : null}
            <div className='min-w-0 max-w-3xl'>
              {eyebrow ? (
                <div className='mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[13px] font-semibold text-mint-100 ring-1 ring-white/10'>
                  {eyebrow}
                </div>
              ) : null}
              <h1 className='text-[28px] leading-tight font-extrabold tracking-tight text-white sm:text-[38px]'>
                {title}
              </h1>
              {description ? <p className='mt-2 text-[15px] text-white/70'>{description}</p> : null}
              {meta ? <div className='mt-2 text-sm text-white/70'>{meta}</div> : null}
            </div>
          </div>
          {actions ? <div className='flex flex-wrap items-center gap-2'>{actions}</div> : null}
        </div>
      </header>
    )
  }

  return (
    // Actions sit on the title row; the description gets the full width below so it stays on one line.
    <header className={`pt-2 pb-2 sm:pt-4 ${className}`}>
      {crumbs}
      {eyebrow ? (
        <div className='mb-2 inline-flex items-center gap-2 rounded-full bg-white/75 px-3 py-1 text-[13px] font-semibold text-forest-700 ring-1 ring-forest-900/5'>
          <span aria-hidden='true' className='h-1.5 w-1.5 rounded-full bg-mint-400' />
          {eyebrow}
        </div>
      ) : null}
      <div className='flex flex-wrap items-center justify-between gap-x-6 gap-y-3'>
        <h1 className='min-w-0 text-[28px] leading-tight text-forest-950 sm:text-[36px]'>{title}</h1>
        {actions ? <div className='flex flex-wrap items-center gap-2'>{actions}</div> : null}
      </div>
      {description ? <p className='mt-2 text-[15px] text-on-surface-variant'>{description}</p> : null}
      {meta ? <div className='mt-2 text-sm text-on-surface-variant'>{meta}</div> : null}
    </header>
  )
}
