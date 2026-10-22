import type { CareRecipientDetailRecordMyAccessLevel } from '~/shared/api/generated/contracts'

export function canEditCareRecipient(level: CareRecipientDetailRecordMyAccessLevel | undefined): boolean {
  return level === 'OWNER' || level === 'EDITOR'
}

export function formatRecipientDate(value: string | undefined, language: string): string | undefined {
  if (!value) return undefined
  const date = new Date(value.length === 10 ? `${value}T00:00:00Z` : value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(language, { dateStyle: 'medium', timeZone: 'UTC' }).format(date)
}

export function ageFromBirthDate(value: string | undefined, today = new Date()): number | undefined {
  if (!value) return undefined
  const birth = new Date(`${value}T00:00:00Z`)
  if (Number.isNaN(birth.getTime())) return undefined
  let age = today.getUTCFullYear() - birth.getUTCFullYear()
  const beforeBirthday =
    today.getUTCMonth() < birth.getUTCMonth() ||
    (today.getUTCMonth() === birth.getUTCMonth() && today.getUTCDate() < birth.getUTCDate())
  if (beforeBirthday) age -= 1
  return age
}
