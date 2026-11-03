import { useTranslation } from 'react-i18next'

import type { CaregiverOccurrenceRecord } from '~/shared/api/generated/contracts'
import { Avatar } from '~/shared/ui/avatar'
import { Icon } from '~/shared/ui/icon'

import { cgCard } from '../../ui/caregiver-page'
import { visitPeople } from '../../ui/visit-card'

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

/** The person cared for: identity, health notes, medicines with their times, mobility and diet. */
export function CareProfile({ visit }: { visit: CaregiverOccurrenceRecord }) {
  const { t } = useTranslation()
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

  const sections = [
    { key: 'chronicConditions', icon: 'monitor_heart', value: snapshot?.chronicConditions || notes?.chronicConditions },
    {
      key: 'mobility',
      icon: 'accessible',
      value: [
        mobility ? t(`caregiver.visitDetail.care.mobilityLevels.${mobility}`) : null,
        independence ? t(`caregiver.visitDetail.care.independenceLevels.${independence}`) : null
      ]
        .filter(Boolean)
        .join(' · ')
    },
    { key: 'diet', icon: 'restaurant', value: snapshot?.dietaryNotes || notes?.dietaryNotes },
    { key: 'behavior', icon: 'psychology', value: snapshot?.behaviorNotes || notes?.behaviorNotes },
    { key: 'requirements', icon: 'assignment', value: snapshot?.careRequirements || notes?.careRequirements }
  ] as const
  const filled = sections.filter((section) => Boolean(section.value))
  const medications = snapshot?.activeMedications ?? []

  return (
    <section aria-labelledby='care-profile-title' className={`${cgCard} p-4 sm:p-5`}>
      <h2 className='sr-only' id='care-profile-title'>
        {t('caregiver.visitDetail.care.title')}
      </h2>
      <div className='flex items-center gap-3'>
        <Avatar className='h-12 w-12 rounded-full text-base' decorative name={name} />
        <div className='min-w-0'>
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
      </div>

      {medications.length ? (
        <div className='mt-4'>
          <h3 className='flex items-center gap-1.5 text-sm font-semibold text-on-surface'>
            <Icon className='text-lg text-primary' name='medication' />
            {t('caregiver.visitDetail.care.medications')}
          </h3>
          <ul className='mt-2 divide-y divide-outline-variant rounded-lg border border-outline-variant'>
            {medications.map((medication, index) => (
              <li
                className='flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 px-3 py-2.5'
                key={medication.id ?? index}
              >
                <span className='min-w-0'>
                  <strong className='font-semibold text-on-surface'>{medication.medicationName}</strong>
                  <span className='block text-sm text-on-surface-variant'>
                    {[medication.dosage, medication.route, medication.frequency, medication.usageNotes]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </span>
                {medication.timeOfDay?.length ? (
                  <span className='flex flex-wrap gap-1'>
                    {medication.timeOfDay.map((time) => (
                      <span
                        className='rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold text-primary tabular-nums'
                        key={time}
                      >
                        {time.slice(0, 5)}
                      </span>
                    ))}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {filled.length ? (
        <dl className='mt-4 grid gap-3 sm:grid-cols-2'>
          {filled.map((section) => (
            <div className='rounded-lg bg-surface-container-low p-3' key={section.key}>
              <dt className='flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant'>
                <Icon className='text-base text-primary' name={section.icon} />
                {t(`caregiver.visitDetail.care.${section.key}`)}
              </dt>
              <dd className='mt-1 text-sm whitespace-pre-line text-on-surface'>{section.value}</dd>
            </div>
          ))}
        </dl>
      ) : !medications.length ? (
        <p className='mt-4 text-sm text-on-surface-variant'>
          {snapshot ? t('caregiver.visitDetail.care.noNotes') : t('caregiver.visitDetail.snapshotHidden')}
        </p>
      ) : null}
    </section>
  )
}
