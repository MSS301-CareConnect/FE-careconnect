import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'

import type { CustomerProfileData } from '../hooks/use-profile-data'

export interface ProfileOverviewCardProps {
  profile: CustomerProfileData
}

export function ProfileOverviewCard({ profile }: ProfileOverviewCardProps) {
  const { t } = useTranslation()

  const formattedFamilyCount = String(profile.stats.familyCount).padStart(2, '0')
  const formattedShiftsCount = String(profile.stats.completedShifts).padStart(2, '0')
  const fullAddress = `${profile.addressDetail}, ${profile.ward}, ${profile.district}, ${profile.city}`

  return (
    <div className='relative overflow-hidden rounded-2xl bg-surface-container-lowest p-6 shadow-sm'>
      <div className='pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full bg-secondary-container/40 blur-2xl' />

      <div className='relative z-10 flex flex-col items-center text-center'>
        <div className='group relative mb-4'>
          <div className='flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-secondary-fixed p-1 shadow-md'>
            <img
              src={profile.avatarUrl}
              alt={t('customer.profile.overview.avatarAlt')}
              className='h-full w-full rounded-full object-cover'
            />
          </div>
          <button
            type='button'
            aria-label={t('customer.profile.overview.changeAvatar')}
            title={t('customer.profile.overview.changeAvatar')}
            className='absolute right-0 bottom-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-on-primary shadow-md transition-all hover:scale-105 hover:bg-primary-container'
          >
            <Icon name='photo_camera' className='text-lg' />
          </button>
        </div>

        <div className='mb-1 flex items-center gap-1.5'>
          <h2 className='text-lg font-bold text-on-surface'>{profile.fullName}</h2>
          <span title={t('customer.profile.overview.verifiedIdentity')}>
            <Icon name='check_circle' filled className='text-xl text-primary' />
          </span>
        </div>

        <div className='mb-4 flex items-center gap-2 text-xs text-on-surface-variant'>
          <span className='rounded-md bg-surface-container px-2 py-0.5 font-mono text-on-surface'>{profile.id}</span>
          <span>•</span>
          <span>{t('customer.profile.overview.memberSince')}</span>
        </div>

        <div className='mb-6 flex w-full flex-col gap-2 rounded-xl bg-surface-container-low p-4 text-left'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Icon name='call' className='text-base text-primary' />
              <span className='text-xs font-medium text-on-surface'>{profile.phone}</span>
            </div>
            <span className='rounded bg-secondary-container/50 px-2 py-0.5 text-[11px] font-semibold text-primary'>
              {t('customer.profile.badge.verified')}
            </span>
          </div>

          <div className='flex items-center justify-between'>
            <div className='flex min-w-0 items-center gap-2 pr-2'>
              <Icon name='mail' className='shrink-0 text-base text-primary' />
              <span className='truncate text-xs font-medium text-on-surface' title={profile.email}>
                {profile.email}
              </span>
            </div>
            <span className='shrink-0 rounded bg-secondary-container/50 px-2 py-0.5 text-[11px] font-semibold text-primary'>
              {t('customer.profile.badge.verified')}
            </span>
          </div>

          <div className='flex items-start gap-2 pt-1'>
            <Icon name='location_on' className='mt-0.5 shrink-0 text-base text-primary' />
            <span className='text-xs leading-snug text-on-surface-variant'>{fullAddress}</span>
          </div>
        </div>

        <div className='grid w-full grid-cols-3 gap-2 rounded-xl bg-surface-container-lowest p-2 shadow-sm'>
          <div className='flex flex-col items-center justify-center rounded-lg bg-surface-container-low p-2 text-center'>
            <span className='text-xl font-bold text-primary'>{formattedFamilyCount}</span>
            <span className='mt-1 text-[11px] leading-tight text-on-surface-variant'>
              {t('customer.profile.overview.stats.carePatients')}
            </span>
          </div>

          <div className='flex flex-col items-center justify-center rounded-lg bg-surface-container-low p-2 text-center'>
            <span className='text-xl font-bold text-primary'>{formattedShiftsCount}</span>
            <span className='mt-1 text-[11px] leading-tight text-on-surface-variant'>
              {t('customer.profile.overview.stats.completedShifts')}
            </span>
          </div>

          <div className='flex flex-col items-center justify-center rounded-lg bg-surface-container-low p-2 text-center'>
            <div className='flex items-center gap-0.5 text-amber-500'>
              <span className='text-xl font-bold text-on-surface'>{profile.stats.ratingGiven}</span>
              <Icon name='star' filled className='text-sm' />
            </div>
            <span className='mt-1 text-[11px] leading-tight text-on-surface-variant'>
              {t('customer.profile.overview.stats.sentReviews')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
