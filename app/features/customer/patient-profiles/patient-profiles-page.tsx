import { useTranslation } from 'react-i18next'

import { useDocumentTitle } from '~/shared/lib/use-document-title'

import { MedicalGuidelinesBanner } from './components/medical-guidelines-banner'
import { PatientList } from './components/patient-list'
import { PatientSidebar } from './components/patient-sidebar'
import { PatientToolbar } from './components/patient-toolbar'
import { usePatientProfiles } from './hooks/use-patient-profiles'

export function PatientProfilesPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('customer.patientProfiles.documentTitle'))

  const { profiles, familyCount, keyword, status, hasFilters, setKeyword, setStatus, setPage, remove } =
    usePatientProfiles()

  return (
    <div className='mx-auto max-w-7xl px-6 py-8'>
      <div className='grid grid-cols-1 items-start gap-8 lg:grid-cols-12'>
        {/* Left Column: Synchronized Account Sidebar */}
        <PatientSidebar familyCount={familyCount} />

        {/* Right Column: Patient Profiles Management */}
        <section className='flex flex-col gap-6 lg:col-span-8'>
          <PatientToolbar
            key={keyword}
            keyword={keyword}
            onSearch={setKeyword}
            statusFilter={status}
            onStatusChange={setStatus}
            totalCount={profiles.data?.totalElements}
          />

          <PatientList profiles={profiles} remove={remove} hasFilters={hasFilters} onPageChange={setPage} />

          <MedicalGuidelinesBanner />
        </section>
      </div>
    </div>
  )
}
