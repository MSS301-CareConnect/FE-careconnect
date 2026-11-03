import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import type { ProviderCaregiverCardRecord } from '~/shared/api/generated/contracts'
import { Avatar } from '~/shared/ui/avatar'
import { Icon } from '~/shared/ui/icon'
import { Rating, VerifiedBadge } from '~/shared/ui/rating'

const key = 'customer.provider' as const

/**
 * Caregiver card: photo or coloured initials (never an empty block), name, verified badge, experience, rating or
 * "New", then "View profile" and "Book" with this caregiver preselected. The whole card opens the profile.
 */
export function CaregiverCard({ person, showCenter }: { person: ProviderCaregiverCardRecord; showCenter: boolean }) {
  const { t } = useTranslation()
  const profile = `/customer/caregivers/${person.caregiverId}`

  return (
    <article className='cc-lift group relative flex flex-col rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-[var(--shadow-card)] hover:border-brand-200'>
      <div className='flex items-start gap-4'>
        <Avatar
          className='h-16 w-16 rounded-full text-lg ring-4 ring-brand-50'
          decorative
          name={person.fullName}
          src={person.avatarUrl}
        />
        <div className='min-w-0 flex-1'>
          <h2 className='text-lg leading-snug font-semibold text-on-surface'>
            <Link
              className='rounded after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
              to={profile}
            >
              {person.fullName}
            </Link>
          </h2>
          <div className='mt-1.5 flex flex-wrap items-center gap-2'>
            {person.verifiedCertificateCount > 0 ? <VerifiedBadge /> : null}
            <Rating average={person.ratingAverage} count={person.ratingCount} />
          </div>
        </div>
      </div>
      <ul className='mt-4 flex flex-col gap-1.5 text-sm text-on-surface-variant'>
        {person.experienceYears !== undefined ? (
          <li className='flex items-center gap-2'>
            <Icon className='text-lg text-primary' name='work_history' />
            {t(`${key}.list.years`, { count: person.experienceYears })}
          </li>
        ) : null}
        {showCenter && person.centerName ? (
          <li className='flex items-center gap-2'>
            <Icon className='text-lg text-primary' name='home_health' />
            <span className='truncate'>{person.centerName}</span>
          </li>
        ) : null}
      </ul>
      {person.bio ? <p className='mt-3 line-clamp-2 text-sm leading-6 text-on-surface-variant'>{person.bio}</p> : null}
      <div className='mt-auto pt-5'>
        <div className='flex items-center justify-between gap-3 border-t border-outline-variant pt-4'>
          <span aria-hidden='true' className='text-sm font-medium text-primary group-hover:underline'>
            {t(`${key}.list.viewProfile`)}
          </span>
          <Link
            aria-label={t(`${key}.list.bookWith`, { name: person.fullName })}
            className='relative z-10 inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-on-primary transition-[background-color,transform] hover:bg-primary-container active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
            to={`/customer/booking?caregiver=${person.caregiverId}`}
          >
            <Icon className='text-lg' name='event_available' />
            {t(`${key}.list.book`)}
          </Link>
        </div>
      </div>
    </article>
  )
}
