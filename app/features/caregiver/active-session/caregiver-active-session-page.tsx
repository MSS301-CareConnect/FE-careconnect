import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'
import { careRecordPreviews } from '~/entities/care-session/care-record-preview'
import { saveCareReportDraft } from '~/entities/care-session/care-report-draft'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { useActiveSession } from './hooks/use-active-session'
import { ActiveSessionHeader } from './components/active-session-header'
import { ActiveSessionHeroBanner } from './components/active-session-hero-banner'
import { ActivePatientCard } from './components/active-patient-card'
import { ActiveCarePlanCard } from './components/active-care-plan-card'
import { ActiveNursingNotesCard } from './components/active-nursing-notes-card'
import { ActiveVitalsBoardCard } from './components/active-vitals-board-card'
import { ActiveActionCommandCard } from './components/active-action-command-card'
import { ActiveEquipmentCard } from './components/active-equipment-card'
import { ActiveSessionModals } from './components/active-session-modals'
import { EndCareModal } from './components/end-care-modal'

const ICON_CHECK_CIRCLE = 'check_circle'

export function CaregiverActiveSessionPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id?: string }>()
  const session = useActiveSession()
  const navigate = useNavigate()

  const sessionCode = id || session.data.code

  function openReport() {
    const vitals = session.data.vitals
    saveCareReportDraft(sessionCode, {
      record: { ...careRecordPreviews[0], code: sessionCode },
      tasks: session.data.tasks.map((task) => ({
        id: task.id,
        title: task.key ? t(`caregiver.activeSession.carePlan.${task.key}Title`) : (task.customTitle ?? ''),
        detail: task.key ? t(`caregiver.activeSession.carePlan.${task.key}Desc`) : (task.customDesc ?? ''),
        done: task.status === 'completed',
        time: task.completedTime ?? ''
      })),
      notes: session.nursingNote,
      advice: '',
      condition: 'stable',
      vitals: {
        pressure: vitals.bloodPressure,
        pulse: vitals.heartRate,
        oxygen: vitals.spo2,
        temperature: vitals.temperature,
        glucose: null
      },
      files: []
    })
    navigate(`/caregiver/shifts/${encodeURIComponent(sessionCode)}/report`)
  }

  useDocumentTitle(t('caregiver.activeSession.meta.title', { code: sessionCode }))

  return (
    <div className='mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8'>
      {/* Toast Notification */}
      {session.toastMessage && (
        <div className='fixed top-24 right-6 z-50 flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-on-primary shadow-xl animate-bounce'>
          <span className='material-symbols-outlined text-[20px]'>{ICON_CHECK_CIRCLE}</span>
          <span>{session.toastMessage}</span>
        </div>
      )}

      {/* Header Breadcrumbs & Live Sync Clock */}
      <ActiveSessionHeader currentClock={session.currentClock} shiftCode={sessionCode} />

      {/* Hero Command Banner */}
      <ActiveSessionHeroBanner
        elapsedFormatted={session.elapsedFormatted}
        onOpenSos={() => session.setIsSosModalOpen(true)}
        orderCode={session.data.orderCode}
      />

      {/* Main Workstation 12-col Layout */}
      <div className='grid grid-cols-1 items-start gap-6 xl:grid-cols-12'>
        {/* Left Column (8 cols) */}
        <div className='flex flex-col gap-6 xl:col-span-8'>
          <ActivePatientCard patient={session.data.patient} />

          <ActiveCarePlanCard
            completedCount={session.completedTasksCount}
            onMarkCompleted={session.markTaskCompleted}
            onOpenAddTaskModal={() => session.setIsAddTaskModalOpen(true)}
            tasks={session.data.tasks}
            totalCount={session.totalTasksCount}
          />

          <ActiveNursingNotesCard
            nursingNote={session.nursingNote}
            onChangeNote={session.setNursingNote}
            onSaveDraft={session.handleSaveDraft}
            onUpdateProgress={session.handleUpdateProgress}
          />
        </div>

        {/* Right Sidebar Column (4 cols) */}
        <div className='flex flex-col gap-6 xl:col-span-4'>
          <ActiveVitalsBoardCard onRemeasure={session.handleRemeasureVitals} vitals={session.data.vitals} />

          <ActiveActionCommandCard
            isBreakActive={session.isBreakActive}
            onOpenSignModal={() => session.setIsSignModalOpen(true)}
            onOpenSos={() => session.setIsSosModalOpen(true)}
            onToggleBreak={session.toggleBreak}
          />

          <ActiveEquipmentCard />
        </div>
      </div>

      {/* Interactive Modals */}
      <ActiveSessionModals
        isAddTaskOpen={session.isAddTaskModalOpen}
        isSosOpen={session.isSosModalOpen}
        onCloseAddTask={() => session.setIsAddTaskModalOpen(false)}
        onCloseSos={() => session.setIsSosModalOpen(false)}
        onConfirmAddTask={session.addAdhocTask}
        onConfirmSos={session.handleTriggerSos}
      />

      {/* End Care Modal */}
      <EndCareModal
        code={session.data.orderCode}
        isOpen={session.isSignModalOpen}
        onClose={() => session.setIsSignModalOpen(false)}
        onConfirm={openReport}
      />
    </div>
  )
}
