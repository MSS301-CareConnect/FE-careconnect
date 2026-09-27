import { useTranslation } from 'react-i18next'

import { useDocumentTitle } from '~/shared/lib/use-document-title'

import { EmergencySupportCard } from './components/emergency-support-card'
import { FamilyInsightCard } from './components/family-insight-card'
import { PersonalInfoForm } from './components/personal-info-form'
import { ProfileBreadcrumb } from './components/profile-breadcrumb'
import { ProfileNavMenu } from './components/profile-nav-menu'
import { ProfileOverviewCard } from './components/profile-overview-card'
import { SecuritySection } from './components/security-section'
import { useProfileData } from './hooks/use-profile-data'

export function MyProfilePage() {
  const { t } = useTranslation()
  useDocumentTitle(t('customer.profile.documentTitle'))

  const { profile, updateProfile, saveProfile, isSaving, saveSuccess } = useProfileData()

  return (
    <div className='mx-auto max-w-7xl px-6 py-8'>
      <ProfileBreadcrumb />

      <div className='grid grid-cols-1 items-start gap-8 lg:grid-cols-12'>
        {/* Left Column */}
        <aside className='flex flex-col gap-6 lg:col-span-4'>
          <ProfileOverviewCard profile={profile} />
          <ProfileNavMenu />
          <EmergencySupportCard />
        </aside>

        {/* Right Column */}
        <div className='flex flex-col gap-8 lg:col-span-8'>
          <PersonalInfoForm
            profile={profile}
            onUpdate={updateProfile}
            onSave={saveProfile}
            isSaving={isSaving}
            saveSuccess={saveSuccess}
          />
          <SecuritySection />
          <FamilyInsightCard />
        </div>
      </div>
    </div>
  )
}
