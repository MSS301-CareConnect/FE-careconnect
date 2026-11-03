import type { CalendarItem } from './calendar-model'

/** Stripes that mark time off, drawn from the neutral token. */
export const TIME_OFF_STRIPES =
  'bg-[repeating-linear-gradient(135deg,var(--color-neutral-container)_0_6px,var(--color-surface-container-lowest)_6px_12px)]'

/** Colours of the three calendar layers: light green availability, solid visits, striped gray time off. */
export function itemClass(item: CalendarItem) {
  if (item.kind === 'visit') return 'border border-primary bg-primary text-on-primary'
  if (item.kind === 'timeOff') return `border border-outline-variant text-on-surface-variant ${TIME_OFF_STRIPES}`
  if (item.state === 'cancelled')
    return 'border border-dashed border-outline-variant bg-surface-container-lowest text-on-surface-variant line-through'
  if (item.state === 'past') return 'border border-outline-variant bg-surface-container-low text-on-surface-variant'
  return 'border border-brand-200 bg-brand-50 text-primary'
}

export const LEGEND = [
  { key: 'availability', swatch: 'border border-brand-200 bg-brand-50' },
  { key: 'visit', swatch: 'bg-primary' },
  { key: 'timeOff', swatch: `border border-outline-variant ${TIME_OFF_STRIPES}` }
] as const
