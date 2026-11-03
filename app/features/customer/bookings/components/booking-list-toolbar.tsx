import { useTranslation } from 'react-i18next'

import { ActiveFilters, FilterMenuChip } from '~/shared/ui/filter-menu-chip'
import { SearchInput } from '~/shared/ui/search-input'
import { Tabs } from '~/shared/ui/tabs'

import { BOOKING_GROUPS, BOOKING_SORTS, type BookingGroup, type BookingSort } from '../booking-groups'
import type { useCustomerBookings } from '../hooks/use-customer-bookings'

type List = ReturnType<typeof useCustomerBookings>
const key = 'customer.myBookings' as const

export const BOOKING_TABS_ID = 'customer-bookings'

/** Status tabs with counts, then one row: search by code or name, and sort. */
export function BookingListToolbar({ list }: { list: List }) {
  const { t } = useTranslation()
  const loaded = list.collection.isSuccess

  return (
    <div className='flex flex-col gap-4'>
      <Tabs
        idBase={BOOKING_TABS_ID}
        items={BOOKING_GROUPS.map((group) => ({
          value: group,
          label: t(`${key}.tabs.${group}`),
          badge: loaded && group !== 'all' ? list.counts[group] : undefined,
          badgeTone: group === 'action' ? 'attention' : 'neutral'
        }))}
        label={t(`${key}.filters.status`)}
        onChange={(value: BookingGroup) => list.setGroup(value)}
        value={list.group}
      />
      <div className='flex flex-wrap items-center gap-2'>
        <SearchInput
          className='min-w-0 flex-1 basis-64'
          label={t(`${key}.filters.search`)}
          onChange={list.setKeyword}
          placeholder={t(`${key}.filters.searchPlaceholder`)}
          value={list.keyword}
        />
        <FilterMenuChip
          defaultValue='newest'
          icon='sort'
          label={t(`${key}.filters.sort`)}
          onChange={(value) => list.setSort(BOOKING_SORTS.find((item) => item === value) ?? 'newest')}
          options={BOOKING_SORTS.map((value: BookingSort) => ({ value, label: t(`${key}.sorts.${value}`) }))}
          value={list.sort}
        />
      </div>
      {list.status ? (
        <ActiveFilters
          clearLabel={t(`${key}.filters.reset`)}
          items={[{ id: 'status', label: t(`booking.status.${list.status}`), onRemove: list.clearStatus }]}
          label={t(`${key}.filters.filtering`)}
          onClear={list.clearFilters}
          removeLabel={(label) => t(`${key}.filters.removeFilter`, { label })}
        />
      ) : null}
    </div>
  )
}
