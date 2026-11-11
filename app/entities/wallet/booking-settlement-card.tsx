import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import type { BookingSettlementOccurrenceRecord } from '~/shared/api/generated/contracts'
import { apiErrorStatus } from '~/shared/api/error-details'
import { useFormat } from '~/shared/lib/format'
import { SectionCard } from '~/shared/ui/section-card'
import { ErrorState } from '~/shared/ui/state-panels'
import { StatusBadge, type StatusTone } from '~/shared/ui/status-badge'

import { fetchBookingSettlement, walletErrorKey, walletKeys } from './wallet-api'

type Outcome = NonNullable<BookingSettlementOccurrenceRecord['finalStatus']> | 'NOT_BILLABLE' | 'PENDING'

const OUTCOME_TONES: Record<Outcome, StatusTone> = {
  COMPLETED: 'success',
  CUSTOMER_NO_SHOW: 'caution',
  MISSED: 'danger',
  CANCELLED: 'neutral',
  NOT_BILLABLE: 'neutral',
  PENDING: 'info'
}

function outcomeOf(occurrence: BookingSettlementOccurrenceRecord): Outcome {
  if (occurrence.finalStatus) return occurrence.finalStatus
  return occurrence.settledAt ? 'NOT_BILLABLE' : 'PENDING'
}

/**
 * Settlement of one booking (2026-11-11, manager and admin booking detail): what the customer paid, what went back
 * (caregiver absence, cancellation, complaint), what the center received and the platform commission, then per visit.
 */
export function BookingSettlementCard({ bookingId }: { bookingId: string }) {
  const { t, i18n } = useTranslation()
  const { money, dateTime } = useFormat()
  const settlement = useQuery({
    queryKey: walletKeys.settlement(bookingId),
    queryFn: () => fetchBookingSettlement(bookingId),
    retry: false
  })

  const body = () => {
    if (settlement.isPending) {
      return (
        <p className='text-sm text-on-surface-variant' role='status'>
          {t('wallet.settlement.loading')}
        </p>
      )
    }
    if (settlement.isError) {
      // PaymentService has no financial record before the first payment.
      if (apiErrorStatus(settlement.error) === 404) {
        return <p className='text-sm text-on-surface-variant'>{t('wallet.settlement.notPaid')}</p>
      }
      return <ErrorState message={t(walletErrorKey(settlement.error))} onRetry={() => void settlement.refetch()} />
    }
    const data = settlement.data
    const percent =
      data.commissionPercent == null
        ? null
        : new Intl.NumberFormat(i18n.language, { style: 'percent', maximumFractionDigits: 2 }).format(
            data.commissionPercent / 100
          )
    type RowKey = 'paid' | 'refunded' | 'centerService' | 'centerKept' | 'caregiverKept' | 'complaintDebit'
    const rows: { key: RowKey; value: number }[] = [
      { key: 'paid', value: data.paidAmount },
      { key: 'refunded', value: data.refundedAmount },
      { key: 'centerService', value: data.centerServiceAmount },
      ...(data.centerKeptDepositAmount ? [{ key: 'centerKept' as const, value: data.centerKeptDepositAmount }] : []),
      ...(data.caregiverKeptDepositAmount
        ? [{ key: 'caregiverKept' as const, value: data.caregiverKeptDepositAmount }]
        : []),
      ...(data.complaintDebitAmount ? [{ key: 'complaintDebit' as const, value: data.complaintDebitAmount }] : [])
    ]

    return (
      <div className='space-y-4'>
        <dl className='grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2'>
          {rows.map((row) => (
            <div className='flex justify-between gap-3' key={row.key}>
              <dt className='text-on-surface-variant'>{t(`wallet.settlement.${row.key}`)}</dt>
              <dd className='font-semibold tabular-nums'>{money(row.value)}</dd>
            </div>
          ))}
        </dl>
        <dl className='grid gap-3 sm:grid-cols-2'>
          <div className='rounded-2xl bg-mint-50 px-4 py-3'>
            <dt className='text-xs font-semibold text-on-surface-variant'>{t('wallet.settlement.centerNet')}</dt>
            <dd className='mt-1 text-xl font-extrabold text-forest-950 tabular-nums'>{money(data.centerNetAmount)}</dd>
          </div>
          <div className='rounded-2xl bg-surface-container-low px-4 py-3'>
            <dt className='text-xs font-semibold text-on-surface-variant'>
              {percent ? t('wallet.settlement.commissionPercent', { percent }) : t('wallet.settlement.commission')}
            </dt>
            <dd className='mt-1 text-xl font-extrabold text-forest-950 tabular-nums'>{money(data.commissionAmount)}</dd>
          </div>
        </dl>
        {data.pendingCount > 0 ? (
          <p className='rounded-xl bg-info-container/60 px-3 py-2 text-xs text-on-surface' role='status'>
            {t('wallet.settlement.pending', { count: data.pendingCount })}
          </p>
        ) : null}
        <div className='overflow-x-auto'>
          <table className='w-full min-w-[36rem] text-left text-sm'>
            <caption className='mb-2 text-left text-sm font-semibold text-on-surface'>
              {t('wallet.settlement.visits')}
            </caption>
            <thead className='bg-mint-50 text-xs text-on-surface-variant'>
              <tr>
                <th className='px-3 py-2 font-semibold' scope='col'>
                  {t('wallet.settlement.visit')}
                </th>
                <th className='px-3 py-2 font-semibold' scope='col'>
                  {t('wallet.settlement.outcome')}
                </th>
                <th className='px-3 py-2 text-right font-semibold' scope='col'>
                  {t('wallet.settlement.paid')}
                </th>
                <th className='px-3 py-2 text-right font-semibold' scope='col'>
                  {t('wallet.settlement.refunded')}
                </th>
                <th className='px-3 py-2 text-right font-semibold' scope='col'>
                  {t('wallet.settlement.centerAmount')}
                </th>
                <th className='px-3 py-2 text-right font-semibold' scope='col'>
                  {t('wallet.settlement.commissionAmount')}
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-outline-variant/60'>
              {data.occurrences.map((occurrence) => {
                const outcome = outcomeOf(occurrence)
                return (
                  <tr key={occurrence.occurrenceId}>
                    <th className='px-3 py-2.5 font-medium text-on-surface' scope='row'>
                      {dateTime(occurrence.startAt)}
                    </th>
                    <td className='px-3 py-2.5'>
                      <StatusBadge tone={OUTCOME_TONES[outcome]}>
                        {t(`wallet.settlement.outcomes.${outcome}`)}
                      </StatusBadge>
                    </td>
                    <td className='px-3 py-2.5 text-right tabular-nums'>{money(occurrence.paidAmount)}</td>
                    <td className='px-3 py-2.5 text-right tabular-nums'>{money(occurrence.refundedAmount)}</td>
                    <td className='px-3 py-2.5 text-right tabular-nums'>{money(occurrence.centerAmount)}</td>
                    <td className='px-3 py-2.5 text-right tabular-nums'>{money(occurrence.commissionAmount)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <SectionCard icon='receipt_long' title={t('wallet.settlement.title')}>
      <p className='-mt-1 mb-4 text-sm text-on-surface-variant'>{t('wallet.settlement.hint')}</p>
      {body()}
    </SectionCard>
  )
}
