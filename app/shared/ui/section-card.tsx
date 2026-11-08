import type { ReactNode } from 'react'
import { Icon } from './icon'

export function SectionCard({
  title,
  icon,
  children,
  action,
  id,
  className = ''
}: {
  title: string
  icon: string
  children: ReactNode
  action?: ReactNode
  id?: string
  className?: string
}) {
  return (
    <section
      className={`scroll-mt-28 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-5 shadow-xs sm:p-6 ${className}`}
      id={id}
    >
      <div className='mb-5 flex flex-wrap items-center justify-between gap-3'>
        <h2 className='flex items-center gap-2 text-base font-bold text-on-surface'>
          <Icon className='text-primary' name={icon} />
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  )
}
