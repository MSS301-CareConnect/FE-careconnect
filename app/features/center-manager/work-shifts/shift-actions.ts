import type { ProviderWorkShiftRecord } from '~/shared/api/generated/contracts'

import { vnInstant } from './shift-form-model'

export type ShiftAction = 'view' | 'edit' | 'duplicate' | 'approve' | 'open' | 'close' | 'cancel' | 'delete'

/** Actions that also run on several selected shifts at once (cancelling needs a reason per shift, so it stays single). */
export const BULK_SHIFT_ACTIONS = ['open', 'close', 'delete'] as const
export type BulkShiftAction = (typeof BULK_SHIFT_ACTIONS)[number]

/**
 * What the manager may do with a shift, following ProviderService: nothing changes once the shift has started or is
 * cancelled / completed; sign-up opens only before the deadline with places left (status is the effective one).
 */
export function allowedShiftActions(shift: ProviderWorkShiftRecord, now: number): Set<ShiftAction> {
  const actions = new Set<ShiftAction>(['view', 'duplicate'])
  const started = vnInstant(shift.workDate, shift.startTime).getTime() <= now
  const finished = shift.shiftStatus === 'CANCELLED' || shift.shiftStatus === 'COMPLETED'
  // ProviderService deletes any shift nobody was approved for (409 otherwise); a running one is left alone.
  if ((shift.approvedCount ?? 0) === 0 && (!started || finished)) actions.add('delete')
  if (started || finished) return actions
  actions.add('edit')
  actions.add('cancel')
  const deadlineOpen = !shift.registrationDeadline || new Date(shift.registrationDeadline).getTime() > now
  const hasPlaces = (shift.approvedCount ?? 0) < shift.capacity
  if ((shift.pendingCount ?? 0) > 0 && hasPlaces) actions.add('approve')
  if (shift.shiftStatus === 'OPEN') actions.add('close')
  else if (deadlineOpen && hasPlaces) actions.add('open')
  return actions
}

/** Minutes of a shift ("HH:mm[:ss]" times on the same day). */
export function shiftMinutes(shift: Pick<ProviderWorkShiftRecord, 'startTime' | 'endTime'>) {
  const toMinutes = (value: string) => Number(value.slice(0, 2)) * 60 + Number(value.slice(3, 5))
  return toMinutes(shift.endTime) - toMinutes(shift.startTime)
}
