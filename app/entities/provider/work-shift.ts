import type { StatusTone } from '~/shared/ui/status-badge'

/**
 * Work-shift vocabulary shared by the Center Manager and Caregiver portals. Mirrors ProviderService
 * `util/ShiftTypes` and `util/WorkShiftStates`: the backend returns the effective status, so a shift that has started
 * or passed its registration deadline is never OPEN.
 */

/** Codes a new shift may use; DAILY / WEEKLY only appear on shifts created before 2026-11-05. */
export const SHIFT_TYPE_CODES = ['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT', 'FULL_DAY', 'CUSTOM'] as const
export type ShiftTypeCode = (typeof SHIFT_TYPE_CODES)[number]

type ShiftTypeLabel = ShiftTypeCode | 'DAILY' | 'WEEKLY' | 'OTHER'

/** Suggested hours a type chip fills in (24-hour "HH:mm", same day — overnight shifts are not supported). */
export const SHIFT_TYPE_PRESETS: Record<Exclude<ShiftTypeCode, 'CUSTOM'>, { start: string; end: string }> = {
  MORNING: { start: '07:00', end: '11:30' },
  AFTERNOON: { start: '13:00', end: '17:00' },
  EVENING: { start: '18:00', end: '22:00' },
  NIGHT: { start: '00:00', end: '06:00' },
  FULL_DAY: { start: '07:00', end: '19:00' }
}

/** i18n key of a shift type; unknown legacy values ("DAY", "STRING") read as "Other", never as the raw code. */
export function shiftTypeLabelKey(type: string | null | undefined): `common.status.shiftType.${ShiftTypeLabel}` {
  const code = (type ?? '').trim().toUpperCase()
  const known: readonly string[] = [...SHIFT_TYPE_CODES, 'DAILY', 'WEEKLY']
  return `common.status.shiftType.${(known.includes(code) ? code : 'OTHER') as ShiftTypeLabel}`
}

export const SHIFT_STATUS_CODES = ['DRAFT', 'OPEN', 'CLOSED', 'COMPLETED', 'CANCELLED'] as const
export type ShiftStatusCode = (typeof SHIFT_STATUS_CODES)[number]

/** One palette for shift states on every portal. */
export const SHIFT_STATUS_TONES: Record<ShiftStatusCode, StatusTone> = {
  DRAFT: 'caution',
  OPEN: 'success',
  CLOSED: 'info',
  COMPLETED: 'neutral',
  CANCELLED: 'danger'
}

export function shiftStatusLabelKey(status: string | null | undefined): `common.status.shift.${ShiftStatusCode}` {
  const code = (SHIFT_STATUS_CODES as readonly string[]).includes(status ?? '') ? status : 'CLOSED'
  return `common.status.shift.${code as ShiftStatusCode}`
}

/** Epoch ms of a shift date + "HH:mm[:ss]" in Vietnam time (never the browser's time zone). */
export function shiftInstant(workDate: string, time: string) {
  return new Date(`${workDate}T${time.slice(0, 5)}:00+07:00`).getTime()
}

/** "HH:mm" or "HH:mm:ss" → minutes since midnight. */
export function minutesOfDay(time: string) {
  return Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5))
}

/** Same-day half-open overlap of two "HH:mm" ranges. */
export function timeRangesOverlap(a: { start: string; end: string }, b: { start: string; end: string }) {
  return minutesOfDay(a.start) < minutesOfDay(b.end) && minutesOfDay(b.start) < minutesOfDay(a.end)
}
