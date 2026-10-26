import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { BOOKING_STATUSES } from '~/entities/booking/booking-format'
import { Icon } from '~/shared/ui/icon'

import { BOOKING_SORTS, type BookingSort, type useCustomerBookings } from '../hooks/use-customer-bookings'

type List = ReturnType<typeof useCustomerBookings>
const SORT_LABELS = {
  'createdAt,desc': 'newest',
  'startDate,asc': 'startSoonest',
  'startDate,desc': 'startLatest'
} as const satisfies Record<BookingSort, string>

/** Status tabs, code search and sort; mounted with key={keyword} so the field resets with the URL. */
export function BookingListToolbar({ list }: { list: List }) {
  const { t } = useTranslation()
  const [draft, setDraft] = useState(list.keyword)

  return (
    <section aria-label={t('customer.myBookings.filters.label')} className='flex flex-col gap-4'>
      <div
        aria-label={t('customer.myBookings.filters.status')}
        className='flex gap-2 overflow-x-auto pb-1'
        role='group'
      >
        {(['', ...BOOKING_STATUSES] as const).map((item) => {
          const active = (list.status ?? '') === item
          return (
            <button
              aria-pressed={active}
              className={`shrink-0 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${active ? 'bg-primary text-white' : 'bg-white text-on-surface-variant hover:bg-surface-container'}`}
              key={item || 'all'}
              onClick={() => list.setStatus(item)}
              type='button'
            >
              {item ? t(`booking.status.${item}`) : t('customer.myBookings.filters.all')}
            </button>
          )
        })}
      </div>
      <div className='grid gap-3 sm:grid-cols-[minmax(0,1fr)_240px]'>
        <form
          className='relative'
          onSubmit={(event) => {
            event.preventDefault()
            list.setKeyword(draft)
          }}
          role='search'
        >
          <label className='sr-only' htmlFor='booking-search'>
            {t('customer.myBookings.filters.search')}
          </label>
          <Icon className='pointer-events-none absolute top-3 left-3 text-xl text-primary' name='search' />
          <input
            className='w-full rounded-lg border border-slate-100 bg-white py-3 pr-4 pl-10 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:border-primary focus:outline-none'
            id='booking-search'
            maxLength={50}
            onBlur={() => draft.trim() !== list.keyword && list.setKeyword(draft)}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={t('customer.myBookings.filters.searchPlaceholder')}
            type='search'
            value={draft}
          />
        </form>
        <label className='relative'>
          <span className='sr-only'>{t('customer.myBookings.filters.sort')}</span>
          <Icon className='pointer-events-none absolute top-3 left-3 text-xl text-primary' name='sort' />
          <select
            className='w-full appearance-none rounded-lg border border-slate-100 bg-white py-3 pr-9 pl-10 text-sm text-on-surface focus:border-primary focus:outline-none'
            onChange={(event) =>
              list.setSort(BOOKING_SORTS.find((item) => item === event.target.value) ?? BOOKING_SORTS[0])
            }
            value={list.sort}
          >
            {BOOKING_SORTS.map((item) => (
              <option key={item} value={item}>
                {t(`customer.myBookings.sorts.${SORT_LABELS[item]}`)}
              </option>
            ))}
          </select>
          <Icon
            className='pointer-events-none absolute top-3 right-3 text-xl text-on-surface-variant'
            name='keyboard_arrow_down'
          />
        </label>
      </div>
    </section>
  )
}
