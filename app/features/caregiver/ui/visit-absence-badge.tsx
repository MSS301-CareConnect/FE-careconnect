import { useTranslation } from 'react-i18next'

import type { CaregiverAbsenceRecord, CaregiverOccurrenceRecord } from '~/shared/api/generated/contracts'
import { StatusBadge, type StatusTone } from '~/shared/ui/status-badge'

import { useAbsencesByVisit } from '../data/caregiver-queries'

export type AbsenceState = 'PENDING' | 'EXPLAINED' | 'EXCUSED' | 'CONFIRMED'

const TONES: Record<AbsenceState, StatusTone> = {
  PENDING: 'danger',
  EXPLAINED: 'warning',
  EXCUSED: 'neutral',
  CONFIRMED: 'danger'
}

/** Where an absence record stands for the caregiver: still to explain, explained and waiting, or concluded. */
export function absenceState(absence: CaregiverAbsenceRecord): AbsenceState {
  if (absence.status !== 'PENDING') return absence.status
  return absence.explanation ? 'EXPLAINED' : 'PENDING'
}

export function AbsenceStateBadge({ absence }: { absence: CaregiverAbsenceRecord }) {
  const { t } = useTranslation()
  const state = absenceState(absence)
  return (
    <StatusBadge dot tone={TONES[state]}>
      {t(`caregiver.visits.absence.badge.${state}`)}
    </StatusBadge>
  )
}

/**
 * The absence record of a missed visit (2026-11-10), shown next to the visit's status so the visit lists, the booking
 * page and the absence panel tell the same story. Reads the records only for a missed visit.
 */
export function VisitAbsenceBadge({ visit }: { visit: CaregiverOccurrenceRecord }) {
  const missed = visit.status === 'CAREGIVER_MISSED'
  const { byVisit } = useAbsencesByVisit(missed)
  const absence = missed ? byVisit.get(visit.id) : undefined
  return absence ? <AbsenceStateBadge absence={absence} /> : null
}
