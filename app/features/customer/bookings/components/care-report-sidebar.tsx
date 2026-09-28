import { useTranslation } from 'react-i18next'
import { Icon } from '~/shared/ui/icon'
import type { BookingPreview } from '../bookings-data'

const vitalSigns = [
  { key: 'pressure', icon: 'cardiology', value: [120, 80], unit: 'mmHg' },
  { key: 'oxygen', icon: 'air', value: [98], unit: '%' },
  { key: 'pulse', icon: 'ecg_heart', value: [74], unit: 'bpm' },
  { key: 'temperature', icon: 'device_thermostat', value: [36.8], unit: '°C' },
  { key: 'glucose', icon: 'bloodtype', value: [115], unit: 'mg/dL' }
] as const

export function CareReportSidebar({ booking, onReview }: { booking: BookingPreview; onReview: () => void }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage === 'en' ? 'en-US' : 'vi-VN'
  const number = new Intl.NumberFormat(locale)
  const total = new Intl.NumberFormat(locale, { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(
    booking.price
  )

  return (
    <aside className='flex flex-col gap-6'>
      <section className='rounded-2xl bg-white p-5 shadow-sm sm:p-6' aria-labelledby='report-vitals-title'>
        <h2 id='report-vitals-title' className='flex items-center gap-2 text-lg font-bold'>
          <Icon name='monitor_heart' className='text-primary' />
          {t('customer.careReport.vitalsTitle')}
        </h2>
        <p className='mt-1 text-xs text-on-surface-variant'>{t('customer.careReport.vitalsSubtitle')}</p>
        <dl className='mt-5 space-y-3'>
          {vitalSigns.map((sign) => (
            <div key={sign.key} className='rounded-xl bg-surface-container-low p-4'>
              <dt className='flex items-center gap-2 text-xs font-semibold text-on-surface-variant'>
                <Icon name={sign.icon} className='text-xl text-primary' />
                {t(`customer.careReport.vitals.${sign.key}`)}
              </dt>
              <dd className='mt-2 text-2xl font-bold'>
                {sign.value.map((value) => number.format(value)).join('/')}{' '}
                <span className='text-sm font-medium text-on-surface-variant'>{sign.unit}</span>
              </dd>
            </div>
          ))}
        </dl>
        <p className='mt-4 text-xs leading-5 text-on-surface-variant'>{t('customer.careReport.measurementNote')}</p>
      </section>
      <section className='rounded-2xl bg-white p-5 shadow-sm sm:p-6' aria-labelledby='report-payment-title'>
        <h2 id='report-payment-title' className='flex items-center gap-2 text-lg font-bold'>
          <Icon name='receipt_long' className='text-primary' />
          {t('customer.careReport.paymentTitle')}
        </h2>
        <dl className='mt-5 text-sm'>
          <div className='flex justify-between gap-3'>
            <dt>{t('customer.careReport.total')}</dt>
            <dd className='font-bold text-primary'>{total}</dd>
          </div>
          <div className='mt-4 border-t border-slate-100 pt-4'>
            <dt className='text-xs text-on-surface-variant'>{t('customer.careReport.paymentStatus')}</dt>
            <dd className='mt-1 leading-6'>{t('customer.myBookings.items.completed.payment')}</dd>
          </div>
        </dl>
      </section>
      <section
        id='care-report-review'
        className='scroll-mt-24 rounded-2xl bg-white p-5 shadow-sm sm:p-6 print:hidden'
        aria-labelledby='report-review-title'
      >
        <h2 id='report-review-title' className='flex items-center gap-2 text-lg font-bold'>
          <Icon name='star' className='text-amber-500' />
          {t('customer.careReport.reviewTitle')}
        </h2>
        <p className='mt-1 text-xs text-on-surface-variant'>{t('customer.careReport.reviewDescription')}</p>
        <button
          type='button'
          onClick={onReview}
          className='mt-4 w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-container'
        >
          {t('customer.careReport.rate')}
        </button>
      </section>
      <section className='rounded-2xl bg-emerald-50 p-5 sm:p-6 print:hidden'>
        <Icon name='support_agent' className='text-3xl text-primary' />
        <h2 className='mt-2 text-base font-bold'>{t('customer.careReport.supportTitle')}</h2>
        <p className='mt-2 text-sm leading-6 text-on-surface-variant'>{t('customer.careReport.supportDescription')}</p>
      </section>
    </aside>
  )
}
