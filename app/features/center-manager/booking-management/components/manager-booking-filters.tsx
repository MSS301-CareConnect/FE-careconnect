import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { BOOKING_STATUSES } from '~/entities/booking/booking-format'
import { Icon } from '~/shared/ui/icon'

import { MANAGER_SORTS, type useManagerBookings } from '../hooks/use-manager-bookings'

type List = ReturnType<typeof useManagerBookings>
const field =
  'w-full rounded-lg border border-outline-variant/50 bg-white px-3 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none'

/** Mounted with a key of the URL filters so the drafts reset when the URL changes. */
export function ManagerBookingFilters({ list }: { list: List }) {
  const { t } = useTranslation()
  const [keyword, setKeyword] = useState(list.keyword)

  return (
    <section aria-label={t('centerManager.bookingManagement.filters.label')} className='flex flex-col gap-3'>
      <div
        aria-label={t('centerManager.bookingManagement.filters.status')}
        className='flex gap-2 overflow-x-auto pb-1'
        role='group'
      >
        {(['', ...BOOKING_STATUSES] as const).map((item) => {
          const active = (list.status ?? '') === item
          return (
            <button
              aria-pressed={active}
              className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${active ? 'bg-primary text-white' : 'bg-white text-on-surface-variant hover:bg-surface-container'}`}
              key={item || 'all'}
              onClick={() => list.setStatus(item)}
              type='button'
            >
              {item ? t(`booking.status.${item}`) : t('centerManager.bookingManagement.filters.all')}
              {item === 'PENDING' && list.pendingCount ? (
                <span className={`rounded-md px-1.5 text-xs ${active ? 'bg-white/20' : 'bg-amber-100 text-amber-900'}`}>
                  {list.pendingCount}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
      <div className='grid gap-3 rounded-xl bg-white p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_160px_160px_200px]'>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            list.setKeyword(keyword)
          }}
          role='search'
        >
          <label className='text-xs font-semibold text-on-surface-variant'>
            {t('centerManager.bookingManagement.filters.search')}
            <span className='relative mt-1 block'>
              <Icon className='pointer-events-none absolute top-2.5 left-3 text-lg text-outline' name='search' />
              <input
                className={`${field} pl-9`}
                maxLength={50}
                onBlur={() => keyword.trim() !== list.keyword && list.setKeyword(keyword)}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder={t('centerManager.bookingManagement.filters.searchPlaceholder')}
                type='search'
                value={keyword}
              />
            </span>
          </label>
        </form>
        <label className='text-xs font-semibold text-on-surface-variant'>
          {t('centerManager.bookingManagement.filters.from')}
          <input
            className={`${field} mt-1`}
            max={list.to}
            onChange={(event) => list.setRange(event.target.value, list.to ?? '')}
            type='date'
            value={list.from ?? ''}
          />
        </label>
        <label className='text-xs font-semibold text-on-surface-variant'>
          {t('centerManager.bookingManagement.filters.to')}
          <input
            className={`${field} mt-1`}
            min={list.from}
            onChange={(event) => list.setRange(list.from ?? '', event.target.value)}
            type='date'
            value={list.to ?? ''}
          />
        </label>
        <label className='text-xs font-semibold text-on-surface-variant'>
          {t('centerManager.bookingManagement.filters.sort')}
          <select
            className={`${field} mt-1`}
            onChange={(event) =>
              list.setSort(MANAGER_SORTS.find((item) => item === event.target.value) ?? MANAGER_SORTS[0])
            }
            value={list.sort}
          >
            <option value={MANAGER_SORTS[0]}>{t('centerManager.bookingManagement.sorts.newest')}</option>
            <option value={MANAGER_SORTS[1]}>{t('centerManager.bookingManagement.sorts.startSoonest')}</option>
          </select>
        </label>
      </div>
    </section>
  )
}
