import { useTranslation } from 'react-i18next'
import { Icon } from '~/shared/ui/icon'
import {
  bookingAreas,
  bookingPeriods,
  bookingServices,
  bookingSorts,
  bookingTabs,
  type ManagerBookingList
} from '../hooks/use-manager-booking-list'

const fieldClass =
  'w-full rounded-lg bg-surface-container-low px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary'
export function BookingFilters({ list }: { list: ManagerBookingList }) {
  const { t, i18n } = useTranslation()
  const number = (value: number) => new Intl.NumberFormat(i18n.resolvedLanguage).format(value)
  return (
    <section
      aria-label={t('centerManager.bookingManagement.status')}
      className='space-y-4 rounded-xl bg-white p-4 shadow-sm sm:p-5'
    >
      <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-12'>
        <label className='relative xl:col-span-4'>
          <span className='sr-only'>{t('centerManager.bookingManagement.search')}</span>
          <Icon className='absolute left-3 top-3 text-outline' name='search' />
          <input
            className={`${fieldClass} pl-10`}
            onChange={(event) => list.update('q', event.target.value)}
            placeholder={t('centerManager.bookingManagement.search')}
            type='search'
            value={list.get('q')}
          />
        </label>
        <label className='xl:col-span-2'>
          <span className='sr-only'>{t('centerManager.bookingManagement.service')}</span>
          <select
            className={fieldClass}
            onChange={(event) => list.update('service', event.target.value)}
            value={list.get('service')}
          >
            <option value=''>
              {t('centerManager.bookingManagement.service')}: {t('centerManager.bookingManagement.all')}
            </option>
            {bookingServices.map((key) => (
              <option key={key} value={key}>
                {t(`centerManager.bookingManagement.services.${key}`)}
              </option>
            ))}
          </select>
        </label>
        <label className='xl:col-span-2'>
          <span className='sr-only'>{t('centerManager.bookingManagement.status')}</span>
          <select
            className={fieldClass}
            onChange={(event) => list.update('status', event.target.value)}
            value={list.get('status')}
          >
            <option value=''>
              {t('centerManager.bookingManagement.status')}: {t('centerManager.bookingManagement.all')}
            </option>
            {bookingTabs
              .filter((key) => key !== 'all')
              .map((key) => (
                <option key={key} value={key}>
                  {t(`centerManager.bookingManagement.statuses.${key}`)}
                </option>
              ))}
          </select>
        </label>
        <label className='xl:col-span-2'>
          <span className='sr-only'>{t('centerManager.bookingManagement.time')}</span>
          <select
            className={fieldClass}
            onChange={(event) => list.update('period', event.target.value)}
            value={list.period}
          >
            {bookingPeriods.map((key) => (
              <option key={key} value={key}>
                {t(`centerManager.bookingManagement.${key}`)}
              </option>
            ))}
          </select>
        </label>
        <label className='xl:col-span-2'>
          <span className='sr-only'>{t('centerManager.bookingManagement.area')}</span>
          <select
            className={fieldClass}
            onChange={(event) => list.update('area', event.target.value)}
            value={list.get('area')}
          >
            <option value=''>
              {t('centerManager.bookingManagement.area')}: {t('centerManager.bookingManagement.all')}
            </option>
            {bookingAreas.map((key) => (
              <option key={key} value={key}>
                {t(`centerManager.bookingManagement.areas.${key}`)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className='flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/20 pt-4'>
        <div className='flex flex-wrap gap-2'>
          {bookingTabs.map((key) => (
            <button
              aria-pressed={(list.get('status') || 'all') === key}
              className={`rounded-lg px-3 py-2 text-xs font-semibold ${(list.get('status') || 'all') === key ? 'bg-primary text-white' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}`}
              key={key}
              onClick={() => list.update('status', key === 'all' ? '' : key)}
              type='button'
            >
              {t(`centerManager.bookingManagement.tabs.${key}`)} ({number(list.counts[key])})
            </button>
          ))}
        </div>
        <label className='flex items-center gap-2 text-xs text-outline'>
          {t('centerManager.bookingManagement.sort')}
          <select
            className='rounded-lg bg-surface-container-low px-3 py-2 text-xs text-on-surface'
            onChange={(event) => list.update('sort', event.target.value)}
            value={list.get('sort') || 'newest'}
          >
            {bookingSorts.map((key) => (
              <option key={key} value={key}>
                {t(`centerManager.bookingManagement.${key}`)}
              </option>
            ))}
          </select>
        </label>
      </div>
      {(['q', 'service', 'status', 'area', 'period'] as const).some((key) => list.get(key)) && (
        <button className='text-xs font-semibold text-primary underline' onClick={list.reset} type='button'>
          {t('centerManager.bookingManagement.reset')}
        </button>
      )}
    </section>
  )
}
