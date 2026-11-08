import { useTranslation } from 'react-i18next'

import type { CareRecipientDetailRecord } from '~/shared/api/generated/contracts'
import { formatCalendarDate } from '~/shared/lib/format'
import { Icon } from '~/shared/ui/icon'

import type { EditSection } from '../hooks/use-profile-editor'
import type { DetailTab } from '../profile-completeness'
import { DetailSection, EmergencyCallout, FieldsBlock } from './detail-ui'

const key = 'customer.patientDetail' as const

interface TabProps {
  detail: CareRecipientDetailRecord
  /** Opens a section's drawer; undefined for read-only access. */
  onEdit?: (section: EditSection) => void
}

/** Allergies are the one thing a caregiver must never miss, so they are called out wherever health shows. */
function AllergyCallout({ allergies }: { allergies?: string }) {
  const { t } = useTranslation()
  if (!allergies) return null
  return (
    <div className='flex items-start gap-3 rounded-2xl border border-error/25 bg-error-container/50 px-4 py-3 text-sm text-on-error-container'>
      <Icon className='mt-0.5 text-xl text-error' name='warning' />
      <p className='min-w-0'>
        <span className='font-semibold'>{t(`${key}.overview.allergyCallout`)}</span>{' '}
        <span className='whitespace-pre-line'>{allergies}</span>
      </p>
    </div>
  )
}

export function OverviewTab({ detail, onEdit, onOpenTab }: TabProps & { onOpenTab: (tab: DetailTab) => void }) {
  const { t } = useTranslation()
  const { profile } = detail
  const activeMedications = (detail.medications ?? []).filter((medication) => medication.active).length
  const primaryContact =
    (detail.emergencyContacts ?? []).find((contact) => contact.primary) ?? detail.emergencyContacts?.[0]
  const address = [profile.addressLine, profile.ward, profile.district, profile.province].filter(Boolean).join(', ')

  return (
    <div className='flex flex-col gap-5'>
      <AllergyCallout allergies={profile.allergies} />
      <DetailSection
        editLabel={t(`${key}.drawer.basic.title`)}
        icon='badge'
        onEdit={onEdit ? () => onEdit('basic') : undefined}
        title={t(`${key}.overview.basic`)}
      >
        <FieldsBlock
          fields={[
            { label: t(`${key}.snapshot.dateOfBirthLabel`), value: formatCalendarDate(profile.dateOfBirth) },
            {
              label: t(`${key}.snapshot.genderLabel`),
              value: profile.gender ? t(`customer.careRecipient.gender.${profile.gender}`) : undefined
            },
            { label: t(`${key}.snapshot.phoneNumberLabel`), value: profile.phoneNumber },
            {
              label: t(`${key}.snapshot.bloodType`),
              value: profile.bloodType === 'UNKNOWN' ? t('customer.careRecipient.bloodType.UNKNOWN') : profile.bloodType
            },
            {
              label: t(`${key}.snapshot.height`),
              value:
                profile.heightCm == null ? undefined : t(`${key}.snapshot.heightValue`, { value: profile.heightCm })
            },
            {
              label: t(`${key}.snapshot.weight`),
              value:
                profile.weightKg == null ? undefined : t(`${key}.snapshot.weightValue`, { value: profile.weightKg })
            }
          ]}
          onAdd={onEdit ? () => onEdit('basic') : undefined}
        />
      </DetailSection>

      <DetailSection
        editLabel={t(`${key}.drawer.address.title`)}
        icon='home_pin'
        onEdit={onEdit ? () => onEdit('address') : undefined}
        title={t(`${key}.overview.address`)}
      >
        <FieldsBlock
          fields={[{ label: t(`${key}.overview.addressValue`), value: address }]}
          onAdd={onEdit ? () => onEdit('address') : undefined}
        />
      </DetailSection>

      <div className='grid gap-4 sm:grid-cols-2'>
        <button
          className='cc-lift flex items-center gap-3 rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 text-left shadow-[var(--shadow-card)] focus-visible:outline-2 focus-visible:outline-primary'
          onClick={() => onOpenTab('medical')}
          type='button'
        >
          <span className='grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-primary'>
            <Icon className='text-xl' name='medication' />
          </span>
          <span className='min-w-0 flex-1'>
            <span className='block text-xs text-on-surface-variant'>{t(`${key}.overview.medications`)}</span>
            <span className='block font-semibold text-on-surface'>
              {t(`${key}.prescriptions.activeCount`, { count: activeMedications })}
            </span>
          </span>
          <Icon className='text-xl text-on-surface-variant' name='chevron_right' />
        </button>
        <button
          className='cc-lift flex items-center gap-3 rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 text-left shadow-[var(--shadow-card)] focus-visible:outline-2 focus-visible:outline-primary'
          onClick={() => onOpenTab('contacts')}
          type='button'
        >
          <span className='grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-primary'>
            <Icon className='text-xl' name='contact_emergency' />
          </span>
          <span className='min-w-0 flex-1'>
            <span className='block text-xs text-on-surface-variant'>{t(`${key}.overview.primaryContact`)}</span>
            <span className='block truncate font-semibold text-on-surface'>
              {primaryContact
                ? `${primaryContact.fullName} · ${primaryContact.phoneNumber}`
                : t(`${key}.emergencySection.empty`)}
            </span>
          </span>
          <Icon className='text-xl text-on-surface-variant' name='chevron_right' />
        </button>
      </div>

      <EmergencyCallout
        number={t(`${key}.emergencySection.hotlineNumber`)}
        title={t(`${key}.emergencySection.hotlineTitle`)}
      />
    </div>
  )
}

