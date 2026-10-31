import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'

import { fetchPublicCaregiver, fetchVerifiedCertificates, providerKeys } from '~/entities/provider/provider-api'
import { useAuthUser } from '~/features/shared/auth/auth-user-context'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'

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
    <div className='flex w-full flex-1 flex-col bg-surface text-on-surface'>
      <div className='mx-auto w-full max-w-[1440px] px-5 py-7 sm:px-8 lg:px-12 lg:py-10'>
        <Link
          className='inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-container focus-visible:outline-2 focus-visible:outline-primary'
          to='/customer/caregivers'
        >
          <Icon className='text-lg' name='arrow_back' />
          {t(`${key}.back`)}
        </Link>

        {profile.isPending ? (
          <div className='mt-8 overflow-hidden rounded-[2rem] bg-surface-container-lowest' role='status'>
            <span className='sr-only'>{t(`${key}.loading`)}</span>
            <div className='grid md:grid-cols-[minmax(14rem,38%)_minmax(0,1fr)]'>
              <div className='min-h-72 animate-pulse bg-primary-fixed md:min-h-[21rem]' />
              <div className='space-y-5 px-7 py-10'>
                <div className='h-4 w-36 animate-pulse rounded bg-surface-container-high' />
                <div className='h-12 w-2/3 animate-pulse rounded bg-surface-container-high' />
                <div className='h-8 w-32 animate-pulse rounded bg-surface-container-high' />
                <div className='h-5 w-1/2 animate-pulse rounded bg-surface-container-high' />
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
          <div className='mt-8 grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8'>
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
