import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { DatePicker } from '~/shared/ui/date-picker'
import { FilterChips } from '~/shared/ui/filter-chips'
import { Icon } from '~/shared/ui/icon'
import { Tabs } from '~/shared/ui/tabs'

import {
  GROUP_STATUSES,
  MANAGER_GROUPS,
  MANAGER_SORTS,
  type ManagerBookingList,
  type ManagerSort
} from '../hooks/use-manager-bookings'

export const BOOKING_LIST_TABS = 'manager-bookings'

const field =
  'w-full rounded-lg border border-outline-variant/60 bg-surface-container-lowest px-3 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none'
const SORT_LABELS: Record<ManagerSort, 'deadline' | 'newest' | 'startSoonest'> = {
  'deadlineAt,asc': 'deadline',
  'createdAt,desc': 'newest',
  'startDate,asc': 'startSoonest'
}

/**
 * Group tabs (with counts), the statuses inside the chosen group, then one compact toolbar: code search, date range,
 * sort. Mounted with a key of the URL keyword so the search draft resets when the URL changes.
 */
export function ManagerBookingFilters({ list }: { list: ManagerBookingList }) {
  const { t } = useTranslation()
  const key = 'centerManager.bookingManagement' as const
  const [keyword, setKeyword] = useState(list.keyword)
  const statuses = GROUP_STATUSES[list.group]

  return (
    <section aria-label={t(`${key}.filters.label`)} className='space-y-3'>
      <Tabs
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
      <div className='flex flex-col gap-3'>
        {statuses.length > 1 ? (
          <FilterChips
            label={t(`${key}.filters.status`)}
            onChange={(value) => list.setStatus(statuses.find((status) => status === value) ?? '')}
            options={[
              { value: '', label: t(`${key}.filters.allInGroup`) },
              ...statuses.map((status) => {
                const count = list.byStatus.get(status)?.count
                return {
                  value: status,
                  label:
                    count === undefined ? t(`booking.status.${status}`) : `${t(`booking.status.${status}`)} · ${count}`
                }
              })
            ]}
            value={list.status ?? ''}
          />
        ) : null}
        <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_170px_170px_220px]'>
          <form
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
                className={`${field} pl-9`}
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
          <div>
            <label className='sr-only' htmlFor='manager-booking-from'>
              {t(`${key}.filters.from`)}
            </label>
            <DatePicker
              id='manager-booking-from'
              max={list.to}
              onChange={(value) => list.setRange(value, list.to ?? '')}
              value={list.from ?? ''}
            />
          </div>
          <div>
            <label className='sr-only' htmlFor='manager-booking-to'>
              {t(`${key}.filters.to`)}
            </label>
            <DatePicker
              id='manager-booking-to'
              min={list.from}
              onChange={(value) => list.setRange(list.from ?? '', value)}
              value={list.to ?? ''}
            />
          </div>
          <label>
            <span className='sr-only'>{t(`${key}.filters.sort`)}</span>
            <select
              className={field}
              onChange={(event) =>
                list.setSort(MANAGER_SORTS.find((item) => item === event.target.value) ?? MANAGER_SORTS[0])
              }
              value={list.sort}
            >
              {MANAGER_SORTS.map((sort) => (
                <option key={sort} value={sort}>
                  {t(`${key}.sorts.${SORT_LABELS[sort]}`)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      {list.hasFilters ? (
        <button className='text-sm font-semibold text-primary underline' onClick={list.reset} type='button'>
          {t(`${key}.filters.reset`)}
        </button>
      ) : null}
    </section>
  )
}
