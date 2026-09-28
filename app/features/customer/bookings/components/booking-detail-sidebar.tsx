import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'

import type { BookingPreview } from '../bookings-data'

const serviceItems = ['monitoring', 'movement', 'hygiene', 'medication', 'report'] as const

interface BookingDetailSidebarProps {
  booking: BookingPreview
}

export function BookingDetailSidebar({ booking }: BookingDetailSidebarProps) {
  const { t, i18n } = useTranslation()
  const key = `customer.myBookings.items.${booking.status}` as const
  const locale = i18n.resolvedLanguage === 'en' ? 'en-US' : 'vi-VN'
  const money = (amount: number) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount)
  const remaining = booking.status === 'cancelled' ? 0 : booking.price - booking.depositPaid

  return (
    <aside className='flex flex-col gap-5'>
      <section className='rounded-2xl bg-white p-5 shadow-sm sm:p-6' aria-labelledby='booking-service-title'>
        <h2 id='booking-service-title' className='flex items-center gap-2 text-lg font-bold'>
          <Icon name='medical_services' className='text-2xl text-primary' />
          {t('customer.bookingDetail.service.title')}
        </h2>
        <h3 className='mt-4 text-base font-bold leading-6 text-on-surface'>{t(`${key}.service`)}</h3>
        <p className='mt-2 text-sm leading-6 text-on-surface-variant'>
          {t('customer.bookingDetail.service.description')}
        </p>
        <p className='mt-5 text-xs font-bold tracking-wide text-on-surface-variant uppercase'>
          {t('customer.bookingDetail.service.included')}
        </p>
        <ul className='mt-3 space-y-3'>
          {serviceItems.map((item) => (
            <li key={item} className='flex gap-2 text-sm leading-5 text-on-surface-variant'>
              <Icon name='check_circle' className='shrink-0 text-lg text-primary' />
              <span>{t(`customer.bookingDetail.service.items.${item}`)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className='rounded-2xl bg-white p-5 shadow-sm sm:p-6' aria-labelledby='booking-people-title'>
        <h2 id='booking-people-title' className='flex items-center gap-2 text-lg font-bold'>
          <Icon name='location_on' className='text-2xl text-primary' />
          {t('customer.bookingDetail.people.title')}
        </h2>
        <div className='mt-5 space-y-5'>
          <div>
            <p className='text-xs font-semibold tracking-wide text-on-surface-variant uppercase'>
              {t('customer.bookingDetail.people.address')}
            </p>
            <p className='mt-1 text-sm leading-6 text-on-surface'>{t(`${key}.location`)}</p>
          </div>
          <div className='border-t border-slate-100 pt-4'>
            <p className='text-xs font-semibold tracking-wide text-on-surface-variant uppercase'>
              {t('customer.bookingDetail.people.patient')}
            </p>
            <p className='mt-1 font-bold text-on-surface'>{t(`${key}.patient`)}</p>
            <p className='text-sm text-on-surface-variant'>{t(`${key}.relation`)}</p>
          </div>
          <div className='border-t border-slate-100 pt-4'>
            <p className='text-xs font-semibold tracking-wide text-on-surface-variant uppercase'>
              {t('customer.bookingDetail.people.caregiver')}
            </p>
            <div className='mt-2 flex items-center gap-3'>
              <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-primary'>
                <Icon name='medical_services' className='text-xl' />
              </div>
              <div>
                <p className='font-bold text-on-surface'>{booking.caregiver}</p>
                <p className='text-xs text-on-surface-variant'>{t(`${key}.caregiverRole`)}</p>
              </div>
            </div>
            <p className='mt-3 text-xs text-on-surface-variant'>{t('customer.bookingDetail.people.caregiverNote')}</p>
            <div className='mt-4 grid grid-cols-2 gap-2'>
              <button
                type='button'
                disabled
                className='flex cursor-not-allowed items-center justify-center gap-1.5 rounded-lg bg-surface-container px-3 py-2 text-sm font-semibold text-on-surface-variant opacity-65'
              >
                <Icon name='call' className='text-lg' />
                {t('customer.bookingDetail.policy.call')}
              </button>
              <button
                type='button'
                disabled
                className='flex cursor-not-allowed items-center justify-center gap-1.5 rounded-lg bg-surface-container px-3 py-2 text-sm font-semibold text-on-surface-variant opacity-65'
              >
                <Icon name='chat' className='text-lg' />
                {t('customer.bookingDetail.policy.message')}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className='rounded-2xl bg-white p-5 shadow-sm sm:p-6' aria-labelledby='booking-payment-title'>
        <h2 id='booking-payment-title' className='text-lg font-bold'>
          {t('customer.bookingDetail.payment.title')}
        </h2>
        <dl className='mt-5 space-y-3 text-sm'>
          <div className='flex justify-between gap-3'>
            <dt className='text-on-surface-variant'>{t('customer.bookingDetail.payment.total')}</dt>
            <dd className='font-semibold text-on-surface'>{money(booking.price)}</dd>
          </div>
          <div className='flex justify-between gap-3'>
            <dt className='text-on-surface-variant'>
              {t(
                booking.status === 'cancelled'
                  ? 'customer.bookingDetail.payment.refunded'
                  : 'customer.bookingDetail.payment.paid'
              )}
            </dt>
            <dd className='font-semibold text-primary'>{money(booking.depositPaid)}</dd>
          </div>
          <div className='flex justify-between gap-3 border-t border-slate-100 pt-3'>
            <dt className='font-semibold text-on-surface'>{t('customer.bookingDetail.payment.remaining')}</dt>
            <dd className='text-lg font-bold text-primary'>{money(remaining)}</dd>
          </div>
        </dl>
        <p className='mt-4 flex items-start gap-1.5 rounded-lg bg-emerald-50 p-3 text-xs leading-5 text-primary'>
          <Icon name='verified' className='shrink-0 text-base' />
          <span>
            {t('customer.bookingDetail.payment.status')}: {t(`${key}.payment`)}
          </span>
        </p>
      </section>

      <section className='rounded-2xl bg-surface-container-low p-5 sm:p-6' aria-labelledby='booking-policy-title'>
        <h2 id='booking-policy-title' className='flex items-center gap-2 text-lg font-bold'>
          <Icon name='policy' className='text-2xl text-primary' />
          {t('customer.bookingDetail.policy.title')}
        </h2>
        <p className='mt-4 text-sm leading-6 text-on-surface-variant'>{t('customer.bookingDetail.policy.before')}</p>
        <p className='mt-3 text-sm leading-6 text-on-surface-variant'>{t('customer.bookingDetail.policy.during')}</p>
        {booking.status === 'ongoing' && (
          <button
            type='button'
            disabled
            className='mt-5 w-full cursor-not-allowed rounded-lg bg-surface-container-high px-4 py-3 text-sm font-semibold text-on-surface-variant opacity-65'
          >
            {t('customer.bookingDetail.policy.stop')}
          </button>
        )}
        <p className='mt-3 text-xs leading-5 text-on-surface-variant'>
          {t('customer.bookingDetail.policy.unavailable')}
        </p>
      </section>
    </aside>
  )
}
