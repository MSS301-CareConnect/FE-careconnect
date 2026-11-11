import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { easeSoft } from '~/shared/ui/motion'

import { ChartEmpty } from './chart-card'

export interface BarListItem {
  key: string
  label: ReactNode
  value: number
  /** Formatted value; defaults to `format(value)`. */
  display?: string
  hint?: ReactNode
}

/**
 * Ranked magnitudes (top centers, caregivers, rating stars): one row per item with its label, value and a thin bar on a
 * shared scale. The rows are the table; the bar only adds shape.
 */
export function BarList({
  items,
  format,
  color,
  emptyLabel,
  max
}: {
  items: readonly BarListItem[]
  format: (value: number) => string
  color: string
  emptyLabel?: string
  max?: number
}) {
  const { t } = useTranslation()
  const scale = max ?? Math.max(0, ...items.map((item) => item.value))
  if (items.length === 0 || scale === 0) return <ChartEmpty label={emptyLabel ?? t('common.charts.empty')} />

  return (
    <ol className='space-y-3'>
      {items.map((item, index) => (
        <li key={item.key}>
          <div className='flex items-baseline justify-between gap-3 text-sm'>
            <span className='min-w-0 truncate font-medium text-on-surface'>{item.label}</span>
            <span className='shrink-0 font-bold text-on-surface tabular-nums'>
              {item.display ?? format(item.value)}
            </span>
          </div>
          {item.hint ? <p className='text-xs text-on-surface-variant'>{item.hint}</p> : null}
          <div aria-hidden='true' className='mt-1.5 h-2 overflow-hidden rounded-full bg-surface-container'>
            <motion.div
              className='h-full rounded-full'
              initial={{ width: 0 }}
              style={{ backgroundColor: color }}
              transition={{ duration: 0.7, delay: Math.min(index, 8) * 0.05, ease: easeSoft }}
              viewport={{ once: true }}
              whileInView={{ width: `${Math.max(2, (Math.max(0, item.value) / scale) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ol>
  )
}
