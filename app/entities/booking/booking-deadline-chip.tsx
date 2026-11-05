import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'

import { deadlineUrgency, timeLeft, type DeadlineUrgency } from './booking-deadline'

const TONES: Record<DeadlineUrgency, string> = {
  overdue: 'bg-surface-container text-on-surface-variant',
  critical: 'bg-error-container text-on-error-container',
  soon: 'bg-warning-container text-on-warning-container',
  normal: 'bg-success-container text-on-success-container'
}

const ICONS: Record<DeadlineUrgency, string> = {
  overdue: 'timer_off',
  critical: 'alarm',
  soon: 'schedule',
  normal: 'schedule'
}

/** Countdown to a booking deadline, coloured by urgency; once past it says the booking is being closed. */
export function BookingDeadlineChip({
  dueAt,
  now,
  prefix,
  className = ''
}: {
  dueAt: string
  now: number
  /** Short label before the countdown, such as "Confirm"; omitted in a column that already names it. */
  prefix?: string
  className?: string
}) {
  const { t } = useTranslation()
  const urgency = deadlineUrgency(dueAt, now)
  const left = timeLeft(dueAt, now)
  const text = !left
    ? t('booking.deadline.closing')
    : left.days > 0
      ? left.hours > 0
        ? t('booking.deadline.leftDays', { days: left.days, hours: left.hours })
        : t('booking.deadline.leftDaysOnly', { days: left.days })
      : left.hours > 0
        ? left.minutes > 0
          ? t('booking.deadline.leftHours', { hours: left.hours, minutes: left.minutes })
          : t('booking.deadline.leftHoursOnly', { hours: left.hours })
        : t('booking.deadline.leftMinutes', { minutes: Math.max(1, left.minutes) })

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold whitespace-nowrap tabular-nums ${TONES[urgency]} ${className}`}
    >
      <Icon className='text-sm' name={ICONS[urgency]} />
      {prefix ? `${prefix} · ${text}` : text}
    </span>
  )
}
