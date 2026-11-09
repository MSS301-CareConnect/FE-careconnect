import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { fetchProviderMedia, providerKeys } from '~/entities/provider/provider-api'
import { peachPill } from '~/features/customer/ui/bento-styles'
import type { ProviderCaregiverPublicRecord, ProviderCertificateRecord } from '~/shared/api/generated/contracts'
import { formatCalendarDate } from '~/shared/lib/format'
import { Avatar } from '~/shared/ui/avatar'
import { Icon } from '~/shared/ui/icon'
import { ViewableImage } from '~/shared/ui/image-viewer'
import { Rating } from '~/shared/ui/rating'

const key = 'customer.provider' as const

type Profile = ProviderCaregiverPublicRecord

/** dd/mm/yyyy, the same everywhere in the customer portal; the language does not change the order. */
function formatDate(value: string) {
  return formatCalendarDate(value)
}

export function DetailSection({ icon, title, children }: { icon: string; title: string; children: ReactNode }) {
  return (
    <section className='rounded-3xl border border-forest-900/[0.06] bg-white p-6 shadow-[var(--shadow-card)] sm:p-7'>
      <h2 className='flex items-center gap-3 text-lg font-bold tracking-tight text-forest-950'>
        <span className='grid size-10 place-items-center rounded-2xl bg-mint-100 text-forest-800'>
          <Icon className='text-xl' name={icon} />
        </span>
        {title}
      </h2>
      <div className='mt-6'>{children}</div>
    </section>
  )
}

/**
 * Forest hero ("Soft Bento", 2026-11-09): photo (or coloured initials), name, badges and the center on a deep forest
 * banner with soft glows, then four fact tiles a family compares first, then the bio.
 */
