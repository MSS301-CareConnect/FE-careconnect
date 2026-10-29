import type { ReactNode } from 'react'

import { Icon } from '~/shared/ui/icon'

/** One part of the booking form, framed like the customer catalog cards: a quiet border, no shadow. */
export function BookingPanel({
  id,
  icon,
  title,
  description,
  action,
  children
}: {
  id: string
  icon: string
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section
      aria-labelledby={id}
      className='rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-5 shadow-xs sm:p-7'
    >
      <div className='mb-5 flex flex-wrap items-start justify-between gap-3'>
        <div className='min-w-0'>
          <h2 className='flex items-center gap-2 text-lg font-bold tracking-[-0.02em] text-on-surface' id={id}>
            <Icon className='text-[22px] text-primary' name={icon} />
            {title}
          </h2>
          {description ? <p className='mt-1 text-sm leading-6 text-on-surface-variant'>{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

export const bookingField =
  'mt-1.5 w-full rounded-xl border border-outline-variant bg-surface-container-low px-3 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none aria-[invalid=true]:border-error'

export const bookingOption = (selected: boolean) =>
  `rounded-xl border transition-colors ${selected ? 'border-primary bg-primary-fixed/45' : 'border-outline-variant/60 bg-surface-container-lowest hover:border-outline'}`
