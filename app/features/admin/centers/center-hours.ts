/** Operating hours are one text field in ProviderService, written and read as `HH:mm - HH:mm`. */
const HOURS = /^(\d{2}:\d{2})\s*[-–]\s*(\d{2}:\d{2})$/

export type CenterHours =
  | { kind: 'none' }
  | { kind: 'legacy'; text: string }
  | { kind: 'range' | 'overnight' | 'allDay'; open: string; close: string }

/**
 * Any pair of times is valid (D-04): a closing time earlier than the opening time means the center works overnight,
 * equal times mean it is open around the clock. Text that is not a pair stays as stored.
 */
export function parseCenterHours(value: string | undefined): CenterHours {
  const text = value?.trim() ?? ''
  if (!text) return { kind: 'none' }
  const match = HOURS.exec(text)
  if (!match) return { kind: 'legacy', text }
  return describeHours(match[1], match[2])
}

export function describeHours(open: string, close: string): CenterHours {
  if (open === close) return { kind: 'allDay', open, close }
  return { kind: close < open ? 'overnight' : 'range', open, close }
}

export function formatCenterHours(open: string, close: string) {
  return `${open} - ${close}`
}
