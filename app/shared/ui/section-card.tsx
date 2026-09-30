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
    <section className={`scroll-mt-28 rounded-2xl bg-white p-5 shadow-sm sm:p-6 ${className}`} id={id}>
      <div className='mb-5 flex flex-wrap items-center justify-between gap-3'>
        <h2 className='flex items-center gap-2 text-base font-bold'>
          <Icon className='text-primary' name={icon} />
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  )
}
