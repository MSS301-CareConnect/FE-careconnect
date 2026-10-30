import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { fetchProviderMedia, providerKeys } from '~/entities/provider/provider-api'
import type { ProviderCaregiverPublicRecord, ProviderCertificateRecord } from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'

const key = 'customer.provider' as const

type Profile = ProviderCaregiverPublicRecord

function formatDate(value: string, language: string) {
  return new Intl.DateTimeFormat(language, { dateStyle: 'medium' }).format(new Date(`${value}T00:00:00`))
}

export function DetailSection({ icon, title, children }: { icon: string; title: string; children: ReactNode }) {
  return (
    <section className='rounded-[1.75rem] border border-outline-variant/60 bg-surface-container-lowest p-6 sm:p-8'>
      <h2 className='flex items-center gap-3 text-xl font-bold tracking-[-0.03em] text-on-surface'>
        <span className='grid size-10 place-items-center rounded-xl bg-primary-fixed text-primary'>
          <Icon className='text-xl' name={icon} />
        </span>
        {title}
      </h2>
      <div className='mt-6'>{children}</div>
    </section>
  )
}

function Stat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className='min-w-0 flex-1 border-outline-variant/50 py-4 sm:py-0 sm:pl-5 sm:not-first:border-l'>
      <dt className='flex items-center gap-2 text-sm font-medium text-on-surface-variant'>
        <Icon aria-hidden='true' className='text-xl text-primary' name={icon} />
        {label}
      </dt>
      <dd className='mt-2 text-lg font-bold tracking-[-0.02em] text-on-surface tabular-nums'>{value}</dd>
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
    <section className='overflow-hidden rounded-[2rem] border border-outline-variant/60 bg-surface-container-lowest'>
      <div className='grid md:grid-cols-[minmax(14rem,38%)_minmax(0,1fr)]'>
        <div className='relative min-h-72 overflow-hidden bg-primary-fixed md:min-h-[21rem]'>
          {profile.avatarUrl ? (
            <img
              alt={t(`${key}.detail.avatar`, { name: profile.fullName })}
              className='absolute inset-0 h-full w-full object-cover object-center'
              src={profile.avatarUrl}
            />
          ) : (
            <div aria-hidden='true' className='absolute inset-0 grid place-items-center overflow-hidden text-primary'>
              <div className='absolute -bottom-28 -left-20 size-64 rounded-full border-[3rem] border-primary/10' />
              <div className='absolute -right-20 -top-24 size-64 rounded-full border-[3rem] border-primary/10' />
              <span className='relative text-[clamp(6rem,14vw,11rem)] font-semibold leading-none tracking-[-0.1em]'>
                {profile.fullName.trim().charAt(0).toLocaleUpperCase(i18n.language)}
              </span>
            </div>
          )}
        </div>
        <div className='flex min-w-0 flex-col justify-center px-6 py-8 sm:px-9 md:py-10'>
          <p className='text-xs font-bold uppercase tracking-[0.16em] text-primary'>{t(`${key}.detail.badge`)}</p>
          <h1 className='mt-3 text-[clamp(2.4rem,4vw,4rem)] font-bold leading-[1.05] tracking-[-0.055em] text-on-surface'>
            {profile.fullName}
          </h1>
          <span className='mt-5 inline-flex w-fit items-center gap-2 rounded-lg bg-primary-fixed px-3 py-2 text-sm font-bold text-primary'>
            <Icon aria-hidden='true' className='text-lg' name='verified' />
            {t(`${key}.verified`)}
          </span>
          {profile.centerName ? (
            <p className='mt-6 flex items-center gap-2 text-base font-medium text-on-surface-variant'>
              <Icon aria-hidden='true' className='text-xl text-primary' name='home_health' />
              {profile.centerName}
            </p>
          ) : null}
          {profile.bio?.trim() ? (
            <p className='mt-5 max-w-[56ch] text-sm leading-7 text-on-surface-variant sm:text-base'>
              {profile.bio.trim()}
            </p>
          ) : null}
        </div>
      </div>
      <dl className='flex flex-col divide-y divide-outline-variant/50 border-t border-outline-variant/50 px-6 sm:flex-row sm:divide-y-0 sm:px-4 sm:py-6'>
        {profile.experienceYears !== undefined ? (
          <Stat
            icon='workspace_premium'
            label={t(`${key}.detail.experience`)}
            value={t(`${key}.experienceValue`, { years: number.format(profile.experienceYears) })}
          />
        ) : null}
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
    <ul className='grid gap-2'>
      {services.map((service) => (
        <li
          className='flex items-center gap-3 rounded-xl bg-surface-container-low px-4 py-3.5 text-sm font-semibold text-on-surface'
          key={service.careServiceId ?? service.serviceName}
        >
          <Icon aria-hidden='true' className='text-xl text-primary' name='check_circle' />
          {service.serviceName}
        </li>
      ))}
    </ul>
  )
}

type PublicCertificate = NonNullable<Profile['certificates']>[number]
type CertificateMediaState = 'guest' | 'loading' | 'error' | 'ready'

