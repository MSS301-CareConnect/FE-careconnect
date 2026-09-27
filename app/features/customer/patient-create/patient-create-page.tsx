import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'

import { BasicInfoSection } from './components/basic-info-section'
import { CreatePatientHeader } from './components/create-patient-header'
import { CreatePatientSidebar } from './components/create-patient-sidebar'
import { CreateSuccessModal } from './components/create-success-modal'
import { MedicalHistorySection } from './components/medical-history-section'
import { MedicationsSection } from './components/medications-section'
import { usePatientCreate } from './hooks/use-patient-create'

export function PatientCreatePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useDocumentTitle(t('customer.patientCreate.documentTitle'))

  const {
    formData,
    updateField,
    bmi,
    handleToggleChronic,
    newAllergyText,
    setNewAllergyText,
    handleAddAllergy,
    handleRemoveAllergy,
    handleAddMedicine,
    handleUpdateMedicine,
    handleDeleteMedicine,
    draftNoticeTime,
    handleSaveDraft,
    handleDismissDraftNotice,
    isSuccessModalOpen,
    handleSubmit,
    handleCloseModal
  } = usePatientCreate()

  const handleCancel = () => {
    navigate('/customer/patient-profiles')
  }

  return (
    <div className='mx-auto max-w-7xl px-6 py-8'>
      <div className='flex flex-col gap-8'>
        <CreatePatientHeader onCancel={handleCancel} onSaveDraft={handleSaveDraft} onSubmit={handleSubmit} />

        <div className='grid grid-cols-1 items-start gap-8 lg:grid-cols-12'>
          {/* Left Column (4 cols) */}
          <CreatePatientSidebar
            avatarUrl={formData.avatar}
            onAvatarChange={(newUrl) => updateField('avatar', newUrl)}
          />

          {/* Right Main Form Column (8 cols) */}
          <div className='flex flex-col gap-8 lg:col-span-8'>
            {/* Draft Saved Alert Notice */}
            {draftNoticeTime && (
              <div className='flex items-center justify-between rounded-xl bg-secondary-container/40 p-4 shadow-sm'>
                <div className='flex items-center gap-3'>
                  <Icon name='cloud_done' className='text-xl text-on-secondary-container' />
                  <p className='text-xs font-semibold text-on-secondary-container'>
                    {t('customer.patientCreate.draftNotice.text', {
                      time: draftNoticeTime
                    })}
                  </p>
                </div>
                <button
                  type='button'
                  onClick={handleDismissDraftNotice}
                  aria-label={t('customer.patientCreate.draftNotice.close')}
                  className='text-on-secondary-container transition-opacity hover:opacity-75'
                >
                  <Icon name='close' className='text-lg' />
                </button>
              </div>
            )}

            <BasicInfoSection formData={formData} bmi={bmi} onUpdate={updateField} />

            <MedicalHistorySection
              formData={formData}
              onUpdate={updateField}
              onToggleChronic={handleToggleChronic}
              newAllergyText={newAllergyText}
              onNewAllergyChange={setNewAllergyText}
              onAddAllergy={handleAddAllergy}
              onRemoveAllergy={handleRemoveAllergy}
            />

            <MedicationsSection
              medications={formData.medications}
              onAddMedicine={handleAddMedicine}
              onUpdateMedicine={handleUpdateMedicine}
              onDeleteMedicine={handleDeleteMedicine}
              onCancel={handleCancel}
              onSaveDraft={handleSaveDraft}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>

      <CreateSuccessModal isOpen={isSuccessModalOpen} patientName={formData.fullName} onClose={handleCloseModal} />
    </div>
  )
}
