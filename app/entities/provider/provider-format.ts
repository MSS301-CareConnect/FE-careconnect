export function formatProviderDate(value: string, language: string): string {
  const date = new Date(`${value}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(language, { dateStyle: 'medium', timeZone: 'UTC' }).format(date)
}

export function formatProviderTime(value: string, language: string): string {
  const date = new Date(`1970-01-01T${value}Z`)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(language, { timeStyle: 'short', timeZone: 'UTC' }).format(date)
}
