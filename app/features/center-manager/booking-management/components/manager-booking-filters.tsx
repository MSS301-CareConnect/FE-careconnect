import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { DatePicker } from '~/shared/ui/date-picker'
import { FilterChips } from '~/shared/ui/filter-chips'
import { FilterMenuChip } from '~/shared/ui/filter-menu-chip'
import { Icon } from '~/shared/ui/icon'
import { PillTabs } from '~/shared/ui/pill-tabs'

import {
  GROUP_STATUSES,
  MANAGER_GROUPS,
  MANAGER_SORTS,
  type ManagerBookingList,
  type ManagerSort
} from '../hooks/use-manager-bookings'

export const BOOKING_LIST_TABS = 'manager-bookings'

const SORT_LABELS: Record<ManagerSort, 'deadline' | 'newest' | 'startSoonest'> = {
  'deadlineAt,asc': 'deadline',
  'createdAt,desc': 'newest',
  'startDate,asc': 'startSoonest'
}

/**
 * Group tabs (with counts), then one filter card: the statuses inside the chosen group as chips with counts, and a
 * single toolbar row — code search, care date range, sort, clear — with the total on the right. Mounted with a key of
 * the URL keyword so the search draft resets when the URL changes.
 */
export function ManagerBookingFilters({ list, total }: { list: ManagerBookingList; total?: number }) {
  const { t } = useTranslation()
  const key = 'centerManager.bookingManagement' as const
  const [keyword, setKeyword] = useState(list.keyword)
  const statuses = GROUP_STATUSES[list.group]

  return (
    <div className='space-y-3'>
      <PillTabs
        idBase={BOOKING_LIST_TABS}
        items={MANAGER_GROUPS.map((group) => ({
          value: group,
          label: t(`${key}.groups.${group}`),
          badge: group === 'all' || group === 'closed' ? undefined : list.groupCount(group),
          badgeTone: group === 'action' ? 'attention' : 'neutral'
        }))}
        label={t(`${key}.groups.label`)}
        onChange={list.setGroup}
        value={list.group}
      />
      <section
        aria-label={t(`${key}.filters.label`)}
        className='space-y-3 rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-3 sm:p-4'
      >
        {statuses.length > 1 ? (
          <FilterChips
            label={t(`${key}.filters.status`)}
            onChange={(value) => list.setStatus(statuses.find((status) => status === value) ?? '')}
            options={[
              { value: '', label: t(`${key}.filters.allInGroup`), count: list.groupCount(list.group) },
              ...statuses.map((status) => ({
                value: status,
                label: t(`booking.status.${status}`),
                count: list.byStatus.get(status)?.count
              }))
            ]}
            value={list.status ?? ''}
          />
        ) : null}
        <div
          className={`flex flex-wrap items-center gap-2 ${statuses.length > 1 ? 'border-t border-outline-variant/40 pt-3' : ''}`}
        >
          <form
            className='w-full sm:w-64'
            onSubmit={(event) => {
              event.preventDefault()
              list.setKeyword(keyword)
            }}
            role='search'
          >
            <label className='sr-only' htmlFor='manager-booking-search'>
              {t(`${key}.filters.search`)}
            </label>
            <span className='relative block'>
              <Icon className='pointer-events-none absolute top-2.5 left-3 text-lg text-outline' name='search' />
              <input
                className='min-h-10 w-full rounded-full border border-outline-variant bg-surface-container-lowest py-2 pr-3 pl-9 text-sm text-on-surface placeholder:text-outline focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/25'
                id='manager-booking-search'
                maxLength={50}
                onBlur={() => keyword.trim() !== list.keyword && list.setKeyword(keyword)}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder={t(`${key}.filters.searchPlaceholder`)}
                type='search'
                value={keyword}
              />
            </span>
          </form>
          <div aria-label={t(`${key}.filters.range`)} className='flex items-center gap-1.5' role='group'>
            <Icon className='text-lg text-on-surface-variant' name='date_range' />
            <DatePicker
              aria-label={t(`${key}.filters.from`)}
              className='w-40'
              id='manager-booking-from'
              max={list.to}
              onChange={(value) => list.setRange(value, list.to ?? '')}
              value={list.from ?? ''}
            />
            <span className='text-sm text-on-surface-variant'>–</span>
            <DatePicker
              aria-label={t(`${key}.filters.to`)}
              className='w-40'
              id='manager-booking-to'
              min={list.from}
              onChange={(value) => list.setRange(list.from ?? '', value)}
              value={list.to ?? ''}
            />
          </div>
          <FilterMenuChip
            defaultValue={list.sort}
            icon='sort'
            label={t(`${key}.filters.sort`)}
            onChange={(value) => list.setSort(MANAGER_SORTS.find((item) => item === value) ?? MANAGER_SORTS[0])}
            options={MANAGER_SORTS.map((sort) => ({ value: sort, label: t(`${key}.sorts.${SORT_LABELS[sort]}`) }))}
            showValue
            value={list.sort}
          />
          {list.hasFilters ? (
            <button
              className='inline-flex min-h-10 items-center gap-1 rounded-lg px-2 text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary'
              onClick={list.reset}
              type='button'
            >
              <Icon className='text-lg' name='filter_alt_off' />
              {t(`${key}.filters.reset`)}
            </button>
          ) : null}
          <p aria-live='polite' className='ml-auto text-sm whitespace-nowrap text-on-surface-variant tabular-nums'>
            {total !== undefined ? t(`${key}.filters.total`, { count: total }) : null}
          </p>
        </div>
      </section>
    </div>
  )
}
