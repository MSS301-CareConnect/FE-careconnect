import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { shiftTypeLabelKey } from '~/entities/provider/work-shift'
import type { ProviderScheduleRecord, ProviderTimeOffRecord } from '~/shared/api/generated/contracts'
import { useFormat } from '~/shared/lib/format'
import { Icon } from '~/shared/ui/icon'
import { StatusBadge } from '~/shared/ui/status-badge'

import { clashesWithLeave, leaveOnDay, type DayLeave } from '../calendar-model'

const k = 'centerManager.schedules' as const

/** The week's work shifts in time order, with who works, the shift type, length, state and a link to the shift. */
export function ScheduleList({
  schedules,
  timeOffs,
  now
}: {
  schedules: ProviderScheduleRecord[]
  timeOffs: ProviderTimeOffRecord[]
  now: number
}) {
  const { t } = useTranslation()
  const format = useFormat()
  const sorted = [...schedules].sort(
    (a, b) => a.workDate.localeCompare(b.workDate) || a.startTime.localeCompare(b.startTime)
  )

  return (
    <div className='overflow-x-auto'>
      <table className='w-full min-w-[760px] text-left text-sm'>
        <caption className='sr-only'>{t(`${k}.list.caption`)}</caption>
        <thead className='border-b border-outline-variant/50 bg-surface-container-low text-xs font-semibold text-on-surface-variant'>
          <tr>
            {(['day', 'time', 'caregiver', 'type', 'status', 'actions'] as const).map((column) => (
              <th className={`px-4 py-3 ${column === 'actions' ? 'text-right' : ''}`} key={column} scope='col'>
                {t(`${k}.list.columns.${column}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className='divide-y divide-outline-variant/30'>
          {sorted.map((schedule) => {
            const leaves = timeOffs
              .filter((item) => item.caregiverId === schedule.caregiverId)
              .map((item) => leaveOnDay(item, schedule.workDate))
              .filter((leave): leave is DayLeave => Boolean(leave))
            const clash = clashesWithLeave(schedule, leaves)
            const cancelled = schedule.scheduleStatus === 'CANCELLED'
            const past = new Date(`${schedule.workDate}T${schedule.endTime.slice(0, 5)}:00+07:00`).getTime() <= now
            return (
              <tr
                className={`hover:bg-surface-container-low/60 ${past || cancelled ? 'text-on-surface-variant' : ''}`}
                key={schedule.id}
              >
                <td className='px-4 py-3 font-medium tabular-nums'>{format.dayLabel(schedule.workDate)}</td>
                <td className='px-4 py-3 tabular-nums'>
                  {format.timeRange(schedule.startTime.slice(0, 5), schedule.endTime.slice(0, 5))}
                </td>
                <td className='px-4 py-3'>
                  <Link
                    className='font-semibold text-on-surface hover:text-primary hover:underline'
                    to={`/center-manager/caregivers/${schedule.caregiverId}`}
                  >
                    {schedule.caregiverName || t(`${k}.unknown`)}
                  </Link>
                </td>
                <td className='px-4 py-3'>{t(shiftTypeLabelKey(schedule.shiftType))}</td>
                <td className='px-4 py-3'>
                  <div className='flex flex-wrap gap-1.5'>
                    <StatusBadge dot tone={cancelled ? 'danger' : past ? 'neutral' : 'success'}>
                      {t(cancelled ? `${k}.cancelled` : past ? `${k}.past` : `${k}.scheduled`)}
                    </StatusBadge>
                    {clash ? (
                      <StatusBadge tone='error'>
                        <Icon className='text-sm' name='warning' />
                        {t(`${k}.list.clash`)}
                      </StatusBadge>
                    ) : null}
                  </div>
                  {cancelled && schedule.cancellationReason ? (
                    <p className='mt-1 text-xs'>
                      {t(`${k}.list.cancelReason`, { reason: schedule.cancellationReason })}
                    </p>
                  ) : null}
                </td>
                <td className='px-4 py-3 text-right'>
                  <Link
                    className='inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-primary hover:bg-surface-container-low'
                    to={`/center-manager/work-shifts/${schedule.workShiftId}`}
                  >
                    {t(`${k}.list.openShift`)}
                    <Icon className='text-base' name='chevron_right' />
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
