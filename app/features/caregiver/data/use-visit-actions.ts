import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toastError, toastSuccess } from '~/shared/ui/app-toast'

import { acknowledgeOccurrence, acknowledgeOccurrences, bookingKeys, checkIn } from '~/entities/booking/booking-api'
import { bookingErrorKey } from '~/entities/booking/booking-format'
import type { CaregiverOccurrenceRecord } from '~/shared/api/generated/contracts'

/** Fallback for a response without the window; the center policy default is 30 minutes either side (D22). */
const DEFAULT_WINDOW_MS = 30 * 60 * 1000

/** Best-effort location for check-in; a denied permission or a slow fix resolves without coordinates. */
export function currentPosition(timeoutMs = 8000): Promise<{ latitude?: number; longitude?: number }> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) return Promise.resolve({})
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
      () => resolve({}),
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 60_000 }
    )
  })
}

/** The check-in window of a visit (Q12: from the center policy captured on the booking). */
export function checkInWindow(visit: CaregiverOccurrenceRecord) {
  const start = new Date(visit.startAt).getTime()
  return {
    opens: visit.checkInOpensAt ? new Date(visit.checkInOpensAt).getTime() : start - DEFAULT_WINDOW_MS,
    closes: visit.checkInClosesAt ? new Date(visit.checkInClosesAt).getTime() : start + DEFAULT_WINDOW_MS
  }
}

export type VisitStep = 'accept' | 'start' | 'waitToStart' | 'continue' | 'none'

/** True while a visit can still be accepted: BookingService takes it until its check-in window closes (2026-11-11). */
const stillOpen = (visit: CaregiverOccurrenceRecord, now: number) =>
  now < checkInWindow(visit).closes && now < new Date(visit.endAt).getTime()

/**
 * The one thing the caregiver does next on a visit, given the current time. A visit not accepted in time is not lost
 * (2026-11-11): inside the check-in window it can be started straight away — checking in accepts it — and once the
 * window closes nothing is left to do (BookingService marks it missed).
 */
export function nextVisitStep(visit: CaregiverOccurrenceRecord, now: number): VisitStep {
  if (visit.noShowReportedAt && !visit.noShowDecidedAt) return 'none'
  if (visit.status === 'IN_PROGRESS' || (visit.sessionId && visit.status !== 'COMPLETED')) return 'continue'
  if (visit.status === 'SCHEDULED' || visit.status === 'ACKNOWLEDGED') {
    if (!stillOpen(visit, now)) return 'none'
    if (now >= checkInWindow(visit).opens) return 'start'
    return visit.status === 'SCHEDULED' ? 'accept' : 'waitToStart'
  }
  return 'none'
}

/**
 * Accept and start a visit with the same payloads as before (`POST …/acknowledge`, `POST /care-sessions`), a toast on
 * success and the booking cache refreshed.
 */
export function useVisitActions(visit: CaregiverOccurrenceRecord, onStarted?: () => void) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const refresh = () => queryClient.invalidateQueries({ queryKey: bookingKeys.all })

  const accept = useMutation({
    mutationFn: () => acknowledgeOccurrence(visit.id),
    onSuccess: async () => {
      toastSuccess(t('caregiver.visitDetail.actions.accepted'))
      await refresh()
    },
    onError: (error) => toastError(t(bookingErrorKey(error)))
  })
  const start = useMutation({
    mutationFn: async () => checkIn({ occurrenceId: visit.id, ...(await currentPosition()) }),
    onSuccess: async () => {
      toastSuccess(t('caregiver.visitDetail.actions.started'))
      await refresh()
      onStarted?.()
    },
    onError: (error) => toastError(t(bookingErrorKey(error)))
  })

  return { accept, start }
}

/** Visits of one booking the caregiver can still accept: assigned, not confirmed, check-in still open, not being replaced. */
export function acceptableVisits(visits: CaregiverOccurrenceRecord[], now: number) {
  return visits.filter((visit) => visit.status === 'SCHEDULED' && !visit.needsReassignment && stillOpen(visit, now))
}

/**
 * Accept several visits of one booking at once (2026-11-10, `POST /booking-occurrences/acknowledgements`, all or
 * nothing), with a toast and the booking cache refreshed.
 */
export function useAcceptVisits(onDone?: () => void) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (visits: CaregiverOccurrenceRecord[]) => acknowledgeOccurrences(visits.map((visit) => visit.id)),
    onSuccess: async (accepted) => {
      toastSuccess(t('caregiver.booking.accept.done', { count: accepted.length }))
      onDone?.()
      await queryClient.invalidateQueries({ queryKey: bookingKeys.all })
    },
    onError: (error) => toastError(t(bookingErrorKey(error)))
  })
}
