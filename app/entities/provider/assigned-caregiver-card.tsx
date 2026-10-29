import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Icon } from '~/shared/ui/icon'

import { fetchPublicCaregiver, providerKeys } from './provider-api'

/**
 * Who the center assigned to the booking, from the public caregiver profile (no internal fields).
 * The family sees this before paying, so a missing assignment says when it will appear.
 */
export function AssignedCaregiverCard({
  caregiverId,
  profileHref
}: {
  caregiverId: string | undefined
  profileHref?: string
}) {
  const { t, i18n } = useTranslation()
  const profile = useQuery({
    queryKey: providerKeys.publicCaregiver(caregiverId ?? ''),
    queryFn: () => fetchPublicCaregiver(caregiverId ?? ''),
    enabled: Boolean(caregiverId),
    retry: false,
    staleTime: 5 * 60_000
  })
  const rating = new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 1, minimumFractionDigits: 1 })

  return (
    <section aria-labelledby='assigned-caregiver-title' className='flex flex-col gap-3 text-sm'>
      <h3 className='text-base font-bold text-on-surface' id='assigned-caregiver-title'>
        {t('booking.caregiver.title')}
      </h3>
      {!caregiverId ? <p className='text-on-surface-variant'>{t('booking.caregiver.pending')}</p> : null}
      {caregiverId && profile.isPending ? (
        <p className='text-on-surface-variant' role='status'>
          {t('booking.caregiver.loading')}
        </p>
      ) : null}
      {profile.isError ? <p className='text-on-surface-variant'>{t('booking.caregiver.unavailable')}</p> : null}
      {profile.data ? (
        <div className='flex items-center gap-3'>
          {profile.data.avatarUrl ? (
            <img
              alt={t('booking.caregiver.photo', { name: profile.data.fullName })}
              className='h-14 w-14 shrink-0 rounded-full object-cover'
              src={profile.data.avatarUrl}
            />
          ) : (
            <span
              aria-hidden='true'
              className='grid h-14 w-14 shrink-0 place-items-center rounded-full bg-secondary-container text-lg font-bold text-primary'
            >
              {profile.data.fullName.trim().charAt(0).toUpperCase()}
            </span>
          )}
          <div className='min-w-0'>
            <p className='text-base font-bold text-on-surface'>{profile.data.fullName}</p>
            <p className='text-on-surface-variant'>
              {profile.data.experienceYears !== undefined
                ? t('booking.caregiver.experience', { count: profile.data.experienceYears })
                : null}
            </p>
            <p className='flex items-center gap-1 text-on-surface-variant tabular-nums'>
              <Icon className='text-base text-primary' filled name='star' />
              {profile.data.ratingCount
                ? t('booking.caregiver.rating', {
                    rating: rating.format(profile.data.ratingAverage ?? 0),
                    count: profile.data.ratingCount
                  })
                : t('booking.caregiver.noRating')}
            </p>
          </div>
          {profileHref ? (
            <Link
              aria-label={t('booking.caregiver.viewProfile', { name: profile.data.fullName })}
              className='ml-auto grid min-h-11 min-w-11 place-items-center rounded-lg text-primary hover:bg-secondary-container focus-visible:outline-2 focus-visible:outline-primary'
              to={profileHref}
            >
              <Icon name='chevron_right' />
            </Link>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
