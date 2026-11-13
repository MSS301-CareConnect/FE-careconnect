import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { bookingKeys, concludeAbsence, fetchCaregiverAbsences, fetchOccurrence } from '~/entities/booking/booking-api'
import { bookingErrorKey } from '~/entities/booking/booking-format'
import { BookingReasonDialog } from '~/entities/booking/booking-reason-dialog'
import { CaregiverAbsenceCard } from '~/entities/booking/caregiver-absence-card'
import { CenterCheckInDialog } from '~/entities/booking/center-check-in-dialog'
import type { BookingOccurrenceRecord } from '~/shared/api/generated/contracts'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'

const key = 'caregiverAbsence' as const

/**
 * A missed visit's absence record in the manager's visit detail (2026-11-13): the caregiver's explanation and the
 * center's conclusion, with excuse / violation while it is still pending — the same record as the attention queue.
 */
export function ManagerVisitAbsence({
  bookingId,
  occurrence,
  caregiverName
}: {
  bookingId: string
  occurrence: BookingOccurrenceRecord
  caregiverName?: string
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const missed = occurrence.status === 'CAREGIVER_MISSED'
  const params = { bookingId, page: 0, size: 100 }
  const absences = useQuery({
    queryKey: bookingKeys.absences(params),
    queryFn: () => fetchCaregiverAbsences(params),
    enabled: missed,
    retry: false
  })
  // Same key as the visit dialog: `missedRefundAt` says the center can still record the check-in (2026-11-13).
  const detail = useQuery({
    queryKey: bookingKeys.occurrence(occurrence.id),
    queryFn: () => fetchOccurrence(occurrence.id),
    enabled: missed,
    retry: false
  })
  const [decision, setDecision] = useState<'excuse' | 'confirm' | null>(null)
  const [checkingIn, setCheckingIn] = useState(false)
  const conclude = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      concludeAbsence(id, { decision: decision === 'excuse' ? 'EXCUSED' : 'CONFIRMED', note }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: bookingKeys.allAbsences })
      setDecision(null)
    }
  })
  const absence = absences.data?.items.find((item) => item.occurrenceId === occurrence.id)
  if (!absence) return null

  function open(next: 'excuse' | 'confirm') {
    conclude.reset()
    setDecision(next)
  }

  return (
    <section aria-label={t(`${key}.manager.visitTitle`)} className='space-y-2'>
      <h3 className='text-xs font-bold tracking-wide text-on-surface-variant uppercase'>
        {t(`${key}.manager.visitTitle`)}
      </h3>
      <ul>
        <CaregiverAbsenceCard
          actions={
            absence.status === 'PENDING' || detail.data?.missedRefundAt ? (
              <>
                {detail.data?.missedRefundAt ? (
                  <Button onClick={() => setCheckingIn(true)} size='sm'>
                    {t('centerManager.bookingDetail.occurrence.checkIn')}
                  </Button>
                ) : null}
                {absence.status === 'PENDING' ? (
                  <>
                    <Button onClick={() => open('excuse')} size='sm' variant='outline'>
                      {t(`${key}.manager.excuse`)}
                    </Button>
                    <Button onClick={() => open('confirm')} size='sm' variant='outline'>
                      {t(`${key}.manager.confirm`)}
                    </Button>
                  </>
                ) : null}
              </>
            ) : undefined
          }
          item={absence}
          meta={t(`${key}.caregiver`, { name: caregiverName ?? t(`${key}.unknownCaregiver`) })}
        />
      </ul>
      {detail.data && !detail.data.missedRefundAt ? (
        <p className='flex items-start gap-2 rounded-xl bg-surface-container-low p-3 text-sm text-on-surface-variant'>
          <Icon className='mt-0.5 text-base' name='info' />
          {t(`${key}.manager.refundSent`)}
          {absence.status === 'PENDING' ? ` ${t(`${key}.manager.refundSentConclude`)}` : ''}
        </p>
      ) : null}
      {checkingIn ? (
        <CenterCheckInDialog
          occurrenceId={occurrence.id}
          occurrenceNo={occurrence.occurrenceNo}
          onClose={() => setCheckingIn(false)}
          startAt={occurrence.startAt}
        />
      ) : null}
      {decision ? (
        <BookingReasonDialog
          confirmLabel={t(`${key}.manager.${decision}`)}
          danger={decision === 'confirm'}
          description={t(`${key}.manager.${decision}Hint`)}
          error={conclude.error ? t(bookingErrorKey(conclude.error)) : undefined}
          label={t(`${key}.manager.note`)}
          onClose={() => setDecision(null)}
          onConfirm={(note) => conclude.mutate({ id: absence.id, note })}
          pending={conclude.isPending}
          title={t(`${key}.manager.${decision}Title`, { number: absence.occurrenceNo ?? '' })}
        />
      ) : null}
    </section>
  )
}
