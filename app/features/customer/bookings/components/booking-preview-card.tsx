import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Icon } from '~/shared/ui/icon'

import type { BookingPreview } from '../bookings-data'

const statusStyle = {
  ongoing: 'bg-emerald-50 text-emerald-800',
  upcoming: 'bg-blue-50 text-blue-800',
  completed: 'bg-slate-100 text-slate-700',
  cancelled: 'bg-red-50 text-red-700'
} as const

const statusIcon = {
  ongoing: 'vital_signs',
  upcoming: 'event_available',
  completed: 'check_circle',
  cancelled: 'cancel'
} as const

interface BookingPreviewCardProps {
  booking: BookingPreview
}

export function BookingPreviewCard({ booking }: BookingPreviewCardProps) {
  const { t, i18n } = useTranslation()
  const key = `customer.myBookings.items.${booking.status}` as const
  const locale = i18n.resolvedLanguage === 'en' ? 'en-US' : 'vi-VN'
  const date = new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(
    new Date(`${booking.date}T12:00:00`)
  )
  const price = new Intl.NumberFormat(locale, { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(
    booking.price
  )

  return (
    <article className='rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgba(24,50,83,0.04)] sm:p-6'>
      <div className='flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4'>
        <div className='flex flex-wrap items-center gap-2'>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusStyle[booking.status]}`}
          >
            <Icon name={statusIcon[booking.status]} className='text-base' />
            {t(`${key}.status`)}
          </span>
          <span className='rounded-md bg-surface-container-low px-2 py-1 font-mono text-xs text-on-surface-variant'>
            #{booking.code}
          </span>
        </div>
        <span className='text-xs text-on-surface-variant'>{t(`${key}.note`)}</span>
      </div>

      <div className='grid gap-5 py-5 md:grid-cols-3 md:gap-6'>
        <div className='flex flex-col gap-4'>
          <div className='flex items-start gap-3'>
            <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-primary'>
              <Icon name='elderly' className='text-2xl' />
            </div>
            <div>
              <p className='text-[11px] font-semibold tracking-wider text-on-surface-variant uppercase'>
                {t('customer.myBookings.labels.patient')}
              </p>
              <h2 className='mt-1 text-base font-bold text-on-surface'>{t(`${key}.patient`)}</h2>
              <p className='mt-1 text-xs leading-5 text-on-surface-variant'>{t(`${key}.relation`)}</p>
            </div>
          </div>
          <div className='rounded-xl bg-surface-container-low p-3 text-sm text-on-surface-variant'>
            <div className='flex items-center gap-2'>
              <Icon name='calendar_today' className='text-lg text-primary' />
              <span className='font-semibold text-on-surface'>{date}</span>
              <span>·</span>
              <span>
                {booking.start}–{booking.end}
              </span>
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-4'>
          <div>
            <p className='text-[11px] font-semibold tracking-wider text-on-surface-variant uppercase'>
              {t('customer.myBookings.labels.caregiver')}
            </p>
            <p className='mt-1 text-base font-bold text-on-surface'>{booking.caregiver}</p>
            <p className='mt-1 text-xs leading-5 text-on-surface-variant'>{t(`${key}.caregiverRole`)}</p>
          </div>
          <div className='rounded-xl bg-emerald-50/70 p-3'>
            <p className='text-xs font-semibold text-primary'>{t('customer.myBookings.labels.service')}</p>
            <p className='mt-1 text-sm leading-5 text-on-surface'>{t(`${key}.service`)}</p>
          </div>
        </div>

        <div className='flex flex-col justify-between gap-4 md:border-l md:border-slate-100 md:pl-5'>
          <div>
            <p className='text-xs text-on-surface-variant'>{t('customer.myBookings.labels.total')}</p>
            <p className='mt-1 text-xl font-bold tracking-tight text-on-surface'>{price}</p>
            <p className='mt-2 flex items-start gap-1.5 text-xs leading-5 text-primary'>
              <Icon name='verified' className='mt-0.5 text-base' />
              {t(`${key}.payment`)}
            </p>
          </div>
          <div className='flex flex-wrap gap-2'>
            <Link
              to={`/customer/bookings/${booking.code}`}
              className='flex w-full items-center justify-center gap-1.5 rounded-lg bg-surface-container px-3 py-2 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-high'
            >
              <Icon name='visibility' className='text-lg text-primary' />
              {t('customer.myBookings.actions.details')}
            </Link>
            {booking.status === 'completed' && (
              <Link
                to={`/customer/bookings/${booking.code}/report`}
                className='flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-container'
              >
                <Icon name='clinical_notes' className='text-lg' />
                {t('customer.careReport.read')}
              </Link>
            )}
            {booking.status === 'completed' && (
              <Link
                to='/customer/booking'
                className='flex-1 rounded-lg bg-primary px-3 py-2 text-center text-sm font-semibold text-white hover:bg-primary-container'
              >
                {t('customer.myBookings.actions.bookAgain')}
              </Link>
            )}
            {booking.status === 'cancelled' && (
              <Link
                to='/customer/caregivers'
                className='flex-1 rounded-lg bg-primary px-3 py-2 text-center text-sm font-semibold text-white hover:bg-primary-container'
              >
                {t('customer.myBookings.actions.findCaregiver')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
