import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import {
  assignOccurrenceCaregiver,
  bookingKeys,
  cancelBookingRequest,
  decideNoShow,
  fetchOccurrence,
  forceEndSession
} from '~/entities/booking/booking-api'
import { bookingErrorKey, hasStarted, isUpcomingOccurrence } from '~/entities/booking/booking-format'
import { BookingReasonDialog } from '~/entities/booking/booking-reason-dialog'
import type { BookingOccurrenceRecord, BookingStatus } from '~/shared/api/generated/contracts'

import type { useCenterCaregivers } from '../hooks/use-center-caregivers'
import { CaregiverAssignDialog } from './caregiver-assign-dialog'

type Dialog = 'assign' | 'approve' | 'reject' | 'forceEnd' | 'cancel' | null
const action = 'rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-primary shadow-sm hover:bg-surface-container'
// Spec §10.1 (B16): once paid, the center cancels single visits (full refund of what was paid for them); an unpaid
// booking is rejected or cancelled whole.
const VISIT_CANCELLABLE: ReadonlySet<BookingStatus> = new Set(['CONFIRMED', 'IN_PROGRESS'])

export interface ManagerOccurrenceActionsProps {
  /** The booking passed its running deadline and BookingService is closing it: no reassignment or cancellation. */
  bookingClosing?: boolean
  bookingId: string
  bookingStatus: BookingStatus
  occurrence: BookingOccurrenceRecord
  caregivers: ReturnType<typeof useCenterCaregivers>
}

/**
 * Started visits load their occurrence detail, the only place BookingService exposes the no-show report
 * and the care session ID.
 */
