import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import type { ProviderCaregiverPublicRecord } from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'

const key = 'customer.provider' as const

type Profile = ProviderCaregiverPublicRecord

function formatDate(value: string, language: string) {
  return new Intl.DateTimeFormat(language, { dateStyle: 'medium' }).format(new Date(`${value}T00:00:00`))
}

export function DetailSection({ icon, title, children }: { icon: string; title: string; children: ReactNode }) {
  return (
    <section className='rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-6 shadow-xs sm:p-7'>
      <h2 className='flex items-center gap-2 text-lg font-bold tracking-[-0.02em] text-on-surface'>
        <Icon className='text-xl text-primary' name={icon} />
        {title}
      </h2>
      <div className='mt-4'>{children}</div>
    </section>
  )
}

function Stat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className='rounded-xl bg-surface-container-low px-4 py-3'>
      <dt className='flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-on-surface-variant'>
        <Icon className='text-base text-primary' name={icon} />
        {label}
      </dt>
      <dd className='mt-1 font-bold text-on-surface tabular-nums'>{value}</dd>
    </div>
  )
}

/** Photo, name, center and the headline numbers a family compares first. */
export function CaregiverDetailHero({ profile }: { profile: Profile }) {
  const { t, i18n } = useTranslation()
  const number = new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 1 })
  const rating =
    profile.ratingAverage === undefined || !profile.ratingCount
      ? t(`${key}.detail.noRating`)
      : `${number.format(profile.ratingAverage)}${t(`${key}.reviews`, { count: profile.ratingCount })}`

  return (
    <section className='rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-6 shadow-xs sm:p-8'>
      <div className='flex flex-col gap-6 sm:flex-row sm:items-start'>
        {profile.avatarUrl ? (
          <img
            alt={t(`${key}.detail.avatar`, { name: profile.fullName })}
            className='h-28 w-28 shrink-0 rounded-2xl object-cover sm:h-32 sm:w-32'
            src={profile.avatarUrl}
          />
        ) : (
          <div
            aria-hidden='true'
            className='grid h-28 w-28 shrink-0 place-items-center rounded-2xl bg-primary-fixed text-primary sm:h-32 sm:w-32'
          >
            <Icon className='text-6xl' name='person' />
          </div>
        )}
        <div className='min-w-0 flex-1'>
          <p className='text-xs font-bold uppercase tracking-[0.16em] text-primary'>{t(`${key}.detail.badge`)}</p>
          <div className='mt-2 flex flex-wrap items-center gap-x-3 gap-y-2'>
            <h1 className='text-3xl font-bold tracking-[-0.04em] text-on-surface sm:text-4xl'>{profile.fullName}</h1>
            <span className='inline-flex items-center gap-1 rounded-md bg-primary-fixed px-2 py-1 text-xs font-bold text-primary'>
              <Icon className='text-sm' name='verified' />
              {t(`${key}.verified`)}
            </span>
          </div>
          {profile.centerName ? (
            <p className='mt-3 flex items-center gap-1.5 text-sm text-on-surface-variant'>
              <Icon className='text-base text-primary' name='home_health' />
              {profile.centerName}
            </p>
          ) : null}
        </div>
      </div>
      <dl className='mt-6 grid gap-3 border-t border-outline-variant/40 pt-6 sm:grid-cols-3'>
        <Stat
          icon='workspace_premium'
          label={t(`${key}.detail.experience`)}
          value={t(`${key}.experienceValue`, { years: number.format(profile.experienceYears ?? 0) })}
        />
        <Stat icon='star' label={t(`${key}.detail.rating`)} value={rating} />
        {profile.gender ? (
          <Stat icon='person' label={t(`${key}.detail.gender`)} value={t(`${key}.genders.${profile.gender}`)} />
        ) : null}
      </dl>
    </section>
  )
}

export function CaregiverServices({ services }: { services: Profile['services'] }) {
  const { t } = useTranslation()
  if (!services?.length) return <p className='text-sm text-on-surface-variant'>{t(`${key}.detail.servicesEmpty`)}</p>
  return (
    <ul className='flex flex-wrap gap-2'>
      {services.map((service) => (
        <li
          className='inline-flex items-center gap-1.5 rounded-xl border border-outline-variant/60 bg-surface-container-low px-3 py-2 text-sm font-semibold text-on-surface'
          key={service.careServiceId ?? service.serviceName}
        >
          <Icon className='text-base text-primary' name='medical_services' />
          {service.serviceName}
        </li>
      ))}
    </ul>
  )
}

export function CaregiverCertificates({ certificates }: { certificates: Profile['certificates'] }) {
  const { t, i18n } = useTranslation()
  if (!certificates?.length) return <p className='text-sm text-on-surface-variant'>{t(`${key}.certificatesEmpty`)}</p>
  return (
    <ul className='grid gap-3 sm:grid-cols-2'>
      {certificates.map((item, index) => (
        <li
          className='flex items-start gap-3 rounded-xl border border-outline-variant/60 p-4'
          key={`${item.certificateName}-${index}`}
        >
          <span className='grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary-fixed text-primary'>
            <Icon className='text-xl' name='workspace_premium' />
          </span>
          <div className='min-w-0'>
            <p className='font-bold text-on-surface'>{item.certificateName}</p>
            {item.issuedBy ? (
              <p className='mt-0.5 text-sm text-on-surface-variant'>
                {t(`${key}.detail.issuedBy`, { issuer: item.issuedBy })}
              </p>
            ) : null}
            <p className='mt-1 text-xs text-outline tabular-nums'>
              {item.issuedDate ? t(`${key}.detail.issued`, { date: formatDate(item.issuedDate, i18n.language) }) : null}
              {item.issuedDate ? ' · ' : null}
              {item.expiryDate
                ? t(`${key}.detail.expires`, { date: formatDate(item.expiryDate, i18n.language) })
                : t(`${key}.detail.noExpiry`)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}

/** Booking keeps this caregiver and their center preselected. */
export function CaregiverBookingCard({ profile }: { profile: Profile }) {
  const { t } = useTranslation()
  const params = new URLSearchParams({ caregiver: profile.caregiverId })
  if (profile.centerId) params.set('center', profile.centerId)
  return (
    <aside className='rounded-2xl border border-outline-variant/60 bg-surface-container-low p-6 shadow-xs lg:sticky lg:top-24'>
      <h2 className='text-lg font-bold tracking-[-0.02em] text-on-surface'>{t(`${key}.detail.bookTitle`)}</h2>
      {profile.centerName ? (
        <p className='mt-3 flex items-center gap-1.5 text-sm text-on-surface-variant'>
          <Icon className='text-base text-primary' name='home_health' />
          {profile.centerName}
        </p>
      ) : null}
      <p className='mt-3 text-sm leading-6 text-on-surface-variant'>{t(`${key}.detail.bookHint`)}</p>
      <Link
        className='mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-on-primary shadow-xs transition-colors hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
        to={`/customer/booking?${params.toString()}`}
      >
        <Icon className='text-lg' name='calendar_add_on' />
        {t(`${key}.book`)}
      </Link>
    </aside>
  )
}
