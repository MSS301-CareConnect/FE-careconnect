import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import type { Caregiver } from '../types'

const ICON_VERIFIED = 'verified'
const ICON_STAR = 'star'
const ICON_LOCATION = 'location_on'
const ICON_CALENDAR = 'calendar_month'
const BULLET = '•'

const BADGE_ICONS: Record<string, string> = {
  verified100: 'shield',
  topRated: 'military_tech',
  dedicated: 'favorite'
}

interface CaregiverCardProps {
  caregiver: Caregiver
}

export function CaregiverCard({ caregiver }: CaregiverCardProps) {
  const { t } = useTranslation()

  const badgeIcon = BADGE_ICONS[caregiver.badgeSecondary] ?? 'shield'
  const isAmber = caregiver.badgeSecondaryType === 'amber'

  return (
    <article className='flex flex-col gap-4 rounded-2xl bg-surface-container-lowest p-5 shadow-sm transition-all hover:shadow-md md:p-6'>
      <div className='flex flex-col items-start gap-5 sm:flex-row'>
        {/* Avatar Column */}
        <div className='relative mx-auto shrink-0 sm:mx-0'>
          <img
            alt={caregiver.name}
            className='h-24 w-24 rounded-2xl object-cover shadow-xs sm:h-28 sm:w-28'
            src={caregiver.avatarUrl}
          />
          {caregiver.verified ? (
            <div
              className='absolute -right-1.5 -bottom-1.5 flex items-center justify-center rounded-full bg-primary p-1 text-on-primary shadow-sm'
              title={t('customer.caregivers.results.verifiedTooltip')}
            >
              <span className='material-symbols-outlined text-[16px]'>{ICON_VERIFIED}</span>
            </div>
          ) : null}
        </div>

        {/* Info Body */}
        <div className='flex w-full flex-1 flex-col gap-2'>
          <div className='flex flex-col justify-between gap-2 sm:flex-row sm:items-start'>
            <div className='flex flex-wrap items-center gap-2'>
              <h3 className='text-lg font-bold text-on-surface sm:text-xl'>{caregiver.name}</h3>
              <span className='inline-flex items-center rounded-md bg-surface-container-high px-2 py-0.5 text-xs font-semibold text-primary'>
                {t(`customer.caregivers.results.badges.${caregiver.badgePrimary}`)}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold ${
                  isAmber ? 'bg-amber-100 text-amber-900' : 'bg-secondary-container text-on-secondary-container'
                }`}
              >
                <span className='material-symbols-outlined text-[14px]'>{badgeIcon}</span>
                {t(`customer.caregivers.results.badges.${caregiver.badgeSecondary}`)}
              </span>
            </div>

            {/* Rate */}
            <div className='shrink-0 text-left sm:text-right'>
              <span className='text-xl font-extrabold text-primary sm:text-2xl'>{caregiver.hourlyRateFormatted}</span>
              <span className='block text-xs text-on-surface-variant'>
                {t('customer.caregivers.results.perHourSuffix')}{' '}
                {t('customer.caregivers.results.shift8hSuffix', {
                  price: caregiver.shift8hRateFormatted
                })}
              </span>
            </div>
          </div>

          {/* Rating and stats */}
          <div className='mt-0.5 flex flex-wrap items-center gap-2 text-xs text-on-surface-variant sm:text-sm'>
            <div className='flex items-center gap-1 font-bold text-amber-500'>
              <span className='material-symbols-outlined text-[18px]' style={{ fontVariationSettings: "'FILL' 1" }}>
                {ICON_STAR}
              </span>
              <span>{caregiver.rating}</span>
              <span className='font-normal text-on-surface-variant'>
                {t('customer.caregivers.results.reviewsCount', {
                  count: caregiver.reviewsCount
                })}
              </span>
            </div>
            <span className='text-outline-variant'>{BULLET}</span>
            <span className='font-medium text-on-surface'>
              {t('customer.caregivers.results.completedShifts', {
                count: caregiver.completedShifts
              })}
            </span>
            <span className='text-outline-variant'>{BULLET}</span>
            <span>
              {t('customer.caregivers.results.ageGender', {
                gender: t(`customer.caregivers.results.genders.${caregiver.gender}`),
                age: caregiver.age
              })}
            </span>
            <span className='text-outline-variant'>{BULLET}</span>
            <span className='flex items-center gap-1 text-on-surface'>
              <span className='material-symbols-outlined text-[16px] text-outline'>{ICON_LOCATION}</span>
              {caregiver.districts}
            </span>
          </div>

          {/* Experience Bio */}
          <p className='mt-1 text-xs leading-relaxed text-on-surface-variant sm:text-sm'>
            <strong className='font-semibold text-on-surface'>
              {t('customer.caregivers.results.experienceLabel', {
                years: caregiver.experienceYears
              })}
            </strong>{' '}
            {t(`customer.caregivers.results.bios.${caregiver.bioKey}`)}
          </p>

          {/* Skill Badges */}
          <div className='mt-1 flex flex-wrap gap-1.5'>
            {caregiver.skillKeys.map((key) => (
              <span
                key={key}
                className='rounded-lg bg-surface-container px-2.5 py-1 text-xs font-medium text-on-surface'
              >
                {t(`customer.caregivers.results.cardSkills.${key}`)}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Card Bottom Bar */}
      <div className='mt-2 flex flex-col justify-between gap-3 rounded-xl bg-surface-container-low/60 p-3.5 sm:flex-row sm:items-center sm:p-4'>
        <div className='flex items-center gap-2'>
          <span className='relative flex h-2.5 w-2.5'>
            <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-75' />
            <span className='relative inline-flex h-2.5 w-2.5 rounded-full bg-secondary' />
          </span>
          <span className='text-xs font-bold text-secondary sm:text-sm'>
            {t(`customer.caregivers.results.availability.${caregiver.availabilityKey}`)}
          </span>
        </div>
        <div className='flex items-center gap-2 sm:gap-3'>
          <button
            className='rounded-xl bg-surface-container px-4 py-2.5 text-xs font-semibold text-on-surface transition-colors hover:bg-surface-container-high sm:text-sm'
            type='button'
          >
            {t('customer.caregivers.results.viewDetail')}
          </button>
          <Link
            className='flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-on-primary shadow-sm transition-colors hover:bg-primary-container sm:text-sm'
            to='/customer/booking'
          >
            <span className='material-symbols-outlined text-[18px]'>{ICON_CALENDAR}</span>
            <span>{t('customer.caregivers.results.bookNow')}</span>
          </Link>
        </div>
      </div>
    </article>
  )
}
