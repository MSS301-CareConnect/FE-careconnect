import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toastSuccess } from '~/shared/ui/app-toast'

import { bookingErrorCode, bookingKeys, withdrawFromVisits } from '~/entities/booking/booking-api'
import type { CaregiverOccurrenceRecord, CaregiverWithdrawalReason } from '~/shared/api/generated/contracts'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'
import { Modal } from '~/shared/ui/modal'

import { calendarDayOf, useCaregiverFormat } from '../../ui/caregiver-format'
import { chunkWholeDays, type WithdrawScope } from '../withdraw-model'
import { VisitDayDigest } from './visit-day-digest'

const key = 'caregiver.booking.withdraw' as const
const KNOWN_ERRORS = new Set([5260, 5261, 5262, 5263, 5265])
type KnownError = 5260 | 5261 | 5262 | 5263 | 5265

const REASONS: { code: CaregiverWithdrawalReason; icon: string }[] = [
  { code: 'PERSONAL', icon: 'person' },
  { code: 'OTHER', icon: 'edit_note' }
]

/**
 * The caregiver asks to give back visits (2026-11-10 redesign): one visit, a whole day (a day with several visits is
 * withdrawn whole, BookingService 5265) or every remaining day. The visits are listed per day, the ones less than 24
 * hours away stay with the caregiver, and the reason is picked from two cards (other needs a note). Long requests go
 * in chunks of whole days.
 */
