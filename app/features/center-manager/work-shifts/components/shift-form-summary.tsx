import { useTranslation } from 'react-i18next'

import { shiftTypeLabelKey, timeRangesOverlap } from '~/entities/provider/work-shift'
import type { ProviderWorkShiftRecord } from '~/shared/api/generated/contracts'
import { minutesBetween, useFormat } from '~/shared/lib/format'
import { Icon } from '~/shared/ui/icon'

import type { ShiftFormValues } from '../shift-form-model'

const k = 'centerManager.workShifts.form.summary' as const

/** Compact live summary card in the right column of the shift form: what will be saved, plus same-day overlap check. */
export function ShiftFormSummary({
  values,
  dates,
  deadline,
  statusLabel,
  sameDayShifts,
  editingId
}: {
  values: ShiftFormValues
  dates: string[]
  deadline: Date | null
  statusLabel: string
  sameDayShifts: ProviderWorkShiftRecord[]
  editingId?: string
}) {
  const { t } = useTranslation()
  const format = useFormat()
  const minutes = values.startTime && values.endTime ? minutesBetween(values.startTime, values.endTime) : 0
  const overlaps = sameDayShifts.filter(
    (shift) =>
      shift.id !== editingId &&
      shift.shiftStatus !== 'CANCELLED' &&
      values.startTime &&
      values.endTime &&
      minutes > 0 &&
      timeRangesOverlap(
        { start: values.startTime, end: values.endTime },
        { start: shift.startTime, end: shift.endTime }
      )
  )
  const rows: [string, string, boolean?][] = [
    [
      t(`${k}.date`),
      dates.length > 1
        ? `${format.date(dates[0])} → ${format.date(dates[dates.length - 1])} (${dates.length})`
        : values.workDate
          ? format.dayLabel(values.workDate)
          : '—',
      true
    ],
    [t(`${k}.time`), minutes > 0 ? format.timeRange(values.startTime, values.endTime) : '—'],
    [t(`${k}.type`), t(shiftTypeLabelKey(values.shiftType))],
    [t(`${k}.capacity`), values.capacity === '' ? '—' : t(`${k}.people`, { count: values.capacity })],
    [t(`${k}.maxBookings`), values.maxBookings === '' ? '—' : t(`${k}.bookings`, { count: values.maxBookings })],
    [
      t(`${k}.deadline`),
      deadline ? format.dateTime(deadline.toISOString()) : t('centerManager.workShifts.detail.noDeadline')
    ],
    [t(`${k}.status`), statusLabel]
  ]

  return (
    <aside aria-label={t(`${k}.title`)} className='space-y-2.5'>
      <div className='rounded-xl bg-surface-container-low/80 p-3.5'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <h3 className='flex items-center gap-1.5 text-sm font-semibold text-on-surface'>
            <Icon className='text-base text-primary' name='fact_check' />
            {t(`${k}.title`)}
          </h3>
          {dates.length <= 1 && values.workDate && overlaps.length === 0 ? (
            <span className='inline-flex items-center gap-1 text-xs font-medium text-success'>
              <Icon className='text-sm' name='check_circle' />
              {t(`${k}.noOverlap`)}
            </span>
          ) : null}
        </div>
        <dl className='mt-2.5 grid grid-cols-1 gap-x-5 gap-y-1.5 text-xs sm:grid-cols-2'>
          {rows.map(([label, value, fullWidth]) => (
            <div
              className={`flex items-baseline justify-between gap-2 border-b border-outline-variant/25 pb-1.5 last:border-b-0 ${fullWidth ? 'sm:col-span-2' : ''}`}
              key={label}
            >
              <dt className='shrink-0 text-on-surface-variant'>{label}</dt>
              <dd className='truncate text-right font-semibold text-on-surface tabular-nums'>{value}</dd>
            </div>
          ))}
        </dl>
      </div>
      {dates.length <= 1 && values.workDate && overlaps.length > 0 ? (
        <div className='rounded-xl bg-warning-container p-3 text-xs text-on-warning-container' role='status'>
          <p className='flex items-center gap-1.5 font-semibold'>
            <Icon className='text-base' name='warning' />
            {t(`${k}.overlapTitle`)}
          </p>
          <ul className='mt-1.5 space-y-0.5'>
            {overlaps.map((shift) => (
              <li className='tabular-nums' key={shift.id}>
                {shift.startTime.slice(0, 5)}–{shift.endTime.slice(0, 5)} · {t(shiftTypeLabelKey(shift.shiftType))} ·{' '}
                {shift.approvedCount ?? 0}/{shift.capacity}
              </li>
            ))}
          </ul>
          <p className='mt-1 opacity-90'>{t(`${k}.overlapHint`)}</p>
        </div>
      ) : null}
    </aside>
  )
}
