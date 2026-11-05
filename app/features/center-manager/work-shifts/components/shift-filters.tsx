import { useTranslation } from 'react-i18next'

import {
  SHIFT_STATUS_CODES,
  SHIFT_TYPE_CODES,
  shiftStatusLabelKey,
  shiftTypeLabelKey
} from '~/entities/provider/work-shift'
import type { ProviderWorkShiftStatisticsRecord } from '~/shared/api/generated/contracts'
import { DatePicker } from '~/shared/ui/date-picker'
import { FilterChips } from '~/shared/ui/filter-chips'
import { Select } from '~/shared/ui/form-field'

import type { RangePreset, ShiftFilters } from '../hooks/use-shift-filters'

const k = 'centerManager.workShifts.filters' as const
const PRESETS: Exclude<RangePreset, 'custom'>[] = ['upcoming', 'next7', 'thisMonth', 'all']

const STAT_OF = {
  DRAFT: 'draft',
  OPEN: 'open',
  CLOSED: 'closed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const

export function ShiftFiltersBar({
  filters,
  stats
}: {
  filters: ShiftFilters
  stats?: ProviderWorkShiftStatisticsRecord
}) {
  const { t } = useTranslation()
  const toggle =
    'inline-flex min-h-10 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
  const on = 'border-primary bg-brand-50 text-primary'
  const off = 'border-outline-variant bg-surface-container-lowest text-on-surface hover:border-brand-300'

  return (
    <section
      aria-label={t(`${k}.label`)}
      className='space-y-4 rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-4'
    >
      <FilterChips
        label={t(`${k}.status`)}
        onChange={(value) =>
          filters.setStatus(value === 'all' ? undefined : (value as (typeof SHIFT_STATUS_CODES)[number]))
        }
        options={[
          { value: 'all', label: t(`${k}.all`), count: stats?.total },
          ...SHIFT_STATUS_CODES.map((status) => ({
            value: status,
            label: t(shiftStatusLabelKey(status)),
            count: stats?.[STAT_OF[status]]
          }))
        ]}
        value={filters.status ?? 'all'}
      />
      <div className='flex flex-wrap items-end gap-x-4 gap-y-3'>
        <div className='min-w-0'>
          <span className='mb-1.5 block text-xs font-semibold text-on-surface-variant'>{t(`${k}.range`)}</span>
          <div aria-label={t(`${k}.range`)} className='flex flex-wrap gap-1.5' role='group'>
            {PRESETS.map((preset) => (
              <button
                aria-pressed={filters.range === preset}
                className={`${toggle} ${filters.range === preset ? on : off}`}
                key={preset}
                onClick={() => filters.setRange(preset)}
                type='button'
              >
                {t(`${k}.rangeOptions.${preset}`)}
              </button>
            ))}
          </div>
        </div>
        <div className='flex flex-wrap items-end gap-2'>
          <label className='block'>
            <span className='mb-1.5 block text-xs font-semibold text-on-surface-variant'>{t(`${k}.from`)}</span>
            <DatePicker
              aria-invalid={filters.rangeInvalid || undefined}
              className='w-40'
              onChange={(value) => filters.setCustomRange(value, filters.range === 'custom' ? filters.to : '')}
              value={filters.range === 'custom' ? filters.from : (filters.fromDate ?? '')}
            />
          </label>
          <label className='block'>
            <span className='mb-1.5 block text-xs font-semibold text-on-surface-variant'>{t(`${k}.to`)}</span>
            <DatePicker
              aria-describedby={filters.rangeInvalid ? 'shift-range-error' : undefined}
              aria-invalid={filters.rangeInvalid || undefined}
              className='w-40'
              onChange={(value) =>
                filters.setCustomRange(filters.range === 'custom' ? filters.from : (filters.fromDate ?? ''), value)
              }
              value={filters.range === 'custom' ? filters.to : (filters.toDate ?? '')}
            />
          </label>
        </div>
        <label className='block w-44'>
          <span className='mb-1.5 block text-xs font-semibold text-on-surface-variant'>{t(`${k}.type`)}</span>
          <Select onChange={(event) => filters.setType(event.target.value)} value={filters.type}>
            <option value=''>{t(`${k}.anyType`)}</option>
            {SHIFT_TYPE_CODES.map((code) => (
              <option key={code} value={code}>
                {t(shiftTypeLabelKey(code))}
              </option>
            ))}
          </Select>
        </label>
        <div className='flex flex-wrap gap-2'>
          <button
            aria-pressed={filters.vacancy}
            className={`${toggle} ${filters.vacancy ? on : off}`}
            onClick={() => filters.setVacancy(!filters.vacancy)}
            type='button'
          >
            {t(`${k}.vacancy`)}
          </button>
          <button
            aria-pressed={filters.pending}
            className={`${toggle} ${filters.pending ? on : off}`}
            onClick={() => filters.setPending(!filters.pending)}
            type='button'
          >
            {t(`${k}.pending`)}
          </button>
        </div>
        {filters.active ? (
          <button
            className='ml-auto min-h-10 rounded-lg px-2 text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary'
            onClick={filters.clear}
            type='button'
          >
            {t(`${k}.clear`)}
          </button>
        ) : null}
      </div>
      {filters.rangeInvalid ? (
        <p className='text-sm text-error' id='shift-range-error'>
          {t(`${k}.rangeInvalid`)}
        </p>
      ) : null}
    </section>
  )
}