export function ManagerOccurrenceActions({
  bookingClosing = false,
  bookingId,
  bookingStatus,
  occurrence,
  caregivers
}: ManagerOccurrenceActionsProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [dialog, setDialog] = useState<Dialog>(null)
  const started =
    occurrence.status === 'IN_PROGRESS' ||
    ((occurrence.status === 'SCHEDULED' || occurrence.status === 'ACKNOWLEDGED') && hasStarted(occurrence.startAt))
  const detail = useQuery({
    queryKey: bookingKeys.occurrence(occurrence.id),
    queryFn: () => fetchOccurrence(occurrence.id),
    enabled: started,
    retry: false
  })

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: bookingKeys.all })
    setDialog(null)
  }
  const assign = useMutation({
    mutationFn: (caregiverId: string) => assignOccurrenceCaregiver(bookingId, occurrence.id, caregiverId),
    onSuccess: refresh
  })
  const decide = useMutation({
    mutationFn: ({ approved, note }: { approved: boolean; note?: string }) =>
      decideNoShow(occurrence.id, { approved, note }),
    onSuccess: refresh
  })
  const forceEnd = useMutation({
    mutationFn: (reason: string) => forceEndSession(detail.data?.sessionId ?? '', reason),
    onSuccess: refresh
  })
  const cancel = useMutation({
    mutationFn: (reason: string) => cancelBookingRequest(bookingId, { reason, occurrenceIds: [occurrence.id] }),
    onSuccess: refresh
  })
  const upcoming = isUpcomingOccurrence(occurrence) && !bookingClosing

  const awaitingDecision = Boolean(detail.data?.noShowReportedAt && !detail.data.noShowDecidedAt)
  const sessionId = occurrence.status === 'IN_PROGRESS' ? detail.data?.sessionId : undefined

  return (
    <>
      {upcoming ? (
        <button className={action} onClick={() => setDialog('assign')} type='button'>
          {t('centerManager.bookingDetail.occurrence.reassign')}
        </button>
      ) : null}
      {upcoming && VISIT_CANCELLABLE.has(bookingStatus) ? (
        <button className={`${action} text-error`} onClick={() => setDialog('cancel')} type='button'>
          {t('centerManager.bookingDetail.occurrence.cancel')}
        </button>
      ) : null}
      {awaitingDecision ? (
        <>
          <p className='w-full rounded-lg border border-warning/25 bg-warning-container p-2.5 text-xs font-medium text-on-warning-container'>
            {t('centerManager.bookingDetail.occurrence.noShowReported', { note: detail.data?.noShowNote ?? '' })}
          </p>
          <button className={action} onClick={() => setDialog('approve')} type='button'>
            {t('centerManager.bookingDetail.occurrence.approveNoShow')}
          </button>
          <button className={action} onClick={() => setDialog('reject')} type='button'>
            {t('centerManager.bookingDetail.occurrence.rejectNoShow')}
          </button>
        </>
      ) : null}
      {sessionId ? (
        <button className={`${action} text-error`} onClick={() => setDialog('forceEnd')} type='button'>
          {t('centerManager.bookingDetail.occurrence.forceEnd')}
        </button>
      ) : null}

      {dialog === 'assign' ? (
        <CaregiverAssignDialog
          confirmLabel={t('centerManager.bookingDetail.assign.confirm')}
          currentId={occurrence.caregiverId}
          description={t('centerManager.bookingDetail.assign.oneDescription', { number: occurrence.occurrenceNo })}
          error={assign.error ? t(bookingErrorKey(assign.error)) : undefined}
          loading={caregivers.caregivers.isPending}
          onClose={() => setDialog(null)}
          onConfirm={(caregiverId) => caregiverId && assign.mutate(caregiverId)}
          options={caregivers.options}
          pending={assign.isPending}
          title={t('centerManager.bookingDetail.assign.oneTitle', { number: occurrence.occurrenceNo })}
        />
      ) : null}
      {dialog === 'approve' ? (
        <BookingReasonDialog
          confirmLabel={t('centerManager.bookingDetail.occurrence.approveNoShow')}
          description={t('centerManager.bookingDetail.occurrence.approveHint')}
          error={decide.error ? t(bookingErrorKey(decide.error)) : undefined}
          label={t('centerManager.bookingDetail.occurrence.decisionNote')}
          onClose={() => setDialog(null)}
          onConfirm={(note) => decide.mutate({ approved: true, note })}
          pending={decide.isPending}
          title={t('centerManager.bookingDetail.occurrence.approveTitle')}
        />
      ) : null}
      {dialog === 'reject' ? (
        <BookingReasonDialog
          confirmLabel={t('centerManager.bookingDetail.occurrence.rejectNoShow')}
          danger
          description={t('centerManager.bookingDetail.occurrence.rejectHint')}
          error={decide.error ? t(bookingErrorKey(decide.error)) : undefined}
          label={t('centerManager.bookingDetail.occurrence.decisionNote')}
          onClose={() => setDialog(null)}
          onConfirm={(note) => decide.mutate({ approved: false, note })}
          pending={decide.isPending}
          title={t('centerManager.bookingDetail.occurrence.rejectTitle')}
        />
      ) : null}
      {dialog === 'cancel' ? (
        <BookingReasonDialog
          confirmLabel={t('centerManager.bookingDetail.occurrence.cancel')}
          danger
          description={t('centerManager.bookingDetail.occurrence.cancelHint')}
          error={cancel.error ? t(bookingErrorKey(cancel.error)) : undefined}
          label={t('centerManager.bookingDetail.reason')}
          onClose={() => setDialog(null)}
          onConfirm={(reason) => cancel.mutate(reason)}
          pending={cancel.isPending}
          title={t('centerManager.bookingDetail.occurrence.cancelTitle', { number: occurrence.occurrenceNo })}
        />
      ) : null}
      {dialog === 'forceEnd' ? (
        <BookingReasonDialog
          confirmLabel={t('centerManager.bookingDetail.occurrence.forceEnd')}
          danger
          description={t('centerManager.bookingDetail.occurrence.forceEndHint')}
          error={forceEnd.error ? t(bookingErrorKey(forceEnd.error)) : undefined}
          label={t('centerManager.bookingDetail.occurrence.forceEndReason')}
          onClose={() => setDialog(null)}
          onConfirm={(reason) => forceEnd.mutate(reason)}
          pending={forceEnd.isPending}
          title={t('centerManager.bookingDetail.occurrence.forceEndTitle', { number: occurrence.occurrenceNo })}
        />
      ) : null}
    </>
  )
}
