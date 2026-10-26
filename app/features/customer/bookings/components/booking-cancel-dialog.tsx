import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { bookingKeys, cancelBookingRequest, previewCancellation } from '~/entities/booking/booking-api'
import { bookingErrorKey, formatDateTime, formatMoney, isUpcomingOccurrence } from '~/entities/booking/booking-format'
import { BookingReasonDialog } from '~/entities/booking/booking-reason-dialog'
import type { BookingDetailRecord } from '~/shared/api/generated/contracts'

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
  const occurrenceIds = scope === 'selected' ? chosen : undefined

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

  const error = cancel.error ?? preview.error
  return (
    <BookingReasonDialog
      canConfirm={!paid || Boolean(preview.data)}
      confirmLabel={t('customer.bookingDetail.cancel.confirm')}
      danger
      description={paid ? t('customer.bookingDetail.cancel.paidHint') : t('customer.bookingDetail.cancel.unpaidHint')}
      error={error ? t(bookingErrorKey(error)) : undefined}
      label={t('customer.bookingDetail.cancel.reason')}
      onClose={onClose}
      onConfirm={(reason) => cancel.mutate(reason)}
      pending={cancel.isPending}
      title={t('customer.bookingDetail.cancel.title', { code: booking.bookingCode })}
    >
      {paid ? (
        <div className='flex flex-col gap-3'>
          <fieldset className='flex flex-col gap-2'>
            <legend className='mb-1 font-semibold'>{t('customer.bookingDetail.cancel.scope')}</legend>
            <label className='flex items-center gap-2'>
              <input
                checked={scope === 'all'}
                className='accent-primary'
                onChange={() => changeScope('all')}
                type='radio'
              />
              {t('customer.bookingDetail.cancel.scopeAll')}
            </label>
            <label className='flex items-center gap-2'>
              <input
                checked={scope === 'selected'}
                className='accent-primary'
                disabled={upcoming.length === 0}
                onChange={() => changeScope('selected')}
                type='radio'
              />
              {t('customer.bookingDetail.cancel.scopeSelected')}
            </label>
          </fieldset>
          {scope === 'selected' ? (
            <ul className='flex max-h-48 flex-col gap-1 overflow-y-auto rounded-lg bg-surface-container-low p-3'>
              {upcoming.map((occurrence) => (
                <li key={occurrence.id}>
                  <label className='flex items-center gap-2'>
                    <input
                      checked={chosen.includes(occurrence.id)}
                      className='accent-primary'
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
                    {t('booking.occurrences.title', { number: occurrence.occurrenceNo })} ·{' '}
                    {formatDateTime(occurrence.startAt, language)}
                  </label>
                </li>
              ))}
            </ul>
          ) : null}
          {preview.data ? (
            <div className='rounded-lg bg-secondary-container/50 p-3'>
              <ul className='flex flex-col gap-1 text-xs text-on-surface-variant'>
                {preview.data.items.map((item) => (
                  <li className='flex justify-between gap-3' key={item.occurrenceId}>
                    <span>
                      {formatDateTime(item.startAt, language)}
                      {item.rule ? ` · ${item.rule}` : ''}
                    </span>
                    <span className='tabular-nums'>{formatMoney(item.refundAmount, language)}</span>
                  </li>
                ))}
              </ul>
              <p className='mt-2 flex justify-between font-semibold text-on-surface'>
                <span>{t('customer.bookingDetail.cancel.refund')}</span>
                <span className='tabular-nums'>{formatMoney(preview.data.totalRefund, language)}</span>
              </p>
              {preview.data.expiresAt ? (
                <p className='mt-1 text-xs text-on-surface-variant'>
                  {t('customer.bookingDetail.cancel.previewExpires', {
                    time: formatDateTime(preview.data.expiresAt, language)
                  })}
                </p>
              ) : null}
            </div>
          ) : (
            <button
              className='self-start rounded-lg bg-surface-container px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-container-high disabled:opacity-50'
              disabled={preview.isPending || (scope === 'selected' && chosen.length === 0)}
              onClick={() => preview.mutate()}
              type='button'
            >
              {preview.isPending ? t('booking.actions.working') : t('customer.bookingDetail.cancel.preview')}
            </button>
          )}
        </div>
      ) : null}
    </BookingReasonDialog>
  )
}
