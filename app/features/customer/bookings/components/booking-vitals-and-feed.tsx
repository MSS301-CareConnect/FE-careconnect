import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'

const vitalSigns = [
  { key: 'bloodPressure', icon: 'cardiology', value: '125/82', unit: 'mmHg', note: 'normal' },
  { key: 'oxygen', icon: 'air', value: '98', unit: '%', note: 'good' },
  { key: 'pulse', icon: 'ecg_heart', value: '74', unit: 'bpm', note: 'regular' },
  { key: 'temperature', icon: 'device_thermostat', value: '36.8', unit: '°C', note: 'normal' },
  { key: 'glucose', icon: 'bloodtype', value: '115', unit: 'mg/dL', note: 'beforeMeal' }
] as const

const entries = [
  { key: 'start', time: '08:00', icon: 'home_health' },
  { key: 'medicine', time: '08:30', icon: 'medication' },
  { key: 'nursing', time: '09:15', icon: 'healing' },
  { key: 'therapy', time: '10:00', icon: 'accessibility_new' },
  { key: 'lunch', time: '11:30', icon: 'restaurant' }
] as const

const sampleNextCheckTime = '14:00'

export function BookingVitalsAndFeed() {
  const { t } = useTranslation()

  return (
    <>
      <section className='rounded-2xl bg-white p-5 shadow-sm sm:p-6' aria-labelledby='booking-vitals-title'>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div>
            <h2 id='booking-vitals-title' className='flex items-center gap-2 text-lg font-bold'>
              <Icon name='monitor_heart' className='text-2xl text-primary' />
              {t('customer.bookingDetail.vitals.title')}
            </h2>
            <p className='mt-1 text-xs text-on-surface-variant'>{t('customer.bookingDetail.vitals.measured')}</p>
          </div>
          <span className='rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-primary'>
            {t('customer.bookingDetail.vitals.stable')}
          </span>
        </div>
        <div className='mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3'>
          {vitalSigns.map((sign) => (
            <div key={sign.key} className='rounded-xl bg-surface-container-low p-4'>
              <p className='flex items-center gap-2 text-xs font-semibold text-on-surface-variant'>
                <Icon name={sign.icon} className='text-xl text-primary' />
                {t(`customer.bookingDetail.vitals.${sign.key}`)}
              </p>
              <p className='mt-3 text-2xl font-bold tracking-tight text-on-surface'>
                {sign.value} <span className='text-sm font-medium text-on-surface-variant'>{sign.unit}</span>
              </p>
              <p className='mt-1 text-xs text-primary'>{t(`customer.bookingDetail.vitals.${sign.note}`)}</p>
            </div>
          ))}
          <div className='rounded-xl bg-emerald-50 p-4'>
            <p className='flex items-center gap-2 text-xs font-semibold text-primary'>
              <Icon name='schedule' className='text-xl' />
              {t('customer.bookingDetail.vitals.next')}
            </p>
            <p className='mt-3 text-2xl font-bold text-on-surface'>{sampleNextCheckTime}</p>
          </div>
        </div>
      </section>

      <section className='rounded-2xl bg-white p-5 shadow-sm sm:p-6' aria-labelledby='booking-feed-title'>
        <h2 id='booking-feed-title' className='flex items-center gap-2 text-lg font-bold'>
          <Icon name='history_edu' className='text-2xl text-primary' />
          {t('customer.bookingDetail.feed.title')}
        </h2>
        <p className='mt-1 text-xs text-on-surface-variant'>{t('customer.bookingDetail.feed.subtitle')}</p>
        <ol className='mt-6 space-y-5 border-l-2 border-emerald-100 pl-6'>
          {entries.map((entry) => (
            <li key={entry.key} className='relative'>
              <span className='absolute top-0 -left-[39px] flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-primary ring-4 ring-white'>
                <Icon name={entry.icon} className='text-base' />
              </span>
              <div className='flex flex-wrap items-baseline gap-2'>
                <time className='text-xs font-bold text-primary'>{entry.time}</time>
                <h3 className='text-sm font-bold'>{t(`customer.bookingDetail.feed.entries.${entry.key}.title`)}</h3>
              </div>
              <p className='mt-1 text-sm leading-6 text-on-surface-variant'>
                {t(`customer.bookingDetail.feed.entries.${entry.key}.description`)}
              </p>
            </li>
          ))}
        </ol>
      </section>
    </>
  )
}
