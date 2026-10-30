import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { useAuthUser } from '~/features/shared/auth/auth-user-context'
import { Icon } from '~/shared/ui/icon'

export interface PatientSidebarProps {
  familyCount?: number
}

export function PatientSidebar({ familyCount }: PatientSidebarProps) {
  const { t, i18n } = useTranslation()
  const user = useAuthUser()
  const name = user?.fullName || user?.email || t('customer.patientProfiles.sidebar.accountFallback')

  return (
    <aside className='flex flex-col gap-6 lg:col-span-4'>
      {/* Customer Card Summary */}
      <div className='relative flex flex-col items-center overflow-hidden rounded-xl bg-surface-container-lowest p-6 text-center shadow-sm'>
        <div className='absolute top-0 right-0 left-0 h-20 bg-gradient-to-r from-surface-container-low via-surface-container to-surface-container-low' />

        <span className='relative mt-3 mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-secondary-container text-primary shadow-md ring-4 ring-surface-container-lowest'>
          <Icon name='person' className='text-5xl' />
        </span>

        <h2 className='text-lg font-bold break-all text-on-surface'>{name}</h2>

        {/* Contact details */}
        {user?.email || user?.phoneNumber ? (
          <div className='mt-4 flex w-full flex-col gap-2 rounded-lg bg-surface-container-low/60 p-3 text-left'>
            {user.phoneNumber ? (
              <div className='flex min-w-0 items-center gap-1.5 text-xs text-on-surface-variant'>
                <Icon name='phone_iphone' className='shrink-0 text-base text-primary' />
                <span className='truncate'>{user.phoneNumber}</span>
              </div>
            ) : null}
            {user.email ? (
              <div className='flex min-w-0 items-center gap-1.5 text-xs text-on-surface-variant'>
                <Icon name='mail' className='shrink-0 text-base text-primary' />
                <span className='truncate'>{user.email}</span>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Family Profile Count */}
        <div className='mt-4 flex w-full flex-col rounded-lg bg-surface-bright p-3 text-center'>
          <span className='text-base font-bold text-primary'>
            {familyCount === undefined ? '-' : new Intl.NumberFormat(i18n.language).format(familyCount)}
          </span>
          <span className='text-[11px] leading-tight text-on-surface-variant'>
            {t('customer.patientProfiles.sidebar.familyMetric')}
          </span>
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
          to='/customer/my-profile?section=security'
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
          {familyCount !== undefined ? (
            <span className='flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-on-primary'>
              {new Intl.NumberFormat(i18n.language).format(familyCount)}
            </span>
          ) : null}
        </div>
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
          <span>{t('customer.patientProfiles.sidebar.hotlineNumber')}</span>
        </a>
      </div>
    </aside>
  )
}
