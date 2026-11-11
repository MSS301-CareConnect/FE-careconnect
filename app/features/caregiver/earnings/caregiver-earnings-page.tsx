import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { calendarDayOf, useFormat } from '~/shared/lib/format'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Pagination } from '~/shared/ui/pagination'
import { Icon } from '~/shared/ui/icon'
import { CountUp } from '~/shared/ui/motion'
import { SegmentedControl } from '~/shared/ui/segmented-control'

import { useKeptDeposits } from '../data/caregiver-queries'
import { useCaregiverFormat } from '../ui/caregiver-format'
import {
  CaregiverEmpty,
  CaregiverError,
  CaregiverPageHeader,
  cgCard,
  cgContainer,
  cgForestCard
} from '../ui/caregiver-page'
import { VisitListSkeleton } from '../ui/visit-skeleton'

type Period = 'month' | 'last30' | 'year'
const PERIODS: Period[] = ['month', 'last30', 'year']
const DAY_MS = 24 * 60 * 60 * 1000

/** Instants of the period, fixed when the period is picked so the query key stays stable. */
function rangeOf(period: Period, now: Date) {
  const to = new Date(now.getTime() + DAY_MS).toISOString()
  if (period === 'last30') return { from: new Date(now.getTime() - 30 * DAY_MS).toISOString(), to }
  const start =
    period === 'month'
      ? new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1) - 7 * 60 * 60 * 1000)
      : new Date(Date.UTC(now.getUTCFullYear(), 0, 1) - 7 * 60 * 60 * 1000)
  return { from: start.toISOString(), to }
}

/**
 * CR-4: deposits customers lost on this caregiver's visits (late cancellation, unpaid remaining balance). The policy
 * gives the whole kept amount to the caregiver of the visit; PaymentService keeps the ledger.
 */
export function CaregiverEarningsPage() {
  const { t } = useTranslation()
  const money = useFormat().money
  const format = useCaregiverFormat()
  const [period, setPeriod] = useState<Period>('month')
  const [range, setRange] = useState(() => rangeOf('month', new Date()))
  const [page, setPage] = useState(0)
  const { summary, rows } = useKeptDeposits(range.from, range.to, page)
  useDocumentTitle(t('caregiver.earnings.documentTitle'))
  const items = rows.data?.items ?? []
  const count = rows.data?.totalElements ?? 0

  function choose(next: Period) {
    setPeriod(next)
    setPage(0)
    setRange(rangeOf(next, new Date()))
  }

  return (
    <div className={cgContainer}>
      <CaregiverPageHeader description={t('caregiver.earnings.subtitle')} title={t('caregiver.earnings.title')} />

      <SegmentedControl
        className='mb-4 max-w-md'
        legend={t('caregiver.earnings.periodLabel')}
        onChange={choose}
        options={PERIODS.map((value) => ({ value, label: t(`caregiver.earnings.periods.${value}`) }))}
        value={period}
      />

      <section aria-live='polite' className={`${cgForestCard} mb-5 flex items-center gap-5 p-6 sm:p-7`}>
        <span
          aria-hidden='true'
          className='grid h-14 w-14 shrink-0 place-items-center rounded-full bg-mint-300 text-forest-950 shadow-[0_10px_22px_-10px_rgb(132_214_185/0.9)]'
        >
          <Icon className='text-[28px]' name='savings' />
        </span>
        <div className='min-w-0'>
          <p className='text-sm font-medium text-white/70'>{t('caregiver.earnings.total')}</p>
          <p className='text-[30px] leading-tight font-bold tracking-tight tabular-nums sm:text-[38px]'>
            {summary.isPending ? (
              t('caregiver.earnings.loading')
            ) : (
              <CountUp format={(n) => money(Math.round(n))} value={summary.data?.caregiverAmount ?? 0} />
            )}
          </p>
          <p className='mt-1 inline-flex rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-mint-100'>
            {t('caregiver.earnings.count', { count })}
          </p>
        </div>
      </section>

      {rows.isPending ? (
        <VisitListSkeleton count={2} />
      ) : rows.isError || summary.isError ? (
        <CaregiverError
          message={t('caregiver.earnings.error')}
          onRetry={() => {
            void rows.refetch()
            void summary.refetch()
          }}
          retryLabel={t('caregiver.earnings.retry')}
        />
      ) : items.length === 0 ? (
        <CaregiverEmpty
          description={t('caregiver.earnings.empty')}
          icon='savings'
          title={t('caregiver.earnings.emptyTitle')}
        />
      ) : (
        <>
          <ul className={`${cgCard} divide-y divide-outline-variant`}>
            {items.map((item) => (
              <li className='flex flex-wrap items-center justify-between gap-2 px-5 py-3.5' key={item.id}>
                <div className='min-w-0'>
                  <p className='font-semibold text-on-surface'>
                    {t('caregiver.earnings.visit', { date: format.shortDateTime(item.occurrenceStartAt) })}
                  </p>
                  <p className='text-xs text-on-surface-variant'>
                    {item.reason === 'CUSTOMER_CANCEL' || item.reason === 'PAYMENT_OVERDUE'
                      ? t(`caregiver.earnings.reasons.${item.reason}`)
                      : t('caregiver.earnings.reasons.other')}
                    {' · '}
                    {t('caregiver.earnings.recordedAt', { date: format.date(calendarDayOf(item.createdAt)) })}
                  </p>
                </div>
                <span className='font-semibold text-success tabular-nums'>+{money(item.amount)}</span>
              </li>
            ))}
          </ul>
          <Pagination
            ariaLabel={t('caregiver.earnings.pagination')}
            className='mt-4'
            onPageChange={setPage}
            page={page}
            totalPages={rows.data?.totalPages ?? 0}
          />
        </>
      )}
    </div>
  )
}
