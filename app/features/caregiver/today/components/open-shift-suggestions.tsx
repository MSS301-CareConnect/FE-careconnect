import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { shiftInstant, shiftTypeLabelKey } from '~/entities/provider/work-shift'

import { useMyRegistrations, useOpenShifts } from '../../data/caregiver-queries'
import { useCaregiverFormat } from '../../ui/caregiver-format'
import { cgCard } from '../../ui/caregiver-page'

/** On a day without visits: the next two or three open shifts the caregiver has not signed up for yet. */
export function OpenShiftSuggestions({ centerId, now }: { centerId?: string; now: number }) {
  const { t } = useTranslation()
  const format = useCaregiverFormat()
  const shifts = useOpenShifts(centerId)
  const registrations = useMyRegistrations()
  const taken = new Set(
    (registrations.data?.items ?? [])
      .filter((item) => item.registrationStatus === 'PENDING' || item.registrationStatus === 'APPROVED')
      .map((item) => item.workShiftId)
  )
  const suggestions = (shifts.data?.items ?? [])
    .filter(
      (shift) =>
        shift.shiftStatus === 'OPEN' &&
        !taken.has(shift.id) &&
        (shift.approvedCount ?? 0) < shift.capacity &&
        shiftInstant(shift.workDate, shift.startTime) > now
    )
    .slice(0, 3)
  if (suggestions.length === 0) return null

  return (
    <section aria-labelledby='today-open-shifts' className={`${cgCard} p-4 sm:p-5`}>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <h2 className='text-base font-semibold text-on-surface' id='today-open-shifts'>
          {t('caregiver.today.empty.openShifts')}
        </h2>
        <Link className='text-sm font-semibold text-primary hover:underline' to='/caregiver/work-shifts'>
          {t('caregiver.today.empty.allShifts')}
        </Link>
      </div>
      <ul className='mt-3 grid gap-2 sm:grid-cols-3'>
        {suggestions.map((shift) => (
          <li key={shift.id}>
            <Link
              className='block rounded-lg border border-outline-variant p-3 transition-colors duration-150 hover:border-brand-300 hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-primary'
              to='/caregiver/work-shifts'
            >
              <span className='block font-semibold tabular-nums'>{format.shortDay(shift.workDate)}</span>
              <span className='block text-sm text-on-surface-variant tabular-nums'>
                {format.timeRangeWithDuration(shift.startTime, shift.endTime)}
              </span>
              <span className='mt-1 block text-xs text-on-surface-variant'>
                {t(shiftTypeLabelKey(shift.shiftType))} ·{' '}
                {t('caregiver.work.shifts.capacity', { approved: shift.approvedCount ?? 0, capacity: shift.capacity })}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
