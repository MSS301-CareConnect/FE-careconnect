import type { PricePlanRecord } from '~/shared/api/generated/contracts'
import { addMinutesToTime, minutesBetween } from '~/shared/lib/format'

/**
 * Several services in one booking (2026-11-05): every visit does one service, in its own time range that does not
 * overlap another visit, so the caregiver ticks the checklist of that service. Each service's price plan fixes the
 * visit length (DAY / SHIFT) or its minimum (HOUR) — BookingService checks the same rules.
 */
export interface ServiceOption {
  careServiceId: string
  offeringId: string
  name: string
  plan?: PricePlanRecord
}

/** A time range chosen inside the caregiver's shift, for one service (Vietnam time, same day as the shift). */
export interface ShiftSlot {
  startTime: string
  endTime: string
  careServiceId: string
}

/** Travel / rest kept free around another booking of the caregiver until BookingService says otherwise. */
export const DEFAULT_TRAVEL_BUFFER_MINUTES = 60

/** True when the plan fixes the length of a visit (DAY / SHIFT). */
export function isFixedPlan(plan: PricePlanRecord | undefined) {
  return Boolean(plan && plan.pricingUnit !== 'HOUR' && plan.durationMinutes)
}

/** Whether a visit of `minutes` fits the plan: DAY / SHIFT exactly its length, HOUR at least its minimum. */
export function fitsPlan(plan: PricePlanRecord | undefined, minutes: number) {
  if (!plan?.durationMinutes) return true
  return plan.pricingUnit === 'HOUR' ? minutes >= plan.durationMinutes : minutes === plan.durationMinutes
}

/** The end time that makes a visit starting at `startTime` fit the plan. */
export function planEndTime(plan: PricePlanRecord | undefined, startTime: string) {
  return plan?.durationMinutes ? addMinutesToTime(startTime, plan.durationMinutes) : startTime
}

const toMinutes = (time: string) => {
  const [hour, minute] = time.slice(0, 5).split(':').map(Number)
  return hour * 60 + minute
}
const toTime = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`

/**
 * The windows of one length a shift can be split into: starting every hour from the shift start, plus right after
 * every window already picked so two windows can follow each other without a gap.
 */
export function shiftWindows(shiftStart: string, shiftEnd: string, lengthMinutes: number, picked: ShiftSlot[] = []) {
  const start = toMinutes(shiftStart)
  const end = toMinutes(shiftEnd)
  if (lengthMinutes <= 0 || end - start < lengthMinutes) return []
  const starts = new Set<number>()
  for (let minute = start; minute + lengthMinutes <= end; minute += 60) starts.add(minute)
  for (const slot of picked) {
    const after = toMinutes(slot.endTime)
    if (after >= start && after + lengthMinutes <= end) starts.add(after)
  }
  return [...starts]
    .sort((a, b) => a - b)
    .map((minute) => ({ startTime: toTime(minute), endTime: toTime(minute + lengthMinutes) }))
}

/** Half-open overlap of two "HH:mm" ranges of the same day, after widening the second by `bufferMinutes`. */
export function rangesOverlap(
  first: { startTime: string; endTime: string },
  second: { startTime: string; endTime: string },
  bufferMinutes = 0
) {
  return (
    toMinutes(first.startTime) < toMinutes(second.endTime) + bufferMinutes &&
    toMinutes(second.startTime) - bufferMinutes < toMinutes(first.endTime)
  )
}

export const lengthOf = (slot: { startTime: string; endTime: string }) => minutesBetween(slot.startTime, slot.endTime)

export type ServiceTimeIssue = 'invalidTime' | 'planLength' | 'overlap'

/**
 * Errors of the per-service times of a pattern (2026-11-11): each included service needs a valid range that fits its
 * plan, and two services of the same day must not overlap.
 */
export function serviceTimeIssues(
  times: readonly { careServiceId: string; startTime: string; endTime: string; enabled: boolean }[],
  options: readonly ServiceOption[]
): (ServiceTimeIssue | null)[] {
  return times.map((time, index) => {
    if (!time.enabled) return null
    if (time.endTime <= time.startTime) return 'invalidTime'
    const plan = options.find((option) => option.careServiceId === time.careServiceId)?.plan
    if (!fitsPlan(plan, lengthOf(time))) return 'planLength'
    const clash = times.some(
      (other, position) =>
        position !== index && other.enabled && other.endTime > other.startTime && rangesOverlap(time, other)
    )
    return clash ? 'overlap' : null
  })
}
