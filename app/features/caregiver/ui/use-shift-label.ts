import { useTranslation } from 'react-i18next'

import { shiftTypeLabelKey } from '~/entities/provider/work-shift'

import { useVisitShift } from '../data/caregiver-queries'
import { hhmm, useCaregiverFormat } from './caregiver-format'

/**
 * "Ca sáng · CN, 08/11 · 07:00–13:00" for the work shift a SHIFT visit holds (`caregiverScheduleId`). Without the
 * shift's type it falls back to the schedule's day and hours; undefined when the schedule is not found.
 */
export function useShiftLabel(scheduleId: string | undefined) {
  const { t } = useTranslation()
  const format = useCaregiverFormat()
  const { schedule, shift, loading } = useVisitShift(scheduleId)
  if (!schedule) return { label: undefined, loading }
  const time = `${format.shortDay(schedule.workDate)} · ${hhmm(schedule.startTime)}–${hhmm(schedule.endTime)}`
  const label = t('caregiver.requests.shiftValue', {
    type: shift ? t(shiftTypeLabelKey(shift.shiftType)) : t('caregiver.requests.shift'),
    time
  })
  return { label, loading: false }
}
