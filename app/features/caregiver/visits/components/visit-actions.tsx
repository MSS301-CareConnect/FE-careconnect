import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { acknowledgeOccurrence, bookingKeys, checkIn, reportNoShow } from '~/entities/booking/booking-api'
import { bookingErrorKey, formatClock, hasStarted } from '~/entities/booking/booking-format'
import { BookingReasonDialog } from '~/entities/booking/booking-reason-dialog'
import type { CaregiverOccurrenceRecord } from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'

import { currentPosition } from '../current-position'

const CHECK_IN_LEAD_MS = 30 * 60 * 1000
// D22: after start + 30 minutes the visit becomes MISSED, so check-in closes then.
const CHECK_IN_GRACE_MS = 30 * 60 * 1000
const CLOCK_TICK_MS = 30_000

/** The current time, refreshed while the page stays open so the check-in button opens and closes on time. */
function useNow() {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), CLOCK_TICK_MS)
    return () => window.clearInterval(timer)
  }, [])
  return now
}

/** The next job for a visit that has no care session yet: acknowledge, check in, or report a no-show. */
export function VisitActions({ visit }: { visit: CaregiverOccurrenceRecord }) {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const [reporting, setReporting] = useState(false)
  const waiting = visit.status === 'SCHEDULED' || visit.status === 'ACKNOWLEDGED'
  const now = useNow()
  const start = new Date(visit.startAt).getTime()
  const opensAt = formatClock(new Date(start - CHECK_IN_LEAD_MS).toISOString(), i18n.language)
  const closesAt = formatClock(new Date(start + CHECK_IN_GRACE_MS).toISOString(), i18n.language)
  const tooEarly = now < start - CHECK_IN_LEAD_MS
  const tooLate = now > start + CHECK_IN_GRACE_MS
  const started = hasStarted(visit.startAt, now)
  const noShowReported = Boolean(visit.noShowReportedAt)

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: bookingKeys.all })
  }
  const acknowledge = useMutation({ mutationFn: () => acknowledgeOccurrence(visit.id), onSuccess: refresh })
  const checkInVisit = useMutation({
    mutationFn: async () => checkIn({ occurrenceId: visit.id, ...(await currentPosition()) }),
    onSuccess: refresh
  })
  const noShow = useMutation({
    mutationFn: (note: string) => reportNoShow(visit.id, note),
    onSuccess: () => {
      refresh()
      setReporting(false)
    }
  })

  if (!waiting) return null
  if (noShowReported)
    return (
      <p className='flex items-start gap-2 rounded-xl border border-warning/25 bg-warning-container p-4 text-sm font-medium text-on-warning-container'>
        <Icon className='text-lg' name='pending' />
        {t('caregiver.visitDetail.noShowAwaiting')}
      </p>
    )

  const error = acknowledge.error ?? checkInVisit.error
  return (
    <section className='flex flex-col gap-3 rounded-2xl border border-outline-variant/20 bg-white p-5 shadow-sm sm:p-6'>
      <h2 className='text-base font-bold text-on-surface'>{t('caregiver.visitDetail.nextStep')}</h2>
      <div className='flex flex-wrap gap-2.5'>
        {visit.status === 'SCHEDULED' ? (
          <button
            className='inline-flex min-h-11 items-center gap-2 rounded-xl bg-surface-container px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50'
            disabled={acknowledge.isPending}
            onClick={() => acknowledge.mutate()}
            type='button'
          >
            <Icon className='text-lg' name='thumb_up' />
            {acknowledge.isPending ? t('booking.actions.working') : t('caregiver.visitDetail.acknowledge')}
          </button>
        ) : null}
        <button
          className='inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50'
          disabled={checkInVisit.isPending || tooEarly || tooLate}
          onClick={() => checkInVisit.mutate()}
          type='button'
        >
          <Icon className='text-lg' name='login' />
          {checkInVisit.isPending ? t('caregiver.visitDetail.checkingIn') : t('caregiver.visitDetail.checkIn')}
        </button>
        {started ? (
          <button
            className='inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-error ring-1 ring-error/30 transition-colors hover:bg-error-container/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error'
            onClick={() => setReporting(true)}
            type='button'
          >
            <Icon className='text-lg' name='person_off' />
            {t('caregiver.visitDetail.reportNoShow')}
          </button>
        ) : null}
      </div>
      {tooLate ? (
        <p className='rounded-lg bg-warning-container p-3 text-sm text-on-warning-container tabular-nums'>
          {t('caregiver.visitDetail.checkInClosed', { time: closesAt })}
        </p>
      ) : (
        <p className='text-sm text-on-surface-variant tabular-nums'>
          {t('caregiver.visitDetail.checkInHint', { time: opensAt, closes: closesAt })}
        </p>
      )}
      {error ? (
        <p className='rounded-lg bg-error-container/40 p-3 text-sm text-error' role='alert'>
          {t(bookingErrorKey(error))}
        </p>
      ) : null}
      {reporting ? (
        <BookingReasonDialog
          confirmLabel={t('caregiver.visitDetail.reportNoShow')}
          danger
          description={t('caregiver.visitDetail.noShowHint')}
          error={noShow.error ? t(bookingErrorKey(noShow.error)) : undefined}
          label={t('caregiver.visitDetail.noShowNote')}
          minLength={10}
          onClose={() => setReporting(false)}
          onConfirm={(note) => noShow.mutate(note)}
          pending={noShow.isPending}
          title={t('caregiver.visitDetail.noShowTitle')}
        />
      ) : null}
    </section>
  )
}
