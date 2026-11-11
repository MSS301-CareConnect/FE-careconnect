import { motion } from 'motion/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { easeSoft } from '~/shared/ui/motion'

import { ChartEmpty } from './chart-card'

export interface DonutSlice {
  key: string
  label: string
  value: number
  color: string
}

const RADIUS = 40
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
// 2 px surface gap between neighbouring slices (in the 100-unit view box ≈ 1 unit of arc).
const GAP = 1.2

/**
 * Part-to-whole for a handful of categories: a thin ring with surface gaps, the total in the middle and the legend as a
 * value list beside it (count and share), which doubles as the table view. Hovering a slice or its row lifts it.
 */
export function DonutChart({
  slices,
  format,
  centerLabel,
  centerValue,
  emptyLabel
}: {
  slices: readonly DonutSlice[]
  format: (value: number) => string
  centerLabel?: string
  centerValue?: string
  emptyLabel?: string
}) {
  const { t, i18n } = useTranslation()
  const [active, setActive] = useState<string | null>(null)
  const visible = slices.filter((slice) => slice.value > 0)
  const total = visible.reduce((sum, slice) => sum + slice.value, 0)
  if (total === 0) return <ChartEmpty label={emptyLabel ?? t('common.charts.empty')} />
  const percent = new Intl.NumberFormat(i18n.language, { style: 'percent', maximumFractionDigits: 0 })
  // Where each slice starts on the ring: the running sum of the slices before it.
  const lengths = visible.map((slice) => (slice.value / total) * CIRCUMFERENCE)
  const starts = lengths.map((_, index) => lengths.slice(0, index).reduce((sum, length) => sum + length, 0))

  return (
    <figure className='flex flex-col items-center gap-5 sm:flex-row sm:items-center'>
      <div className='relative h-40 w-40 shrink-0'>
        <svg aria-hidden='true' className='h-full w-full -rotate-90' viewBox='0 0 100 100'>
          <circle className='stroke-surface-container' cx='50' cy='50' fill='none' r={RADIUS} strokeWidth='12' />
          {visible.map((slice, index) => {
            const dash = Math.max(0.5, lengths[index] - (visible.length > 1 ? GAP : 0))
            const start = starts[index]
            return (
              <motion.circle
                animate={{ strokeDasharray: `${dash} ${CIRCUMFERENCE}` }}
                cx='50'
                cy='50'
                fill='none'
                initial={{ strokeDasharray: `0 ${CIRCUMFERENCE}` }}
                key={slice.key}
                onPointerEnter={() => setActive(slice.key)}
                onPointerLeave={() => setActive(null)}
                r={RADIUS}
                stroke={slice.color}
                strokeDashoffset={-start}
                strokeLinecap='butt'
                strokeWidth={active === slice.key ? 15 : 12}
                style={{ transition: 'stroke-width 150ms' }}
                transition={{ duration: 0.8, ease: easeSoft }}
              />
            )
          })}
        </svg>
        <div className='pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center'>
          <span className='text-2xl font-extrabold tracking-tight text-forest-950 tabular-nums'>
            {centerValue ?? format(total)}
          </span>
          <span className='max-w-24 text-[11px] leading-tight text-on-surface-variant'>
            {centerLabel ?? t('common.charts.total')}
          </span>
        </div>
      </div>
      <dl className='w-full min-w-0 space-y-1.5'>
        {slices.map((slice) => (
          <div
            className={`flex items-center justify-between gap-3 rounded-full px-3 py-1.5 text-sm transition-colors ${active === slice.key ? 'bg-mint-50' : ''}`}
            key={slice.key}
            onPointerEnter={() => setActive(slice.key)}
            onPointerLeave={() => setActive(null)}
          >
            <dt className='flex min-w-0 items-center gap-2 text-on-surface-variant'>
              <span
                aria-hidden='true'
                className='h-2.5 w-2.5 shrink-0 rounded-full'
                style={{ backgroundColor: slice.color }}
              />
              <span className='truncate'>{slice.label}</span>
            </dt>
            <dd className='shrink-0 text-right tabular-nums'>
              <span className='font-bold text-on-surface'>{format(slice.value)}</span>
              <span className='ml-2 text-xs text-on-surface-variant'>{percent.format(slice.value / total)}</span>
            </dd>
          </div>
        ))}
      </dl>
    </figure>
  )
}
