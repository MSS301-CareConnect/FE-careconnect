export type CareRecordPatient = 'a' | 'b' | 'd' | 'minh'
export interface CareRecordPreview {
  code: string
  patient: CareRecordPatient
  date: string
  start: string
  end: string
  minutes: number
  age: number
  amount: number
  rating: number | null
  needsSupplement: boolean
}

export const careRecordPreviews: readonly CareRecordPreview[] = [
  {
    code: 'BK-8821',
    patient: 'a',
    date: '2026-09-20',
    start: '08:30',
    end: '12:00',
    minutes: 210,
    age: 78,
    amount: 350000,
    rating: 5,
    needsSupplement: false
  },
  {
    code: 'BK-8790',
    patient: 'b',
    date: '2026-09-18',
    start: '14:00',
    end: '18:00',
    minutes: 240,
    age: 70,
    amount: 350000,
    rating: 5,
    needsSupplement: false
  },
  {
    code: 'BK-8755',
    patient: 'd',
    date: '2026-09-15',
    start: '08:00',
    end: '12:00',
    minutes: 240,
    age: 82,
    amount: 350000,
    rating: 4.9,
    needsSupplement: false
  },
  {
    code: 'BK-8640',
    patient: 'minh',
    date: '2026-09-12',
    start: '08:00',
    end: '12:00',
    minutes: 240,
    age: 75,
    amount: 380000,
    rating: 5,
    needsSupplement: false
  },
  {
    code: 'BK-8600',
    patient: 'a',
    date: '2026-09-10',
    start: '08:00',
    end: '12:00',
    minutes: 240,
    age: 78,
    amount: 350000,
    rating: null,
    needsSupplement: true
  },
  {
    code: 'BK-8510',
    patient: 'b',
    date: '2026-08-28',
    start: '14:00',
    end: '18:00',
    minutes: 240,
    age: 70,
    amount: 350000,
    rating: null,
    needsSupplement: true
  }
]

export function findCareRecord(code: string) {
  const canonical = code === 'CC-BK-882194' || code === 'sample-20-am' ? 'BK-8821' : code
  return careRecordPreviews.find((record) => record.code === canonical)
}

export function careDate(
  date: string,
  locale: string,
  options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' }
) {
  return new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`))
}

export function careTime(time: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: 'UTC'
  }).format(new Date(`2026-09-20T${time}:00Z`))
}
