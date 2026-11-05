import type { ProviderWorkShiftRecord } from '~/shared/api/generated/contracts'

import { vnInstant } from './shift-form-model'

export type ShiftAction = 'view' | 'edit' | 'duplicate' | 'open' | 'close' | 'cancel'

/**
 * What the manager may do with a shift, following ProviderService: nothing changes once the shift has started or is
 * cancelled / completed; sign-up opens only before the deadline with places left (status is the effective one).
 */
export function allowedShiftActions(shift: ProviderWorkShiftRecord, now: number): Set<ShiftAction> {
  const actions = new Set<ShiftAction>(['view', 'duplicate'])
  const started = vnInstant(shift.workDate, shift.startTime).getTime() <= now
  const finished = shift.shiftStatus === 'CANCELLED' || shift.shiftStatus === 'COMPLETED'
  if (started || finished) return actions
  actions.add('edit')
  actions.add('cancel')
  const deadlineOpen = !shift.registrationDeadline || new Date(shift.registrationDeadline).getTime() > now
  const hasPlaces = (shift.approvedCount ?? 0) < shift.capacity
  if (shift.shiftStatus === 'OPEN') actions.add('close')
  else if (deadlineOpen && hasPlaces) actions.add('open')
  return actions
}

/** Minutes of a shift ("HH:mm[:ss]" times on the same day). */
export function shiftMinutes(shift: Pick<ProviderWorkShiftRecord, 'startTime' | 'endTime'>) {
  const toMinutes = (value: string) => Number(value.slice(0, 2)) * 60 + Number(value.slice(3, 5))
  return toMinutes(shift.endTime) - toMinutes(shift.startTime)
}
