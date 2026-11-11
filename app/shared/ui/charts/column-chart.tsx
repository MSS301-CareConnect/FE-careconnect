import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'

import { easeSoft } from '~/shared/ui/motion'

import { ChartEmpty, ChartLegend } from './chart-card'
import { niceMax, type ChartSeries } from './chart-colors'

// Tooltips sit inside the plot (an overflow-x scroller would clip them above it) and open away from the edges.
function tooltipSide(index: number, count: number) {
  if (index < count / 3) return 'left-0'
  if (index >= (count * 2) / 3) return 'right-0'
  return 'left-1/2 -translate-x-1/2'
}

export interface ColumnPoint<K extends string> {
  key: string
  /** Axis text; long ranges show every n-th one. */
  label: string
  values: Record<K, number>
}

/**
 * Columns per period (grouped side by side, or stacked with a 2 px surface gap), drawn with CSS on one y-axis with three
 * recessive gridlines. Each period is focusable and names every value, and a hover / focus tooltip shows them, so the
 * chart needs no separate table. Negative values draw as empty columns; their value stays in the tooltip.
 */
export function ColumnChart<K extends string>({
  series,
  points,
  format,
  stacked = false,
  height = 'h-56',
  emptyLabel
}: {
  series: readonly ChartSeries<K>[]
  points: readonly ColumnPoint<K>[]
  format: (value: number) => string
  stacked?: boolean
  height?: string
  emptyLabel?: string
}) {
  const { t } = useTranslation()
  const valueOf = (point: ColumnPoint<K>, key: K) => Math.max(0, point.values[key] ?? 0)
  const peak = Math.max(
    0,
    ...points.map((point) =>
      stacked
        ? series.reduce((sum, item) => sum + valueOf(point, item.key), 0)
        : Math.max(0, ...series.map((item) => valueOf(point, item.key)))
    )
  )
  if (peak === 0) return <ChartEmpty label={emptyLabel ?? t('common.charts.empty')} />
  const max = niceMax(peak)
  const labelEvery = Math.max(1, Math.ceil(points.length / 10))
  const grid = [1, 0.5]

  return (
    <figure className='space-y-4'>
      <ChartLegend series={series} />
      <div className='flex gap-2'>
        <div aria-hidden='true' className={`relative w-14 shrink-0 ${height}`}>
          {grid.map((ratio) => (
            <span
              className='absolute right-0 -translate-y-1/2 text-[10px] text-on-surface-variant tabular-nums'
              key={ratio}
              style={{ top: `${(1 - ratio) * 100}%` }}
            >
              {format(max * ratio)}
            </span>
          ))}
        </div>
        <div className='min-w-0 flex-1 overflow-x-auto pt-1'>
          <ul
            className={`relative flex min-w-full items-end gap-1 border-b border-outline-variant ${height}`}
            role='list'
          >
            {grid.map((ratio) => (
              <li
                aria-hidden='true'
                className='pointer-events-none absolute inset-x-0 border-t border-dashed border-outline-variant/60'
                key={ratio}
                style={{ top: `${(1 - ratio) * 100}%` }}
              />
            ))}
            {points.map((point, index) => {
              const summary = series.map((item) => `${item.label} ${format(point.values[item.key] ?? 0)}`).join(', ')
              return (
                <li
                  aria-label={t('common.charts.point', { label: point.label, values: summary })}
                  className='group relative flex h-full min-w-3 flex-1 items-end justify-center gap-0.5 rounded-md outline-none hover:bg-mint-50/70 focus-visible:bg-mint-50 focus-visible:ring-2 focus-visible:ring-forest-700/40'
                  key={point.key}
                  tabIndex={0}
                >
                  {stacked ? (
                    <div className='flex h-full w-full max-w-7 flex-col-reverse justify-start gap-[2px]'>
                      {series.map((item) => (
                        <motion.span
                          animate={{ scaleY: 1 }}
                          className='block w-full origin-bottom rounded-[4px]'
                          initial={{ scaleY: 0 }}
                          key={item.key}
                          style={{
                            backgroundColor: item.color,
                            height: `${(valueOf(point, item.key) / max) * 100}%`
                          }}
                          transition={{ duration: 0.6, delay: Math.min(index, 14) * 0.03, ease: easeSoft }}
                        />
                      ))}
                    </div>
                  ) : (
                    series.map((item) => (
                      <motion.span
                        animate={{ scaleY: 1 }}
                        className='block w-full max-w-4 origin-bottom rounded-t-[4px]'
                        initial={{ scaleY: 0 }}
                        key={item.key}
                        style={{ backgroundColor: item.color, height: `${(valueOf(point, item.key) / max) * 100}%` }}
                        transition={{ duration: 0.6, delay: Math.min(index, 14) * 0.03, ease: easeSoft }}
                      />
                    ))
                  )}
                  <span
                    aria-hidden='true'
                    className={`pointer-events-none absolute top-1 z-10 hidden w-max max-w-56 rounded-xl bg-forest-950 px-3 py-2 text-xs text-white shadow-[var(--shadow-float)] group-hover:block group-focus-visible:block ${tooltipSide(index, points.length)}`}
                  >
                    <span className='block font-semibold'>{point.label}</span>
                    {series.map((item) => (
                      <span className='mt-0.5 flex items-center gap-1.5 tabular-nums' key={item.key}>
                        <span className='h-2 w-2 rounded-full' style={{ backgroundColor: item.color }} />
                        {item.label}: {format(point.values[item.key] ?? 0)}
                      </span>
                    ))}
                  </span>
                  <span
                    aria-hidden='true'
                    className='absolute top-full mt-1 text-[10px] whitespace-nowrap text-on-surface-variant tabular-nums'
                  >
                    {index % labelEvery === 0 ? point.label : ''}
                  </span>
                </li>
              )
            })}
          </ul>
          <div aria-hidden='true' className='h-5' />
        </div>
      </div>
    </figure>
  )
}
