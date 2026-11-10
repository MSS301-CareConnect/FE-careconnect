import { useTranslation } from 'react-i18next'

import type { BookingDetailRecord } from '~/shared/api/generated/contracts'
import { useFormat } from '~/shared/lib/format'
import { useClock } from '~/shared/lib/use-clock'
import { Icon } from '~/shared/ui/icon'
import { Stepper, type StepState } from '~/shared/ui/stepper'

import {
  lifecyclePosition,
  lifecycleStepLabel,
  lifecycleSteps,
  timeLeft,
  type LifecycleStep
} from '../booking-lifecycle'

const key = 'customer.bookingDetail.lifecycle' as const
// A deadline closer than this is drawn in the warning colour.
const URGENT_MS = 6 * 60 * 60_000

const STEP_ICONS: Record<LifecycleStep | 'finished', string> = {
  request: 'send',
  confirm: 'how_to_reg',
  assign: 'person_add',
  pay: 'payments',
  upcoming: 'event_upcoming',
  care: 'volunteer_activism',
  done: 'task_alt',
  finished: 'task_alt'
}

/**
 * Request → confirmation → assignment → payment → first visit → care → done. The track keeps one line per step so every
 * label sits on the same line; what the current step means (its deadline with a countdown, the first visit, the visits
 * done) is a status bar under the track.
 */
export function BookingLifecycleStepper({ booking }: { booking: BookingDetailRecord }) {
  const { t } = useTranslation()
  const format = useFormat()
  const now = useClock()
  const position = lifecyclePosition(booking)
  if (!position) return null

  const steps = lifecycleSteps(booking)
  const currentIndex = position.current === 'finished' ? steps.length : steps.indexOf(position.current)
  const currentLabel =
    position.current === 'finished'
      ? t(`${key}.steps.done`)
      : t(`${key}.steps.${lifecycleStepLabel(booking, position.current)}`)

  const left = position.dueAt ? timeLeft(position.dueAt, now) : null
  const countdown = !position.dueAt
    ? undefined
    : !left
      ? t(`${key}.overdue`)
      : left.days > 0
        ? t(`${key}.leftDays`, { days: left.days, hours: left.hours })
        : left.hours > 0
          ? t(`${key}.leftHours`, { hours: left.hours, minutes: left.minutes })
          : t(`${key}.leftMinutes`, { minutes: Math.max(1, left.minutes) })
  const detail =
    position.current === 'finished'
      ? booking.completedAt
        ? t(`${key}.completedAt`, { time: format.dateTime(booking.completedAt) })
        : undefined
      : position.current === 'care'
        ? t(`${key}.visitsDone`, {
            done: (booking.occurrences ?? []).filter((visit) => visit.status === 'COMPLETED').length,
            total: booking.occurrences?.length ?? 0
          })
        : position.dueAt
          ? t(position.current === 'upcoming' ? `${key}.firstVisit` : `${key}.due`, {
              time: format.dateTime(position.dueAt)
            })
          : undefined
  // Only a deadline the customer must meet turns orange; the wait for the first visit never does.
  const urgent = Boolean(
    position.dueAt && position.current !== 'upcoming' && (!left || new Date(position.dueAt).getTime() - now < URGENT_MS)
  )

  return (
    <section
      aria-label={t(`${key}.label`)}
      className='rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 shadow-[var(--shadow-card)] sm:p-5'
    >
      <Stepper
        label={t(`${key}.label`)}
        steps={steps.map((step, index) => {
          const state: StepState = index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'todo'
          return { id: step, label: t(`${key}.steps.${lifecycleStepLabel(booking, step)}`), state }
        })}
      />
      {detail || countdown ? (
        <div className='mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-2xl bg-forest-900 px-4 py-3 text-sm text-white shadow-[var(--shadow-soft)]'>
          <p className='flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5'>
            <Icon className='text-lg text-mint-300' name={STEP_ICONS[position.current]} />
            <span className='font-semibold text-white'>{currentLabel}</span>
            {detail ? <span className='text-white/70 tabular-nums'>{detail}</span> : null}
          </p>
          {countdown ? (
            <span
              className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums ${urgent ? 'bg-peach-300 text-forest-950' : 'bg-mint-300 text-forest-950'}`}
            >
              <Icon className='text-sm' name='schedule' />
              {countdown}
            </span>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
