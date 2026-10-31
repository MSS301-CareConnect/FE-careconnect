import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useId, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router'

import { fetchCenters, providerKeys } from '~/entities/provider/provider-api'
import { useCenterNames } from '~/entities/provider/use-provider-names'
import type { BookingStatus, BookingSummaryRecord, ListBookingsParams } from '~/shared/api/generated/contracts'
import { Button } from '~/shared/ui/button'
import { baseControlClass } from '~/shared/ui/form-field'
import { Icon } from '~/shared/ui/icon'
import { Pagination } from '~/shared/ui/pagination'
import { EmptyState, ErrorState, SkeletonBlock } from '~/shared/ui/state-panels'

import { bookingKeys, fetchBookings } from './booking-api'
import { BOOKING_STATUSES, bookingDay, formatDate, formatMoney, shortTime } from './booking-format'
import { BookingMonthCalendar } from './booking-month-calendar'
import { monthRange, planVisits, shiftMonth } from './booking-month'
import { BookingStatusBadge } from './booking-status-badge'

const key = 'booking.browser' as const
const PAGE_SIZE = 20
/** BookingService caps a page at 100; five pages cover a busy month before the view asks for a center filter. */
const MONTH_PAGE_SIZE = 100
const MONTH_MAX_PAGES = 5
const DAY = /^\d{4}-\d{2}-\d{2}$/
const MONTH = /^\d{4}-\d{2}$/

async function fetchMonth(params: Omit<ListBookingsParams, 'page' | 'size'>) {
  const items: BookingSummaryRecord[] = []
  for (let page = 0; page < MONTH_MAX_PAGES; page += 1) {
    const result = await fetchBookings({ ...params, page, size: MONTH_PAGE_SIZE })
    items.push(...result.items)
    if (page + 1 >= result.totalPages) return { items, truncated: false }
  }
  return { items, truncated: true }
}

export interface BookingsBrowserProps {
  /** Shows one center only (the center page tab); the center filter is hidden. */
  fixedCenterId?: string
  detailPath: (bookingId: string) => string
}

/**
 * Every booking (or one center's), as a list or as a month of planned visits (V-03). BookingService filters by
 * `centerId`, `status`, `keyword` and a `from`/`to` range that overlaps each booking's dates; all filters live in the URL.
 */
