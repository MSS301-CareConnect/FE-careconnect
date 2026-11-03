import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { acknowledgeOccurrence, bookingKeys, checkIn } from '~/entities/booking/booking-api'
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

/** The one thing the caregiver does next on a visit, given the current time. */
export function nextVisitStep(visit: CaregiverOccurrenceRecord, now: number): VisitStep {
  if (visit.noShowReportedAt && !visit.noShowDecidedAt) return 'none'
  if (visit.status === 'SCHEDULED') return 'accept'
  if (visit.status === 'IN_PROGRESS' || (visit.sessionId && visit.status !== 'COMPLETED')) return 'continue'
  if (visit.status === 'ACKNOWLEDGED') {
    const { opens, closes } = checkInWindow(visit)
    if (now >= closes) return 'none'
    return now >= opens ? 'start' : 'waitToStart'
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
      toast.success(t('caregiver.visitDetail.actions.accepted'))
      await refresh()
    },
    onError: (error) => toast.error(t(bookingErrorKey(error)))
  })
  const start = useMutation({
    mutationFn: async () => checkIn({ occurrenceId: visit.id, ...(await currentPosition()) }),
    onSuccess: async () => {
      toast.success(t('caregiver.visitDetail.actions.started'))
      await refresh()
      onStarted?.()
    },
    onError: (error) => toast.error(t(bookingErrorKey(error)))
  })

  return { accept, start }
}
