import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'

import { useAuthUser } from '~/features/shared/auth/auth-user-context'
import { fetchCaregiverServices, fetchCertificates, providerKeys } from '~/entities/provider/provider-api'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Skeleton, SkeletonGroup } from '~/shared/ui/skeleton'
import { Tabs, tabPanelId } from '~/shared/ui/tabs'

import { useMyAvatar, useMyCaregiverProfile } from '../data/caregiver-queries'
import { CaregiverError, CaregiverPageHeader, cgContainer } from '../ui/caregiver-page'
import { useNow } from '../ui/use-now'
import { CertificatesTab, certificateState } from './components/certificates-tab'
import { InfoTab } from './components/info-tab'
import { ProfileHeader, type CompletenessItem } from './components/profile-header'
import { SecurityTab } from './components/security-tab'

const TABS = ['info', 'certificates', 'security'] as const
type ProfileTab = (typeof TABS)[number]

/** "Hồ sơ": photo and completeness on top, then Information, Certificates and Security (`?tab=`). */
export function CaregiverProfilePage() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const tab: ProfileTab = TABS.find((value) => value === params.get('tab')) ?? 'info'
  const now = useNow(60_000)
  const user = useAuthUser()
  const profile = useMyCaregiverProfile()
  const profileId = profile.data?.id
  const avatar = useMyAvatar(profileId)
  const services = useQuery({
    queryKey: providerKeys.caregiverServices(profileId ?? ''),
    queryFn: () => fetchCaregiverServices(profileId ?? ''),
    enabled: Boolean(profileId),
    retry: false
  })
  const certificates = useQuery({
    queryKey: providerKeys.certificates(profileId ?? ''),
    queryFn: () => fetchCertificates(profileId ?? ''),
    enabled: Boolean(profileId),
    retry: false
  })
  useDocumentTitle(t('caregiver.me.documentTitle'))

  const completeness: CompletenessItem[] = profile.data
    ? [
        { key: 'photo', done: Boolean(avatar.url) },
        { key: 'phone', done: Boolean(user?.phoneNumber) },
        { key: 'birthDate', done: Boolean(profile.data.dateOfBirth) },
        { key: 'bio', done: Boolean(profile.data.bio?.trim()) },
        { key: 'services', done: (services.data?.length ?? 0) > 0 },
        {
          key: 'certificate',
          done: (certificates.data ?? []).some(
            (item) => certificateState(item, now) !== 'expired' && item.verificationStatus !== 'REJECTED'
          )
        }
      ]
    : []

  return (
    <div className={`${cgContainer} caregiver-print-page`}>
      <CaregiverPageHeader description={t('caregiver.me.subtitle')} title={t('caregiver.me.title')} />

      {profile.isPending ? (
        <SkeletonGroup className='flex flex-col gap-4' label={t('caregiver.ui.states.loading')}>
          <Skeleton className='h-48 rounded-xl' />
          <Skeleton className='h-11 w-72 rounded-lg' />
          <Skeleton className='h-64 rounded-xl' />
        </SkeletonGroup>
      ) : null}
      {profile.isError ? (
        <CaregiverError
          message={t('caregiver.provider.profileError')}
          onRetry={() => void profile.refetch()}
          retryLabel={t('caregiver.ui.actions.retry')}
        />
      ) : null}

      {profile.isSuccess ? (
        <div className='flex flex-col gap-5'>
          <ProfileHeader
            avatarUrl={avatar.url}
            completeness={completeness}
            media={avatar.media.data}
            onAvatarExpired={() => void avatar.media.refetch()}
            profile={profile.data}
          />
          <Tabs
            className='print:hidden'
            idBase='caregiver-profile'
            items={TABS.map((value) => ({ value, label: t(`caregiver.me.tabs.${value}`) }))}
            label={t('caregiver.me.tabsLabel')}
            onChange={(value) =>
              setParams(
                (previous) => {
                  const next = new URLSearchParams(previous)
                  if (value === 'info') next.delete('tab')
                  else next.set('tab', value)
                  return next
                },
                { replace: true }
              )
            }
            value={tab}
          />
          <div
            aria-labelledby={`caregiver-profile-tab-${tab}`}
            className='cg-page-in'
            id={tabPanelId('caregiver-profile')}
            key={tab}
            role='tabpanel'
          >
            {tab === 'info' ? <InfoTab profile={profile.data} services={services} /> : null}
            {tab === 'certificates' ? (
              <CertificatesTab caregiverId={profile.data.id} certificates={certificates} now={now} />
            ) : null}
            {tab === 'security' ? <SecurityTab /> : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
