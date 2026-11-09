import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { calendarDayOf, useFormat } from '~/shared/lib/format'
import { useServerClock } from '~/shared/lib/use-clock'
import { Icon } from '~/shared/ui/icon'

// Hold length shown by the progress bar (BookingService booking.schedule.payment-hold, 5 minutes).
const HOLD_MS = 5 * 60_000
// Under this the countdown turns urgent.
const URGENT_MS = 60_000

/** "04:59" from milliseconds left (minutes may pass 59 for a longer hold: "72:05"). */
export function formatCountdown(ms: number) {
  const seconds = Math.max(0, Math.ceil(ms / 1_000))
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
}

/**
 * The booking hold of a booking waiting for its first payment (2026-11-09): mm:ss on the server clock, the time it ends
 * and a bar. At zero it tells the customer the slot was released (BookingService closes it after a short grace) and calls
 * `onExpire` once so the screen can reload the booking. `compact` is the one-line chip for lists and side panels.
 */
export function HoldCountdown({
  dueAt,
  onExpire,
  compact = false
}: {
  dueAt: string
  onExpire?: () => void
  compact?: boolean
}) {
  const { t } = useTranslation()
  const format = useFormat()
  const now = useServerClock(1_000)
  const left = new Date(dueAt).getTime() - now
  const expired = !Number.isFinite(left) || left <= 0
  const fired = useRef(false)

  useEffect(() => {
    if (expired && !fired.current) {
      fired.current = true
      onExpire?.()
    }
  }, [expired, onExpire])

  const time = formatCountdown(left)
  const urgent = !expired && left < URGENT_MS

  if (compact) {
    return (
      <span
        aria-label={expired ? t('bookingSchedule.hold.expiredTitle') : t('bookingSchedule.hold.leftLabel', { time })}
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold tabular-nums ${expired ? 'bg-surface-container-high text-on-surface-variant' : urgent ? 'bg-error-container text-on-error-container' : 'bg-caution-container text-on-caution-container'}`}
        role='timer'
      >
        <Icon className='text-sm' name={expired ? 'timer_off' : 'timer'} />
        {expired ? t('bookingSchedule.hold.expiredTitle') : time}
      </span>
    )
  }

  if (expired) {
    return (
      <div className='rounded-2xl border border-outline-variant bg-surface-container-low p-4' role='status'>
        <p className='flex items-center gap-2 font-semibold text-on-surface'>
          <Icon className='text-xl text-on-surface-variant' name='timer_off' />
          {t('bookingSchedule.hold.expiredTitle')}
        </p>
        <p className='mt-1 text-sm text-on-surface-variant'>{t('bookingSchedule.hold.expiredBody')}</p>
      </div>
    )
  }

  const progress = Math.min(100, Math.max(0, (left / HOLD_MS) * 100))
  return (
    <div
      className={`rounded-2xl border p-4 ${urgent ? 'border-error/40 bg-error-container/40' : 'border-caution/40 bg-caution-container/40'}`}
    >
      <div className='flex items-center justify-between gap-3'>
        <div className='min-w-0'>
          <p className='text-sm font-semibold text-on-surface'>{t('bookingSchedule.hold.title')}</p>
          <p className='text-xs text-on-surface-variant tabular-nums'>
            {t('bookingSchedule.hold.until', { time: format.clockWithDay(dueAt, calendarDayOf(new Date(now))) })}
          </p>
        </div>
        <p
          aria-label={t('bookingSchedule.hold.leftLabel', { time })}
          aria-live={urgent ? 'polite' : 'off'}
          className={`shrink-0 font-mono text-3xl font-extrabold tabular-nums ${urgent ? 'text-error' : 'text-on-surface'}`}
          role='timer'
        >
          {time}
        </p>
      </div>
      <div
        aria-hidden='true'
        className='mt-3 h-1.5 overflow-hidden rounded-full bg-surface-container-high'
      >
        <span
          className={`block h-full rounded-full transition-[width] duration-1000 ease-linear ${urgent ? 'bg-error' : 'bg-caution'}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className='mt-2 text-xs text-on-surface-variant'>{t('bookingSchedule.hold.hint')}</p>
    </div>
  )
}
