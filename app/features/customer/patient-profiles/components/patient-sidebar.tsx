import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Icon } from '~/shared/ui/icon'

const USER_DATA = {
  name: 'Nguyễn Mai Anh',
  code: 'CC-KH8842',
  phone: '0912 345 678',
  email: 'maianh.nguyen@gmail.com',
  address: 'Tòa Landmark 2, Vinhomes Central Park, P.22, Q.Bình Thạnh, TP.HCM',
  familyCount: '03',
  completedShifts: '12',
  rating: '4.9',
  hotline: '1900 6868',
  avatar:
    'https://lh3.googleusercontent.com/aida/AEtjO1X2AIMwVnr_6oP665-POD8JGdhQiSqnQke1YoJo8DWKbZTq0idG-_0lQ0hkcZ9LVU9133ickmVSs-e6Z57r9Acj7qQnwkEuqu4NaP_aaS86WIwNDpmsr6HcFLMbcUM9vPsGY1mrEYn1plB8UZeNcQLkC4Y3P--ijT1iBQ7MtOT66MtBsti7t0eM3NXdQWp3lsUoC5gQsvQ6G9oLWa5AfUcq2Kf93tIHpcdfcJq-j8hEX6Cfh18g8xRDt6dK'
}

export function PatientSidebar() {
  const { t } = useTranslation()
  const activeCount = 3

  return (
    <aside className='flex flex-col gap-6 lg:col-span-4'>
      {/* Customer Card Summary */}
      <div className='relative flex flex-col items-center overflow-hidden rounded-xl bg-surface-container-lowest p-6 text-center shadow-sm'>
        <div className='absolute top-0 right-0 left-0 h-20 bg-gradient-to-r from-surface-container-low via-surface-container to-surface-container-low' />

        <div className='relative mt-3 mb-3'>
          <img
            src={USER_DATA.avatar}
            alt={USER_DATA.name}
            className='h-24 w-24 rounded-full object-cover shadow-md ring-4 ring-surface-container-lowest'
          />
          <span
            title={t('customer.profile.badge.verifiedAccount')}
            className='absolute right-1 bottom-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-on-primary shadow-sm'
          >
            <Icon name='verified' className='text-sm' />
          </span>
        </div>

        <h2 className='flex items-center justify-center gap-1.5 text-lg font-bold text-on-surface'>
          <span>{USER_DATA.name}</span>
          <span
            className='inline-flex items-center text-primary'
            title={t('customer.patientProfiles.sidebar.verifiedIdentity')}
          >
            <Icon name='check_circle' filled className='text-base' />
          </span>
        </h2>
        <span className='mt-0.5 text-xs font-medium text-on-surface-variant'>
          {t('customer.patientProfiles.sidebar.accountCode')}{' '}
          <span className='font-semibold text-primary'>{USER_DATA.code}</span>
        </span>

        {/* Contact details */}
        <div className='mt-4 flex w-full flex-col gap-2 rounded-lg bg-surface-container-low/60 p-3 text-left'>
          <div className='flex items-center justify-between text-xs'>
            <div className='flex min-w-0 items-center gap-1.5 text-on-surface-variant'>
              <Icon name='phone_iphone' className='shrink-0 text-base text-primary' />
              <span className='truncate'>{USER_DATA.phone}</span>
            </div>
            <span className='shrink-0 rounded-full bg-secondary-container/40 px-1.5 py-0.5 text-[11px] font-semibold text-on-secondary-container'>
              {t('customer.profile.badge.verified')}
            </span>
          </div>

          <div className='flex items-center justify-between text-xs'>
            <div className='flex min-w-0 items-center gap-1.5 text-on-surface-variant'>
              <Icon name='mail' className='shrink-0 text-base text-primary' />
              <span className='truncate'>{USER_DATA.email}</span>
            </div>
            <span className='shrink-0 rounded-full bg-secondary-container/40 px-1.5 py-0.5 text-[11px] font-semibold text-on-secondary-container'>
              {t('customer.profile.badge.verified')}
            </span>
          </div>

          <div className='flex items-start gap-1.5 pt-0.5 text-xs text-on-surface-variant'>
            <Icon name='location_on' className='mt-0.5 shrink-0 text-base text-primary' />
            <span className='line-clamp-2 leading-relaxed'>{USER_DATA.address}</span>
          </div>
        </div>

        {/* Metric Statistics Grid */}
        <div className='mt-4 grid w-full grid-cols-3 gap-2 rounded-lg bg-surface-bright p-3 text-center'>
          <div className='flex flex-col'>
            <span className='text-base font-bold text-primary'>{USER_DATA.familyCount}</span>
            <span className='text-[11px] leading-tight text-on-surface-variant'>
              {t('customer.patientProfiles.sidebar.familyMetric')}
            </span>
          </div>
          <div className='flex flex-col'>
            <span className='text-base font-bold text-on-surface'>{USER_DATA.completedShifts}</span>
            <span className='text-[11px] leading-tight text-on-surface-variant'>
              {t('customer.patientProfiles.sidebar.shiftsMetric')}
            </span>
          </div>
          <div className='flex flex-col'>
            <span className='flex items-center justify-center gap-0.5 text-base font-bold text-amber-600'>
              <span>{USER_DATA.rating}</span>
              <Icon name='star' filled className='text-sm text-amber-500' />
            </span>
            <span className='text-[11px] leading-tight text-on-surface-variant'>
              {t('customer.patientProfiles.sidebar.reviewsMetric')}
            </span>
          </div>
        </div>
      </div>

      {/* Synchronized Account Navigation Menu */}
      <nav className='flex flex-col gap-1 rounded-xl bg-surface-container-lowest p-2 shadow-sm'>
        <Link
          to='/customer/my-profile'
          className='flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface'
        >
          <Icon name='badge' className='text-xl' />
          <span className='flex-1 text-left'>{t('customer.profile.nav.personalInfo')}</span>
        </Link>

        <Link
          to='/customer/my-profile#security-section'
          className='flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface'
        >
          <Icon name='lock_reset' className='text-xl' />
          <span className='flex-1 text-left'>{t('customer.profile.nav.security')}</span>
        </Link>

        {/* ACTIVE TAB: Patient Profiles */}
        <div className='relative flex items-center gap-3 overflow-hidden rounded-lg bg-surface-container-low px-4 py-2.5 text-sm font-bold text-primary shadow-sm'>
          <div className='absolute top-0 bottom-0 left-0 w-1.5 rounded-r bg-primary' />
          <Icon name='family_restroom' filled className='text-xl text-primary' />
          <span className='flex-1 text-left'>{t('customer.profile.nav.familyProfiles')}</span>
          <span className='flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-on-primary'>
            {activeCount}
          </span>
        </div>

        <Link
          to='/customer/bookings'
          className='flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface'
        >
          <Icon name='calendar_month' className='text-xl' />
          <span className='flex-1 text-left'>{t('customer.profile.nav.bookingHistory')}</span>
        </Link>

        <Link
          to='/customer/notifications'
          className='flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface'
        >
          <Icon name='notifications_active' className='text-xl' />
          <span className='flex-1 text-left'>{t('customer.profile.nav.notifications')}</span>
        </Link>
      </nav>

      {/* 24/7 Medical Emergency Hotline */}
      <div className='relative overflow-hidden rounded-xl bg-gradient-to-br from-primary-container to-primary p-6 text-on-primary shadow-md'>
        <div className='pointer-events-none absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-white/10 blur-xl' />
        <div className='mb-2 flex items-center gap-3'>
          <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-container-lowest/20'>
            <Icon name='support_agent' className='animate-pulse text-xl text-on-primary' />
          </div>
          <div>
            <div className='text-xs font-semibold tracking-wider text-primary-fixed uppercase'>
              {t('customer.patientProfiles.sidebar.emergencyTitle')}
            </div>
            <div className='text-base font-bold tracking-tight'>
              {t('customer.patientProfiles.sidebar.emergencySubtitle')}
            </div>
          </div>
        </div>
        <p className='mb-4 text-xs text-on-primary-container opacity-90 leading-relaxed'>
          {t('customer.patientProfiles.sidebar.emergencyDesc')}
        </p>
        <a
          href='tel:19006868'
          className='inline-flex w-full items-center justify-center gap-2 rounded-lg bg-surface-container-lowest px-4 py-2.5 text-lg font-bold text-primary shadow-sm transition-all hover:bg-surface-container-low'
        >
          <Icon name='call' className='text-2xl' />
          <span>{USER_DATA.hotline}</span>
        </a>
      </div>
    </aside>
  )
}
