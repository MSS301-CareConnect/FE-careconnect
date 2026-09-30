import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Icon } from '~/shared/ui/icon'
import { SectionCard } from '~/shared/ui/section-card'
import type { ManagerBookingPreview } from '../booking-preview'
import { featuredBookingDetail } from '../booking-detail-preview'

const key = 'centerManager.bookingDetail' as const
const minorButton =
  'inline-flex items-center gap-1.5 rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-xs font-semibold text-on-surface-variant'

export function BookingDetailLeft({ booking, featured }: { booking: ManagerBookingPreview; featured: boolean }) {
  const { t, i18n } = useTranslation()
  const number = (value: number) => new Intl.NumberFormat(i18n.resolvedLanguage ?? 'vi').format(value)
  return (
    <div className='space-y-6'>
      <SectionCard icon='person' title={t(`${key}.customer`)}>
        <div className='flex items-start gap-4'>
          <span
            aria-hidden='true'
            className='flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-secondary-container text-primary'
          >
            <Icon className='text-3xl' name='person' />
          </span>
          <div className='min-w-0 flex-1'>
            <h3 className='font-bold'>{booking.customer}</h3>
            <p className='mt-1 text-xs text-outline'>
              {t(`${key}.customerCode`)}: #{booking.customerCode}
            </p>
            <div className='mt-4 grid gap-3 text-sm sm:grid-cols-2'>
              <a className='flex items-center gap-2 text-primary hover:underline' href={`tel:${booking.phone}`}>
                <Icon name='call' />
                {booking.phone}
              </a>
              {featured && (
                <a
                  className='flex min-w-0 items-center gap-2 text-primary hover:underline'
                  href={`mailto:${featuredBookingDetail.customerEmail}`}
                >
                  <Icon name='mail' />
                  <span className='truncate'>{featuredBookingDetail.customerEmail}</span>
                </a>
              )}
            </div>
            {featured && (
              <p className='mt-4 flex items-start gap-2 text-sm text-on-surface-variant'>
                <Icon className='shrink-0 text-outline' name='location_on' />
                {featuredBookingDetail.address}
              </p>
            )}
          </div>
        </div>
        <div className='mt-5 flex flex-wrap gap-2 border-t border-outline-variant/25 pt-4'>
          <a className={minorButton} href={`tel:${booking.phone}`}>
            <Icon className='text-primary' name='call' />
            {t(`${key}.call`)}
          </a>
          <button className={minorButton} disabled title={t(`${key}.unavailable`)} type='button'>
            <Icon name='chat' />
            {t(`${key}.message`)}
          </button>
          <button className={minorButton} disabled title={t(`${key}.unavailable`)} type='button'>
            {t(`${key}.customerProfile`)}
          </button>
        </div>
      </SectionCard>
      <SectionCard
        action={
          <button className={minorButton} disabled title={t(`${key}.unavailable`)} type='button'>
            {t(`${key}.medicalRecord`)}
          </button>
        }
        icon='medical_services'
        title={t(`${key}.patient`)}
      >
        <div className='flex items-start gap-4'>
          <span
            aria-hidden='true'
            className='flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-secondary-container text-primary'
          >
            <Icon className='text-3xl' name='personal_injury' />
          </span>
          <div>
            <h3 className='font-bold'>{booking.patient}</h3>
            <p className='mt-1 text-xs text-outline'>
              {featured && (
                <>
                  {t(`${key}.patientCode`)}: #{featuredBookingDetail.patientCode} ·{' '}
                </>
              )}
              {booking.patientAge === 0
                ? t('centerManager.bookingManagement.infantAge')
                : t(`${key}.age`, { count: booking.patientAge })}
              {featured && (
                <>
                  {' '}
                  · {t(`${key}.relationship`)}: {t(`${key}.father`)}
                </>
              )}
            </p>
            <p className='mt-3 text-sm text-on-surface-variant'>{booking.condition}</p>
          </div>
        </div>
        {featured && (
          <>
            <div className='mt-5'>
              <h3 className='text-xs font-bold uppercase tracking-wide text-on-surface-variant'>
                {t(`${key}.clinicalHistory`)}
              </h3>
              <div className='mt-3 flex flex-wrap gap-2'>
                {(['stroke', 'pressure', 'dementia'] as const).map((item) => (
                  <span className='rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900' key={item}>
                    {t(`${key}.medical.${item}`)}
                  </span>
                ))}
              </div>
            </div>
            <div className='mt-5 rounded-lg bg-surface-container-low p-4'>
              <h3 className='text-sm font-bold'>{t(`${key}.carePlan`)}</h3>
              <ul className='mt-2 list-inside list-disc space-y-1 text-sm leading-6 text-on-surface-variant'>
                {(['vital', 'turn', 'nutrition'] as const).map((item) => (
                  <li key={item}>{t(`${key}.medical.${item}`)}</li>
                ))}
              </ul>
            </div>
          </>
        )}
      </SectionCard>
      <SectionCard icon='badge' title={t(`${key}.caregiver`)}>
        {booking.caregiver && booking.caregiverId ? (
          <>
            <div className='flex items-start gap-4'>
              <span
                aria-hidden='true'
                className='flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-secondary-container text-primary'
              >
                <Icon className='text-3xl' name='health_and_safety' />
              </span>
              <div className='min-w-0 flex-1'>
                <Link
                  className='font-bold hover:text-primary hover:underline'
                  to={`/center-manager/caregivers/${booking.caregiverId}`}
                >
                  {booking.caregiver}
                </Link>
                <p className='mt-1 text-xs text-outline'>#{booking.caregiverId}</p>
                {featured && (
                  <>
                    <p className='mt-3 text-sm text-primary'>
                      {t(`${key}.qualification`)}: {t(`${key}.specialty`)}
                    </p>
                    <div className='mt-3 grid gap-2 text-xs text-on-surface-variant sm:grid-cols-2'>
                      <p>
                        {t(`${key}.license`)}: #{featuredBookingDetail.caregiverLicense}
                      </p>
                      <p>
                        {t(`${key}.completed`)}: {number(featuredBookingDetail.caregiverCompleted)}
                      </p>
                      <p>
                        <Icon className='text-amber-500' name='star' /> {number(featuredBookingDetail.caregiverRating)}{' '}
                        · {t(`${key}.reviews`, { count: featuredBookingDetail.caregiverReviews })}
                      </p>
                      <a className='text-primary hover:underline' href={`tel:${featuredBookingDetail.caregiverPhone}`}>
                        {featuredBookingDetail.caregiverPhone}
                      </a>
                      <a
                        className='text-primary hover:underline'
                        href={`mailto:${featuredBookingDetail.caregiverEmail}`}
                      >
                        {featuredBookingDetail.caregiverEmail}
                      </a>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className='mt-5 flex flex-wrap gap-2 border-t border-outline-variant/25 pt-4'>
              <button className={minorButton} disabled title={t(`${key}.unavailable`)} type='button'>
                {t(`${key}.sendMessage`)}
              </button>
              <button className={minorButton} disabled title={t(`${key}.unavailable`)} type='button'>
                {t(`${key}.replace`)}
              </button>
              <Link className={`${minorButton} text-primary`} to={`/center-manager/caregivers/${booking.caregiverId}`}>
                {t(`${key}.caregiverProfile`)}
                <Icon name='chevron_right' />
              </Link>
            </div>
          </>
        ) : (
          <p className='text-sm text-amber-800'>{t(`${key}.noAssignment`)}</p>
        )}
      </SectionCard>
    </div>
  )
}
