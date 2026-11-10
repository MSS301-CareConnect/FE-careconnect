import { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import {
  bookingKeys,
  previewRescheduleOccurrence,
  rescheduleBookingOccurrence,
  type OccurrenceRescheduleResponseRecord
} from '~/entities/booking/booking-api'
import { bookingErrorKey, formatClock, formatDate } from '~/entities/booking/booking-format'
import type { BookingDetailRecord, BookingOccurrenceRecord } from '~/shared/api/generated/contracts'
import { useClock } from '~/shared/lib/use-clock'
import { Button } from '~/shared/ui/button'
import { DatePicker } from '~/shared/ui/date-picker'
import { Icon } from '~/shared/ui/icon'
import { Modal } from '~/shared/ui/modal'
import { TimeSelect } from '~/shared/ui/time-select'

export interface OccurrenceRescheduleDialogProps {
  occurrence: BookingOccurrenceRecord
  booking: BookingDetailRecord
  onClose: () => void
}

function toLocalDateStr(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function toLocalTimeStr(date: Date) {
  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

const key = 'customer.bookingDetail.reschedule' as const
const DAY_MS = 24 * 3600 * 1000

export function OccurrenceRescheduleDialog({ occurrence, booking, onClose }: OccurrenceRescheduleDialogProps) {
  const { t, i18n } = useTranslation()
  const language = i18n.language
  const queryClient = useQueryClient()

  // Calculate session duration in minutes
  const durationMs = useMemo(() => {
    return new Date(occurrence.endAt).getTime() - new Date(occurrence.startAt).getTime()
  }, [occurrence.startAt, occurrence.endAt])

  // BookingService moves a visit only 24 hours ahead (409 5250).
  const now = useClock()
  const minDate = toLocalDateStr(new Date(now + DAY_MS))

  // The visit's own day, or the first day it may move to.
  const [dateStr, setDateStr] = useState(() => {
    const occDate = toLocalDateStr(new Date(occurrence.startAt))
    return occDate < minDate ? minDate : occDate
  })

  const [timeStr, setTimeStr] = useState(() => {
    const d = new Date(occurrence.startAt)
    return toLocalTimeStr(d)
  })

  const [reason, setReason] = useState('')
  const [previewResult, setPreviewResult] = useState<OccurrenceRescheduleResponseRecord | null>(null)

  // Computed ISO timestamps for new slot
  const newSlot = useMemo(() => {
    try {
      if (!dateStr || !timeStr) return null
      const start = new Date(`${dateStr}T${timeStr}:00`)
      if (isNaN(start.getTime())) return null
      const end = new Date(start.getTime() + durationMs)
      return {
        newStartAt: start.toISOString(),
        newEndAt: end.toISOString()
      }
    } catch {
      return null
    }
  }, [dateStr, timeStr, durationMs])

  const previewMutation = useMutation({
    mutationFn: () => {
      if (!newSlot) throw new Error('invalid slot')
      return previewRescheduleOccurrence(occurrence.id, newSlot)
    },
    onSuccess: (data) => setPreviewResult(data),
    onError: () => setPreviewResult(null)
  })

  const rescheduleMutation = useMutation({
    mutationFn: () => {
      if (!newSlot) throw new Error('invalid slot')
      return rescheduleBookingOccurrence(occurrence.id, {
        ...newSlot,
        reason: reason.trim() || undefined
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: bookingKeys.detail(booking.id) })
      void queryClient.invalidateQueries({ queryKey: bookingKeys.all })
      onClose()
    }
  })
  const error = rescheduleMutation.error ?? previewMutation.error

  function handleSlotChange(newDate: string, newTime: string) {
    setDateStr(newDate)
    setTimeStr(newTime)
    setPreviewResult(null)
    previewMutation.reset()
    rescheduleMutation.reset()
  }

  const limit = (booking.occurrences?.length ?? 0) >= 20 ? 4 : 2
  const currentCount = occurrence.rescheduleCount ?? 0

  return (
    <Modal
      dismissOnBackdrop
      footer={
        <div className='flex items-center justify-between w-full'>
          <span className='text-xs text-on-surface-variant'>{t(`${key}.quota`, { count: currentCount, limit })}</span>
          <div className='flex gap-2.5'>
            <Button onClick={onClose} type='button' variant='secondary'>
              {t(`${key}.back`)}
            </Button>
            <Button
              disabled={!previewResult?.available || rescheduleMutation.isPending}
              loading={rescheduleMutation.isPending}
              onClick={() => rescheduleMutation.mutate()}
              type='button'
              variant='primary'
            >
              {t(`${key}.confirm`)}
            </Button>
          </div>
        </div>
      }
      onClose={onClose}
      open
      size='lg'
      title={t(`${key}.title`, { number: occurrence.occurrenceNo })}
    >
      <div className='flex flex-col gap-4 text-sm'>
        {error && (
          <div className='rounded-xl border border-error/30 bg-error-container p-3.5 text-xs font-semibold text-on-error-container flex items-center gap-2'>
            <Icon className='text-base text-error shrink-0' name='error' />
            <span>{t(bookingErrorKey(error))}</span>
          </div>
        )}

        {/* Current Schedule Summary */}
        <div className='rounded-xl border border-outline-variant/60 bg-surface-container-low/50 p-3.5'>
          <span className='text-xs font-semibold text-on-surface-variant block mb-1'>{t(`${key}.current`)}</span>
          <div className='flex items-center gap-2 font-bold text-on-surface text-sm'>
            <Icon className='text-base text-primary' name='calendar_month' />
            <span>{formatDate(occurrence.startAt, language)}</span>
            <span>·</span>
            <span>
              {formatClock(occurrence.startAt, language)} – {formatClock(occurrence.endAt, language)}
            </span>
          </div>
        </div>

        {/* Date & Time Picker */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3.5'>
          <div>
            <label className='block font-semibold text-xs text-on-surface mb-1.5' htmlFor='reschedule-date'>
              {t(`${key}.date`)}
            </label>
            <DatePicker
              className='w-full'
              id='reschedule-date'
              min={minDate}
              onChange={(val) => handleSlotChange(val, timeStr)}
              value={dateStr}
            />
          </div>

          <div>
            <label className='block font-semibold text-xs text-on-surface mb-1.5' htmlFor='reschedule-time'>
              {t(`${key}.time`)}
            </label>
            <TimeSelect
              className='w-full'
              id='reschedule-time'
              onChange={(val) => handleSlotChange(dateStr, val)}
              step={15}
              value={timeStr}
            />
          </div>
        </div>

        {/* Check Availability Action */}
        <div className='flex items-center justify-between rounded-xl border border-dashed border-outline-variant p-3 bg-surface-container-low/30'>
          <div className='text-xs'>
            {newSlot ? (
              <div className='flex items-center gap-1.5 text-on-surface'>
                <span className='text-on-surface-variant'>{t(`${key}.newSlot`)}</span>
                <span className='font-bold text-primary'>
                  {formatDate(newSlot.newStartAt, language)} · {formatClock(newSlot.newStartAt, language)} –{' '}
                  {formatClock(newSlot.newEndAt, language)}
                </span>
              </div>
            ) : (
              <span className='text-on-surface-variant'>{t(`${key}.pickSlot`)}</span>
            )}
          </div>
          <Button
            disabled={!newSlot || previewMutation.isPending}
            leftIcon={<Icon className='text-sm' name='schedule' />}
            loading={previewMutation.isPending}
            onClick={() => previewMutation.mutate()}
            size='sm'
            variant='primary'
          >
            {t(`${key}.check`)}
          </Button>
        </div>

        {/* Availability Banner */}
        {previewResult && (
          <div
            className={`rounded-xl border p-3.5 text-xs ${
              previewResult.available
                ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                : 'border-amber-300 bg-amber-50 text-amber-900'
            }`}
          >
            <div className='flex items-center gap-2 font-bold'>
              <Icon className='text-base' name={previewResult.available ? 'check_circle' : 'warning'} />
              <span>{t(previewResult.available ? `${key}.available` : `${key}.busy`)}</span>
            </div>
            <p className='mt-1 text-[11px] leading-relaxed'>{previewResult.message}</p>
          </div>
        )}

        {/* Reason field */}
        <div>
          <label className='block font-semibold text-xs text-on-surface mb-1.5' htmlFor='rescheduleReason'>
            {t(`${key}.reason`)}
          </label>
          <input
            className='w-full min-h-11 rounded-xl border border-outline-variant bg-surface-container-lowest px-3.5 py-2.5 text-sm text-on-surface placeholder:text-outline focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/25'
            id='rescheduleReason'
            maxLength={200}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t(`${key}.reasonPlaceholder`)}
            type='text'
            value={reason}
          />
        </div>
      </div>
    </Modal>
  )
}