export function BookingsBrowser({ fixedCenterId, detailPath }: BookingsBrowserProps) {
  const { t, i18n } = useTranslation()
  const id = useId()
  const [params, setParams] = useSearchParams()
  const [today] = useState(() => bookingDay(new Date()))
  const view = params.get('view') === 'calendar' ? 'calendar' : 'list'
  const centerId = fixedCenterId ?? (params.get('center') || undefined)
  const status = BOOKING_STATUSES.find((item) => item === params.get('status')) as BookingStatus | undefined
  const keyword = params.get('q') ?? ''
  const from = DAY.test(params.get('from') ?? '') ? params.get('from')! : ''
  const to = DAY.test(params.get('to') ?? '') ? params.get('to')! : ''
  const month = MONTH.test(params.get('month') ?? '') ? params.get('month')! : today.slice(0, 7)
  const selectedDay = DAY.test(params.get('day') ?? '') ? params.get('day')! : null
  const page = Math.max(0, Number(params.get('page')) || 0)
  const [draft, setDraft] = useState(keyword)
  // A reversed range is only flagged, never blocked or corrected (U-10); the request keeps the last valid range.
  const rangeReversed = Boolean(from && to && to < from)

  const centers = useQuery({
    queryKey: [...providerKeys.centers, 'booking-filter'],
    queryFn: () => fetchCenters({ page: 0, size: 100 }),
    enabled: !fixedCenterId,
    retry: false
  })
  const listQuery: ListBookingsParams = {
    centerId,
    status,
    keyword: keyword || undefined,
    from: rangeReversed ? undefined : from || undefined,
    to: rangeReversed ? undefined : to || undefined,
    sort: 'startDate,desc',
    page,
    size: PAGE_SIZE
  }
  const list = useQuery({
    queryKey: bookingKeys.list(listQuery),
    queryFn: () => fetchBookings(listQuery),
    enabled: view === 'list',
    placeholderData: keepPreviousData,
    retry: false
  })
  const range = monthRange(month)
  const monthQuery = { centerId, status, keyword: keyword || undefined, from: range.from, to: range.to }
  const calendar = useQuery({
    queryKey: [...bookingKeys.all, 'month', monthQuery],
    queryFn: () => fetchMonth(monthQuery),
    enabled: view === 'calendar',
    placeholderData: keepPreviousData,
    retry: false
  })
  const rows = list.data?.items ?? []
  const centerName = useCenterNames(
    view === 'list' ? rows.map((row) => row.centerId) : (calendar.data?.items ?? []).map((row) => row.centerId)
  )
  const locale = i18n.language === 'en' ? 'en-US' : 'vi-VN'
  const monthLabel = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${month}-01T12:00:00Z`)
  )

  function update(next: Record<string, string | undefined>, keepPage = false) {
    setParams(
      (previous) => {
        const search = new URLSearchParams(previous)
        for (const [name, value] of Object.entries(next)) {
          if (value) search.set(name, value)
          else search.delete(name)
        }
        if (!keepPage) search.delete('page')
        return search
      },
      { replace: true }
    )
  }

  function submitSearch(event: FormEvent) {
    event.preventDefault()
    update({ q: draft.trim() || undefined })
  }

  const hasFilters = Boolean((!fixedCenterId && centerId) || status || keyword || from || to)

  return (
    <div className='space-y-4'>
      <section className='space-y-4 rounded-xl border border-outline-variant/40 bg-white p-4'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div
            aria-label={t(`${key}.viewLabel`)}
            className='inline-flex rounded-xl bg-surface-container-low p-1'
            role='group'
          >
            {(['list', 'calendar'] as const).map((item) => (
              <button
                aria-pressed={view === item}
                className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-primary ${view === item ? 'bg-white text-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'}`}
                key={item}
                onClick={() => update({ view: item === 'list' ? undefined : 'calendar', day: undefined })}
                type='button'
              >
                <Icon className='text-lg' name={item === 'list' ? 'view_list' : 'calendar_month'} />
                {t(`${key}.${item}`)}
              </button>
            ))}
          </div>
          {view === 'calendar' ? (
            <div className='flex items-center gap-1.5'>
              <Button
                aria-label={t(`${key}.previousMonth`)}
                onClick={() => update({ month: shiftMonth(month, -1), day: undefined })}
                size='sm'
                variant='ghost'
              >
                <Icon className='text-lg' name='chevron_left' />
              </Button>
              <span className='min-w-36 text-center text-sm font-bold capitalize text-on-surface' aria-live='polite'>
                {monthLabel}
              </span>
              <Button
                aria-label={t(`${key}.nextMonth`)}
                onClick={() => update({ month: shiftMonth(month, 1), day: undefined })}
                size='sm'
                variant='ghost'
              >
                <Icon className='text-lg' name='chevron_right' />
              </Button>
              <Button
                className='whitespace-nowrap'
                onClick={() => update({ month: undefined, day: today })}
                size='sm'
                variant='outline'
              >
                {t(`${key}.today`)}
              </Button>
            </div>
          ) : null}
        </div>
        <div className='flex flex-wrap items-end gap-3'>
          {fixedCenterId ? null : (
            <label className='flex min-w-48 flex-1 flex-col gap-1 text-xs font-semibold text-on-surface-variant sm:flex-none'>
              {t(`${key}.center`)}
              <select
                className={baseControlClass}
                onChange={(event) => update({ center: event.target.value || undefined })}
                value={centerId ?? ''}
              >
                <option value=''>{t(`${key}.allCenters`)}</option>
                {(centers.data?.items ?? [])
                  .filter((center) => center.centerStatus !== 'ARCHIVED')
                  .map((center) => (
                    <option key={center.id} value={center.id}>
                      {center.centerName}
                    </option>
                  ))}
              </select>
            </label>
          )}
          <label className='flex min-w-44 flex-1 flex-col gap-1 text-xs font-semibold text-on-surface-variant sm:flex-none'>
            {t(`${key}.status`)}
            <select
              className={baseControlClass}
              onChange={(event) => update({ status: event.target.value || undefined })}
              value={status ?? ''}
            >
              <option value=''>{t(`${key}.allStatuses`)}</option>
              {BOOKING_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {t(`booking.status.${item}`)}
                </option>
              ))}
            </select>
          </label>
          {view === 'list' ? (
            <>
              <label className='flex flex-col gap-1 text-xs font-semibold text-on-surface-variant'>
                {t(`${key}.from`)}
                <input
                  aria-describedby={rangeReversed ? `${id}-range` : undefined}
                  className={baseControlClass}
                  onChange={(event) => update({ from: event.target.value || undefined })}
                  type='date'
                  value={from}
                />
              </label>
              <label className='flex flex-col gap-1 text-xs font-semibold text-on-surface-variant'>
                {t(`${key}.to`)}
                <input
                  aria-describedby={rangeReversed ? `${id}-range` : undefined}
                  aria-invalid={rangeReversed || undefined}
                  className={baseControlClass}
                  onChange={(event) => update({ to: event.target.value || undefined })}
                  type='date'
                  value={to}
                />
              </label>
            </>
          ) : null}
          <form className='flex min-w-56 flex-1 items-end gap-2' onSubmit={submitSearch} role='search'>
            <label className='flex flex-1 flex-col gap-1 text-xs font-semibold text-on-surface-variant'>
              {t(`${key}.search`)}
              <input
                className={baseControlClass}
                maxLength={50}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={t(`${key}.searchPlaceholder`)}
                type='search'
                value={draft}
              />
            </label>
            <Button type='submit' variant='secondary'>
              {t(`${key}.apply`)}
            </Button>
          </form>
          {hasFilters ? (
            <Button
              onClick={() => {
                setDraft('')
                update({ center: undefined, status: undefined, q: undefined, from: undefined, to: undefined })
              }}
              variant='ghost'
            >
              {t(`${key}.reset`)}
            </Button>
          ) : null}
        </div>
        {rangeReversed ? (
          <p className='text-xs font-medium text-error' id={`${id}-range`}>
            {t(`${key}.dateOrder`)}
          </p>
        ) : null}
      </section>

      {view === 'list' ? (
        list.isPending ? (
          <SkeletonBlock label={t(`${key}.loading`)} rows={5} />
        ) : list.isError ? (
          <ErrorState message={t(`${key}.error`)} onRetry={() => void list.refetch()} retryLabel={t(`${key}.retry`)} />
        ) : rows.length === 0 ? (
          <EmptyState description={t(`${key}.emptyHint`)} icon='calendar_month' title={t(`${key}.empty`)} />
        ) : (
          <>
            <p className='text-sm text-on-surface-variant'>{t(`${key}.total`, { count: list.data.totalElements })}</p>
            <ul className='overflow-hidden rounded-xl border border-outline-variant/40 bg-white'>
              {rows.map((booking) => (
                <li className='border-b border-outline-variant/25 last:border-b-0' key={booking.id}>
                  <Link
                    className='grid gap-2 px-4 py-3 text-sm transition-colors hover:bg-surface-container-low/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center'
                    to={detailPath(booking.id)}
                  >
                    <span className='min-w-0'>
                      <span className='block font-semibold text-on-surface'>
                        #{booking.bookingCode} · {booking.recipientName ?? t(`${key}.noRecipient`)}
                      </span>
                      <span className='mt-0.5 block text-xs text-on-surface-variant'>
                        {booking.customer?.fullName ?? t(`${key}.unknown`)}
                        {fixedCenterId ? '' : ` · ${centerName(booking.centerId)}`}
                      </span>
                      <span className='mt-0.5 block text-xs tabular-nums text-on-surface-variant'>
                        {t(`booking.scheduleType.${booking.scheduleType}`)} ·{' '}
                        {booking.endDate && booking.endDate !== booking.startDate
                          ? t(`${key}.range`, {
                              from: formatDate(booking.startDate, i18n.language),
                              to: formatDate(booking.endDate, i18n.language)
                            })
                          : formatDate(booking.startDate, i18n.language)}{' '}
                        · {t(`${key}.time`, { start: shortTime(booking.startTime), end: shortTime(booking.endTime) })}
                      </span>
                    </span>
                    <span className='flex items-center gap-3 sm:justify-end'>
                      <span className='font-semibold tabular-nums'>
                        {formatMoney(booking.totalAmount, i18n.language)}
                      </span>
                      <BookingStatusBadge status={booking.status} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <Pagination
              ariaLabel={t(`${key}.pagination`)}
              onPageChange={(next) => update({ page: next > 0 ? String(next) : undefined }, true)}
              page={page}
              totalPages={list.data.totalPages}
            />
          </>
        )
      ) : calendar.isPending ? (
        <SkeletonBlock label={t(`${key}.loading`)} rows={6} />
      ) : calendar.isError ? (
        <ErrorState
          message={t(`${key}.error`)}
          onRetry={() => void calendar.refetch()}
          retryLabel={t(`${key}.retry`)}
        />
      ) : (
        <>
          {calendar.data.truncated ? (
            <p className='rounded-xl bg-warning-container px-4 py-2.5 text-sm text-on-warning-container' role='status'>
              {t(`${key}.tooMany`, { count: MONTH_PAGE_SIZE * MONTH_MAX_PAGES })}
            </p>
          ) : null}
          <BookingMonthCalendar
            centerName={fixedCenterId ? undefined : centerName}
            detailPath={detailPath}
            month={month}
            onSelectDay={(day) => update({ day }, true)}
            selectedDay={selectedDay}
            today={today}
            visits={planVisits(calendar.data.items, range.from, range.to)}
          />
          <p className='flex items-start gap-2 text-xs text-on-surface-variant'>
            <Icon className='text-base' name='info' />
            {t(`${key}.projected`)}
          </p>
        </>
      )}
    </div>
  )
}
