import { useEffect, useState } from 'react'

const INITIAL_SECONDS = 44 * 60 + 50

export function useShiftDetail() {
  const [secondsLeft, setSecondsLeft] = useState(INITIAL_SECONDS)
  const [checkedItems, setCheckedItems] = useState<string[]>([])
  const [shiftStatus, setShiftStatus] = useState<'ready' | 'ongoing'>('ready')
  const [hasArrived, setHasArrived] = useState(false)
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false)
  const [incidentSuccessMessage, setIncidentSuccessMessage] = useState<string | null>(null)
  const [copiedToast, setCopiedToast] = useState(false)

  useEffect(() => {
    if (secondsLeft <= 0 || shiftStatus === 'ongoing') return

    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [secondsLeft, shiftStatus])

  const formattedCountdown = () => {
    const minutes = Math.floor(secondsLeft / 60)
    const seconds = secondsLeft % 60
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  const toggleChecklist = (id: string) => {
    setCheckedItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const startShift = () => {
    setShiftStatus('ongoing')
  }

  const markArrived = () => {
    setHasArrived(true)
  }

  const shareShift = async () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(window.location.href)
        setCopiedToast(true)
        setTimeout(() => setCopiedToast(false), 3000)
      } catch {
        // fallback
      }
    }
  }

  const openIncidentModal = () => {
    setIsIncidentModalOpen(true)
  }

  const closeIncidentModal = () => {
    setIsIncidentModalOpen(false)
  }

  const submitIncident = (reason: string) => {
    void reason
    setIsIncidentModalOpen(false)
    setIncidentSuccessMessage('incident_submitted')
    setTimeout(() => setIncidentSuccessMessage(null), 5000)
  }

  return {
    countdownText: formattedCountdown(),
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
    submitIncident,
    incidentSuccessMessage
  }
}
