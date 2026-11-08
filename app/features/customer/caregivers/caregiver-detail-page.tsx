import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'

import { fetchPublicCaregiver, fetchVerifiedCertificates, providerKeys } from '~/entities/provider/provider-api'
import { useAuthUser } from '~/features/shared/auth/auth-user-context'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'
import { pageContainer } from '~/shared/ui/page-header'

import {
  CaregiverBookingCard,
  CaregiverCertificates,
  CaregiverDetailHero,
  CaregiverServices,
  DetailSection
} from './components/caregiver-detail-sections'

const key = 'customer.provider' as const

/** Customer-facing caregiver profile from the public endpoint (no internal fields). */
export function CustomerCaregiverDetailPage() {
  const { caregiverId = '' } = useParams()
  const { t } = useTranslation()
  const customer = useAuthUser()
  const profile = useQuery({
    queryKey: providerKeys.publicCaregiver(caregiverId),
    queryFn: () => fetchPublicCaregiver(caregiverId),
    enabled: Boolean(caregiverId),
    retry: false
  })
  const verifiedCertificates = useQuery({
    queryKey: providerKeys.verifiedCertificates(caregiverId),
    queryFn: () => fetchVerifiedCertificates(caregiverId),
    enabled: Boolean(customer && caregiverId && profile.data?.certificates?.length),
    retry: false
  })
  useDocumentTitle(profile.data?.fullName ?? t(`${key}.title`))

  return (
    <div className='flex w-full flex-1 flex-col text-on-surface'>
      <div className={`${pageContainer} pb-16`}>
        <nav aria-label={t(`${key}.list.breadcrumb.label`)} className='pt-6 sm:pt-8'>
          <ol className='flex flex-wrap items-center gap-1 text-sm text-on-surface-variant'>
            <li>
              <Link className='rounded hover:text-primary hover:underline' to='/customer'>
                {t(`${key}.list.breadcrumb.home`)}
              </Link>
            </li>
            <li className='flex items-center gap-1'>
              <Icon className='text-base text-outline' name='chevron_right' />
              <Link className='rounded hover:text-primary hover:underline' to='/customer/caregivers'>
                {t(`${key}.list.title`)}
              </Link>
            </li>
            {profile.data ? (
              <li className='flex items-center gap-1'>
                <Icon className='text-base text-outline' name='chevron_right' />
                <span aria-current='page' className='font-medium text-on-surface'>
                  {profile.data.fullName}
                </span>
              </li>
            ) : null}
          </ol>
        </nav>

        {profile.isPending ? (
          <div className='mt-6 rounded-2xl border border-outline-variant bg-surface-container-lowest p-7' role='status'>
            <span className='sr-only'>{t(`${key}.loading`)}</span>
            <div className='flex items-center gap-5'>
              <span className='cc-skeleton h-28 w-28 rounded-full' />
              <div className='flex-1 space-y-3'>
                <span className='cc-skeleton block h-8 w-2/3 rounded' />
                <span className='cc-skeleton block h-5 w-40 rounded' />
                <span className='cc-skeleton block h-4 w-1/2 rounded' />
              </div>
            </div>
          </div>
        ) : null}

        {profile.isError ? (
          <div
            className='mt-6 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest px-6 py-16 text-center'
            role='alert'
          >
            <Icon className='text-4xl text-primary' name='person_off' />
            <h1 className='mt-4 text-xl font-bold text-on-surface'>{t(`${key}.profileError`)}</h1>
            <p className='mt-2 text-sm text-on-surface-variant'>{t(`${key}.detail.errorHelp`)}</p>
            <button
              className='mt-6 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-on-primary transition-colors hover:bg-primary-container'
              onClick={() => profile.refetch()}
              type='button'
            >
              {t(`${key}.retry`)}
            </button>
          </div>
        ) : null}

        {profile.isSuccess ? (
          <div className='mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8'>
            <div className='flex min-w-0 flex-col gap-6'>
              <CaregiverDetailHero profile={profile.data} />
              <DetailSection icon='medical_services' title={t(`${key}.detail.services`)}>
                <CaregiverServices services={profile.data.services} />
              </DetailSection>
              <DetailSection icon='verified' title={t(`${key}.certificates`)}>
                <CaregiverCertificates
                  certificates={profile.data.certificates}
                  verifiedCertificates={verifiedCertificates.data}
                  mediaState={
                    !customer
                      ? 'guest'
                      : verifiedCertificates.isPending
                        ? 'loading'
                        : verifiedCertificates.isError
                          ? 'error'
                          : 'ready'
                  }
                />
              </DetailSection>
            </div>
            <CaregiverBookingCard profile={profile.data} />
          </div>
        ) : null}
      </div>
    </div>
  )
}
