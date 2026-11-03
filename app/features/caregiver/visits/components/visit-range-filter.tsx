import { useTranslation } from 'react-i18next'

import { DatePicker } from '~/shared/ui/date-picker'
import { FilterChips } from '~/shared/ui/filter-chips'

import { VISIT_RANGES, type VisitRange } from '../hooks/use-visit-list'

/** Period chips for the history tabs; "Tùy chọn" reveals two dd/mm/yyyy pickers. */
export function VisitRangeFilter({
  range,
  from,
  to,
  invalid,
  onRange,
  onCustom
}: {
  range: VisitRange
  from: string
  to: string
  invalid: boolean
  onRange: (value: VisitRange) => void
  onCustom: (from: string, to: string) => void
}) {
  const { t } = useTranslation()
  return (
    <div className='flex flex-col gap-3'>
      <FilterChips
        label={t('caregiver.visits.rangeLabel')}
        onChange={(value) => onRange(value as VisitRange)}
        options={VISIT_RANGES.map((value) => ({ value, label: t(`caregiver.visits.ranges.${value}`) }))}
        value={range}
      />
      {range === 'custom' ? (
        <div className='grid gap-3 sm:max-w-md sm:grid-cols-2'>
          <label className='text-sm font-medium text-on-surface'>
            <span className='mb-1 block'>{t('caregiver.visits.customFrom')}</span>
            <DatePicker onChange={(value) => onCustom(value, to)} value={from} />
          </label>
          <label className='text-sm font-medium text-on-surface'>
            <span className='mb-1 block'>{t('caregiver.visits.customTo')}</span>
            <DatePicker
              aria-describedby={invalid ? 'visit-range-error' : undefined}
              aria-invalid={invalid}
              onChange={(value) => onCustom(from, value)}
              value={to}
            />
          </label>
          {invalid ? (
            <p className='text-sm text-error sm:col-span-2' id='visit-range-error'>
              {t('caregiver.visits.customInvalid')}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
