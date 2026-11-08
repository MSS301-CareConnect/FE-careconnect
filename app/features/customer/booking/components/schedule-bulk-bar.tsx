import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { addMinutesToTime, minutesBetween } from '~/shared/lib/format'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'
import { TimeSelect } from '~/shared/ui/time-select'

/**
 * Bulk edit of the chosen visits (RECURRING and CUSTOM lists): one time range for all of them, or remove them. Shown
 * only while at least one visit is chosen.
 */
export function ScheduleBulkBar({
  count,
  total,
  minimumMinutes,
  initialStart,
  initialEnd,
  onApply,
  onRemove,
  onClear
}: {
  count: number
  total: number
  minimumMinutes: number
  initialStart: string
  initialEnd: string
  onApply: (startTime: string, endTime: string) => void
  onRemove: () => void
  onClear: () => void
}) {
  const { t } = useTranslation()
  const [startTime, setStartTime] = useState(initialStart)
  const [endTime, setEndTime] = useState(initialEnd)
  const invalid = endTime <= startTime

  function changeStart(value: string) {
    setStartTime(value)
    if (minutesBetween(value, endTime) < minimumMinutes) setEndTime(addMinutesToTime(value, minimumMinutes))
  }

  return (
    <div
      aria-label={t('customer.booking.schedule.bulk.label')}
      className='cc-fade-up sticky top-20 z-10 mb-3 flex flex-wrap items-end gap-3 rounded-xl border border-primary/30 bg-brand-50 p-3 shadow-[var(--shadow-card)]'
      role='group'
    >
      <p className='w-full text-sm font-semibold text-on-surface sm:w-auto sm:self-center'>
        {t('customer.booking.schedule.bulk.selected', { count })}
      </p>
      <label className='w-28 text-xs font-medium text-on-surface-variant'>
        {t('customer.booking.schedule.bulk.start')}
        <TimeSelect className='mt-1' onChange={changeStart} value={startTime} />
      </label>
      <label className='w-28 text-xs font-medium text-on-surface-variant'>
        {t('customer.booking.schedule.bulk.end')}
        <TimeSelect className='mt-1' onChange={setEndTime} value={endTime} />
      </label>
      <Button
        disabled={invalid}
        leftIcon={<Icon className='text-lg' name='schedule' />}
        onClick={() => onApply(startTime, endTime)}
        size='sm'
      >
        {t('customer.booking.schedule.bulk.apply', { count })}
      </Button>
      <Button
        disabled={count >= total}
        leftIcon={<Icon className='text-lg' name='delete' />}
        onClick={onRemove}
        size='sm'
        variant='outline'
      >
        {t('customer.booking.schedule.bulk.remove', { count })}
      </Button>
      <button
        className='ml-auto min-h-10 rounded-lg px-3 text-sm font-semibold text-primary hover:bg-brand-100 focus-visible:outline-2 focus-visible:outline-primary'
        onClick={onClear}
        type='button'
      >
        {t('customer.booking.schedule.bulk.clear')}
      </button>
      {invalid ? <p className='w-full text-xs text-error'>{t('customer.booking.schedule.invalidTime')}</p> : null}
    </div>
  )
}
