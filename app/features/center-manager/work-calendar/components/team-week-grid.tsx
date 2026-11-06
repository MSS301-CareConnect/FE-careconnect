import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { CaregiverAvatar } from '~/entities/provider/caregiver-avatar'
import { shiftTypeLabelKey } from '~/entities/provider/work-shift'
import type { ProviderScheduleRecord } from '~/shared/api/generated/contracts'
import { addDays, useFormat } from '~/shared/lib/format'
import { Icon } from '~/shared/ui/icon'

import { clashesWithLeave, leaveOnDay, scheduleMinutes, type CalendarRow, type DayLeave } from '../calendar-model'

const k = 'centerManager.schedules' as const

function ShiftChip({ schedule, clash }: { schedule: ProviderScheduleRecord; clash: boolean }) {
  const { t } = useTranslation()
  const cancelled = schedule.scheduleStatus === 'CANCELLED'
  const tone = cancelled
    ? 'border-outline-variant bg-surface-container-low text-on-surface-variant line-through decoration-error/60'
    : clash
      ? 'border-error/50 bg-error-container/60 text-on-error-container'
      : 'border-success/40 bg-success-container/70 text-on-success-container'
  const label = t(`${k}.grid.shiftLabel`, {
    start: schedule.startTime.slice(0, 5),
    end: schedule.endTime.slice(0, 5),
    type: t(shiftTypeLabelKey(schedule.shiftType)),
    status: t(cancelled ? `${k}.cancelled` : `${k}.scheduled`)
  })
  return (
    <Link
      aria-label={label}
      className={`block rounded-lg border px-2 py-1 text-left text-xs transition-shadow duration-150 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-primary ${tone}`}
      title={clash ? t(`${k}.grid.clash`) : label}
      to={`/center-manager/work-shifts/${schedule.workShiftId}`}
    >
      <span className='flex items-center gap-1 font-semibold tabular-nums'>
        {clash ? <Icon className='text-sm' name='warning' /> : null}
        {schedule.startTime.slice(0, 5)}–{schedule.endTime.slice(0, 5)}
      </span>
      <span className='block truncate opacity-80'>{t(shiftTypeLabelKey(schedule.shiftType))}</span>
    </Link>
  )
}

function LeaveChip({ leave }: { leave: DayLeave }) {
  const { t } = useTranslation()
  const text = leave.wholeDay
    ? t(`${k}.grid.leaveAllDay`)
    : t(`${k}.grid.leaveHours`, { start: leave.start, end: leave.end })
  return (
    <p
      className='flex items-start gap-1 rounded-lg border border-dashed border-warning/60 bg-warning-container/60 px-2 py-1 text-xs font-medium text-on-warning-container'
      title={leave.item.reason || text}
    >
      <Icon className='text-sm' name='beach_access' />
      <span className='tabular-nums'>{text}</span>
    </p>
  )
}

/**
 * Team × week: one row per caregiver, one column per day. Green = a work shift (click opens it in "Work shifts"),
 * dashed amber = time off, red = a shift that falls in time off, struck through = cancelled.
 */
export function TeamWeekGrid({ rows, monday, today }: { rows: CalendarRow[]; monday: string; today: string }) {
  const { t } = useTranslation()
  const format = useFormat()
  const days = Array.from({ length: 7 }, (_, index) => addDays(monday, index))

  return (
    <div className='overflow-x-auto'>
      <table className='w-full min-w-[980px] table-fixed border-collapse text-sm'>
        <caption className='sr-only'>{t(`${k}.grid.caption`)}</caption>
        <colgroup>
          <col className='w-52' />
          {days.map((day) => (
            <col key={day} />
          ))}
        </colgroup>
        <thead>
          <tr className='border-b border-outline-variant/50 bg-surface-container-low text-xs font-semibold text-on-surface-variant'>
            <th className='px-4 py-3 text-left' scope='col'>
              {t(`${k}.grid.caregiver`)}
            </th>
            {days.map((day) => (
              <th
                className={`px-2 py-3 text-left ${day === today ? 'bg-brand-50 text-primary' : ''}`}
                key={day}
                scope='col'
              >
                {format.shortDayLabel(day)}
                {day === today ? <span className='ml-1 font-bold'>· {t(`${k}.grid.today`)}</span> : null}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className='divide-y divide-outline-variant/30'>
          {rows.map((row) => {
            const minutes = row.schedules
              .filter((item) => item.scheduleStatus !== 'CANCELLED')
              .reduce((sum, item) => sum + scheduleMinutes(item), 0)
            return (
              <tr className='align-top' key={row.caregiverId}>
                <th className='px-4 py-3 text-left font-normal' scope='row'>
                  <div className='flex items-center gap-2.5'>
                    <CaregiverAvatar caregiverId={row.caregiverId} className='h-9 w-9 rounded-xl' name={row.name} />
                    <div className='min-w-0'>
                      <Link
                        className='block truncate font-semibold text-on-surface hover:text-primary hover:underline'
                        to={`/center-manager/caregivers/${row.caregiverId}`}
                      >
                        {row.name}
                      </Link>
                      <span className='text-xs text-on-surface-variant tabular-nums'>
                        {minutes > 0
                          ? t(`${k}.grid.weekHours`, { hours: format.duration(minutes) })
                          : t(`${k}.grid.noShift`)}
                      </span>
                    </div>
                  </div>
                </th>
                {days.map((day) => {
                  const leaves = row.timeOffs
                    .map((item) => leaveOnDay(item, day))
                    .filter((leave): leave is DayLeave => Boolean(leave))
                  const shifts = row.schedules
                    .filter((item) => item.workDate === day)
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  return (
                    <td className={`px-1.5 py-2 ${day === today ? 'bg-brand-50/40' : ''}`} key={day}>
                      <div className='flex min-h-12 flex-col gap-1'>
                        {leaves.map((leave) => (
                          <LeaveChip key={leave.item.id} leave={leave} />
                        ))}
                        {shifts.map((schedule) => (
                          <ShiftChip clash={clashesWithLeave(schedule, leaves)} key={schedule.id} schedule={schedule} />
                        ))}
                        {leaves.length === 0 && shifts.length === 0 ? (
                          <span aria-hidden='true' className='px-2 py-1 text-xs text-outline-variant'>
                            —
                          </span>
                        ) : null}
                      </div>
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
