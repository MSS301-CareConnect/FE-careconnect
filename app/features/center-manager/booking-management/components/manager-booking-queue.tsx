import { useTranslation } from 'react-i18next'

import { formatDateTime } from '~/entities/booking/booking-format'
import type { BookingStatus } from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'
import { CountUp } from '~/shared/ui/motion'

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
    <section aria-label={t(`${key}.label`)} className='ops-stagger grid grid-cols-2 gap-3 lg:grid-cols-4'>
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
            className={`group flex min-h-[8.5rem] flex-col rounded-2xl border p-5 text-left shadow-[var(--shadow-card)] transition-[border-color,background-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              urgent
                ? 'border-error/40 bg-error-container/40 hover:border-error'
                : action && count > 0
                  ? 'border-peach-200 bg-peach-50 hover:border-peach-300'
                  : 'border-forest-900/[0.06] bg-surface-container-lowest hover:border-mint-300'
            } ${selected ? 'ring-2 ring-forest-900' : ''}`}
            key={status}
            onClick={() => list.setStatus(selected ? '' : status)}
            type='button'
          >
            <span className='flex items-center justify-between gap-2'>
              <span className='text-sm font-medium text-on-surface-variant'>{t(`${key}.${status}`)}</span>
              <span
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${urgent ? 'bg-error-container' : action && count > 0 ? 'bg-peach-100' : 'bg-mint-50'}`}
              >
                <Icon
                  className={`text-xl ${urgent ? 'text-error' : action && count > 0 ? 'text-peach-700' : action ? 'text-primary' : 'text-outline'}`}
                  name={icon}
                />
              </span>
            </span>
            <span className='mt-3 text-[34px] leading-none font-bold tracking-tight text-forest-950 tabular-nums'>
              {list.counts.isSuccess ? <CountUp value={count} /> : '–'}
            </span>
            <span className={`mt-auto pt-1 text-xs font-medium ${detail?.tone ?? 'text-outline'}`}>{detail?.text}</span>
          </button>
        )
      })}
    </section>
  )
}