export function WithdrawDialog({
  visits,
  kept = [],
  scope,
  onClose
}: {
  visits: CaregiverOccurrenceRecord[]
  kept?: CaregiverOccurrenceRecord[]
  scope: WithdrawScope
  onClose: () => void
}) {
  const { t } = useTranslation()
  const format = useCaregiverFormat()
  const queryClient = useQueryClient()
  const [reasonCode, setReasonCode] = useState<CaregiverWithdrawalReason>('PERSONAL')
  const [detail, setDetail] = useState('')
  const [missingDetail, setMissingDetail] = useState(false)

  const withdraw = useMutation({
    mutationFn: async () => {
      for (const occurrenceIds of chunkWholeDays(visits)) {
        await withdrawFromVisits({ occurrenceIds, reasonCode, reasonDetail: detail.trim() || undefined })
      }
    },
    onSuccess: () => {
      toastSuccess(t(`${key}.sent`, { count: visits.length }))
      onClose()
    },
    // A chunk may have gone through before a later one failed, so the lists are refreshed either way.
    onSettled: () => void queryClient.invalidateQueries({ queryKey: bookingKeys.all })
  })
  const errorCode = withdraw.isError ? bookingErrorCode(withdraw.error) : undefined

  function submit() {
    if (reasonCode === 'OTHER' && !detail.trim()) {
      setMissingDetail(true)
      return
    }
    withdraw.mutate()
  }

  const firstDay = visits[0] ? calendarDayOf(visits[0].startAt) : ''
  const title =
    scope === 'day'
      ? t(`${key}.titleDay`, { day: format.shortDay(firstDay) })
      : scope === 'remaining'
        ? t(`${key}.titleRemaining`)
        : t(`${key}.title`)

  return (
    <Modal
      dismissOnBackdrop={false}
      footer={
        <div className='flex w-full flex-wrap items-center justify-end gap-2'>
          <Button onClick={onClose} variant='outline'>
            {t(`${key}.cancel`)}
          </Button>
          <Button disabled={visits.length === 0} loading={withdraw.isPending} onClick={submit} variant='danger'>
            {t(`${key}.submit`, { count: visits.length })}
          </Button>
        </div>
      }
      onClose={onClose}
      open
      size='lg'
      title={title}
    >
      <div className='flex flex-col gap-5 text-sm'>
        <div className='flex items-start gap-3 rounded-2xl bg-mint-50 p-3.5 text-forest-900 ring-1 ring-mint-200'>
          <span className='grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-forest-800'>
            <Icon className='text-xl' name='swap_horiz' />
          </span>
          <div className='space-y-1'>
            <p>{t(`${key}.intro`)}</p>
            {scope === 'day' ? <p className='font-semibold'>{t(`${key}.wholeDayRule`)}</p> : null}
          </div>
        </div>

        <section aria-labelledby='withdraw-visits-title'>
          <h3
            className='mb-2 flex items-center justify-between text-xs font-bold tracking-wider text-on-surface-variant uppercase'
            id='withdraw-visits-title'
          >
            {t(`${key}.visits`)}
            <span className='rounded-full bg-error-container px-2 py-0.5 text-[11px] text-on-error-container normal-case tabular-nums'>
              {t(`${key}.count`, { count: visits.length })}
            </span>
          </h3>
          {visits.length ? (
            <VisitDayDigest visits={visits} />
          ) : (
            <p className='rounded-2xl bg-surface-container-low p-3 text-on-surface-variant'>{t(`${key}.none`)}</p>
          )}
        </section>

        {kept.length ? (
          <details className='group rounded-2xl border border-outline-variant/70 p-3'>
            <summary className='flex cursor-pointer list-none items-center justify-between gap-2 font-semibold text-on-surface'>
              <span className='flex items-center gap-2'>
                <Icon className='text-lg text-on-surface-variant' name='lock_clock' />
                {t(`${key}.kept`, { count: kept.length })}
              </span>
              <Icon className='text-lg transition-transform group-open:rotate-180' name='expand_more' />
            </summary>
            <p className='mt-1 text-xs text-on-surface-variant'>{t(`${key}.keptHint`)}</p>
            <VisitDayDigest className='mt-2' tone='muted' visits={kept} />
          </details>
        ) : null}

        <fieldset>
          <legend className='mb-2 text-xs font-bold tracking-wider text-on-surface-variant uppercase'>
            {t(`${key}.reasonTitle`)}
          </legend>
          <div className='grid gap-2 sm:grid-cols-2'>
            {REASONS.map((reason) => {
              const checked = reasonCode === reason.code
              return (
                <label
                  className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border px-3 py-2.5 transition-colors has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-forest-900 ${checked ? 'border-forest-800 bg-mint-50 ring-1 ring-forest-800' : 'border-outline-variant hover:bg-surface-container-low'}`}
                  key={reason.code}
                >
                  <input
                    checked={checked}
                    className='sr-only'
                    name='withdraw-reason'
                    onChange={() => {
                      setReasonCode(reason.code)
                      setMissingDetail(false)
                    }}
                    type='radio'
                  />
                  <span
                    aria-hidden='true'
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${checked ? 'bg-forest-900 text-white' : 'bg-surface-container text-on-surface-variant'}`}
                  >
                    <Icon className='text-lg' name={reason.icon} />
                  </span>
                  <span className='min-w-0'>
                    <span className='block font-semibold text-on-surface'>{t(`${key}.reasons.${reason.code}`)}</span>
                    <span className='block text-xs text-on-surface-variant'>
                      {t(`${key}.reasonHints.${reason.code}`)}
                    </span>
                  </span>
                </label>
              )
            })}
          </div>
        </fieldset>

        <div>
          <label className='text-xs font-semibold text-on-surface' htmlFor='withdraw-detail'>
            {reasonCode === 'OTHER' ? t(`${key}.detail`) : t(`${key}.detailOptional`)}
          </label>
          <textarea
            aria-describedby={missingDetail ? 'withdraw-detail-error' : undefined}
            aria-invalid={missingDetail}
            className='mt-1.5 w-full rounded-2xl border border-outline-variant bg-surface-container-lowest p-3 text-sm text-on-surface focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/25'
            id='withdraw-detail'
            maxLength={1000}
            onChange={(event) => {
              setDetail(event.target.value)
              setMissingDetail(false)
            }}
            placeholder={t(`${key}.detailPlaceholder`)}
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
          <p className='flex items-start gap-2 rounded-2xl bg-error-container p-3 text-on-error-container' role='alert'>
            <Icon className='text-lg' name='error' />
            {errorCode !== undefined && KNOWN_ERRORS.has(errorCode)
              ? t(`${key}.errors.e${errorCode as KnownError}`)
              : t(`${key}.errors.generic`)}
          </p>
        ) : null}
      </div>
    </Modal>
  )
}
