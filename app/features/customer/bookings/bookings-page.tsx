import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router'

import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'

import { bookingPreviews, type BookingStatus, type PatientId } from './bookings-data'
import { BookingPreviewCard } from './components/booking-preview-card'

const statuses = ['all', 'upcoming', 'ongoing', 'completed', 'cancelled'] as const
const statItems = [
  { status: 'ongoing', icon: 'vital_signs', tone: 'bg-emerald-50 text-emerald-700' },
  { status: 'upcoming', icon: 'event_upcoming', tone: 'bg-blue-50 text-blue-700' },
  { status: 'completed', icon: 'verified', tone: 'bg-violet-50 text-violet-700' },
  { status: 'cancelled', icon: 'event_busy', tone: 'bg-slate-100 text-slate-600' }
] as const

export function CustomerBookingsPage() {
  const { t, i18n } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  useDocumentTitle(t('customer.myBookings.documentTitle'))

  const statusParam = searchParams.get('status')
  const status = statuses.find((item) => item === statusParam) ?? 'all'
  const month = searchParams.get('month') ?? ''
  const patient = searchParams.get('patient') ?? ''
  const query = searchParams.get('q') ?? ''
  const locale = i18n.resolvedLanguage === 'en' ? 'en-US' : 'vi-VN'
  const months = [...new Set(bookingPreviews.map((booking) => booking.date.slice(0, 7)))]

  function updateFilter(name: string, value: string) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(name, value)
    else next.delete(name)
    setSearchParams(next, { replace: true })
  }

  const normalizedQuery = query.trim().toLocaleLowerCase(locale)
  const filteredBookings = bookingPreviews.filter((booking) => {
    if (status !== 'all' && booking.status !== status) return false
    if (month && !booking.date.startsWith(month)) return false
    if (patient && booking.patientId !== patient) return false
    if (!normalizedQuery) return true
    const searchable = [booking.code, booking.caregiver, t(`customer.myBookings.items.${booking.status}.patient`)]
    return searchable.some((value) => value.toLocaleLowerCase(locale).includes(normalizedQuery))
  })

  function countStatus(value: BookingStatus) {
    return bookingPreviews.filter((booking) => booking.status === value).length
  }

  return (
    <div className='min-h-full bg-surface pb-16'>
      <div className='mx-auto flex max-w-7xl flex-col gap-7 px-4 py-8 sm:px-6 lg:px-8'>
        <div className='flex flex-col justify-between gap-5 md:flex-row md:items-end'>
          <div>
            <nav
              aria-label={t('customer.myBookings.breadcrumb')}
              className='mb-3 flex items-center gap-1.5 text-xs text-on-surface-variant'
            >
              <Link to='/' className='hover:text-primary'>
                {t('customer.nav.home')}
              </Link>
              <Icon name='chevron_right' className='text-base' />
              <span className='font-semibold text-primary'>{t('customer.myBookings.breadcrumb')}</span>
            </nav>
            <h1 className='text-2xl font-bold tracking-tight text-on-surface sm:text-3xl'>
              {t('customer.myBookings.title')}
            </h1>
            <p className='mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant sm:text-base'>
              {t('customer.myBookings.subtitle')}
            </p>
          </div>
          <Link
            to='/customer/booking'
            className='inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-container md:self-auto'
          >
            <Icon name='add_circle' className='text-xl' />
            {t('customer.myBookings.newBooking')}
          </Link>
        </div>

        <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
          {statItems.map(({ status: item, icon, tone }) => (
            <div key={item} className='flex items-center justify-between rounded-xl bg-white p-4 shadow-sm sm:p-5'>
              <div>
                <p className='text-xs font-semibold tracking-wide text-on-surface-variant uppercase'>
                  {t(`customer.myBookings.stats.${item}`)}
                </p>
                <p className='mt-2 text-2xl font-bold text-on-surface'>{countStatus(item)}</p>
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}>
                <Icon name={icon} className='text-2xl' />
              </div>
            </div>
          ))}
        </div>

        <section aria-label={t('customer.myBookings.tabs.all')} className='flex flex-col gap-5'>
          <div className='flex gap-2 overflow-x-auto pb-1' role='group' aria-label={t('customer.myBookings.tabs.all')}>
            {statuses.map((item) => (
              <button
                key={item}
                type='button'
                aria-pressed={status === item}
                onClick={() => updateFilter('status', item === 'all' ? '' : item)}
                className={`shrink-0 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${status === item ? 'bg-primary text-white' : 'bg-white text-on-surface-variant hover:bg-surface-container'}`}
              >
                {t(`customer.myBookings.tabs.${item}`)}{' '}
                <span className='ml-1 opacity-70'>{item === 'all' ? bookingPreviews.length : countStatus(item)}</span>
              </button>
            ))}
          </div>

          <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.5fr]'>
            <label className='relative'>
              <span className='sr-only'>{t('customer.myBookings.filters.month')}</span>
              <Icon name='calendar_month' className='pointer-events-none absolute top-3 left-3 text-xl text-primary' />
              <select
                value={month}
                onChange={(event) => updateFilter('month', event.target.value)}
                className='w-full appearance-none rounded-lg border border-slate-100 bg-white py-3 pr-9 pl-10 text-sm text-on-surface focus:border-primary focus:outline-none'
              >
                <option value=''>{t('customer.myBookings.filters.allMonths')}</option>
                {months.map((value) => (
                  <option key={value} value={value}>
                    {new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(
                      new Date(`${value}-01T12:00:00`)
                    )}
                  </option>
                ))}
              </select>
              <Icon
                name='keyboard_arrow_down'
                className='pointer-events-none absolute top-3 right-3 text-xl text-on-surface-variant'
              />
            </label>
            <label className='relative'>
              <span className='sr-only'>{t('customer.myBookings.filters.patient')}</span>
              <Icon name='person' className='pointer-events-none absolute top-3 left-3 text-xl text-primary' />
              <select
                value={patient}
                onChange={(event) => updateFilter('patient', event.target.value)}
                className='w-full appearance-none rounded-lg border border-slate-100 bg-white py-3 pr-9 pl-10 text-sm text-on-surface focus:border-primary focus:outline-none'
              >
                <option value=''>{t('customer.myBookings.filters.allPatients')}</option>
                {(['father', 'mother'] as PatientId[]).map((value) => (
                  <option key={value} value={value}>
                    {t(`customer.myBookings.patients.${value}`)}
                  </option>
                ))}
              </select>
              <Icon
                name='keyboard_arrow_down'
                className='pointer-events-none absolute top-3 right-3 text-xl text-on-surface-variant'
              />
            </label>
            <label className='relative'>
              <span className='sr-only'>{t('customer.myBookings.filters.search')}</span>
              <Icon name='search' className='pointer-events-none absolute top-3 left-3 text-xl text-primary' />
              <input
                type='search'
                value={query}
                onChange={(event) => updateFilter('q', event.target.value)}
                placeholder={t('customer.myBookings.filters.search')}
                className='w-full rounded-lg border border-slate-100 bg-white py-3 pr-4 pl-10 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:border-primary focus:outline-none'
              />
            </label>
          </div>

          <p className='flex items-center gap-2 text-xs text-on-surface-variant'>
            <Icon name='info' className='text-base' />
            {t('customer.myBookings.sampleNotice')}
          </p>

          <div className='flex flex-col gap-4'>
            {filteredBookings.map((booking) => (
              <BookingPreviewCard key={booking.code} booking={booking} />
            ))}
            {filteredBookings.length === 0 && (
              <div className='flex flex-col items-center rounded-xl bg-white px-6 py-12 text-center shadow-sm'>
                <div className='flex h-16 w-16 items-center justify-center rounded-full bg-surface-container text-on-surface-variant'>
                  <Icon name='event_busy' className='text-3xl' />
                </div>
                <h2 className='mt-4 text-lg font-bold'>{t('customer.myBookings.empty.title')}</h2>
                <p className='mt-2 max-w-md text-sm text-on-surface-variant'>
                  {t('customer.myBookings.empty.description')}
                </p>
                <button
                  type='button'
                  onClick={() => setSearchParams({}, { replace: true })}
                  className='mt-5 rounded-lg bg-surface-container px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-container-high'
                >
                  {t('customer.myBookings.filters.reset')}
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
