import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'

import { fetchPublicCaregiver, providerKeys } from '~/entities/provider/provider-api'
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
  const profile = useQuery({
    queryKey: providerKeys.publicCaregiver(caregiverId),
    queryFn: () => fetchPublicCaregiver(caregiverId),
    enabled: Boolean(caregiverId),
    retry: false
  })
  useDocumentTitle(profile.data?.fullName ?? t(`${key}.title`))

  return (
    <div className='flex w-full flex-1 flex-col bg-[#fbfcfa] text-[#1b2922]'>
      <div className='mx-auto w-full max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12 lg:py-12'>
        <Link
          className='inline-flex items-center gap-2 text-sm font-bold text-[#075b31] hover:text-[#043b20] focus-visible:outline-2 focus-visible:outline-[#075b31]'
          to='/customer/caregivers'
        >
          <Icon className='text-lg' name='arrow_back' />
          {t(`${key}.back`)}
        </Link>

        {profile.isPending ? (
          <div
            className='mt-6 rounded-2xl border border-[#dbe4db] bg-white px-6 py-16 text-center text-[#53675a]'
            role='status'
          >
            <Icon className='mb-4 text-4xl text-[#075b31]' name='progress_activity' />
            <p>{t(`${key}.loading`)}</p>
          </div>
        ) : null}

        {profile.isError ? (
          <div className='mt-6 rounded-2xl border border-[#dbe4db] bg-white px-6 py-16 text-center' role='alert'>
            <Icon className='text-4xl text-[#075b31]' name='person_off' />
            <h1 className='mt-4 text-xl font-bold'>{t(`${key}.profileError`)}</h1>
            <p className='mt-2 text-sm text-[#647568]'>{t(`${key}.detail.errorHelp`)}</p>
            <button
              className='mt-6 rounded-lg bg-[#075b31] px-5 py-3 text-sm font-bold text-white hover:bg-[#064a29]'
              onClick={() => profile.refetch()}
              type='button'
            >
              {t(`${key}.retry`)}
            </button>
          </div>
        ) : null}

        {profile.isSuccess ? (
          <div className='mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8'>
            <div className='flex min-w-0 flex-col gap-6'>
              <CaregiverDetailHero profile={profile.data} />
              <DetailSection icon='badge' title={t(`${key}.detail.about`)}>
                <p className='leading-7 text-[#435b4a]'>{profile.data.bio || t(`${key}.detail.aboutEmpty`)}</p>
              </DetailSection>
              <DetailSection icon='medical_services' title={t(`${key}.detail.services`)}>
                <CaregiverServices services={profile.data.services} />
              </DetailSection>
              <DetailSection icon='verified' title={t(`${key}.certificates`)}>
                <CaregiverCertificates certificates={profile.data.certificates} />
              </DetailSection>
            </div>
            <CaregiverBookingCard profile={profile.data} />
          </div>
        ) : null}
      </div>
    </div>
  )
}