export function CaregiverDetailHero({ profile }: { profile: Profile }) {
  const { t, i18n } = useTranslation()
  const number = new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 1 })
  const rated = Boolean(profile.ratingAverage && profile.ratingCount)
  const stats = [
    {
      icon: 'work_history',
      label: t(`${key}.detail.stats.years`),
      value: profile.experienceYears !== undefined ? number.format(profile.experienceYears) : '—'
    },
    {
      icon: 'star',
      label: t(`${key}.detail.stats.rating`),
      value: rated ? number.format(profile.ratingAverage ?? 0) : t(`${key}.detail.stats.ratingNew`)
    },
    {
      icon: 'verified',
      label: t(`${key}.detail.stats.certificates`),
      value: String(profile.certificates?.length ?? 0)
    },
    { icon: 'medical_services', label: t(`${key}.detail.stats.services`), value: String(profile.services?.length ?? 0) }
  ]

  return (
    <section className='overflow-hidden rounded-3xl border border-forest-900/[0.06] bg-white shadow-[var(--shadow-card)]'>
      <div className='relative isolate overflow-hidden bg-forest-900 px-6 pt-7 pb-6 text-white sm:px-8 sm:pt-8'>
        <span
          aria-hidden='true'
          className='pointer-events-none absolute -top-24 -right-16 -z-10 h-64 w-64 rounded-full bg-mint-400/25 blur-3xl'
        />
        <span
          aria-hidden='true'
          className='pointer-events-none absolute -bottom-28 left-10 -z-10 h-56 w-56 rounded-full bg-peach-300/20 blur-3xl'
        />
        <div className='flex flex-col gap-5 sm:flex-row sm:items-center'>
          <Avatar
            alt={t(`${key}.detail.avatar`, { name: profile.fullName })}
            className='h-24 w-24 rounded-full text-2xl ring-4 ring-white/15 sm:h-28 sm:w-28'
            name={profile.fullName}
            src={profile.avatarUrl}
            viewable
          />
          <div className='min-w-0'>
            <h1 className='text-[clamp(1.6rem,3vw,2.2rem)] leading-tight font-extrabold tracking-tight text-white'>
              {profile.fullName}
            </h1>
            <div className='mt-2.5 flex flex-wrap items-center gap-2'>
              <span className='inline-flex items-center gap-1 rounded-full bg-mint-300 px-2.5 py-0.5 text-xs font-bold text-forest-950'>
                <Icon className='text-sm' filled name='verified' />
                {t('common.kit.verified')}
              </span>
              {profile.gender ? (
                <span className='inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-white/90 ring-1 ring-white/15'>
                  <Icon aria-hidden='true' className='text-sm' name='person' />
                  {t(`${key}.genders.${profile.gender}`)}
                </span>
              ) : null}
              {profile.centerName ? (
                <span className='inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-white/90 ring-1 ring-white/15'>
                  <Icon aria-hidden='true' className='text-sm' name='home_health' />
                  {profile.centerName}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      <dl
        aria-label={t(`${key}.detail.stats.label`)}
        className='cc-stagger grid grid-cols-2 gap-3 p-4 sm:grid-cols-4 sm:p-5'
      >
        {stats.map((stat) => (
          <div className='rounded-2xl bg-mint-50 px-4 py-3.5 ring-1 ring-mint-100' key={stat.icon}>
            <dt className='flex items-center gap-1.5 text-xs font-semibold text-forest-700'>
              <Icon aria-hidden='true' className='text-base' filled={stat.icon === 'star'} name={stat.icon} />
              {stat.label}
            </dt>
            <dd className='mt-1 text-2xl font-extrabold tracking-tight text-forest-950 tabular-nums'>{stat.value}</dd>
          </div>
        ))}
      </dl>
      {rated ? (
        <div className='-mt-1 px-5 pb-1 sm:px-6'>
          <Rating average={profile.ratingAverage} count={profile.ratingCount} />
        </div>
      ) : null}
      {profile.bio?.trim() ? (
        <div className='mx-5 mb-5 border-t border-outline-variant pt-5 sm:mx-6'>
          <h2 className='text-sm font-semibold text-on-surface'>{t(`${key}.detail.about`)}</h2>
          <p className='mt-1.5 max-w-[65ch] text-sm leading-7 whitespace-pre-line text-on-surface-variant'>
            {profile.bio.trim()}
          </p>
        </div>
      ) : (
        <div className='h-1' />
      )}
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
  const { t } = useTranslation()
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
  const gallery = previews.flatMap((file) =>
    file.downloadUrl && file.contentType !== 'application/pdf'
      ? [{ src: file.downloadUrl, alt: item.certificateName ?? t(`${key}.certificates`) }]
      : []
  )
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
                <ViewableImage
                  alt={item.certificateName ?? t(`${key}.certificates`)}
                  className='h-full w-full'
                  gallery={gallery}
                  imgClassName='h-full w-full object-contain'
                  index={gallery.findIndex((image) => image.src === file.downloadUrl)}
                  src={file.downloadUrl ?? ''}
                />
              )}
            </div>
          ))}
        </div>
      ) : null}
      {previewStatus ? <p className='px-4 pt-4 text-sm text-on-surface-variant sm:px-5'>{previewStatus}</p> : null}
      <div className='flex items-start gap-3 p-4 sm:p-5'>
        <span className='grid size-10 shrink-0 place-items-center rounded-2xl bg-mint-100 text-forest-800'>
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
            {item.issuedDate ? t(`${key}.detail.issued`, { date: formatDate(item.issuedDate) }) : null}
            {item.issuedDate ? ' · ' : null}
            {item.expiryDate
              ? t(`${key}.detail.expires`, { date: formatDate(item.expiryDate) })
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
    <aside className='relative isolate overflow-hidden rounded-3xl border border-forest-900/[0.06] bg-white p-6 shadow-[var(--shadow-soft)] lg:sticky lg:top-24 lg:p-7'>
      <span
        aria-hidden='true'
        className='pointer-events-none absolute -top-20 -right-16 -z-10 h-48 w-48 rounded-full bg-peach-100 blur-3xl'
      />
      <span className='grid size-11 place-items-center rounded-2xl bg-peach-100 text-peach-700'>
        <Icon aria-hidden='true' className='text-2xl' name='calendar_month' />
      </span>
      <h2 className='mt-5 text-xl font-extrabold tracking-tight text-forest-950'>{t(`${key}.detail.bookTitle`)}</h2>
      {profile.centerName ? (
        <p className='mt-3 inline-flex items-center gap-1.5 rounded-full bg-mint-50 px-3 py-1 text-xs font-semibold text-forest-800 ring-1 ring-mint-200/60'>
          <Icon aria-hidden='true' className='text-base' name='home_health' />
          {profile.centerName}
        </p>
      ) : null}
      <p className='mt-4 border-t border-outline-variant pt-4 text-sm leading-6 text-on-surface-variant'>
        {t(`${key}.detail.bookHint`)}
      </p>
      <Link className={`mt-6 w-full ${peachPill} min-h-12`} to={`/customer/booking?${params.toString()}`}>
        <Icon className='text-lg' name='calendar_add_on' />
        {t(`${key}.book`)}
      </Link>
    </aside>
  )
}