export function MedicalBackground({ detail, onEdit }: TabProps) {
  const { t } = useTranslation()
  const { profile } = detail
  return (
    <DetailSection
      editLabel={t(`${key}.drawer.medical.title`)}
      icon='vital_signs'
      onEdit={onEdit ? () => onEdit('medical') : undefined}
      title={t(`${key}.medicalBackground.title`)}
    >
      <FieldsBlock
        fields={[
          { label: t(`${key}.medicalBackground.chronicLabel`), value: profile.chronicConditions },
          { label: t(`${key}.medicalBackground.allergyLabel`), value: profile.allergies },
          { label: t(`${key}.medicalBackground.historyLabel`), value: profile.medicalHistory }
        ]}
        onAdd={onEdit ? () => onEdit('medical') : undefined}
      />
    </DetailSection>
  )
}

export function DailyLifeTab({ detail, onEdit }: TabProps) {
  const { t } = useTranslation()
  const { profile } = detail
  return (
    <DetailSection
      editLabel={t(`${key}.drawer.daily.title`)}
      icon='self_care'
      onEdit={onEdit ? () => onEdit('daily') : undefined}
      title={t(`${key}.carePlan.title`)}
    >
      <FieldsBlock
        fields={[
          {
            label: t(`${key}.carePlan.mobilityLabel`),
            value: profile.mobilityLevel ? t(`customer.careRecipient.mobility.${profile.mobilityLevel}`) : undefined
          },
          {
            label: t(`${key}.carePlan.independenceLabel`),
            value: profile.independenceLevel
              ? t(`customer.careRecipient.independence.${profile.independenceLevel}`)
              : undefined
          },
          { label: t(`${key}.carePlan.nutritionTitle`), value: profile.dietaryNotes },
          { label: t(`${key}.carePlan.sleepTitle`), value: profile.sleepHabits },
          { label: t(`${key}.carePlan.behaviorTitle`), value: profile.behaviorNotes },
          { label: t(`${key}.carePlan.requirementsTitle`), value: profile.careRequirements }
        ]}
        onAdd={onEdit ? () => onEdit('daily') : undefined}
      />
    </DetailSection>
  )
}

export { AllergyCallout }
