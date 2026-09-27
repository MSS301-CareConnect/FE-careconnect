import { useTranslation } from 'react-i18next'

import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'

import { AssignedCaregiverCard } from './components/assigned-caregiver-card'
import { CarePlanSection } from './components/care-plan-section'
import { EmergencyContactsCard } from './components/emergency-contacts-card'
import { HistoryAndDocsSection } from './components/history-and-docs-section'
import { MedicalBackgroundSection } from './components/medical-background-section'
import { PatientDetailHeader } from './components/patient-detail-header'
import { PatientSnapshotCard } from './components/patient-snapshot-card'
import { PrescriptionsSection } from './components/prescriptions-section'
import { usePatientDetail } from './hooks/use-patient-detail'

export function PatientDetailPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('customer.patientDetail.documentTitle'))

  const { data, updateData, isEditMode, toggleEditMode, handleSave, showToast, activeTab, setActiveTab } =
    usePatientDetail()

  return (
    <div className='mx-auto max-w-7xl px-6 py-8'>
      <div className='flex flex-col gap-6'>
        <PatientDetailHeader
          data={data}
          isEditMode={isEditMode}
          onToggleEditMode={toggleEditMode}
          onSave={handleSave}
        />

        <div className='grid grid-cols-1 items-start gap-6 lg:grid-cols-12'>
          {/* Left Column (4 cols) */}
          <div className='flex flex-col gap-6 lg:col-span-4'>
            <PatientSnapshotCard data={data} isEditMode={isEditMode} onUpdate={updateData} />
            <AssignedCaregiverCard caregiver={data.caregiver} />
            <EmergencyContactsCard contacts={data.emergencyContacts} />
          </div>

          {/* Right Column (8 cols) */}
          <div className='flex flex-col gap-6 lg:col-span-8'>
            <MedicalBackgroundSection
              medicalBackground={data.medicalBackground}
              isEditMode={isEditMode}
              onUpdate={(bg) =>
                updateData({
                  medicalBackground: { ...data.medicalBackground, ...bg }
                })
              }
            />

            <PrescriptionsSection medications={data.medications} isEditMode={isEditMode} />

            <CarePlanSection
              carePlan={data.carePlan}
              isEditMode={isEditMode}
              onUpdate={(cp) =>
                updateData({
                  carePlan: { ...data.carePlan, ...cp }
                })
              }
            />

            <HistoryAndDocsSection
              sessionHistory={data.sessionHistory}
              attachedDocs={data.attachedDocs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
        </div>
      </div>

      {/* Floating Save Toast Notification */}
      {showToast && (
        <div className='fixed right-6 bottom-6 z-50 flex items-center gap-3 rounded-xl bg-primary px-4 py-3 text-on-primary shadow-lg transition-all'>
          <Icon name='check_circle' className='text-xl' />
          <span className='text-xs font-semibold'>{t('customer.patientDetail.banner.toastSuccess')}</span>
        </div>
      )}
    </div>
  )
}