function CertificateCard({
  item,
  certificateId,
  mediaState
}: {
  item: PublicCertificate
  certificateId?: string
  mediaState: CertificateMediaState
}) {
  const { t, i18n } = useTranslation()
  const media = useQuery({
    queryKey: providerKeys.media('CERTIFICATE', certificateId ?? ''),
    queryFn: () => fetchProviderMedia('CERTIFICATE', certificateId ?? ''),
    enabled: Boolean(certificateId),
    retry: false
  })
  const previews =
    media.data?.filter(
      (file) =>
        file.downloadUrl &&
        (file.mediaFileType === 'IMAGE' ||
          file.contentType?.startsWith('image/') ||
          file.contentType === 'application/pdf')
    ) ?? []
  const previewStatus =
    mediaState === 'error' || media.isError
      ? t(`${key}.detail.certificateMediaError`)
      : mediaState === 'loading' || (certificateId && media.isPending)
        ? t(`${key}.detail.certificateMediaLoading`)
        : media.isSuccess && previews.length === 0
          ? t(`${key}.detail.certificateMediaEmpty`)
          : null

  return (
    <li className='min-w-0 overflow-hidden rounded-2xl border border-outline-variant/60 bg-surface-container-lowest'>
      {previews.length ? (
        <div className='grid gap-2 bg-surface-container-low p-3'>
          {previews.map((file) => (
            <div
              className='flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-white'
              key={file.mediaFileId}
            >
              {file.contentType === 'application/pdf' ? (
                <iframe
                  className='h-full w-full border-0'
                  loading='lazy'
                  src={file.downloadUrl}
                  title={t(`${key}.detail.certificatePreview`, {
                    name: item.certificateName ?? t(`${key}.certificates`)
                  })}
                />
              ) : (
                <img
                  alt={item.certificateName ?? t(`${key}.certificates`)}
                  className='h-full w-full object-contain'
                  loading='lazy'
                  src={file.downloadUrl}
                />
              )}
            </div>
          ))}
        </div>
      ) : null}
      {previewStatus ? <p className='px-4 pt-4 text-sm text-on-surface-variant sm:px-5'>{previewStatus}</p> : null}
      <div className='flex items-start gap-3 p-4 sm:p-5'>
        <span className='grid size-10 shrink-0 place-items-center rounded-xl bg-primary-fixed text-primary'>
          <Icon aria-hidden='true' className='text-xl' name='workspace_premium' />
        </span>
        <div className='min-w-0'>
          <p className='font-bold leading-6 text-on-surface'>{item.certificateName}</p>
          {item.issuedBy ? (
            <p className='mt-0.5 text-sm text-on-surface-variant'>
              {t(`${key}.detail.issuedBy`, { issuer: item.issuedBy })}
            </p>
          ) : null}
          <p className='mt-2 text-xs leading-5 text-on-surface-variant tabular-nums'>
            {item.issuedDate ? t(`${key}.detail.issued`, { date: formatDate(item.issuedDate, i18n.language) }) : null}
            {item.issuedDate ? ' · ' : null}
            {item.expiryDate
              ? t(`${key}.detail.expires`, { date: formatDate(item.expiryDate, i18n.language) })
              : t(`${key}.detail.noExpiry`)}
          </p>
        </div>
      </div>
    </li>
  )
}

export function CaregiverCertificates({
  certificates,
  verifiedCertificates,
  mediaState
}: {
  certificates: Profile['certificates']
  verifiedCertificates?: ProviderCertificateRecord[]
  mediaState: CertificateMediaState
}) {
  const { t } = useTranslation()
  const items: { item: PublicCertificate; certificateId?: string; key: string }[] =
    mediaState === 'ready' && verifiedCertificates?.length
      ? verifiedCertificates.map((item) => ({ item, certificateId: item.id, key: item.id }))
      : (certificates ?? []).map((item, index) => ({ item, key: `${item.certificateName}-${index}` }))
  if (!items.length) return <p className='text-sm text-on-surface-variant'>{t(`${key}.certificatesEmpty`)}</p>
  return (
    <ul className='grid gap-4 sm:grid-cols-2'>
      {items.map(({ item, certificateId, key: itemKey }) => (
        <CertificateCard certificateId={certificateId} item={item} key={itemKey} mediaState={mediaState} />
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
    <aside className='rounded-[1.75rem] bg-primary p-6 text-on-primary lg:sticky lg:top-24 lg:p-7'>
      <span className='grid size-11 place-items-center rounded-xl bg-on-primary/15'>
        <Icon aria-hidden='true' className='text-2xl' name='calendar_month' />
      </span>
      <h2 className='mt-5 text-xl font-bold tracking-[-0.03em]'>{t(`${key}.detail.bookTitle`)}</h2>
      {profile.centerName ? (
        <p className='mt-4 flex items-center gap-2 text-sm font-medium text-on-primary/85'>
          <Icon aria-hidden='true' className='text-lg' name='home_health' />
          {profile.centerName}
        </p>
      ) : null}
      <p className='mt-4 border-t border-on-primary/20 pt-4 text-sm leading-6 text-on-primary/85'>
        {t(`${key}.detail.bookHint`)}
      </p>
      <Link
        className='mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-on-primary px-4 py-3 text-sm font-bold text-primary transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-primary-fixed active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-primary'
        to={`/customer/booking?${params.toString()}`}
      >
        <Icon className='text-lg' name='calendar_add_on' />
        {t(`${key}.book`)}
      </Link>
    </aside>
  )
}
