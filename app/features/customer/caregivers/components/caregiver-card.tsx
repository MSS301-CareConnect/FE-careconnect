import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { bentoCard, peachPillSm, softChip } from '~/features/customer/ui/bento-styles'
import type { ProviderCaregiverCardRecord } from '~/shared/api/generated/contracts'
import { Avatar } from '~/shared/ui/avatar'
import { Icon } from '~/shared/ui/icon'
import { Rating, VerifiedBadge } from '~/shared/ui/rating'

const key = 'customer.provider' as const

/**
 * Caregiver card ("Soft Bento", 2026-11-09): a mint band behind the photo or coloured initials (never an empty block),
 * name, verified badge and rating, experience and center as chips, the bio, then "View profile" and a peach "Book"
 * with this caregiver preselected. The whole card opens the profile.
 */
export function CaregiverCard({ person, showCenter }: { person: ProviderCaregiverCardRecord; showCenter: boolean }) {
  const { t } = useTranslation()
  const profile = `/customer/caregivers/${person.caregiverId}`

  return (
    <article className={`cc-lift group relative flex flex-col overflow-hidden ${bentoCard} hover:border-mint-200`}>
      <div
        aria-hidden='true'
        className='h-20 bg-[radial-gradient(120%_140%_at_0%_0%,var(--color-mint-200),transparent_60%),radial-gradient(120%_140%_at_100%_0%,var(--color-peach-100),transparent_60%)] bg-mint-50'
      />
      <div className='-mt-10 flex flex-1 flex-col px-5 pb-5'>
        <div className='flex items-end justify-between gap-3'>
          <Avatar
            className='h-20 w-20 rounded-full text-xl ring-4 ring-white shadow-[var(--shadow-soft)]'
            decorative
            name={person.fullName}
            src={person.avatarUrl}
          />
          <div className='mb-1 flex flex-wrap justify-end gap-1.5'>
            {person.verifiedCertificateCount > 0 ? <VerifiedBadge /> : null}
          </div>
        </div>
        <h2 className='mt-3 text-lg leading-snug font-bold tracking-tight text-forest-950'>
          <Link
            className='rounded after:absolute after:inset-0 after:rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-900'
            to={profile}
          >
            {person.fullName}
          </Link>
        </h2>
        <div className='mt-2 flex flex-wrap items-center gap-1.5'>
          <Rating average={person.ratingAverage} count={person.ratingCount} />
          {person.experienceYears !== undefined ? (
            <span className={softChip}>
              <Icon className='text-sm' name='work_history' />
              {t(`${key}.list.years`, { count: person.experienceYears })}
            </span>
          ) : null}
          {showCenter && person.centerName ? (
            <span className={`${softChip} max-w-full`}>
              <Icon aria-hidden='true' className='text-sm' name='home_health' />
              <span className='truncate'>{person.centerName}</span>
            </span>
          ) : null}
        </div>
        {person.bio ? (
          <p className='mt-3 line-clamp-2 text-sm leading-6 text-on-surface-variant'>{person.bio}</p>
        ) : null}
        <div className='mt-auto flex items-center justify-between gap-3 pt-5'>
          <span
            aria-hidden='true'
            className='inline-flex items-center gap-1 text-sm font-semibold text-forest-800 transition-[gap] group-hover:gap-2'
          >
            {t(`${key}.list.viewProfile`)}
            <Icon className='text-base' name='arrow_forward' />
          </span>
          <Link
            aria-label={t(`${key}.list.bookWith`, { name: person.fullName })}
            className={`relative z-10 ${peachPillSm}`}
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
