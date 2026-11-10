import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { bookingErrorCode, bookingKeys, withdrawFromVisits } from '~/entities/booking/booking-api'
import type { CaregiverOccurrenceRecord, CaregiverWithdrawalReason } from '~/shared/api/generated/contracts'
import { Button } from '~/shared/ui/button'
import { Modal } from '~/shared/ui/modal'

import { calendarDayOf, useCaregiverFormat } from '../../ui/caregiver-format'

const key = 'caregiver.booking.withdraw' as const
// BookingService caregiver-withdrawal-lead: only visits starting later than this can be withdrawn.
export const WITHDRAWAL_LEAD_MS = 24 * 60 * 60_000
const KNOWN_ERRORS = new Set([5260, 5261, 5262, 5263])

/** A visit the caregiver may still withdraw from: confirmed or not yet, starts more than 24 h from now, not withdrawn. */
export function canWithdraw(visit: CaregiverOccurrenceRecord, now: number) {
  return (
    (visit.status === 'SCHEDULED' || visit.status === 'ACKNOWLEDGED') &&
    !visit.needsReassignment &&
    new Date(visit.startAt).getTime() - now > WITHDRAWAL_LEAD_MS
  )
}

/**
 * The caregiver withdraws from one visit or every remaining visit of a booking (2026-11-09) with a reason (personal or
 * other — other needs a note). Visits less than 24 hours away are listed as kept; the center (or the automatic
 * assignment) gives the withdrawn visits to someone else.
 */
export function WithdrawDialog({
  visits,
  kept = [],
  onClose
}: {
  visits: CaregiverOccurrenceRecord[]
  kept?: CaregiverOccurrenceRecord[]
  onClose: () => void
}) {
  const { t } = useTranslation()
  const format = useCaregiverFormat()
  const queryClient = useQueryClient()
  const [reasonCode, setReasonCode] = useState<CaregiverWithdrawalReason>('PERSONAL')
  const [detail, setDetail] = useState('')
  const [missingDetail, setMissingDetail] = useState(false)

  const withdraw = useMutation({
    mutationFn: () =>
      withdrawFromVisits({
        occurrenceIds: visits.map((visit) => visit.id),
        reasonCode,
        reasonDetail: detail.trim() || undefined
      }),
    onSuccess: () => {
      toast.success(t(`${key}.sent`))
      void queryClient.invalidateQueries({ queryKey: bookingKeys.all })
      onClose()
    }
  })
  const errorCode = withdraw.isError ? bookingErrorCode(withdraw.error) : undefined

  function submit() {
    if (reasonCode === 'OTHER' && !detail.trim()) {
      setMissingDetail(true)
      return
    }
    withdraw.mutate()
  }

  const line = (visit: CaregiverOccurrenceRecord) =>
    `${format.weekdayLong(calendarDayOf(visit.startAt))}, ${format.date(visit.startAt)} · ${format.clockRange(visit.startAt, visit.endAt)}`

  return (
    <Modal
      dismissOnBackdrop={false}
      footer={
        <div className='flex w-full justify-end gap-2'>
          <Button onClick={onClose} variant='secondary'>
            {t(`${key}.cancel`)}
          </Button>
          <Button disabled={visits.length === 0} loading={withdraw.isPending} onClick={submit} variant='danger'>
            {t(`${key}.submit`)}
          </Button>
        </div>
      }
      onClose={onClose}
      open
      size='lg'
      title={visits.length > 1 ? t(`${key}.titleMany`, { count: visits.length }) : t(`${key}.title`)}
    >
      <div className='flex flex-col gap-4 text-sm'>
        <p className='text-on-surface-variant'>{t(`${key}.intro`)}</p>

        <section>
          <h3 className='text-xs font-bold tracking-wider text-on-surface-variant uppercase'>{t(`${key}.visits`)}</h3>
          {visits.length ? (
            <ul className='mt-1.5 flex max-h-44 flex-col gap-1 overflow-y-auto text-on-surface tabular-nums'>
              {visits.map((visit) => (
                <li key={visit.id}>{line(visit)}</li>
              ))}
            </ul>
          ) : (
            <p className='mt-1.5 text-on-surface-variant'>{t(`${key}.none`)}</p>
          )}
        </section>

        {kept.length ? (
          <section>
            <h3 className='text-xs font-bold tracking-wider text-on-surface-variant uppercase'>{t(`${key}.kept`)}</h3>
            <ul className='mt-1.5 flex flex-col gap-1 text-on-surface-variant tabular-nums'>
              {kept.map((visit) => (
                <li key={visit.id}>{line(visit)}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <fieldset className='flex flex-col gap-1.5'>
          <legend className='mb-1.5 text-xs font-bold tracking-wider text-on-surface-variant uppercase'>
            {t(`${key}.reasonTitle`)}
          </legend>
          {(['PERSONAL', 'OTHER'] as const).map((code) => (
            <label
              className={`flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xl border px-3 ${reasonCode === code ? 'border-primary bg-brand-50 font-semibold text-primary' : 'border-outline-variant text-on-surface hover:bg-surface-container-low'}`}
              key={code}
            >
              <input
                checked={reasonCode === code}
                className='accent-primary'
                name='withdraw-reason'
                onChange={() => {
                  setReasonCode(code)
                  setMissingDetail(false)
                }}
                type='radio'
              />
              {t(`${key}.reasons.${code}`)}
            </label>
          ))}
        </fieldset>

        <div>
          <label className='text-xs font-semibold text-on-surface' htmlFor='withdraw-detail'>
            {reasonCode === 'OTHER' ? t(`${key}.detail`) : t(`${key}.detailOptional`)}
          </label>
          <textarea
            aria-describedby={missingDetail ? 'withdraw-detail-error' : undefined}
            aria-invalid={missingDetail}
            className='mt-1.5 w-full rounded-xl border border-outline-variant bg-surface-container-lowest p-3 text-sm text-on-surface focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/25'
            id='withdraw-detail'
            maxLength={1000}
            onChange={(event) => {
              setDetail(event.target.value)
              setMissingDetail(false)
            }}
            rows={3}
            value={detail}
          />
          {missingDetail ? (
            <p className='mt-1 text-xs text-error' id='withdraw-detail-error'>
              {t(`${key}.detailRequired`)}
            </p>
          ) : null}
        </div>

        {withdraw.isError ? (
          <p className='rounded-xl bg-error-container p-3 text-sm text-on-error-container' role='alert'>
            {errorCode !== undefined && KNOWN_ERRORS.has(errorCode)
              ? t(`${key}.errors.e${errorCode as 5260 | 5261 | 5262 | 5263}`)
              : t(`${key}.errors.generic`)}
          </p>
        ) : null}
      </div>
    </Modal>
  )
}
