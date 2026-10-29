import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'

import { careRecipientErrorStatus as errorStatus } from '~/entities/care-recipient/care-recipient-api'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'

import { CarePlanSection } from './components/care-plan-section'
import { EmergencyContactsCard } from './components/emergency-contacts-card'
import { ManagersCard } from './components/managers-card'
import { MedicalBackgroundSection } from './components/medical-background-section'
import { PatientDetailHeader } from './components/patient-detail-header'
import { PatientSnapshotCard } from './components/patient-snapshot-card'
import { PrescriptionsSection } from './components/prescriptions-section'
import { usePatientDetail } from './hooks/use-patient-detail'

const LOAD_ERROR_KEYS = {
  403: 'customer.patientDetail.states.forbidden',
  404: 'customer.patientDetail.states.notFound'
} as const

export function PatientDetailPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('customer.patientDetail.documentTitle'))
  const { id = '' } = useParams()

  const {
    detail,
    draft,
    updateDraft,
    canEdit,
    isEditMode,
    toggleEditMode,
    handleSave,
    isSaving,
    saveError,
    showToast
  } = usePatientDetail(id)

  if (detail.isPending)
    return (
      <div className='mx-auto max-w-7xl px-6 py-8'>
        <p
          role='status'
          className='rounded-xl bg-surface-container-lowest p-6 text-sm text-on-surface-variant shadow-sm'
        >
          {t('customer.patientDetail.states.loading')}
        </p>
      </div>
    )

  if (detail.isError || !draft) {
    const status = errorStatus(detail.error)
    return (
      <div className='mx-auto max-w-7xl px-6 py-8'>
        <div
          role='alert'
          className='flex flex-col items-start gap-3 rounded-xl bg-surface-container-lowest p-6 shadow-sm'
        >
          <p className='text-sm text-error'>
            {t(status === 403 || status === 404 ? LOAD_ERROR_KEYS[status] : 'customer.patientDetail.states.error')}
          </p>
          <div className='flex gap-4 text-xs font-semibold'>
            <button type='button' onClick={() => void detail.refetch()} className='text-primary underline'>
              {t('customer.patientDetail.states.retry')}
            </button>
            <Link to='/customer/patient-profiles' className='text-primary underline'>
              {t('customer.patientDetail.banner.back')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const { profile } = detail.data
  const sectionProps = { profile, draft, isEditMode, onUpdate: updateDraft }

  return (
    <div className='mx-auto max-w-7xl px-6 py-8'>
      <div className='flex flex-col gap-6'>
        <PatientDetailHeader
          detail={detail.data}
          canEdit={canEdit}
          isEditMode={isEditMode}
          isSaving={isSaving}
          saveError={saveError}
          onToggleEditMode={toggleEditMode}
          onSave={handleSave}
        />

        <div className='grid grid-cols-1 items-start gap-6 lg:grid-cols-12'>
          {/* Left Column (4 cols) */}
          <div className='flex flex-col gap-6 lg:col-span-4'>
            <PatientSnapshotCard {...sectionProps} />
            <EmergencyContactsCard
              recipientId={profile.id}
              contacts={detail.data.emergencyContacts ?? []}
              isEditMode={isEditMode}
            />
            <ManagersCard recipientId={profile.id} />
          </div>

          {/* Right Column (8 cols) */}
          <div className='flex flex-col gap-6 lg:col-span-8'>
            <MedicalBackgroundSection {...sectionProps} />
            <PrescriptionsSection
              recipientId={profile.id}
              medications={detail.data.medications ?? []}
              isEditMode={isEditMode}
            />
            <CarePlanSection {...sectionProps} />
          </div>
        </div>
      </div>

      {/* Floating Save Toast Notification */}
      {showToast && (
        <div
          role='status'
          className='fixed right-6 bottom-6 z-50 flex items-center gap-3 rounded-xl bg-primary px-4 py-3 text-on-primary shadow-lg transition-all'
        >
          <Icon name='check_circle' className='text-xl' />
          <span className='text-xs font-semibold'>{t('customer.patientDetail.banner.toastSuccess')}</span>
        </div>
      )}
    </div>
  )
}
