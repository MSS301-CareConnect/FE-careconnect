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
            className={`group flex min-h-[7.5rem] flex-col rounded-2xl border p-4 text-left transition-[border-color,background-color,box-shadow] duration-150 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              urgent
                ? 'border-error/40 bg-error-container/40 hover:border-error'
                : action && count > 0
                  ? 'border-warning/50 bg-warning-container/50 hover:border-warning'
                  : 'border-outline-variant/50 bg-surface-container-lowest hover:border-primary/40'
            } ${selected ? 'ring-2 ring-primary' : ''}`}
            key={status}
            onClick={() => list.setStatus(selected ? '' : status)}
            type='button'
          >
            <span className='flex items-center justify-between gap-2'>
              <span className='text-sm font-medium text-on-surface-variant'>{t(`${key}.${status}`)}</span>
              <Icon
                className={`text-xl ${urgent ? 'text-error' : action && count > 0 ? 'text-warning' : action ? 'text-primary' : 'text-outline'}`}
                name={icon}
              />
            </span>
            <span className='mt-2 text-3xl font-bold text-on-surface tabular-nums'>
              {list.counts.isSuccess ? count : '–'}
            </span>
            <span className={`mt-auto pt-1 text-xs font-medium ${detail?.tone ?? 'text-outline'}`}>{detail?.text}</span>
          </button>
        )
      })}
    </section>
  )
}
