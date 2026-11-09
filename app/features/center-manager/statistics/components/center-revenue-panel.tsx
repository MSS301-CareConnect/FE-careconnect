import { useQuery } from '@tanstack/react-query'
import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { formatMoney } from '~/entities/booking/booking-format'
import { fetchRevenue, paymentErrorKey, paymentKeys } from '~/entities/payment/payment-api'
import { Select } from '~/shared/ui/form-field'
import { ErrorState } from '~/shared/ui/state-panels'

const key = 'centerManager.statisticsPage.revenue' as const
const PERIODS = ['month', 'last30', 'year'] as const
type Period = (typeof PERIODS)[number]
const DAY = 24 * 60 * 60 * 1000

// Periods end now; a month or a year starts at local midnight of its first day.
function periodRange(period: Period, now: Date) {
  const start =
    period === 'month'
      ? new Date(now.getFullYear(), now.getMonth(), 1)
      : period === 'year'
        ? new Date(now.getFullYear(), 0, 1)
        : new Date(now.getTime() - 30 * DAY)
  return { from: start.toISOString(), to: now.toISOString() }
}

/** Spec §9.3: the center's net revenue (collected minus refunded) from PaymentService; the token decides the center. */
export function CenterRevenuePanel() {
  const { t, i18n } = useTranslation()
  const id = useId()
  const [period, setPeriod] = useState<Period>('month')
  // Fixed per period choice so the query key stays stable between renders.
  const [range, setRange] = useState(() => periodRange('month', new Date()))
  const revenue = useQuery({
    queryKey: paymentKeys.revenue(range.from, range.to),
    queryFn: () => fetchRevenue(range.from, range.to),
    retry: false
  })
  const language = i18n.language
  const count = new Intl.NumberFormat(language)

  function choose(next: Period) {
    setPeriod(next)
    setRange(periodRange(next, new Date()))
  }

  const metrics = revenue.data
    ? ([
        ['net', formatMoney(revenue.data.totalRevenue, language)],
        ['gross', formatMoney(revenue.data.grossRevenue, language)],
        ['refunded', formatMoney(revenue.data.totalRefunded, language)],
        ['payments', count.format(revenue.data.successfulPaymentCount)],
        // CR-4: kept deposits — the center keeps those of visits without a caregiver, the rest goes to the caregivers.
        ['centerForfeit', formatMoney(revenue.data.centerForfeitAmount ?? 0, language)],
        ['caregiverForfeit', formatMoney(revenue.data.caregiverForfeitAmount ?? 0, language)]
      ] as const)
    : []

  return (
    <section aria-labelledby={`${id}-title`} className='space-y-4'>
      <div className='flex flex-wrap items-end justify-between gap-3'>
        <div>
          <h2 className='text-[22px] font-bold tracking-tight text-forest-950' id={`${id}-title`}>
            {t(`${key}.title`)}
          </h2>
          <p className='text-sm text-on-surface-variant'>{t(`${key}.hint`)}</p>
        </div>
        <label className='text-sm font-semibold text-on-surface' htmlFor={`${id}-period`}>
          {t(`${key}.period`)}
          <Select
            className='mt-1 w-auto'
            id={`${id}-period`}
            onChange={(event) => choose(event.target.value as Period)}
            value={period}
          >
            {PERIODS.map((item) => (
              <option key={item} value={item}>
                {t(`${key}.periods.${item}`)}
              </option>
            ))}
          </Select>
        </label>
      </div>
      {revenue.isPending ? (
        <p className='text-sm text-on-surface-variant' role='status'>
          {t(`${key}.loading`)}
        </p>
      ) : null}
      {revenue.isError ? (
        <ErrorState message={t(paymentErrorKey(revenue.error))} onRetry={() => void revenue.refetch()} />
      ) : null}
      {revenue.data ? (
        <dl className='ops-stagger grid gap-3 sm:grid-cols-2 xl:grid-cols-3'>
          {metrics.map(([metric, value], index) => (
            <div
              className={`rounded-2xl border border-forest-900/[0.06] bg-surface-container-lowest p-5 shadow-[var(--shadow-card)] ${index === 0 ? 'ops-stat-dark' : ''}`}
              key={metric}
            >
              <dt className='text-xs font-semibold text-on-surface-variant'>{t(`${key}.metrics.${metric}`)}</dt>
              <dd className='ops-stat-value mt-2 text-[26px] font-extrabold tracking-tight text-forest-950 tabular-nums'>
                {value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  )
}
