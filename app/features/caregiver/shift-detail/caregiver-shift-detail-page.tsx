import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'

import { useDocumentTitle } from '~/shared/lib/use-document-title'

import { ClinicalWarningsCard } from './components/clinical-warnings-card'
import { FamilyNotesCard } from './components/family-notes-card'
import { MedicalChecklistCard } from './components/medical-checklist-card'
import { PatientProfileCard } from './components/patient-profile-card'
import { ReportIncidentModal } from './components/report-incident-modal'
import { ShiftCountdownBanner } from './components/shift-countdown-banner'
import { ShiftHeader } from './components/shift-header'
import { ShiftLocationMapCard } from './components/shift-location-map-card'
import { ShiftSafetyActionCard } from './components/shift-safety-action-card'
import { ShiftTimingEarningsCard } from './components/shift-timing-earnings-card'
import { useShiftDetail } from './hooks/use-shift-detail'
import { defaultShiftData } from './shift-preview'

export function CaregiverShiftDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const shiftCode = id || defaultShiftData.code

  useDocumentTitle(t('caregiver.shiftDetail.documentTitle', { code: shiftCode }))

  const {
    countdownText,
    checkedItems,
    toggleChecklist,
    shiftStatus,
    startShift,
    hasArrived,
    markArrived,
    shareShift,
    copiedToast,
    isIncidentModalOpen,
    openIncidentModal,
    closeIncidentModal,
    submitIncident
  } = useShiftDetail()

  return (
    <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 space-y-6'>
      {/* Header action group */}
      <ShiftHeader code={shiftCode} copiedToast={copiedToast} onShare={shareShift} shiftStatus={shiftStatus} />

      {/* Countdown Real-time Banner */}
      <ShiftCountdownBanner countdownText={countdownText} shiftStatus={shiftStatus} />

      {/* 2-Column Desktop Grid Layout */}
      <div className='grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8'>
        {/* Left Column (8 cols): Clinical Responsibilities & Patient Profile */}
        <div className='space-y-6 lg:col-span-8'>
          <PatientProfileCard shift={defaultShiftData} />
          <MedicalChecklistCard
            checkedItems={checkedItems}
            items={defaultShiftData.checklistItems}
            onToggleChecklist={toggleChecklist}
          />
          <ClinicalWarningsCard />
          <FamilyNotesCard />
        </div>

        {/* Right Column (4 cols): Shift Timing, Earnings, Location & Action Card */}
        <div className='space-y-6 lg:col-span-4'>
          <ShiftTimingEarningsCard shift={defaultShiftData} />
          <ShiftLocationMapCard hasArrived={hasArrived} onArrive={markArrived} shift={defaultShiftData} />
          <ShiftSafetyActionCard
            code={shiftCode}
            onOpenIncidentModal={openIncidentModal}
            onStartShift={startShift}
            shiftStatus={shiftStatus}
          />
        </div>
      </div>

      {/* Incident / Emergency Support Modal */}
      <ReportIncidentModal isOpen={isIncidentModalOpen} onClose={closeIncidentModal} onSubmit={submitIncident} />
    </div>
  )
}
