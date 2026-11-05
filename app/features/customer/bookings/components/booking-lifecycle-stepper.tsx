import { useTranslation } from 'react-i18next'

import type { BookingDetailRecord } from '~/shared/api/generated/contracts'
import { useFormat } from '~/shared/lib/format'
import { useClock } from '~/shared/lib/use-clock'
import { Stepper, type StepState } from '~/shared/ui/stepper'

import { lifecyclePosition, lifecycleStepLabel, lifecycleSteps, timeLeft } from '../booking-lifecycle'

const key = 'customer.bookingDetail.lifecycle' as const
// A deadline closer than this is drawn in the warning colour.
const URGENT_MS = 6 * 60 * 60_000

/** Request → center confirmation → assignment → payment → care → done, with the current step's deadline. */
export function BookingLifecycleStepper({ booking }: { booking: BookingDetailRecord }) {
  const { t } = useTranslation()
  const format = useFormat()
  const now = useClock()
  const position = lifecyclePosition(booking)
  if (!position) return null

  const steps = lifecycleSteps(booking)
  const currentIndex = position.current === 'finished' ? steps.length : steps.indexOf(position.current)
  const progress =
    position.current === 'care' && booking.status === 'IN_PROGRESS'
      ? t(`${key}.visitsDone`, {
          done: (booking.occurrences ?? []).filter((visit) => visit.status === 'COMPLETED').length,
          total: booking.occurrences?.length ?? 0
        })
      : undefined
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
  const deadline = position.dueAt
    ? t(position.current === 'care' ? `${key}.firstVisit` : `${key}.due`, {
        time: format.dateTime(position.dueAt),
        left: countdown
      })
    : progress
  const urgent = Boolean(
    position.dueAt && position.current !== 'care' && new Date(position.dueAt).getTime() - now < URGENT_MS
  )

  return (
    <section
      aria-label={t(`${key}.label`)}
      className='rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 shadow-[var(--shadow-card)] sm:px-5 sm:py-5'
    >
      <Stepper
        label={t(`${key}.label`)}
        steps={steps.map((step, index) => {
          const state: StepState = index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'todo'
          return {
            id: step,
            label: t(`${key}.steps.${lifecycleStepLabel(booking, step)}`),
            state,
            note:
              state === 'current'
                ? deadline
                : step === 'done' && booking.completedAt
                  ? t(`${key}.completedAt`, { time: format.dateTime(booking.completedAt) })
                  : undefined,
            noteTone: state === 'current' && urgent ? 'warning' : 'default'
          }
        })}
      />
    </section>
  )
}
