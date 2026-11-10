import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'

import { Icon } from '~/shared/ui/icon'
import { revealVariants, staggerVariants } from '~/shared/ui/motion'
import type { Crumb } from '~/shared/ui/page-header'

/**
 * The title block of every customer page in "Soft Bento" (2026-11-09): a glass breadcrumb pill, a large tight title,
 * one line of description and the page actions, revealed one after another. Same props as the shared `PageHeader`,
 * which the operations portals keep.
 */
export function CustomerPageHeader({
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
    <motion.header
      animate='shown'
      className={`flex flex-wrap items-end justify-between gap-x-6 gap-y-4 pt-7 pb-7 sm:pt-9 ${className}`}
      initial='hidden'
      variants={staggerVariants(0.06)}
    >
      <div className='min-w-0 max-w-3xl'>
        {breadcrumb && breadcrumb.length > 0 ? (
          <motion.nav aria-label={breadcrumbLabel} className='mb-3' variants={revealVariants}>
            <ol className='cc-glass inline-flex max-w-full flex-wrap items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-on-surface-variant shadow-xs'>
              {breadcrumb.map((crumb, index) => (
                <li className='flex items-center gap-1' key={`${crumb.label}-${index}`}>
                  {index > 0 ? <Icon className='text-sm text-outline' name='chevron_right' /> : null}
                  {crumb.to ? (
                    <Link className='rounded hover:text-forest-900 hover:underline' to={crumb.to}>
                      {crumb.label}
                    </Link>
                  ) : (
                    <span
                      aria-current='page'
                      className='inline-flex items-center gap-1.5 font-semibold text-forest-900'
                    >
                      <span aria-hidden='true' className='h-1.5 w-1.5 rounded-full bg-mint-400' />
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </motion.nav>
        ) : null}
        <motion.h1
          className='text-[clamp(1.75rem,3.2vw,2.5rem)] leading-[1.1] font-extrabold tracking-tight text-forest-950'
          variants={revealVariants}
        >
          {title}
        </motion.h1>
        {description ? (
          <motion.p className='mt-2 max-w-2xl text-base text-on-surface-variant' variants={revealVariants}>
            {description}
          </motion.p>
        ) : null}
        {meta ? (
          <motion.div className='mt-2.5 text-sm text-on-surface-variant' variants={revealVariants}>
            {meta}
          </motion.div>
        ) : null}
      </div>
      {actions ? (
        <motion.div className='flex flex-wrap items-center gap-2' variants={revealVariants}>
          {actions}
        </motion.div>
      ) : null}
    </motion.header>
  )
}
