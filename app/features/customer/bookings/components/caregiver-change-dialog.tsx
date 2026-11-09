import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import {
  bookingKeys,
  createCaregiverChangeRequest,
  type CaregiverChangeCreatePayload
} from '~/entities/booking/booking-api'
import { isUpcomingOccurrence } from '~/entities/booking/booking-format'
import type { BookingDetailRecord } from '~/shared/api/generated/contracts'
import { calendarDayOf, useFormat } from '~/shared/lib/format'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'
import { Modal } from '~/shared/ui/modal'

const REASONS = [
  { code: 'SKILL_MISMATCH', icon: 'medical_services' },
  { code: 'ATTITUDE_ISSUE', icon: 'sentiment_dissatisfied' },
  { code: 'PUNCTUALITY_ISSUE', icon: 'schedule' },
  { code: 'PERSONAL_PREFERENCE', icon: 'person' },
  { code: 'OTHER', icon: 'more_horiz' }
] as const
const PREVIEW_VISITS = 3
const key = 'customer.caregiverChange' as const

type ReasonCode = CaregiverChangeCreatePayload['reasonCode']

function errorMessage(error: unknown) {
  if (typeof error !== 'object' || error === null || !('info' in error)) return undefined
  const info = error.info
  return typeof info === 'object' && info !== null && 'message' in info && typeof info.message === 'string'
    ? info.message
    : undefined
}

/**
 * The customer asks the center for another caregiver for the WHOLE booking (2026-11-09): every visit still to come
 * moves to the caregiver the center picks; visits within 12 hours keep the current one (BookingService decides).
 */
export function CaregiverChangeDialog({ booking, onClose }: { booking: BookingDetailRecord; onClose: () => void }) {
  const { t } = useTranslation()
  const format = useFormat()
  const queryClient = useQueryClient()
  const upcoming = (booking.occurrences ?? [])
    .filter((occurrence) => isUpcomingOccurrence(occurrence))
    .sort((first, second) => first.startAt.localeCompare(second.startAt))
  const [reasonCode, setReasonCode] = useState<ReasonCode>('PERSONAL_PREFERENCE')
  const [reasonDetail, setReasonDetail] = useState('')
  const [missingDetail, setMissingDetail] = useState(false)

  const mutation = useMutation({
    mutationFn: (payload: CaregiverChangeCreatePayload) => createCaregiverChangeRequest(booking.id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: bookingKeys.all })
      onClose()
    }
  })

  function submit() {
    if (!reasonDetail.trim()) {
      setMissingDetail(true)
      return
    }
    mutation.mutate({ scopeType: 'ALL_REMAINING', reasonCode, reasonDetail: reasonDetail.trim() })
  }

  return (
    <Modal
      dismissOnBackdrop={false}
      footer={
        <div className='flex w-full flex-wrap items-center justify-between gap-3'>
          <span className='text-xs text-on-surface-variant'>{t(`${key}.footer`)}</span>
          <div className='flex gap-2.5'>
            <Button onClick={onClose} type='button' variant='secondary'>
              {t(`${key}.back`)}
            </Button>
            <Button
              disabled={upcoming.length === 0}
              loading={mutation.isPending}
              onClick={submit}
              type='button'
              variant='primary'
            >
              {t(`${key}.submit`)}
            </Button>
          </div>
        </div>
      }
      onClose={onClose}
      open
      size='xl'
      title={t(`${key}.title`, { code: booking.bookingCode })}
    >
      <div className='grid gap-5 text-sm md:grid-cols-2'>
        <section className='flex flex-col gap-3'>
          <h3 className='text-xs font-bold tracking-wider text-on-surface-variant uppercase'>{t(`${key}.scopeTitle`)}</h3>
          <div className='rounded-xl border border-primary/40 bg-brand-50/60 p-3.5'>
            <p className='flex items-center gap-2 font-semibold text-on-surface'>
              <Icon className='text-lg text-primary' name='event_repeat' />
              {upcoming.length ? t(`${key}.scope`, { count: upcoming.length }) : t(`${key}.scopeNone`)}
            </p>
            <p className='mt-1.5 text-xs text-on-surface-variant'>{t(`${key}.scopeNote`)}</p>
          </div>
          {upcoming.length ? (
            <div>
              <p className='text-xs font-semibold text-on-surface-variant'>{t(`${key}.firstVisits`)}</p>
              <ul className='mt-1.5 flex flex-col gap-1 text-xs text-on-surface tabular-nums'>
                {upcoming.slice(0, PREVIEW_VISITS).map((occurrence) => (
                  <li key={occurrence.id}>
                    {format.longDayLabel(calendarDayOf(occurrence.startAt))} ·{' '}
                    {t('bookingSchedule.timeRange', {
                      start: format.clock(occurrence.startAt),
                      end: format.clock(occurrence.endAt)
                    })}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        <section className='flex flex-col gap-3'>
          <h3 className='text-xs font-bold tracking-wider text-on-surface-variant uppercase'>{t(`${key}.reasonTitle`)}</h3>
          <div className='flex flex-col gap-1.5' role='radiogroup'>
            {REASONS.map((reason) => (
              <label
                className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2 text-xs transition-colors ${reasonCode === reason.code ? 'border-primary bg-primary/5 font-semibold text-primary ring-1 ring-primary' : 'border-outline-variant/50 bg-surface-container-lowest text-on-surface hover:bg-surface-container-low'}`}
                key={reason.code}
              >
                <input
                  checked={reasonCode === reason.code}
                  className='accent-primary'
                  name='caregiver-change-reason'
                  onChange={() => setReasonCode(reason.code)}
                  type='radio'
                />
                <Icon className='text-sm text-primary' name={reason.icon} />
                {t(`${key}.reasons.${reason.code}`)}
              </label>
            ))}
          </div>
          <div>
            <label className='text-xs font-semibold text-on-surface' htmlFor='caregiver-change-detail'>
              {t(`${key}.detail`)}
            </label>
            <textarea
              aria-describedby={missingDetail ? 'caregiver-change-detail-error' : undefined}
              aria-invalid={missingDetail}
              className='mt-1.5 w-full rounded-xl border border-outline-variant bg-surface-container-lowest p-3 text-xs text-on-surface focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/25'
              id='caregiver-change-detail'
              maxLength={1000}
              onChange={(event) => {
                setReasonDetail(event.target.value)
                setMissingDetail(false)
              }}
              placeholder={t(`${key}.detailPlaceholder`)}
              rows={3}
              value={reasonDetail}
            />
            {missingDetail ? (
              <p className='mt-1 text-xs text-error' id='caregiver-change-detail-error'>
                {t(`${key}.detailRequired`)}
              </p>
            ) : null}
          </div>
        </section>
      </div>
      {mutation.isError ? (
        <p className='mt-4 rounded-xl bg-error-container p-3 text-xs font-semibold text-on-error-container' role='alert'>
          {errorMessage(mutation.error) ?? t(`${key}.failed`)}
        </p>
      ) : null}
    </Modal>
  )
}
