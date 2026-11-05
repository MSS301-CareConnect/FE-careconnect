import { SHIFT_TYPE_CODES } from '~/entities/provider/work-shift'
import type { ApiErrorMap } from '~/shared/api/api-error'
import type { ProviderWorkShiftRecord, WorkShiftBatchRequest, WorkShiftRequest } from '~/shared/api/generated/contracts'
import { addDays, calendarDayOf, isoWeekday, minutesBetween } from '~/shared/lib/format'

/**
 * The create / edit / duplicate form of a work shift. Rules mirror ProviderService (WorkShiftServiceImpl.validateFields)
 * so every field is checked here first; the backend answers with one code per field as a safety net.
 */

export const MAX_CAPACITY = 50
export const MAX_NOTE = 500
export const MAX_BATCH = 31
const HOUR = 3_600_000

export type DeadlineMode = 'h24' | 'h12' | 'custom'
export type ShiftFormMode = 'create' | 'edit' | 'duplicate'

export interface ShiftFormValues {
  workDate: string
  shiftType: string
  startTime: string
  endTime: string
  capacity: number | ''
  deadlineMode: DeadlineMode
  deadlineDate: string
  deadlineTime: string
  note: string
  repeat: boolean
  repeatTo: string
  weekdays: number[]
}

export type ShiftField =
  'workDate' | 'shiftType' | 'startTime' | 'endTime' | 'capacity' | 'deadline' | 'note' | 'repeat'
export type ShiftErrorKey =
  | 'date'
  | 'past'
  | 'time'
  | 'end'
  | 'duration'
  | 'capacity'
  | 'type'
  | 'deadline'
  | 'note'
  | 'weekdays'
  | 'range'
  | 'tooMany'
  | 'batch'
export type ShiftBusinessKey = `centerManager.workShifts.form.business.${
  'conflict' | 'hasApproved' | 'statusInvalid' | 'started' | 'full' | 'centerInactive' | 'notFound'}`

/** ProviderService codes → the input they belong to, or a sentence at the end of the form. */
export const SHIFT_ERROR_MAP: ApiErrorMap<ShiftField, ShiftErrorKey, ShiftBusinessKey> = {
  fields: {
    4302: { field: 'endTime', key: 'end' },
    4303: { field: 'workDate', key: 'past' },
    4309: { field: 'endTime', key: 'duration' },
    4310: { field: 'capacity', key: 'capacity' },
    4311: { field: 'deadline', key: 'deadline' },
    4312: { field: 'note', key: 'note' },
    4313: { field: 'shiftType', key: 'type' },
    4315: { field: 'repeat', key: 'tooMany' }
  },
  business: {
    4300: 'centerManager.workShifts.form.business.notFound',
    4301: 'centerManager.workShifts.form.business.conflict',
    4305: 'centerManager.workShifts.form.business.full',
    4306: 'centerManager.workShifts.form.business.hasApproved',
    4307: 'centerManager.workShifts.form.business.statusInvalid',
    4308: 'centerManager.workShifts.form.business.started',
    4116: 'centerManager.workShifts.form.business.centerInactive'
  }
}

/** Instant of a Vietnam-time date + "HH:mm". */
export function vnInstant(date: string, time: string) {
  return new Date(`${date}T${time.slice(0, 5)}:00+07:00`)
}

/** "HH:mm" of an instant in Vietnam time. */
export function vnClock(value: Date | string) {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: 'Asia/Ho_Chi_Minh'
  }).format(new Date(value))
}

export function emptyShiftForm(today: string): ShiftFormValues {
  const tomorrow = addDays(today, 1)
  return {
    workDate: tomorrow,
    shiftType: 'MORNING',
    startTime: '07:00',
    endTime: '11:30',
    capacity: 2,
    deadlineMode: 'h24',
    deadlineDate: '',
    deadlineTime: '',
    note: '',
    repeat: false,
    repeatTo: addDays(tomorrow, 6),
    weekdays: [1, 2, 3, 4, 5]
  }
}

/** Values of an existing shift; a duplicate keeps everything but moves to the next free day. */
export function shiftFormFromRecord(
  shift: ProviderWorkShiftRecord,
  mode: ShiftFormMode,
  today: string
): ShiftFormValues {
  const base = emptyShiftForm(today)
  const workDate =
    mode === 'duplicate' ? (shift.workDate > today ? addDays(shift.workDate, 1) : addDays(today, 1)) : shift.workDate
  const keepDeadline = mode === 'edit' && shift.registrationDeadline
  return {
    ...base,
    workDate,
    shiftType: mode === 'duplicate' && !isNewType(shift.shiftType) ? 'CUSTOM' : shift.shiftType,
    startTime: shift.startTime.slice(0, 5),
    endTime: shift.endTime.slice(0, 5),
    capacity: shift.capacity,
    deadlineMode: keepDeadline ? 'custom' : 'h24',
    deadlineDate: keepDeadline ? calendarDayOf(shift.registrationDeadline!) : '',
    deadlineTime: keepDeadline ? vnClock(shift.registrationDeadline!) : '',
    note: shift.note ?? '',
    repeatTo: addDays(workDate, 6)
  }
}

function isNewType(type: string) {
  return (SHIFT_TYPE_CODES as readonly string[]).includes(type)
}

/**
 * The deadline that will be sent: 24 h / 12 h before the start, falling back to 1 h before when that is already past
 * (the backend applies the same fallback when the deadline is left empty), or the custom date + time.
 */
