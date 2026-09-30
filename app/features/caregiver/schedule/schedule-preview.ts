export type SessionStatus = 'ongoing' | 'confirmed' | 'upcoming' | 'completed'
export type PatientKey = 'a' | 'b' | 'c'
export interface ScheduleSession {
  id: string
  date: string
  startHour: number
  endHour: number
  patient: PatientKey
  status: SessionStatus
}

export const sampleToday = '2026-09-20'
export const sampleTomorrow = '2026-09-21'
export const sampleWeekStart = '2026-09-19'
export const sessionStatuses: SessionStatus[] = ['ongoing', 'confirmed', 'upcoming', 'completed']

export const schedulePreview: readonly ScheduleSession[] = [
  { id: 'sample-19', date: '2026-09-19', startHour: 8, endHour: 12, patient: 'b', status: 'completed' },
  { id: 'sample-20-am', date: sampleToday, startHour: 8, endHour: 12, patient: 'a', status: 'ongoing' },
  { id: 'sample-20-pm', date: sampleToday, startHour: 14, endHour: 18, patient: 'c', status: 'confirmed' },
  { id: 'sample-21', date: sampleTomorrow, startHour: 14, endHour: 18, patient: 'b', status: 'upcoming' },
  { id: 'sample-22', date: '2026-09-22', startHour: 8, endHour: 12, patient: 'a', status: 'upcoming' },
  { id: 'sample-23-am', date: '2026-09-23', startHour: 8, endHour: 12, patient: 'c', status: 'upcoming' },
  { id: 'sample-23-pm', date: '2026-09-23', startHour: 14, endHour: 18, patient: 'b', status: 'upcoming' },
  { id: 'sample-24', date: '2026-09-24', startHour: 8, endHour: 12, patient: 'a', status: 'upcoming' }
]

export const patientAges: Record<PatientKey, number> = { a: 78, c: 65, b: 70 }
export const patientImages: Partial<Record<PatientKey, string>> = {
  a: 'https://lh3.googleusercontent.com/aida/AEtjO1Wo9RHCxhwbdzDMpwAexot8HlDsbapPxEsDKlLaOx-FiWsDYzeLTaLbXWjxrfSRveutMIKe9zZ8brT0gFbhXcoW4KCxz1MtR-oOJv3FddfDpv6LbgUG1K7027QR3pbeUFjrhke8y2iAKSrLVgEkF7AY1QvD9FoUKrzSTGvOopZGSXInNDN2SGyQyPvBqFMj0j5HnNXUl3nyCUgJm3oKZUyzik5ivh_A3sSYU0R4hRIAPI2bK3AhHKaxPPA',
  c: 'https://lh3.googleusercontent.com/aida/AEtjO1Xcolw7_A30gqTRLnijZJSqrbzEX2pWYoG6xpkaN1rF390dqGOYJJaQpbV9rmonA6oEoKphJL2iM4zn9nDvXkyxPjvxwtCOAYXdLB-qHlc_H7Oitub0bgzpqCmxpUBtmFuTEkixDA8KPXsTaoI7Is0BOqBRVtPAoreZnAifCKkgpmOiqfRVQVzCvr2zmDUfvUT3OTL9xIhwpm_-pNuOV768nLs5ovABhlKLstQCaluroYY02JurCRqh51w'
}

export function dateFromKey(key: string) {
  return new Date(`${key}T00:00:00Z`)
}

export function dateKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function addDays(key: string, count: number) {
  const date = dateFromKey(key)
  date.setUTCDate(date.getUTCDate() + count)
  return dateKey(date)
}

export function displayWeekStart(key: string) {
  if (key >= sampleWeekStart && key <= addDays(sampleWeekStart, 6)) return sampleWeekStart
  const day = dateFromKey(key).getUTCDay()
  return addDays(key, -((day + 6) % 7))
}

export function validDateKey(value: string | null): value is string {
  if (!value || !/^(19|20)\d{2}-\d{2}-\d{2}$/.test(value)) return false
  const date = dateFromKey(value)
  return Number.isFinite(date.getTime()) && dateKey(date) === value
}

export function formatDate(key: string, locale: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' }).format(dateFromKey(key))
}

export function formatHour(hour: number, locale: string) {
  const date = dateFromKey(sampleToday)
  date.setUTCHours(hour)
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: 'UTC'
  }).format(date)
}
