import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import type { ProviderCaregiverCardRecord } from '~/shared/api/generated/contracts'
import { Avatar } from '~/shared/ui/avatar'
import { Icon } from '~/shared/ui/icon'
import { Rating, VerifiedBadge } from '~/shared/ui/rating'

const key = 'customer.serviceDetail' as const

type Props = {
  items: ProviderCaregiverCardRecord[] | undefined
  total: number | undefined
  isPending: boolean
  isError: boolean
}

/** Photo or coloured initials, name, experience, rating or "New", and the verified badge only when it applies. */
function CaregiverItem({ person }: { person: ProviderCaregiverCardRecord }) {
  const { t } = useTranslation()
  return (
    <li className='cc-lift group relative flex items-center gap-4 rounded-xl border border-outline-variant p-4 hover:border-brand-200'>
      <Avatar
        alt={t(`${key}.caregivers.avatar`, { name: person.fullName })}
        className='h-14 w-14 rounded-full text-base'
        name={person.fullName}
        src={person.avatarUrl}
      />
      <div className='min-w-0 flex-1'>
        <h3 className='truncate font-semibold text-on-surface'>
          <Link
            className='rounded after:absolute after:inset-0 after:rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
            to={`/customer/caregivers/${person.caregiverId}`}
          >
            {person.fullName}
          </Link>
        </h3>
        <p className='mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-on-surface-variant tabular-nums'>
          {person.experienceYears !== undefined ? (
            <span>{t(`${key}.caregivers.experience`, { years: person.experienceYears })}</span>
          ) : null}
          <Rating average={person.ratingAverage} count={person.ratingCount} />
          {person.verifiedCertificateCount > 0 ? <VerifiedBadge /> : null}
        </p>
      </div>
      <Icon
        aria-hidden='true'
        className='shrink-0 text-xl text-primary transition-transform group-hover:translate-x-0.5'
        name='arrow_forward'
      />
    </li>
  )
}

/** The center's caregivers who provide this service; empty means the center assigns one later. */
export function ServiceCaregivers({ items, total, isPending, isError }: Props) {
  const { t } = useTranslation()
  return (
    <section className='rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-[var(--shadow-card)] sm:p-7'>
      <div className='flex flex-wrap items-end justify-between gap-3'>
        <div>
          <h2 className='flex items-center gap-2 text-lg font-bold tracking-[-0.02em] text-on-surface'>
            <Icon className='text-xl text-primary' name='diversity_1' />
            {t(`${key}.caregivers.title`)}
          </h2>
          {total ? (
            <p className='mt-1 text-sm text-on-surface-variant'>{t(`${key}.caregivers.count`, { count: total })}</p>
          ) : null}
        </div>
        {total && items && total > items.length ? (
          <Link className='text-sm font-bold text-primary underline-offset-4 hover:underline' to='/customer/caregivers'>
            {t(`${key}.caregivers.viewAll`)}
          </Link>
        ) : null}
      </div>
      {isPending ? (
        <p className='mt-5 text-sm text-on-surface-variant' role='status'>
          {t(`${key}.caregivers.loading`)}
        </p>
      ) : null}
      {isError ? (
        <p className='mt-5 text-sm text-error' role='alert'>
          {t(`${key}.caregivers.error`)}
        </p>
      ) : null}
      {items && items.length === 0 ? (
        <p className='mt-5 rounded-xl bg-surface-container-low p-4 text-sm text-on-surface-variant'>
          {t(`${key}.caregivers.empty`)}
        </p>
      ) : null}
      {items && items.length > 0 ? (
        <ul className='mt-5 grid gap-3 xl:grid-cols-2'>
          {items.map((person) => (
            <CaregiverItem key={person.caregiverId} person={person} />
          ))}
        </ul>
      ) : null}
    </section>
  )
}