export function deadlineOf(values: ShiftFormValues, workDate: string, now: number): Date | null {
  if (values.deadlineMode === 'custom') {
    return values.deadlineDate && values.deadlineTime ? vnInstant(values.deadlineDate, values.deadlineTime) : null
  }
  const start = vnInstant(workDate, values.startTime).getTime()
  const lead = values.deadlineMode === 'h24' ? 24 : 12
  if (start - lead * HOUR > now) return new Date(start - lead * HOUR)
  if (start - HOUR > now) return new Date(start - HOUR)
  return null
}

/** Days the repeat creates: every chosen ISO weekday from the work date to repeatTo (inclusive). */
export function repeatDates(values: ShiftFormValues) {
  if (!values.repeat) return [values.workDate]
  const days: string[] = []
  if (!values.workDate || !values.repeatTo || values.repeatTo < values.workDate) return days
  for (let day = values.workDate; day <= values.repeatTo && days.length <= MAX_BATCH; day = addDays(day, 1)) {
    if (values.weekdays.includes(isoWeekday(day))) days.push(day)
  }
  return days
}

export function validateShiftForm(
  values: ShiftFormValues,
  { now, original, mode }: { now: number; original?: ProviderWorkShiftRecord; mode: ShiftFormMode }
) {
  const errors: Partial<Record<ShiftField, ShiftErrorKey>> = {}
  const editing = mode === 'edit' && original
  const timeChanged =
    !editing ||
    original.workDate !== values.workDate ||
    original.startTime.slice(0, 5) !== values.startTime ||
    original.endTime.slice(0, 5) !== values.endTime

  if (!values.workDate) errors.workDate = 'date'
  if (!values.startTime || !values.endTime) errors.startTime = 'time'
  else {
    const minutes = minutesBetween(values.startTime, values.endTime)
    if (minutes <= 0) errors.endTime = 'end'
    else if (timeChanged && minutes < 60) errors.endTime = 'duration'
  }
  if (
    values.workDate &&
    values.startTime &&
    timeChanged &&
    vnInstant(values.workDate, values.startTime).getTime() <= now
  )
    errors.workDate = 'past'

  const typeChanged = !editing || original.shiftType !== values.shiftType
  if (!values.shiftType || (typeChanged && !isNewType(values.shiftType))) errors.shiftType = 'type'

  const capacityChanged = !editing || original.capacity !== values.capacity
  if (values.capacity === '' || (capacityChanged && (values.capacity < 1 || values.capacity > MAX_CAPACITY)))
    errors.capacity = 'capacity'

  const noteChanged = !editing || (original.note ?? '') !== values.note.trim()
  if (noteChanged && values.note.trim().length > MAX_NOTE) errors.note = 'note'

  if (values.deadlineMode === 'custom' && values.workDate && values.startTime) {
    const deadline = deadlineOf(values, values.workDate, now)
    const start = vnInstant(values.workDate, values.startTime).getTime()
    const unchanged =
      editing &&
      original.registrationDeadline &&
      deadline?.getTime() === new Date(original.registrationDeadline).getTime()
    if (!deadline) errors.deadline = 'deadline'
    else if (!unchanged && (deadline.getTime() <= now || deadline.getTime() > start - HOUR))
      errors.deadline = 'deadline'
    else if (deadline.getTime() >= start) errors.deadline = 'deadline'
  }

  if (values.repeat) {
    if (values.weekdays.length === 0) errors.repeat = 'weekdays'
    else if (!values.repeatTo || values.repeatTo < values.workDate) errors.repeat = 'range'
    else {
      const days = repeatDates(values)
      if (days.length === 0) errors.repeat = 'batch'
      else if (days.length > MAX_BATCH) errors.repeat = 'tooMany'
    }
  }
  return errors
}

export function toShiftRequest(
  values: ShiftFormValues,
  status: WorkShiftRequest['shiftStatus'],
  now: number,
  version?: number
): WorkShiftRequest {
  const deadline = deadlineOf(values, values.workDate, now)
  return {
    workDate: values.workDate,
    startTime: values.startTime,
    endTime: values.endTime,
    shiftType: values.shiftType,
    shiftStatus: status,
    capacity: Number(values.capacity),
    registrationDeadline: deadline?.toISOString(),
    note: values.note.trim() || undefined,
    version
  }
}

/** The repeat as one all-or-nothing batch; the deadline becomes a lead time so every day gets its own. */
export function toBatchRequest(values: ShiftFormValues, status: 'DRAFT' | 'OPEN', now: number): WorkShiftBatchRequest {
  const days = repeatDates(values)
  let lead: number | undefined
  if (values.deadlineMode === 'h24') lead = 24 * 60
  else if (values.deadlineMode === 'h12') lead = 12 * 60
  else if (values.deadlineDate && values.deadlineTime) {
    const minutes = Math.round(
      (vnInstant(values.workDate, values.startTime).getTime() -
        vnInstant(values.deadlineDate, values.deadlineTime).getTime()) /
        60_000
    )
    lead = Math.min(10_080, Math.max(60, minutes))
  }
  // A lead that is already past for the first day would be refused; without one the backend falls back per day
  // (24 h before, else 1 h before).
  if (lead !== undefined && days[0] && vnInstant(days[0], values.startTime).getTime() - lead * 60_000 <= now) {
    lead = values.deadlineMode === 'custom' ? lead : undefined
  }
  return {
    workDates: days,
    startTime: values.startTime,
    endTime: values.endTime,
    shiftType: values.shiftType,
    shiftStatus: status,
    capacity: Number(values.capacity),
    registrationLeadMinutes: lead,
    note: values.note.trim() || undefined
  }
}
