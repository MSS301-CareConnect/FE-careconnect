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
    <section aria-labelledby={id} className='rounded-2xl border border-[#dbe4db] bg-white p-5 sm:p-7'>
      <div className='mb-5 flex flex-wrap items-start justify-between gap-3'>
        <div className='min-w-0'>
          <h2 className='flex items-center gap-2 text-lg font-bold tracking-[-0.02em] text-[#1b2922]' id={id}>
            <Icon className='text-[22px] text-[#075b31]' name={icon} />
            {title}
          </h2>
          {description ? <p className='mt-1 text-sm leading-6 text-[#637469]'>{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

export const bookingField =
  'mt-1.5 w-full rounded-lg border border-[#d5e0d5] bg-[#f8faf7] px-3 py-2.5 text-sm text-[#1b2922] focus:border-[#075b31] focus:outline-none aria-[invalid=true]:border-[#ba1a1a]'

export const bookingOption = (selected: boolean) =>
  `rounded-xl border transition-colors ${selected ? 'border-[#075b31] bg-[#eef5ee]' : 'border-[#dbe4db] bg-white hover:border-[#a8c2ad]'}`
