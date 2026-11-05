import type { ReactNode } from 'react'
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
import { FilterMenuChip } from '~/shared/ui/filter-menu-chip'
import { Icon } from '~/shared/ui/icon'

import type { RangePreset, ShiftFilters } from '../hooks/use-shift-filters'

const k = 'centerManager.workShifts.filters' as const
const RANGE_OPTIONS: RangePreset[] = ['upcoming', 'next7', 'thisMonth', 'all', 'custom']

const STAT_OF = {
  DRAFT: 'draft',
  OPEN: 'open',
  CLOSED: 'closed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const

/**
 * One compact card: status chips (with counts) on top, then a single toolbar row — date range and shift type as
 * dropdown chips, two toggles and "clear" — with the list / week switch (`trailing`) on the right. Custom dates show
 * two date inputs inline only when "Pick dates" is chosen.
 */
export function ShiftFiltersBar({
  filters,
  stats,
  trailing
}: {
  filters: ShiftFilters
  stats?: ProviderWorkShiftStatisticsRecord
  trailing?: ReactNode
}) {
  const { t } = useTranslation()
  const toggle =
    'inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
  const on = 'border-primary bg-brand-50 text-primary'
  const off = 'border-outline-variant bg-surface-container-lowest text-on-surface hover:border-brand-300'
  const custom = filters.range === 'custom'

  return (
    <section
      aria-label={t(`${k}.label`)}
      className='space-y-3 rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-3 sm:p-4'
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
      <div className='flex flex-wrap items-center gap-2 border-t border-outline-variant/40 pt-3'>
        <FilterMenuChip
          defaultValue='upcoming'
          icon='date_range'
          label={t(`${k}.range`)}
          onChange={(value) => filters.setRange(value as RangePreset)}
          options={RANGE_OPTIONS.map((preset) => ({ value: preset, label: t(`${k}.rangeOptions.${preset}`) }))}
          showValue
          value={filters.range}
        />
        {custom ? (
          <div aria-label={t(`${k}.range`)} className='flex items-center gap-1.5' role='group'>
            <DatePicker
              aria-describedby={filters.rangeInvalid ? 'shift-range-error' : undefined}
              aria-invalid={filters.rangeInvalid || undefined}
              className='w-36'
              onChange={(value) => filters.setCustomRange(value, filters.to)}
              value={filters.from}
            />
            <span className='text-sm text-on-surface-variant'>{t(`${k}.rangeSeparator`)}</span>
            <DatePicker
              aria-describedby={filters.rangeInvalid ? 'shift-range-error' : undefined}
              aria-invalid={filters.rangeInvalid || undefined}
              className='w-36'
              min={filters.from || undefined}
              onChange={(value) => filters.setCustomRange(filters.from, value)}
              value={filters.to}
            />
          </div>
        ) : null}
        <FilterMenuChip
          icon='category'
          label={t(`${k}.type`)}
          onChange={filters.setType}
          options={[
            { value: '', label: t(`${k}.anyType`) },
            ...SHIFT_TYPE_CODES.map((code) => ({ value: code, label: t(shiftTypeLabelKey(code)) }))
          ]}
          value={filters.type}
        />
        <button
          aria-pressed={filters.vacancy}
          className={`${toggle} ${filters.vacancy ? on : off}`}
          onClick={() => filters.setVacancy(!filters.vacancy)}
          type='button'
        >
          <Icon className='text-lg' name={filters.vacancy ? 'check' : 'group_add'} />
          {t(`${k}.vacancy`)}
        </button>
        <button
          aria-pressed={filters.pending}
          className={`${toggle} ${filters.pending ? on : off}`}
          onClick={() => filters.setPending(!filters.pending)}
          type='button'
        >
          <Icon className='text-lg' name={filters.pending ? 'check' : 'pending_actions'} />
          {t(`${k}.pending`)}
          {stats?.pendingRegistrations ? (
            <span className='min-w-6 rounded-full bg-warning-container px-1.5 py-0.5 text-center text-xs font-semibold text-on-warning-container tabular-nums'>
              {stats.pendingRegistrations}
            </span>
          ) : null}
        </button>
        {filters.active ? (
          <button
            className='inline-flex min-h-10 items-center gap-1 rounded-lg px-2 text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary'
            onClick={filters.clear}
            type='button'
          >
            <Icon className='text-lg' name='filter_alt_off' />
            {t(`${k}.clear`)}
          </button>
        ) : null}
        {trailing ? <div className='ml-auto flex items-center gap-3'>{trailing}</div> : null}
      </div>
      {filters.rangeInvalid ? (
        <p className='text-sm text-error' id='shift-range-error'>
          {t(`${k}.rangeInvalid`)}
        </p>
      ) : null}
    </section>
  )
}
