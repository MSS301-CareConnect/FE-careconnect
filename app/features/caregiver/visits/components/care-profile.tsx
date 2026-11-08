import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { CaregiverOccurrenceRecord } from '~/shared/api/generated/contracts'
import { Avatar } from '~/shared/ui/avatar'
import { Icon } from '~/shared/ui/icon'

import { cgCard } from '../../ui/caregiver-page'
import { visitPeople } from '../../ui/visit-card'
import { RecipientProfileDialog } from './recipient-profile-dialog'

const MOBILITY = ['INDEPENDENT', 'NEEDS_ASSISTANCE', 'WHEELCHAIR', 'BEDRIDDEN'] as const
const INDEPENDENCE = ['INDEPENDENT', 'PARTIALLY_DEPENDENT', 'FULLY_DEPENDENT'] as const

/** Red callout for allergies, shown above everything else on the visit. */
export function AllergyCallout({ value }: { value: string }) {
  const { t } = useTranslation()
  return (
    <div
      className='flex items-start gap-3 rounded-xl border border-error/30 bg-error-container p-4 text-on-error-container'
      role='note'
    >
      <Icon className='text-2xl' filled name='warning' />
      <div>
        <p className='text-sm font-semibold'>{t('caregiver.visitDetail.care.allergies')}</p>
        <p className='mt-0.5 text-[15px] font-medium'>{value}</p>
      </div>
    </div>
  )
}

/**
 * The person cared for: compact identification and quick briefing badges for the visit.
 * Detailed records (prescriptions, daily routine, full medical history) are available via "Full profile".
 */
export function CareProfile({ visit }: { visit: CaregiverOccurrenceRecord }) {
  const { t } = useTranslation()
  const [profileOpen, setProfileOpen] = useState(false)
  const snapshot = visit.recipientSnapshot
  const notes = visit.specialNotes
  const people = visitPeople(visit)
  const name = people.name ?? t('caregiver.visits.patientFallback')
  const mobility = MOBILITY.find((value) => value === snapshot?.mobilityLevel)
  const independence = INDEPENDENCE.find((value) => value === snapshot?.independenceLevel)
  const gender =
    people.gender === 'MALE' || people.gender === 'FEMALE' || people.gender === 'OTHER'
      ? t(`caregiver.ui.gender.${people.gender}`)
      : null

  const mobilityLabel = [
    mobility ? t(`caregiver.visitDetail.care.mobilityLevels.${mobility}`) : null,
    independence ? t(`caregiver.visitDetail.care.independenceLevels.${independence}`) : null
  ]
    .filter(Boolean)
    .join(' · ')

  const chronicConditions = snapshot?.chronicConditions || notes?.chronicConditions
  const careRequirements = snapshot?.careRequirements || notes?.careRequirements
  const medications = snapshot?.activeMedications ?? []

  const medicationTimes = Array.from(
    new Set(medications.flatMap((item) => (item.timeOfDay ?? []).map((time) => time.slice(0, 5))))
  )
    .sort()
    .join(', ')

  const hasAnyInfo = Boolean(mobilityLabel || chronicConditions || careRequirements || medications.length)

  return (
    <section aria-labelledby='care-profile-title' className={`${cgCard} p-4 sm:p-5`}>
      <h2 className='sr-only' id='care-profile-title'>
        {t('caregiver.visitDetail.care.title')}
      </h2>
      <div className='flex flex-wrap items-center gap-3'>
        <Avatar className='h-12 w-12 rounded-full text-base' decorative name={name} />
        <div className='min-w-0 flex-1'>
          <p className='text-xs font-medium text-on-surface-variant'>{t('caregiver.visitDetail.care.title')}</p>
          <p className='truncate text-lg font-semibold text-on-surface'>{name}</p>
          <p className='text-sm text-on-surface-variant'>
            {[
              people.age !== undefined ? t('caregiver.ui.age', { count: people.age }) : null,
              gender,
              snapshot?.bloodType ? t('caregiver.visitDetail.care.bloodType', { type: snapshot.bloodType }) : null
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
        {visit.recipientId && snapshot ? (
          <button
            aria-label={t('caregiver.visitDetail.profile.openLabel', { name })}
            className='cg-press inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl border border-outline-variant bg-surface-container-lowest px-3.5 text-sm font-semibold text-primary hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-primary'
            onClick={() => setProfileOpen(true)}
            type='button'
          >
            <Icon className='text-lg' name='clinical_notes' />
            {t('caregiver.visitDetail.profile.open')}
          </button>
        ) : null}
      </div>

      {visit.recipientId && snapshot ? (
        <RecipientProfileDialog
          onClose={() => setProfileOpen(false)}
          open={profileOpen}
          recipientId={visit.recipientId}
        />
      ) : null}

      {/* Compact Quick Summary Strip */}
      {hasAnyInfo ? (
        <div className='mt-3.5 flex flex-col gap-2.5'>
          <div className='flex flex-wrap items-center gap-2'>
            {mobilityLabel ? (
              <span className='inline-flex items-center gap-1.5 rounded-lg bg-surface-container-low px-2.5 py-1 text-xs font-medium text-on-surface'>
                <Icon className='text-base text-primary' name='accessible' />
                {mobilityLabel}
              </span>
            ) : null}
            {chronicConditions ? (
              <span className='inline-flex max-w-full items-center gap-1.5 rounded-lg bg-surface-container-low px-2.5 py-1 text-xs font-medium text-on-surface'>
                <Icon className='text-base text-primary' name='monitor_heart' />
                <span className='truncate'>{chronicConditions}</span>
              </span>
            ) : null}
          </div>

          {medications.length ? (
            <div className='flex items-center justify-between gap-3 rounded-lg bg-surface-container-low px-3 py-2 text-xs'>
              <span className='flex min-w-0 items-center gap-2 text-on-surface font-medium'>
                <Icon className='text-base text-primary shrink-0' name='medication' />
                <span className='truncate'>
                  {t('caregiver.visitDetail.care.medicationsSummary', {
                    count: medications.length,
                    times: medicationTimes || '--'
                  })}
                </span>
              </span>
              {visit.recipientId && snapshot ? (
                <button
                  className='shrink-0 font-semibold text-primary underline-offset-2 hover:underline'
                  onClick={() => setProfileOpen(true)}
                  type='button'
                >
                  {t('caregiver.visitDetail.care.viewMedications')}
                </button>
              ) : null}
            </div>
          ) : null}

          {careRequirements ? (
            <div className='rounded-lg bg-surface-container-low p-3 text-xs'>
              <p className='flex items-center gap-1.5 font-semibold text-primary'>
                <Icon className='text-base' name='assignment' />
                {t('caregiver.visitDetail.care.careNotesTitle')}
              </p>
              <p className='mt-1 text-sm line-clamp-2 text-on-surface whitespace-pre-line'>
                {careRequirements}
              </p>
            </div>
          ) : null}
        </div>
      ) : (
        <p className='mt-3 text-sm text-on-surface-variant'>
          {snapshot ? t('caregiver.visitDetail.care.noNotes') : t('caregiver.visitDetail.snapshotHidden')}
        </p>
      )}
    </section>
  )
}
