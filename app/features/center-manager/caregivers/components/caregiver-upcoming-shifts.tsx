import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { fetchCenterSchedules, providerKeys } from '~/entities/provider/provider-api'
import { shiftTypeLabelKey } from '~/entities/provider/work-shift'
import { apiRequestErrorKey } from '~/shared/api/error-details'
import { addDays, useFormat } from '~/shared/lib/format'
import { Icon } from '~/shared/ui/icon'

const key = 'centerManager.provider.upcomingShifts' as const
const DAYS = 14

/** The caregiver's approved shifts of the next two weeks, with a link to the full work schedule. */
export function CaregiverUpcomingShifts({
  caregiverId,
  centerId,
  today
}: {
  caregiverId: string
  centerId: string
  today: string
}) {
  const { t } = useTranslation()
  const format = useFormat()
  const request = {
    caregiverId,
    fromDate: today,
    toDate: addDays(today, DAYS - 1),
    status: 'SCHEDULED' as const,
    size: 50
  }
  const shifts = useQuery({
    queryKey: [...providerKeys.centerSchedules(centerId), request],
    queryFn: () => fetchCenterSchedules(centerId, request),
    retry: false
  })
  const items = shifts.data?.items ?? []

  return (
    <section className='rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-5 sm:p-6'>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <h2 className='flex items-center gap-2 text-lg font-bold'>
            <Icon className='text-primary' name='calendar_view_week' />
            {t(`${key}.title`)}
          </h2>
          <p className='mt-1 text-sm text-on-surface-variant'>{t(`${key}.hint`, { days: DAYS })}</p>
        </div>
        <Link
          className='inline-flex min-h-9 items-center gap-1 rounded-lg px-3 text-sm font-semibold text-primary hover:bg-surface-container-low'
          to={`/center-manager/schedules?caregiver=${caregiverId}`}
        >
          {t(`${key}.openCalendar`)}
          <Icon className='text-base' name='chevron_right' />
        </Link>
      </div>
      {shifts.isPending ? (
        <p className='mt-4 text-sm text-on-surface-variant' role='status'>
          {t(`${key}.loading`)}
        </p>
      ) : null}
      {shifts.isError ? (
        <p className='mt-4 text-sm text-error' role='alert'>
          {t(apiRequestErrorKey(shifts.error, `${key}.error`))}
        </p>
      ) : null}
      {shifts.isSuccess && items.length === 0 ? (
        <p className='mt-4 rounded-xl bg-surface-container-low px-4 py-5 text-center text-sm text-on-surface-variant'>
          {t(`${key}.empty`)}
        </p>
      ) : null}
      {items.length > 0 ? (
        <ul className='mt-4 grid gap-2 sm:grid-cols-2'>
          {items.map((item) => (
            <li key={item.id}>
              <Link
                className='flex items-center gap-3 rounded-xl border border-outline-variant/50 px-3 py-2.5 transition-colors hover:border-primary/40 hover:bg-surface-container-low'
                to={`/center-manager/work-shifts/${item.workShiftId}`}
              >
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg text-xs font-bold ${item.workDate === today ? 'bg-primary text-on-primary' : 'bg-brand-50 text-primary'}`}
                >
                  {item.workDate.slice(8, 10)}
                </span>
                <span className='min-w-0'>
                  <span className='block text-sm font-semibold tabular-nums'>
                    {format.shortDayLabel(item.workDate)} · {item.startTime.slice(0, 5)}–{item.endTime.slice(0, 5)}
                  </span>
                  <span className='block truncate text-xs text-on-surface-variant'>
                    {t(shiftTypeLabelKey(item.shiftType))}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
