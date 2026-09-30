import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'
import { managerBookingPreviews, managerBookingReferenceDate } from '../booking-preview'

export const bookingTabs = ['all', 'inProgress', 'pending', 'confirmed', 'completed', 'cancelled'] as const
export const bookingServices = ['elderly', 'stroke', 'dressing', 'motherBaby', 'night', 'postop'] as const
export const bookingAreas = ['q7', 'q1', 'bt', 'cg', 'hk'] as const
export const bookingPeriods = ['month', 'today', 'next7', 'week'] as const
export const bookingSorts = ['newest', 'nearest', 'urgent'] as const

export function useManagerBookingList() {
  const { i18n } = useTranslation()
  const [params, setParams] = useSearchParams()
  const locale = i18n.resolvedLanguage ?? 'vi'
  const get = (key: string) => params.get(key) ?? ''
  function update(key: string, value: string) {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        if (value && !(key === 'period' && value === 'month')) next.set(key, value)
        else next.delete(key)
        if (key !== 'page' && key !== 'booking') next.delete('page')
        return next
      },
      { replace: true }
    )
  }
  function reset() {
    setParams({})
  }
  const period = get('period') || 'month'
  const periodRecords = managerBookingPreviews.filter((booking) => {
    if (period === 'today') return booking.date === managerBookingReferenceDate
    if (period === 'next7') return booking.date >= managerBookingReferenceDate && booking.date <= '2026-09-27'
    if (period === 'week') return booking.date >= '2026-09-14' && booking.date <= managerBookingReferenceDate
    return booking.date.startsWith('2026-09')
  })
  const query = get('q').trim().toLocaleLowerCase(locale)
  const filtered = periodRecords
    .filter((booking) => {
      const searchable = [
        booking.id,
        booking.customer,
        booking.customerCode,
        booking.patient,
        booking.caregiver ?? '',
        booking.caregiverId ?? '',
        booking.phone,
        booking.serviceName
      ]
        .join(' ')
        .toLocaleLowerCase(locale)
      return (
        searchable.includes(query) &&
        (!get('service') || booking.service === get('service')) &&
        (!get('status') || booking.status === get('status')) &&
        (!get('area') || booking.area === get('area'))
      )
    })
    .sort((a, b) => {
      if (get('sort') === 'urgent' && a.urgent !== b.urgent) return Number(b.urgent) - Number(a.urgent)
      if (get('sort') === 'nearest') {
        const appointment = (date: string, start: string | null) =>
          date < managerBookingReferenceDate || !start ? '9999' : `${date}T${start}`
        return appointment(a.date, a.start).localeCompare(appointment(b.date, b.start))
      }
      return b.createdAt.localeCompare(a.createdAt)
    })
  const perPage = [10, 25, 50, 100].includes(Number(get('size'))) ? Number(get('size')) : 10
  const pages = Math.max(1, Math.ceil(filtered.length / perPage))
  const page = Math.min(pages, Math.max(1, Math.floor(Number(get('page')) || 1)))
  const shown = filtered.slice((page - 1) * perPage, page * perPage)
  const counts = Object.fromEntries(
    bookingTabs.map((tab) => [
      tab,
      tab === 'all' ? periodRecords.length : periodRecords.filter((booking) => booking.status === tab).length
    ])
  ) as Record<(typeof bookingTabs)[number], number>
  return { get, update, reset, locale, filtered, shown, periodRecords, period, perPage, pages, page, counts }
}
export type ManagerBookingList = ReturnType<typeof useManagerBookingList>
