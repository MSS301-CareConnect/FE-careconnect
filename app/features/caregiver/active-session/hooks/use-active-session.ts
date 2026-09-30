import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { type ActiveSessionData, defaultActiveSessionData } from '../active-session-preview'

export function useActiveSession(initialData: ActiveSessionData = defaultActiveSessionData) {
  const { t } = useTranslation()
  const [data, setData] = useState<ActiveSessionData>(initialData)
  const [elapsedSeconds, setElapsedSeconds] = useState(6383) // 01:46:23
  const [currentClock, setCurrentClock] = useState('10:16:23')
  const [nursingNote, setNursingNote] = useState(t('caregiver.activeSession.nursingNotes.defaultText'))
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Modals & States
  const [isSosModalOpen, setIsSosModalOpen] = useState(false)
  const [isSignModalOpen, setIsSignModalOpen] = useState(false)
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false)
  const [isBreakActive, setIsBreakActive] = useState(false)
  const [isSessionCompleted, setIsSessionCompleted] = useState(false)

  // Stopwatch timer (1s tick)
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Real-time clock (1s tick)
  useEffect(() => {
    const updateClock = () => {
      const now = new Date()
      setCurrentClock(now.toTimeString().split(' ')[0] ?? '')
    }
    updateClock()
    const timer = setInterval(updateClock, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatStopwatch = (totalSecs: number) => {
    const hrs = String(Math.floor(totalSecs / 3600)).padStart(2, '0')
    const mins = String(Math.floor((totalSecs % 3600) / 60)).padStart(2, '0')
    const secs = String(totalSecs % 60).padStart(2, '0')
    return `${hrs}:${mins}:${secs}`
  }

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3500)
  }

  const markTaskCompleted = (taskId: string) => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: 'completed',
              completedTime: currentClock.slice(0, 5)
            }
          : task
      )
    }))
  }

  const addAdhocTask = (title: string, desc: string) => {
    const newTask = {
      id: `task-${Date.now()}`,
      customTitle: title,
      customDesc: desc,
      status: 'pending' as const,
      expectedTime: currentClock.slice(0, 5)
    }
    setData((prev) => ({
      ...prev,
      tasks: [...prev.tasks, newTask]
    }))
    setIsAddTaskModalOpen(false)
    showToast(t('caregiver.activeSession.carePlan.addTaskBtn'))
  }

  const handleSaveDraft = () => {
    showToast(t('caregiver.activeSession.nursingNotes.draftSavedToast'))
  }

  const handleUpdateProgress = () => {
    showToast(t('caregiver.activeSession.nursingNotes.updatedToast'))
  }

  const handleRemeasureVitals = () => {
    setData((prev) => ({
      ...prev,
      vitals: {
        ...prev.vitals,
        bloodPressure: '126/80',
        heartRate: 74,
        lastMeasured: currentClock.slice(0, 5)
      }
    }))
    alert(t('caregiver.activeSession.vitals.reMeasureAlert'))
  }

  const toggleBreak = () => {
    setIsBreakActive((prev) => !prev)
    if (!isBreakActive) {
      alert(t('caregiver.activeSession.commandCenter.breakActiveNotice'))
    }
  }

  const handleTriggerSos = () => {
    setIsSosModalOpen(false)
    alert(t('caregiver.activeSession.modals.sosAlertSuccess'))
  }

  const handleCompleteSignOff = () => {
    setIsSignModalOpen(false)
    setIsSessionCompleted(true)
    alert(t('caregiver.activeSession.commandCenter.completeSuccess'))
  }

  const completedTasksCount = data.tasks.filter((t) => t.status === 'completed').length
  const totalTasksCount = data.tasks.length

  return {
    data,
    elapsedFormatted: formatStopwatch(elapsedSeconds),
    currentClock,
    nursingNote,
    setNursingNote,
    toastMessage,
    completedTasksCount,
    totalTasksCount,
    markTaskCompleted,
    addAdhocTask,
    handleSaveDraft,
    handleUpdateProgress,
    handleRemeasureVitals,
    isBreakActive,
    toggleBreak,
    isSosModalOpen,
    setIsSosModalOpen,
    handleTriggerSos,
    isSignModalOpen,
    setIsSignModalOpen,
    handleCompleteSignOff,
    isSessionCompleted,
    isAddTaskModalOpen,
    setIsAddTaskModalOpen
  }
}
