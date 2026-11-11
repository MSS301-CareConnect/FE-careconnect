import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Icon } from '~/shared/ui/icon'

/** Rows that belong to a booking (absences, withdrawals): grouped in list order, one group per booking. */
export function groupByBooking<T extends { bookingId: string }>(items: readonly T[]) {
  const groups = new Map<string, T[]>()
  for (const item of items) {
    const group = groups.get(item.bookingId)
    if (group) group.push(item)
    else groups.set(item.bookingId, [item])
  }
  return [...groups.entries()].map(([bookingId, rows]) => ({ bookingId, rows }))
}

/**
 * One booking with the visits that concern it, folded into a single card (2026-11-11): the header names the booking,
 * the person cared for and how many visits are inside (plus a badge, e.g. how many still wait); the visits open below.
 * A native `<details>`, so it works with the keyboard and without script.
 */
export function BookingGroupCard({
  bookingCode,
  recipientName,
  href,
  countLabel,
  badge,
  action,
  defaultOpen = true,
  children
}: {
  bookingCode?: string
  recipientName?: string
  /** Booking page of the signed-in role. */
  href?: string
  countLabel: string
  badge?: ReactNode
  /** One action for the whole booking, shown on the header row. */
  action?: ReactNode
  defaultOpen?: boolean
  children: ReactNode
}) {
  const { t } = useTranslation()
  return (
    <li className='overflow-hidden rounded-2xl border border-outline-variant/60 bg-surface-container-lowest shadow-xs'>
      <details className='group' open={defaultOpen}>
        <summary className='flex cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 transition-colors hover:bg-surface-container-low/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden'>
          <Icon
            className='text-xl text-on-surface-variant transition-transform duration-200 group-open:rotate-90'
            name='chevron_right'
          />
          <span className='min-w-0 flex-1 basis-40'>
            <span className='block truncate font-semibold text-on-surface'>
              {recipientName ?? (bookingCode ? `#${bookingCode}` : '')}
            </span>
            <span className='block text-xs text-on-surface-variant tabular-nums'>
              {bookingCode && recipientName ? `#${bookingCode} · ` : ''}
              {countLabel}
            </span>
          </span>
          {badge}
          {href ? (
            <Link
              className='inline-flex min-h-9 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold text-primary hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-primary'
              to={href}
            >
              {t('booking.group.open')}
              <Icon className='text-base' name='chevron_right' />
            </Link>
          ) : null}
          {action}
        </summary>
        <ul className='flex flex-col gap-2 border-t border-outline-variant/40 bg-surface-container-low/40 p-3'>
          {children}
        </ul>
      </details>
    </li>
  )
}
