import { useEffect, useRef } from 'react'
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

/** Moves focus to the first control marked invalid, in page order, and brings it into view. */
function focusFirstInvalid(root: HTMLElement | null) {
  const invalid = root?.querySelector<HTMLElement>('[aria-invalid="true"]')
  if (!invalid) return
  // A radio group is not focusable itself; its first option is.
  const target = invalid.matches('input, select, textarea')
    ? invalid
    : (invalid.querySelector<HTMLElement>('input, select, textarea') ?? invalid)
  target.focus({ preventScroll: true })
  target.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
}

export function PatientCreatePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const formRef = useRef<HTMLDivElement>(null)
  const alertRef = useRef<HTMLDivElement>(null)
  useDocumentTitle(t('customer.patientCreate.documentTitle'))

  const {
    formData,
    updateField,
    updateEmergencyContact,
    bmi,
    handleToggleChronic,
    newAllergyText,
    setNewAllergyText,
    handleAddAllergy,
    handleRemoveAllergy,
    handleAddMedicine,
    handleUpdateMedicine,
    handleDeleteMedicine,
    errors,
    formError,
    focusRequest,
    isSubmitting,
    createdProfile,
    handleSubmit,
    handleCloseModal
  } = usePatientCreate()

  useEffect(() => {
    if (focusRequest > 0) focusFirstInvalid(formRef.current)
  }, [focusRequest])

  useEffect(() => {
    if (formError) alertRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
  }, [formError])

  const handleCancel = () => {
    navigate('/customer/patient-profiles')
  }

  return (
    <div className='mx-auto max-w-7xl px-6 py-8'>
      <div className='flex flex-col gap-8'>
        <CreatePatientHeader onCancel={handleCancel} onSubmit={handleSubmit} isSubmitting={isSubmitting} />

        <div className='grid grid-cols-1 items-start gap-8 lg:grid-cols-12'>
          {/* Left Column (4 cols) */}
          <CreatePatientSidebar />

          {/* Right Main Form Column (8 cols) */}
          <div ref={formRef} className='flex flex-col gap-8 lg:col-span-8'>
            {/* Only server failures that cannot be tied to a field are reported here. */}
            {formError ? (
              <div
                ref={alertRef}
                role='alert'
                className='flex items-center gap-3 rounded-xl bg-error-container/60 p-4 text-on-error-container shadow-sm'
              >
                <Icon name='error' className='text-xl text-error' />
                <p className='text-xs font-semibold'>{t(`customer.patientCreate.${formError}`)}</p>
              </div>
            ) : null}

            <BasicInfoSection formData={formData} bmi={bmi} errors={errors} onUpdate={updateField} />

            <MedicalHistorySection
              formData={formData}
              errors={errors}
              onUpdate={updateField}
              onEmergencyContactChange={updateEmergencyContact}
              onToggleChronic={handleToggleChronic}
              newAllergyText={newAllergyText}
              onNewAllergyChange={setNewAllergyText}
              onAddAllergy={handleAddAllergy}
              onRemoveAllergy={handleRemoveAllergy}
            />

            <MedicationsSection
              medications={formData.medications}
              errors={errors}
              onAddMedicine={handleAddMedicine}
              onUpdateMedicine={handleUpdateMedicine}
              onDeleteMedicine={handleDeleteMedicine}
              onCancel={handleCancel}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </div>

      <CreateSuccessModal profile={createdProfile} onClose={handleCloseModal} />
    </div>
  )
}
