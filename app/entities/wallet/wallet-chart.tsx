import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'

import type { WalletSeriesPointRecord } from '~/shared/api/generated/contracts'
import { useFormat } from '~/shared/lib/format'
import { easeSoft } from '~/shared/ui/motion'

type Measure = 'income' | 'withdrawn' | 'spent'
const COLORS: Record<Measure, string> = {
  income: 'bg-mint-400',
  withdrawn: 'bg-peach-300',
  spent: 'bg-forest-700'
}

/** "2026-11-09" → "09/11", "2026-11" → "11/2026" for the axis. */
function periodLabel(period: string) {
  const [year, month, day] = period.split('-')
  return day ? `${day}/${month}` : `${month}/${year}`
}

/**
 * Columns per period (income, withdrawn and — for customers — paid), drawn with CSS; every column states its value in
 * its accessible name, so the chart needs no separate table. Income can dip below zero after a complaint refund; the
 * column then shows as empty and the value stays in the label.
 */
export function WalletChart({ series, showSpent }: { series: WalletSeriesPointRecord[]; showSpent: boolean }) {
  const { t } = useTranslation()
  const { money } = useFormat()
  const measures: Measure[] = showSpent ? ['income', 'spent', 'withdrawn'] : ['income', 'withdrawn']
  const valueOf = (point: WalletSeriesPointRecord, measure: Measure) => Math.max(0, point[measure] ?? 0)
  const max = Math.max(0, ...series.flatMap((point) => measures.map((measure) => valueOf(point, measure))))
  // Long ranges label every n-th column so the axis stays readable on phones.
  const labelEvery = Math.max(1, Math.ceil(series.length / 12))

  return (
    <figure className='space-y-3'>
      <figcaption className='flex flex-wrap items-center justify-between gap-3'>
        <span className='text-sm font-semibold text-on-surface'>{t('wallet.chart.title')}</span>
        <span className='flex flex-wrap gap-3 text-xs text-on-surface-variant'>
          {measures.map((measure) => (
            <span className='flex items-center gap-1.5' key={measure}>
              <span aria-hidden='true' className={`h-2.5 w-2.5 rounded-full ${COLORS[measure]}`} />
              {t(`wallet.chart.${measure}`)}
            </span>
          ))}
        </span>
      </figcaption>
      {max === 0 ? (
        <p className='rounded-2xl bg-mint-50 px-4 py-8 text-center text-sm text-on-surface-variant'>
          {t('wallet.chart.empty')}
        </p>
      ) : (
        <div className='overflow-x-auto'>
          <ul className='flex h-52 min-w-full items-end gap-1.5 border-b border-outline-variant/60 pb-px' role='list'>
            {series.map((point, index) => (
              <li className='flex h-full min-w-4 flex-1 flex-col justify-end' key={point.period}>
                <div className='flex h-full items-end justify-center gap-px'>
                  {measures.map((measure) => (
                    <motion.span
                      animate={{ scaleY: 1 }}
                      aria-label={t('wallet.chart.point', {
                        period: periodLabel(point.period),
                        label: t(`wallet.chart.${measure}`),
                        amount: money(point[measure] ?? 0)
                      })}
                      className={`w-full max-w-4 origin-bottom rounded-t-full ${COLORS[measure]}`}
                      initial={{ scaleY: 0 }}
                      key={measure}
                      role='img'
                      style={{ height: `${(valueOf(point, measure) / max) * 100}%` }}
                      title={money(point[measure] ?? 0)}
                      transition={{ duration: 0.6, delay: Math.min(index, 12) * 0.03, ease: easeSoft }}
                    />
                  ))}
                </div>
                <span
                  aria-hidden='true'
                  className='mt-1 h-4 text-center text-[10px] text-on-surface-variant tabular-nums'
                >
                  {index % labelEvery === 0 ? periodLabel(point.period) : ''}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </figure>
  )
}
