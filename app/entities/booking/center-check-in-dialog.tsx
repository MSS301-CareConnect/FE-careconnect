import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { bookingKeys, centerCheckIn, fetchOccurrence } from '~/entities/booking/booking-api'
import { bookingDay, bookingErrorKey } from '~/entities/booking/booking-format'
import { BookingReasonDialog } from '~/entities/booking/booking-reason-dialog'
import { useFormat } from '~/shared/lib/format'
import { TimeSelect } from '~/shared/ui/time-select'

const k = 'centerManager.bookingDetail.occurrence' as const

/**
 * The center records the check-in of a caregiver who came but forgot to press it (2026-11-13): arrival time inside the
 * visit's check-in window and a note. It also restores a visit already marked missed while its refund has not been sent
 * (`missedRefundAt`); BookingService answers 409 `5277` once the refund went out.
 */
export function CenterCheckInDialog({
  occurrenceId,
  occurrenceNo,
  startAt,
  onClose
}: {
  occurrenceId: string
  occurrenceNo?: number
  startAt: string
  onClose: () => void
}) {
  const { t } = useTranslation()
  const format = useFormat()
  const queryClient = useQueryClient()
  const [arrival, setArrival] = useState(() => format.clock(startAt))
  const detail = useQuery({
    queryKey: bookingKeys.occurrence(occurrenceId),
    queryFn: () => fetchOccurrence(occurrenceId),
    retry: false
  })
  const opensAt = detail.data?.checkInOpensAt
  const missedRefundAt = detail.data?.missedRefundAt
  const checkIn = useMutation({
    mutationFn: (note: string) => {
      // HH:mm on the visit's Vietnam day; a time before the window opens belongs to the next day (overnight visit).
      let at = new Date(`${bookingDay(new Date(startAt))}T${arrival}:00+07:00`)
      if (opensAt && at < new Date(opensAt)) at = new Date(at.getTime() + 86_400_000)
      return centerCheckIn({ occurrenceId, note, checkedInAt: at.toISOString() })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: bookingKeys.all })
      onClose()
    }
  })
  // HH:mm bounds only when the window does not cross midnight; BookingService checks the exact window anyway.
  const min = format.clock(opensAt)
  const max =
    detail.data?.status === 'CAREGIVER_MISSED'
      ? format.clock(detail.data.checkInClosesAt)
      : format.clock(new Date().toISOString())
  const range = min && max && min <= max ? { min, max } : undefined

  return (
    <BookingReasonDialog
      confirmLabel={t(`${k}.checkIn`)}
      description={t(`${k}.checkInHint`)}
      error={checkIn.error ? t(bookingErrorKey(checkIn.error)) : undefined}
      label={t(`${k}.checkInNote`)}
      onClose={onClose}
      onConfirm={(note) => checkIn.mutate(note)}
      pending={checkIn.isPending}
      title={t(`${k}.checkInTitle`, { number: occurrenceNo ?? '' })}
    >
      {missedRefundAt ? (
        <p className='rounded-xl border border-warning/30 bg-warning-container p-3 text-sm text-on-warning-container'>
          {t(`${k}.checkInMissed`, { time: format.dateTime(missedRefundAt) })}
        </p>
      ) : null}
      <div className='text-sm font-semibold text-on-surface'>
        {t(`${k}.checkInArrival`)}
        <TimeSelect
          aria-label={t(`${k}.checkInArrival`)}
          className='mt-1.5'
          max={range?.max}
          min={range?.min}
          onChange={setArrival}
          step={15}
          value={arrival}
        />
      </div>
    </BookingReasonDialog>
  )
}
