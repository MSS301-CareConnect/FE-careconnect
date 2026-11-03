import type { ReactNode } from 'react'
import { Link } from 'react-router'

import { Icon } from './icon'

export interface Crumb {
  label: string
  to?: string
}

/** The one page title block of the customer portal: breadcrumb, title, one line of description, actions. No hero. */
export function PageHeader({
  title,
  description,
  breadcrumb,
  breadcrumbLabel,
  actions,
  meta,
  className = ''
}: {
  title: string
  description?: ReactNode
  breadcrumb?: Crumb[]
  breadcrumbLabel?: string
  actions?: ReactNode
  /** A small line under the description, e.g. "At TT An Tâm · Change". */
  meta?: ReactNode
  className?: string
}) {
  return (
    <header className={`flex flex-wrap items-end justify-between gap-x-6 gap-y-4 pt-6 pb-6 sm:pt-8 ${className}`}>
      <div className='min-w-0 max-w-3xl'>
        {breadcrumb && breadcrumb.length > 0 ? (
          <nav aria-label={breadcrumbLabel} className='mb-2'>
            <ol className='flex flex-wrap items-center gap-1 text-sm text-on-surface-variant'>
              {breadcrumb.map((crumb, index) => (
                <li className='flex items-center gap-1' key={`${crumb.label}-${index}`}>
                  {index > 0 ? <Icon className='text-base text-outline' name='chevron_right' /> : null}
                  {crumb.to ? (
                    <Link className='rounded hover:text-primary hover:underline' to={crumb.to}>
                      {crumb.label}
                    </Link>
                  ) : (
                    <span aria-current='page' className='font-medium text-on-surface'>
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        ) : null}
        <h1 className='text-2xl font-bold text-on-surface sm:text-[30px]'>{title}</h1>
        {description ? <p className='mt-1.5 text-base text-on-surface-variant'>{description}</p> : null}
        {meta ? <div className='mt-2 text-sm text-on-surface-variant'>{meta}</div> : null}
      </div>
      {actions ? <div className='flex flex-wrap items-center gap-2'>{actions}</div> : null}
    </header>
  )
}

/** The shared content width of every customer page: 1200 px, 24 px gutters (16 px on phones). */
export const pageContainer = 'mx-auto w-full max-w-[1200px] px-4 sm:px-6'
