import { useTranslation } from 'react-i18next'

import { formatDateTime } from '~/entities/booking/booking-format'
import type { BookingStatus } from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'

import type { ManagerBookingList } from '../hooks/use-manager-bookings'

// The center acts on the first two; the last two only wait (shown so the manager can follow up).
type QueueStatus = Extract<
  BookingStatus,
  | 'PENDING_CENTER_CONFIRMATION'
  | 'PENDING_CAREGIVER_ASSIGNMENT'
  | 'PENDING_CAREGIVER_CONFIRMATION'
  | 'AWAITING_INITIAL_PAYMENT'
>
const QUEUE: { status: QueueStatus; icon: string; action: boolean }[] = [
  { status: 'PENDING_CENTER_CONFIRMATION', icon: 'pending_actions', action: true },
  { status: 'PENDING_CAREGIVER_ASSIGNMENT', icon: 'person_search', action: true },
  { status: 'PENDING_CAREGIVER_CONFIRMATION', icon: 'how_to_reg', action: false },
  { status: 'AWAITING_INITIAL_PAYMENT', icon: 'account_balance_wallet', action: false }
]

/** Four queue cards with counts, the nearest deadline and how many are due soon; a card opens its status. */
export function ManagerBookingQueue({ list }: { list: ManagerBookingList }) {
  const { t, i18n } = useTranslation()
  const key = 'centerManager.bookingManagement.queue' as const

  return (
    <section aria-label={t(`${key}.label`)} className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
      {QUEUE.map(({ status, icon, action }) => {
        const item = list.byStatus.get(status)
        const count = item?.count ?? 0
        const urgent = action && (item?.dueSoonCount ?? 0) > 0
        const selected = list.status === status
        const detail = !item
          ? null
          : item.dueSoonCount > 0
            ? { tone: 'text-error', text: t(`${key}.dueSoon`, { count: item.dueSoonCount }) }
            : item.overdueCount > 0
              ? { tone: 'text-on-surface-variant', text: t(`${key}.overdue`, { count: item.overdueCount }) }
              : item.nearestDueAt
                ? {
                    tone: 'text-on-surface-variant',
                    text: t(`${key}.nearest`, { time: formatDateTime(item.nearestDueAt, i18n.language) })
                  }
                : { tone: 'text-outline', text: action ? t(`${key}.none`) : t(`${key}.noAction`) }
        return (
          <button
            aria-pressed={selected}
            className={`group flex min-h-28 flex-col justify-between rounded-2xl border bg-surface-container-lowest p-4 text-left shadow-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              selected
                ? 'border-primary ring-1 ring-primary'
                : urgent
                  ? 'border-error/40 hover:border-error'
                  : 'border-outline-variant/60 hover:border-primary/50'
            }`}
            key={status}
            onClick={() => list.setStatus(selected ? '' : status)}
            type='button'
          >
            <span className='flex items-center justify-between gap-2'>
              <span className='text-sm font-semibold text-on-surface-variant'>{t(`${key}.${status}`)}</span>
              <Icon
                className={`text-xl ${action ? 'text-primary' : 'text-outline'} transition-transform group-hover:scale-110`}
                name={icon}
              />
            </span>
            <span className='mt-2 text-3xl font-extrabold text-on-surface tabular-nums'>
              {list.counts.isSuccess ? count : '–'}
            </span>
            <span className={`mt-1 text-xs font-medium ${detail?.tone ?? 'text-outline'}`}>{detail?.text}</span>
          </button>
        )
      })}
    </section>
  )
}
