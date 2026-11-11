import { motion } from 'motion/react'
import { useState, type KeyboardEvent, type PointerEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { easeSoft } from '~/shared/ui/motion'

import { ChartEmpty, ChartLegend } from './chart-card'
import { niceMax, type ChartSeries } from './chart-colors'
import type { ColumnPoint } from './column-chart'

const VIEW_HEIGHT = 100
// Above this many periods the dots would crowd the line; the crosshair still marks the active period.
const MAX_DOTS = 31

/**
 * Change over time: one 2 px line per series on one y-axis, with a dot on every period of a short range. The lines are
 * revealed left to right with a clip (a `pathLength` draw broke them into dashes under `non-scaling-stroke`). A
 * crosshair follows the pointer (or ←/→ once the chart has focus) and a tooltip lists every series at that period; the
 * focused chart announces the same text, so identity never rests on colour alone.
 */
export function LineChart<K extends string>({
  series,
  points,
  format,
  height = 'h-56',
  emptyLabel
}: {
  series: readonly ChartSeries<K>[]
  points: readonly ColumnPoint<K>[]
  format: (value: number) => string
  height?: string
  emptyLabel?: string
}) {
  const { t } = useTranslation()
  const [active, setActive] = useState<number | null>(null)
  const peak = Math.max(0, ...points.flatMap((point) => series.map((item) => point.values[item.key] ?? 0)))
  if (peak === 0 || points.length === 0) return <ChartEmpty label={emptyLabel ?? t('common.charts.empty')} />
  const max = niceMax(peak)
  // A small inset keeps the first and last dots inside the plot.
  const xOf = (index: number) => (points.length === 1 ? 50 : 2 + (index / (points.length - 1)) * 96)
  const yOf = (value: number) => VIEW_HEIGHT - (Math.max(0, value) / max) * VIEW_HEIGHT
  const pathOf = (key: K) =>
    points.map((point, index) => `${index ? 'L' : 'M'}${xOf(index)},${yOf(point.values[key] ?? 0)}`).join(' ')
  const labelEvery = Math.max(1, Math.ceil(points.length / 8))
  const current = active === null ? null : points[active]
  const describe = (point: ColumnPoint<K>) =>
    t('common.charts.point', {
      label: point.label,
      values: series.map((item) => `${item.label} ${format(point.values[item.key] ?? 0)}`).join(', ')
    })

  function pick(event: PointerEvent<HTMLDivElement>) {
    const box = event.currentTarget.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (event.clientX - box.left) / box.width))
    setActive(Math.round(ratio * (points.length - 1)))
  }

  function step(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    const delta = event.key === 'ArrowRight' ? 1 : -1
    setActive((index) => Math.min(points.length - 1, Math.max(0, (index ?? (delta > 0 ? -1 : points.length)) + delta)))
  }

  return (
    <figure className='space-y-4'>
      <ChartLegend series={series} />
      <div className='flex gap-2'>
        <div aria-hidden='true' className={`relative w-14 shrink-0 ${height}`}>
          {[1, 0.5, 0].map((ratio) => (
            <span
              className='absolute right-0 -translate-y-1/2 text-[10px] text-on-surface-variant tabular-nums'
              key={ratio}
              style={{ top: `${(1 - ratio) * 100}%` }}
            >
              {format(max * ratio)}
            </span>
          ))}
        </div>
        <div className='min-w-0 flex-1'>
          <div
            aria-label={current ? describe(current) : series.map((item) => item.label).join(', ')}
            className={`relative rounded-md outline-none focus-visible:ring-2 focus-visible:ring-forest-700/40 ${height}`}
            onBlur={() => setActive(null)}
            onKeyDown={step}
            onPointerLeave={() => setActive(null)}
            onPointerMove={pick}
            role='img'
            tabIndex={0}
          >
            <svg
              aria-hidden='true'
              className='absolute inset-0 h-full w-full overflow-visible'
              preserveAspectRatio='none'
              viewBox={`0 0 100 ${VIEW_HEIGHT}`}
            >
              {[0, 0.5].map((ratio) => (
                <line
                  className='stroke-outline-variant/60'
                  key={ratio}
                  strokeDasharray='3 3'
                  vectorEffect='non-scaling-stroke'
                  x1='0'
                  x2='100'
                  y1={ratio * VIEW_HEIGHT}
                  y2={ratio * VIEW_HEIGHT}
                />
              ))}
              <line
                className='stroke-outline-variant'
                vectorEffect='non-scaling-stroke'
                x1='0'
                x2='100'
                y1={VIEW_HEIGHT}
                y2={VIEW_HEIGHT}
              />
              {active !== null ? (
                <line
                  className='stroke-forest-900/30'
                  vectorEffect='non-scaling-stroke'
                  x1={xOf(active)}
                  x2={xOf(active)}
                  y1='0'
                  y2={VIEW_HEIGHT}
                />
              ) : null}
            </svg>
            <motion.div
              animate={{ clipPath: 'inset(-8px 0% -8px -8px)' }}
              aria-hidden='true'
              className='pointer-events-none absolute inset-0'
              initial={{ clipPath: 'inset(-8px 100% -8px -8px)' }}
              transition={{ duration: 0.9, ease: easeSoft }}
            >
              <svg
                className='absolute inset-0 h-full w-full overflow-visible'
                preserveAspectRatio='none'
                viewBox={`0 0 100 ${VIEW_HEIGHT}`}
              >
                {/* Last series first, so the first (the headline) stays on top where lines meet. */}
                {[...series].reverse().map((item) => (
                  <path
                    d={pathOf(item.key)}
                    fill='none'
                    key={item.key}
                    stroke={item.color}
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    vectorEffect='non-scaling-stroke'
                  />
                ))}
              </svg>
              {points.length <= MAX_DOTS
                ? [...series].reverse().flatMap((item) =>
                    points.map((point, index) => (
                      <span
                        className='absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full'
                        key={`${item.key}-${point.key}`}
                        style={{
                          backgroundColor: item.color,
                          left: `${xOf(index)}%`,
                          top: `${yOf(point.values[item.key] ?? 0)}%`
                        }}
                      />
                    ))
                  )
                : null}
            </motion.div>
            {active !== null && current
              ? series.map((item) => (
                  <span
                    aria-hidden='true'
                    className='pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white'
                    key={item.key}
                    style={{
                      backgroundColor: item.color,
                      left: `${xOf(active)}%`,
                      top: `${yOf(current.values[item.key] ?? 0)}%`
                    }}
                  />
                ))
              : null}
            {active !== null && current ? (
              <span
                aria-hidden='true'
                className={`pointer-events-none absolute top-1 z-10 w-max max-w-56 rounded-xl bg-forest-950 px-3 py-2 text-xs text-white shadow-[var(--shadow-float)] ${xOf(active) > 60 ? '-translate-x-[calc(100%+12px)]' : 'translate-x-3'}`}
                style={{ left: `${xOf(active)}%` }}
              >
                <span className='block font-semibold'>{current.label}</span>
                {series.map((item) => (
                  <span className='mt-0.5 flex items-center gap-1.5 tabular-nums' key={item.key}>
                    <span className='h-2 w-2 rounded-full' style={{ backgroundColor: item.color }} />
                    {item.label}: {format(current.values[item.key] ?? 0)}
                  </span>
                ))}
              </span>
            ) : null}
          </div>
          <div aria-hidden='true' className='relative mt-1 h-4'>
            {points.map((point, index) =>
              index % labelEvery === 0 ? (
                <span
                  className='absolute -translate-x-1/2 text-[10px] whitespace-nowrap text-on-surface-variant tabular-nums'
                  key={point.key}
                  style={{ left: `${xOf(index)}%` }}
                >
                  {point.label}
                </span>
              ) : null
            )}
          </div>
        </div>
      </div>
    </figure>
  )
}
