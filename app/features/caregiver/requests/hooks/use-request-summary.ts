import { useTranslation } from 'react-i18next'

import type { CaregiverBookingRequestRecord } from '~/shared/api/generated/contracts'

import { useCaregiverFormat } from '../../ui/caregiver-format'
import { genderCode, sortedVisits, totalMinutes, visitDays } from '../request-model'

/** What every view of a request needs: the visits in order, when they are, who is cared for and where. */
export function useRequestSummary(request: CaregiverBookingRequestRecord) {
  const { t } = useTranslation()
  const format = useCaregiverFormat()
  const visits = sortedVisits(request.occurrences)
  const days = visitDays(visits)
  const first = visits[0]
  const last = visits[visits.length - 1]

  // One day: "CN, 08/11 · 08:00–13:00"; several days: "CN, 08/11 – T7, 22/11".
  const when =
    days && first && last
      ? days.first === days.last
        ? `${format.shortDay(days.first)} · ${format.clockRange(first.startAt, last.endAt)}`
        : t('caregiver.requests.dateRange', { from: format.shortDay(days.first), to: format.shortDay(days.last) })
      : request.bookingCode

  const gender = genderCode(request.recipientGender)
  const recipientMeta = [
    request.recipientAge !== undefined ? t('caregiver.ui.age', { count: request.recipientAge }) : null,
    gender ? t(`caregiver.ui.gender.${gender}`) : null
  ]
    .filter(Boolean)
    .join(' · ')

  return {
    visits,
    when,
    multiDay: Boolean(days && days.first !== days.last),
    totalTime: format.duration(totalMinutes(visits)),
    recipientName: request.recipientName || t('caregiver.visits.patientFallback'),
    recipientMeta,
    area: [request.ward, request.district, request.province].filter(Boolean).join(', '),
    shiftScheduleId: request.bookingType === 'SHIFT' ? first?.caregiverScheduleId : undefined
  }
}
