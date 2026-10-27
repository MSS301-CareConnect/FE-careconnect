import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import type { ProviderCaregiverCardRecord } from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'

const key = 'customer.serviceDetail' as const

type Props = {
  items: ProviderCaregiverCardRecord[] | undefined
  total: number | undefined
  isPending: boolean
  isError: boolean
}

function CaregiverItem({ person }: { person: ProviderCaregiverCardRecord }) {
  const { t, i18n } = useTranslation()
  const number = new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 1 })
  return (
    <li className='group flex items-center gap-4 rounded-xl border border-[#e2e9e1] p-4 transition-colors hover:border-[#a8c2ad]'>
      {person.avatarUrl ? (
        <img
          alt={t(`${key}.caregivers.avatar`, { name: person.fullName })}
          className='h-14 w-14 shrink-0 rounded-xl object-cover'
          src={person.avatarUrl}
        />
      ) : (
        <span
          aria-hidden='true'
          className='grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-[#e8f0e8] text-[#075b31]'
        >
          <Icon className='text-3xl' name='person' />
        </span>
      )}
      <div className='min-w-0 flex-1'>
        <h3 className='truncate font-bold text-[#1b2922]'>{person.fullName}</h3>
        <p className='mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-[#637469]'>
          {person.experienceYears !== undefined ? (
            <span>{t(`${key}.caregivers.experience`, { years: person.experienceYears })}</span>
          ) : null}
          {person.ratingAverage !== undefined && person.ratingCount ? (
            <span className='inline-flex items-center gap-0.5'>
              <Icon className='text-base text-[#a06a12]' filled name='star' />
              {number.format(person.ratingAverage)}
            </span>
          ) : null}
          <span className='inline-flex items-center gap-0.5'>
            <Icon className='text-base text-[#075b31]' name='verified' />
            {t(`${key}.caregivers.certificates`, { count: person.verifiedCertificateCount })}
          </span>
        </p>
      </div>
      <Link
        className='inline-flex shrink-0 items-center gap-1 text-sm font-bold text-[#075b31] hover:text-[#043b20] focus-visible:outline-2 focus-visible:outline-[#075b31]'
        to={`/customer/caregivers/${person.caregiverId}`}
      >
        {t(`${key}.caregivers.viewProfile`)}
        <Icon className='text-lg transition-transform group-hover:translate-x-0.5' name='arrow_forward' />
      </Link>
    </li>
  )
}

/** The center's caregivers who provide this service; empty means the center assigns one later. */
export function ServiceCaregivers({ items, total, isPending, isError }: Props) {
  const { t } = useTranslation()
  return (
    <section className='rounded-2xl border border-[#dbe4db] bg-white p-6 sm:p-7'>
      <div className='flex flex-wrap items-end justify-between gap-3'>
        <div>
          <h2 className='flex items-center gap-2 text-lg font-bold tracking-[-0.02em] text-[#1b2922]'>
            <Icon className='text-xl text-[#075b31]' name='diversity_1' />
            {t(`${key}.caregivers.title`)}
          </h2>
          {total ? (
            <p className='mt-1 text-sm text-[#617267]'>{t(`${key}.caregivers.count`, { count: total })}</p>
          ) : null}
        </div>
        {total && items && total > items.length ? (
          <Link
            className='text-sm font-bold text-[#075b31] underline-offset-4 hover:underline'
            to='/customer/caregivers'
          >
            {t(`${key}.caregivers.viewAll`)}
          </Link>
        ) : null}
      </div>
      {isPending ? (
        <p className='mt-5 text-sm text-[#526a57]' role='status'>
          {t(`${key}.caregivers.loading`)}
        </p>
      ) : null}
      {isError ? (
        <p className='mt-5 text-sm text-[#ba1a1a]' role='alert'>
          {t(`${key}.caregivers.error`)}
        </p>
      ) : null}
      {items && items.length === 0 ? (
        <p className='mt-5 rounded-xl bg-[#f5f9f4] p-4 text-sm text-[#526a57]'>{t(`${key}.caregivers.empty`)}</p>
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
