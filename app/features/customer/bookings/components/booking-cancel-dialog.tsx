import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { bookingKeys, cancelBookingRequest, previewCancellation } from '~/entities/booking/booking-api'
import { bookingErrorKey, formatDateTime, formatMoney, isUpcomingOccurrence } from '~/entities/booking/booking-format'
import { BookingReasonDialog } from '~/entities/booking/booking-reason-dialog'
import { RefundPolicySummary, refundRuleLabel, useCenterBookingPolicy } from '~/entities/payment/refund-policy'
import type { BookingDetailRecord } from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'

/** Bookings without a deposit can only be cancelled whole and need no refund preview. */
function isDepositPaid(booking: BookingDetailRecord) {
  return booking.status === 'CONFIRMED' || booking.status === 'IN_PROGRESS'
}

export function BookingCancelDialog({ booking, onClose }: { booking: BookingDetailRecord; onClose: () => void }) {
  const { t, i18n } = useTranslation()
  const language = i18n.language
  const queryClient = useQueryClient()
  const paid = isDepositPaid(booking)
  const upcoming = (booking.occurrences ?? []).filter((occurrence) => isUpcomingOccurrence(occurrence))
  const [scope, setScope] = useState<'all' | 'selected'>('all')
  const [chosen, setChosen] = useState<string[]>([])
  const [showFullPolicy, setShowFullPolicy] = useState(false)
  const occurrenceIds = scope === 'selected' ? chosen : undefined
  const policy = useCenterBookingPolicy(booking.centerId).data
  const percent = new Intl.NumberFormat(language, { style: 'percent', maximumFractionDigits: 2 })
  const hours = new Intl.NumberFormat(language, { maximumFractionDigits: 1 })

  const preview = useMutation({ mutationFn: () => previewCancellation(booking.id, occurrenceIds) })
  const cancel = useMutation({
    mutationFn: (reason: string) =>
      cancelBookingRequest(booking.id, { reason, occurrenceIds, previewToken: preview.data?.previewToken }),
    onSuccess: (updated) => {
      queryClient.setQueryData(bookingKeys.detail(booking.id), updated)
      void queryClient.invalidateQueries({ queryKey: bookingKeys.all })
      onClose()
    }
  })

  function changeScope(next: typeof scope, ids = chosen) {
    setScope(next)
    setChosen(ids)
    // A preview belongs to one exact set of visits; any change needs a new one.
    preview.reset()
  }

  function toggleAllSelected() {
    if (chosen.length === upcoming.length) {
      changeScope('selected', [])
    } else {
      changeScope(
        'selected',
        upcoming.map((o) => o.id)
      )
    }
  }

  const error = cancel.error ?? preview.error

  // Left Column Content: Cancellation Scope & Specific Occurrences Checklist
  const leftContent = paid ? (
    <div className='flex flex-col gap-4'>
      {/* Scope Selector: 2 Selectable Cards */}
      <div>
        <label className='mb-2 block font-semibold text-on-surface'>{t('customer.bookingDetail.cancel.scope')}</label>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3' role='radiogroup'>
          <button
            type='button'
            role='radio'
            aria-checked={scope === 'all'}
            aria-label={t('customer.bookingDetail.cancel.scopeAll')}
            onClick={() => changeScope('all')}
            className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all ${
              scope === 'all'
                ? 'border-primary bg-primary/5 ring-1.5 ring-primary'
                : 'border-outline-variant/60 bg-surface-container-lowest hover:border-outline-variant hover:bg-surface-container-low'
            }`}
          >
            <div
              className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
                scope === 'all' ? 'border-primary bg-primary text-white' : 'border-outline-variant'
              }`}
            >
              {scope === 'all' && <div className='h-2 w-2 rounded-full bg-white' />}
            </div>
            <div className='min-w-0'>
              <span className='block font-semibold text-on-surface text-sm'>
                {t('customer.bookingDetail.cancel.scopeAll')}
              </span>
              <span className='block text-xs text-on-surface-variant mt-0.5'>
                {t('customer.bookingDetail.cancel.allUpcoming', { count: upcoming.length })}
              </span>
            </div>
          </button>

          <button
            type='button'
            role='radio'
            aria-checked={scope === 'selected'}
            aria-label={t('customer.bookingDetail.cancel.scopeSelected')}
            disabled={upcoming.length === 0}
            onClick={() => changeScope('selected')}
            className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all ${
              upcoming.length === 0 ? 'opacity-50 cursor-not-allowed border-outline-variant/30' : ''
            } ${
              scope === 'selected'
                ? 'border-primary bg-primary/5 ring-1.5 ring-primary'
                : 'border-outline-variant/60 bg-surface-container-lowest hover:border-outline-variant hover:bg-surface-container-low'
            }`}
          >
            <div
              className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
                scope === 'selected' ? 'border-primary bg-primary text-white' : 'border-outline-variant'
              }`}
            >
              {scope === 'selected' && <div className='h-2 w-2 rounded-full bg-white' />}
            </div>
            <div className='min-w-0'>
              <span className='block font-semibold text-on-surface text-sm'>
                {t('customer.bookingDetail.cancel.scopeSelected')}
              </span>
              <span className='block text-xs text-on-surface-variant mt-0.5'>
                {chosen.length > 0
                  ? t('customer.bookingDetail.cancel.chosenCount', { count: chosen.length })
                  : t('customer.bookingDetail.cancel.pickVisits')}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Occurrences Checklist (When scope is selected) */}
      {scope === 'selected' ? (
        <div className='rounded-xl border border-outline-variant/60 bg-surface-container-low/50 p-4'>
          <div className='mb-2.5 flex items-center justify-between text-xs'>
            <span className='font-semibold text-on-surface text-sm'>
              {t('customer.bookingDetail.cancel.upcomingList', { count: upcoming.length })}
            </span>
            <button type='button' onClick={toggleAllSelected} className='font-semibold text-primary hover:underline'>
              {chosen.length === upcoming.length
                ? t('customer.bookingDetail.cancel.selectNone')
                : t('customer.bookingDetail.cancel.selectAll')}
            </button>
          </div>
          <ul className='flex max-h-56 flex-col gap-2 overflow-y-auto pr-1'>
            {upcoming.map((occurrence) => {
              const isChecked = chosen.includes(occurrence.id)
              return (
                <li key={occurrence.id}>
                  <label
                    className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-xs transition-colors ${
                      isChecked
                        ? 'border-primary/50 bg-surface-container-lowest shadow-2xs font-medium'
                        : 'border-transparent bg-surface-container-lowest/80 hover:bg-surface-container-lowest text-on-surface-variant'
                    }`}
                  >
                    <div className='flex items-center gap-2.5 min-w-0'>
                      <input
                        checked={isChecked}
                        className='accent-primary rounded h-4 w-4'
                        onChange={(event) =>
                          changeScope(
                            'selected',
                            event.target.checked
                              ? [...chosen, occurrence.id]
                              : chosen.filter((id) => id !== occurrence.id)
                          )
                        }
                        type='checkbox'
                      />
                      <span className='truncate text-on-surface font-medium text-sm'>
                        {t('booking.occurrences.title', { number: occurrence.occurrenceNo })} ·{' '}
                        {formatDateTime(occurrence.startAt, language)}
                      </span>
                    </div>
                    {occurrence.priceAmount ? (
                      <span className='shrink-0 text-on-surface-variant font-semibold text-sm tabular-nums'>
                        {formatMoney(occurrence.priceAmount, language)}
                      </span>
                    ) : null}
                  </label>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}
    </div>
  ) : null

  // Right Column Content: Policy Matrix & Financial Refund Preview
  const rightContent = paid ? (
    <div className='flex flex-col gap-4'>
      {/* Compact Refund Policy Card */}
      <div className='rounded-xl border border-outline-variant/50 bg-surface-container-low/40 p-4 text-xs text-on-surface-variant'>
        <div className='flex items-center justify-between gap-2'>
          <span className='flex items-center gap-1.5 font-semibold text-on-surface text-sm'>
            <Icon className='text-base text-primary' name='verified_user' />
            {t('customer.bookingDetail.cancel.tiers.title')}
          </span>
          <button
            type='button'
            onClick={() => setShowFullPolicy(!showFullPolicy)}
            className='flex items-center gap-1 font-semibold text-primary hover:underline'
          >
            {t(
              showFullPolicy ? 'customer.bookingDetail.cancel.tiers.less' : 'customer.bookingDetail.cancel.tiers.more'
            )}
            <Icon className={`text-sm transition-transform ${showFullPolicy ? 'rotate-180' : ''}`} name='expand_more' />
          </button>
        </div>

        {/* Refund tiers of the center policy; the no-refund tier exists only when its window is above zero. */}
        {policy ? (
          <div
            className={`mt-3 grid ${policy.lateCancelNoRefundMinutes > 0 ? 'grid-cols-3' : 'grid-cols-2'} gap-2.5 text-center`}
          >
            <div className='rounded-xl bg-emerald-50 border border-emerald-200/70 p-2.5 text-emerald-900'>
              <span className='block font-bold text-sm text-emerald-700'>
                {t('customer.bookingDetail.cancel.tiers.refund', {
                  percent: percent.format(policy.refundPercentBeforeThreshold / 100)
                })}
              </span>
              <span className='block text-xs text-emerald-600 mt-0.5 leading-tight'>
                {t('customer.bookingDetail.cancel.tiers.from', {
                  hours: hours.format(policy.refundThresholdMinutes / 60)
                })}
              </span>
            </div>
            <div className='rounded-xl bg-amber-50 border border-amber-200/70 p-2.5 text-amber-900'>
              <span className='block font-bold text-sm text-amber-700'>
                {t('customer.bookingDetail.cancel.tiers.refund', {
                  percent: percent.format(policy.refundPercentAfterThreshold / 100)
                })}
              </span>
              <span className='block text-xs text-amber-600 mt-0.5 leading-tight'>
                {t('customer.bookingDetail.cancel.tiers.between', {
                  from: hours.format(policy.lateCancelNoRefundMinutes / 60),
                  to: hours.format(policy.refundThresholdMinutes / 60)
                })}
              </span>
            </div>
            {policy.lateCancelNoRefundMinutes > 0 ? (
              <div className='rounded-xl bg-rose-50 border border-rose-200/70 p-2.5 text-rose-900'>
                <span className='block font-bold text-sm text-rose-700'>
                  {t('customer.bookingDetail.cancel.tiers.none')}
                </span>
                <span className='block text-xs text-rose-600 mt-0.5 leading-tight'>
                  {t('customer.bookingDetail.cancel.tiers.under', {
                    hours: hours.format(policy.lateCancelNoRefundMinutes / 60)
                  })}
                </span>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className={showFullPolicy ? 'mt-3.5 pt-3.5 border-t border-outline-variant/40' : 'hidden'}>
          <RefundPolicySummary centerId={booking.centerId} />
        </div>
      </div>

      {/* Financial Refund Calculation Section */}
      {preview.data ? (
        <div className='flex flex-col gap-3.5 rounded-xl border border-emerald-500/35 bg-emerald-500/5 p-4'>
          <div className='flex items-center justify-between border-b border-emerald-500/20 pb-3'>
            <div>
              <span className='text-xs font-bold tracking-wider text-emerald-800 uppercase'>
                {t('customer.bookingDetail.cancel.refund')}
              </span>
              <p className='text-2xl sm:text-3xl font-extrabold text-emerald-700 tabular-nums mt-0.5'>
                {formatMoney(preview.data.totalRefund, language)}
              </p>
            </div>
            <div className='flex flex-col items-end gap-1.5'>
              {preview.data.expiresAt ? (
                <span className='inline-flex items-center gap-1.5 rounded-full bg-emerald-100/90 px-3 py-1 text-xs font-medium text-emerald-800'>
                  <Icon className='text-xs' name='schedule' />
                  {t('customer.bookingDetail.cancel.previewExpires', {
                    time: formatDateTime(preview.data.expiresAt, language)
                  })}
                </span>
              ) : null}
              <button
                type='button'
                onClick={() => preview.mutate()}
                disabled={preview.isPending}
                className='text-xs font-semibold text-emerald-700 hover:underline inline-flex items-center gap-1'
              >
                <Icon className='text-sm' name='refresh' />
                {t('customer.bookingDetail.cancel.recalculate')}
              </button>
            </div>
          </div>

          {/* Breakdown Items List */}
          <div>
            <span className='block mb-2 text-xs font-semibold text-on-surface-variant uppercase tracking-wider'>
              {t('customer.bookingDetail.cancel.breakdown', { count: preview.data.items.length })}
            </span>
            <ul className='flex max-h-60 flex-col gap-2 overflow-y-auto pr-1 text-xs'>
              {preview.data.items.map((item) => (
                <li
                  className='flex items-center justify-between gap-3 rounded-xl bg-surface-container-lowest border border-outline-variant/40 p-3 shadow-2xs'
                  key={item.occurrenceId}
                >
                  <div className='min-w-0'>
                    <div className='flex items-center gap-2 flex-wrap'>
                      <span className='font-bold text-sm text-on-surface'>
                        {formatDateTime(item.startAt, language)}
                      </span>
                      <span className='inline-block rounded-md bg-surface-container px-2 py-0.5 text-xs text-on-surface-variant font-medium'>
                        {refundRuleLabel(t, item.rule)}
                      </span>
                    </div>
                    {item.feeAmount && item.feeAmount > 0 ? (
                      <span className='block text-xs font-medium text-amber-700 mt-1'>
                        {t('customer.bookingDetail.cancel.feeKept', {
                          amount: formatMoney(item.feeAmount, language)
                        })}
                      </span>
                    ) : null}
                  </div>
                  <span className='shrink-0 font-extrabold text-base text-emerald-700 tabular-nums'>
                    +{formatMoney(item.refundAmount, language)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className='flex flex-col gap-2.5 rounded-xl border border-dashed border-outline-variant p-4 bg-surface-container-low/20'>
          <div className='flex items-center gap-2 font-semibold text-on-surface text-sm'>
            <Icon className='text-lg text-primary' name='calculate' />
            {t('customer.bookingDetail.cancel.previewTitle')}
          </div>
          <p className='text-xs text-on-surface-variant leading-relaxed'>
            {t('customer.bookingDetail.cancel.previewHint')}
          </p>
          <button
            className='mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white shadow-xs hover:bg-primary/90 disabled:opacity-50 transition-all'
            disabled={preview.isPending || (scope === 'selected' && chosen.length === 0)}
            onClick={() => preview.mutate()}
            type='button'
          >
            <Icon className='text-base' name='calculate' />
            {preview.isPending ? t('booking.actions.working') : t('customer.bookingDetail.cancel.preview')}
          </button>
          {scope === 'selected' && chosen.length === 0 && (
            <span className='text-xs text-amber-600 italic text-center'>
              {t('customer.bookingDetail.cancel.pickFirst')}
            </span>
          )}
        </div>
      )}
    </div>
  ) : undefined

  let missingRequirement: string | undefined
  if (paid) {
    if (scope === 'selected' && chosen.length === 0) {
      missingRequirement = t('customer.bookingDetail.cancel.needVisits')
    } else if (!preview.data) {
      missingRequirement = t('customer.bookingDetail.cancel.needPreview', {
        action: t('customer.bookingDetail.cancel.preview')
      })
    }
  }

  return (
    <BookingReasonDialog
      canConfirm={!paid || Boolean(preview.data)}
      confirmLabel={t('customer.bookingDetail.cancel.confirm')}
      danger
      description={paid ? t('customer.bookingDetail.cancel.paidHint') : t('customer.bookingDetail.cancel.unpaidHint')}
      error={error ? t(bookingErrorKey(error)) : undefined}
      label={t('customer.bookingDetail.cancel.reason')}
      maxWidth={paid ? 'max-w-5xl' : 'max-w-lg'}
      missingRequirement={missingRequirement}
      onClose={onClose}
      onConfirm={(reason) => cancel.mutate(reason)}
      pending={cancel.isPending}
      sideContent={rightContent}
      title={t('customer.bookingDetail.cancel.title', { code: booking.bookingCode })}
    >
      {leftContent}
    </BookingReasonDialog>
  )
}
