import type { CalendarItem } from './calendar-model'

/** Stripes that mark time off, drawn from the neutral token. */
export const TIME_OFF_STRIPES =
  'bg-[repeating-linear-gradient(135deg,var(--color-neutral-container)_0_6px,var(--color-surface-container-lowest)_6px_12px)]'

/** Colours of the three calendar layers: mint working hours, forest visits, striped gray time off. */
export function itemClass(item: CalendarItem) {
  if (item.kind === 'visit') return 'border border-forest-900 bg-forest-900 text-white'
  if (item.kind === 'timeOff') return `border border-outline-variant text-on-surface-variant ${TIME_OFF_STRIPES}`
  if (item.state === 'cancelled')
    return 'border border-dashed border-outline-variant bg-surface-container-lowest text-on-surface-variant line-through'
  if (item.state === 'past') return 'border border-outline-variant bg-surface-container-low text-on-surface-variant'
  return 'border border-mint-200 bg-mint-100 text-forest-900'
}

export const LEGEND = [
  { key: 'availability', swatch: 'border border-mint-200 bg-mint-100' },
  { key: 'visit', swatch: 'bg-forest-900' },
  { key: 'timeOff', swatch: `border border-outline-variant ${TIME_OFF_STRIPES}` }
] as const
