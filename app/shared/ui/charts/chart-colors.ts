/**
 * Chart colours (2026-11-10). Categorical hues are assigned in this fixed order and follow the entity, never its rank;
 * the values live in `app.css` (`--color-chart-*`, validated for colour-vision deficiency on the light surface).
 * `muted` is the recessive grey for "other" / remaining shares.
 */
export const chartColors = {
  c1: 'var(--color-chart-1)',
  c2: 'var(--color-chart-2)',
  c3: 'var(--color-chart-3)',
  c4: 'var(--color-chart-4)',
  c5: 'var(--color-chart-5)',
  muted: 'var(--color-outline-variant)'
} as const

export type ChartColor = (typeof chartColors)[keyof typeof chartColors]

export interface ChartSeries<K extends string> {
  key: K
  label: string
  color: string
}

/** "2026-11-09" → "09/11", "2026-11" → "11/2026" for time axes (periods are Vietnam calendar days or months). */
export function periodLabel(period: string) {
  const [year, month, day] = period.split('-')
  return day ? `${day}/${month}` : `${month}/${year}`
}

/** A round axis maximum (1, 2, 2.5 or 5 × 10ⁿ) at or above `value`, so gridlines land on readable numbers. */
export function niceMax(value: number) {
  if (value <= 0) return 1
  const power = 10 ** Math.floor(Math.log10(value))
  const step = [1, 2, 2.5, 5, 10].find((candidate) => candidate * power >= value) ?? 10
  return step * power
}
