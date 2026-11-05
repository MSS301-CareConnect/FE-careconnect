import { useTranslation } from 'react-i18next'

import { shiftTypeLabelKey, timeRangesOverlap } from '~/entities/provider/work-shift'
import type { ProviderWorkShiftRecord } from '~/shared/api/generated/contracts'
import { minutesBetween, useFormat } from '~/shared/lib/format'
import { Icon } from '~/shared/ui/icon'

import type { ShiftFormValues } from '../shift-form-model'

const k = 'centerManager.workShifts.form.summary' as const

/** The live right column of the form: what will be saved, and other shifts of that day it overlaps (warning only). */
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
  const rows: [string, string][] = [
    [
      t(`${k}.date`),
      dates.length > 1
        ? `${format.date(dates[0])} → ${format.date(dates[dates.length - 1])} (${dates.length})`
        : values.workDate
          ? format.dayLabel(values.workDate)
          : '—'
    ],
    [t(`${k}.time`), minutes > 0 ? format.timeRange(values.startTime, values.endTime) : '—'],
    [t(`${k}.type`), t(shiftTypeLabelKey(values.shiftType))],
    [t(`${k}.capacity`), values.capacity === '' ? '—' : t(`${k}.people`, { count: values.capacity })],
    [
      t(`${k}.deadline`),
      deadline ? format.dateTime(deadline.toISOString()) : t('centerManager.workShifts.detail.noDeadline')
    ],
    [t(`${k}.status`), statusLabel]
  ]

  return (
    <aside aria-label={t(`${k}.title`)} className='space-y-3'>
      <div className='rounded-2xl border border-outline-variant/50 bg-surface-container-low p-4'>
        <h3 className='text-sm font-semibold'>{t(`${k}.title`)}</h3>
        <dl className='mt-3 space-y-2.5 text-sm'>
          {rows.map(([label, value]) => (
            <div className='flex justify-between gap-3' key={label}>
              <dt className='shrink-0 text-on-surface-variant'>{label}</dt>
              <dd className='text-right font-medium'>{value}</dd>
            </div>
          ))}
        </dl>
      </div>
      {dates.length <= 1 && values.workDate ? (
        overlaps.length > 0 ? (
          <div
            className='rounded-2xl border border-warning/40 bg-warning-container p-4 text-sm text-on-warning-container'
            role='status'
          >
            <p className='flex items-center gap-2 font-semibold'>
              <Icon className='text-lg' name='warning' />
              {t(`${k}.overlapTitle`)}
            </p>
            <ul className='mt-2 space-y-1'>
              {overlaps.map((shift) => (
                <li className='tabular-nums' key={shift.id}>
                  {shift.startTime.slice(0, 5)}–{shift.endTime.slice(0, 5)} · {t(shiftTypeLabelKey(shift.shiftType))} ·{' '}
                  {shift.approvedCount ?? 0}/{shift.capacity}
                </li>
              ))}
            </ul>
            <p className='mt-2 text-xs'>{t(`${k}.overlapHint`)}</p>
          </div>
        ) : (
          <p className='flex items-center gap-2 px-1 text-xs text-on-surface-variant'>
            <Icon className='text-base text-success' name='check_circle' />
            {t(`${k}.noOverlap`)}
          </p>
        )
      ) : null}
    </aside>
  )
}
