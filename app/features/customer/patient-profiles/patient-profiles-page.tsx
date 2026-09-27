import { useTranslation } from 'react-i18next'

import { useDocumentTitle } from '~/shared/lib/use-document-title'

import { MedicalGuidelinesBanner } from './components/medical-guidelines-banner'
import { PatientBreadcrumb } from './components/patient-breadcrumb'
import { PatientCard } from './components/patient-card'
import { PatientSidebar } from './components/patient-sidebar'
import { PatientToolbar } from './components/patient-toolbar'
import { usePatientProfiles } from './hooks/use-patient-profiles'

export function PatientProfilesPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('customer.patientProfiles.documentTitle'))

  const {
    patients,
    totalCount,
    searchQuery,
    setSearchQuery,
    relationshipFilter,
    setRelationshipFilter,
    statusFilter,
    setStatusFilter,
    handleDelete
  } = usePatientProfiles()

  return (
    <div className='mx-auto max-w-7xl px-6 py-8'>
      <PatientBreadcrumb />

      <div className='grid grid-cols-1 items-start gap-8 lg:grid-cols-12'>
        {/* Left Column: Synchronized Account Sidebar */}
        <PatientSidebar />

        {/* Right Column: Patient Profiles Management */}
        <section className='flex flex-col gap-6 lg:col-span-8'>
          <PatientToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            relationshipFilter={relationshipFilter}
            onRelationshipChange={setRelationshipFilter}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            totalCount={totalCount}
          />

          <div className='flex flex-col gap-6'>
            {patients.map((patient) => (
              <PatientCard key={patient.id} patient={patient} onDelete={handleDelete} />
            ))}
          </div>

          <MedicalGuidelinesBanner />
        </section>
      </div>
    </div>
  )
}
