import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import {
  careRecipientErrorStatus,
  careRecipientKeys,
  fetchAssignedCareRecipient
} from '~/entities/care-recipient/care-recipient-api'
import type { EmergencyContactRecord, MedicationRecord } from '~/shared/api/generated/contracts'
import { formatPhone, phoneHref } from '~/shared/lib/phone'
import { Avatar } from '~/shared/ui/avatar'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'
import { Modal } from '~/shared/ui/modal'
import { Skeleton, SkeletonGroup } from '~/shared/ui/skeleton'

import { useCaregiverFormat } from '../../ui/caregiver-format'

const MOBILITY = ['INDEPENDENT', 'NEEDS_ASSISTANCE', 'WHEELCHAIR', 'BEDRIDDEN'] as const
const INDEPENDENCE = ['INDEPENDENT', 'PARTIALLY_DEPENDENT', 'FULLY_DEPENDENT'] as const
const ROUTES = ['ORAL', 'INJECTION', 'TOPICAL', 'INHALATION', 'OTHER'] as const
const GENDERS = ['MALE', 'FEMALE', 'OTHER'] as const

const key = 'caregiver.visitDetail.profile' as const

type AssignedProfile = Awaited<ReturnType<typeof fetchAssignedCareRecipient>>

/**
 * The whole profile the family keeps for the person cared for, read live from CareRecipientService while the caregiver
 * is assigned (BookingService decides). Laid out to be read at a glance without scrolling on a laptop: who the person
 * is with the allergy beside the name, one row of key facts, then three columns — health and emergency contacts, the
 * day's medicines in time order, and daily life. On phones the columns stack in that order.
 */
export function RecipientProfileDialog({
  recipientId,
  open,
  onClose
}: {
  recipientId: string
  open: boolean
  onClose: () => void
}) {
  const { t } = useTranslation()
  const format = useCaregiverFormat()
  const profile = useQuery({
    queryKey: careRecipientKeys.caregiverView(recipientId),
    queryFn: () => fetchAssignedCareRecipient(recipientId),
    enabled: open,
    retry: false
  })
  const snapshotAt = profile.data?.snapshot.snapshotAt
  const notFound = profile.isError && careRecipientErrorStatus(profile.error) === 404

  return (
    <Modal
      description={t(`${key}.description`)}
      footer={
        <div className='flex w-full flex-wrap items-center justify-between gap-3'>
          <p className='text-xs text-on-surface-variant tabular-nums'>
            {snapshotAt ? t(`${key}.updatedAt`, { time: format.shortDateTime(snapshotAt) }) : null}
          </p>
          <Button onClick={onClose} variant='secondary'>
            {t('caregiver.ui.actions.close')}
          </Button>
        </div>
      }
      onClose={onClose}
      open={open}
      size='2xl'
      title={t(`${key}.title`)}
    >
      {profile.isPending ? (
        <SkeletonGroup className='flex flex-col gap-3' label={t(`${key}.loading`)}>
          <Skeleton className='h-14 w-72 rounded-xl' />
          <Skeleton className='h-16 rounded-xl' />
          <div className='grid gap-3 lg:grid-cols-3'>
            <Skeleton className='h-56 rounded-xl' />
            <Skeleton className='h-56 rounded-xl' />
            <Skeleton className='h-56 rounded-xl' />
          </div>
        </SkeletonGroup>
      ) : profile.isError ? (
        <div className='flex flex-col items-start gap-3 rounded-xl bg-surface-container-low p-4' role='alert'>
          <p className='text-sm text-on-surface'>{notFound ? t(`${key}.notAvailable`) : t(`${key}.error`)}</p>
          {notFound ? null : (
            <Button onClick={() => void profile.refetch()} size='sm' variant='secondary'>
              {t('caregiver.ui.actions.retry')}
            </Button>
          )}
        </div>
      ) : (
        <ProfileBody data={profile.data} />
      )}
    </Modal>
  )
}

/** Earliest time of day of a medicine ("07:00"), so the list reads in the order of the day. */
function firstTime(medication: MedicationRecord) {
  return [...(medication.timeOfDay ?? [])].sort()[0] ?? '99:99'
}

function ProfileBody({ data }: { data: AssignedProfile }) {
  const { t } = useTranslation()
  const format = useCaregiverFormat()
  const { snapshot, details, emergencyContacts } = data
  const gender = GENDERS.find((value) => value === snapshot.gender)
  const mobility = MOBILITY.find((value) => value === snapshot.mobilityLevel)
  const independence = INDEPENDENCE.find((value) => value === snapshot.independenceLevel)
  const address = [snapshot.addressLine, snapshot.ward, snapshot.district, snapshot.province].filter(Boolean).join(', ')
  const medications = [...(snapshot.activeMedications ?? [])].sort((a, b) => firstTime(a).localeCompare(firstTime(b)))
  const contacts = [...emergencyContacts].sort(
    (a, b) => Number(b.primary) - Number(a.primary) || a.priority - b.priority
  )
  const levels = [
    mobility ? t(`caregiver.visitDetail.care.mobilityLevels.${mobility}`) : null,
    independence ? t(`caregiver.visitDetail.care.independenceLevels.${independence}`) : null
  ].filter((label): label is string => Boolean(label))

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div className='flex min-w-0 items-center gap-3'>
          <Avatar className='h-12 w-12 rounded-full text-base' decorative name={snapshot.fullName} />
          <div className='min-w-0'>
            <p className='text-lg font-semibold break-words text-on-surface'>{snapshot.fullName}</p>
            <p className='text-sm text-on-surface-variant'>
              {[
                snapshot.age !== undefined ? t('caregiver.ui.age', { count: snapshot.age }) : null,
                gender ? t(`caregiver.ui.gender.${gender}`) : null,
                snapshot.bloodType && snapshot.bloodType !== 'UNKNOWN'
                  ? t('caregiver.visitDetail.care.bloodType', { type: snapshot.bloodType })
                  : null
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
        </div>
        {snapshot.allergies ? (
          <p
            className='flex max-w-full items-start gap-2 rounded-xl border border-error/30 bg-error-container px-3 py-2 text-sm text-on-error-container'
            role='note'
          >
            <Icon className='text-lg' filled name='warning' />
            <span>
              <strong className='font-semibold'>{t(`${key}.fields.allergies`)}</strong>
              <span className='ml-1.5 font-medium whitespace-pre-line'>{snapshot.allergies}</span>
            </span>
          </p>
        ) : null}
      </div>

      <dl className='grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl bg-surface-container-low px-4 py-3 sm:grid-cols-4 lg:grid-cols-[repeat(4,minmax(0,auto))_minmax(0,1fr)] lg:gap-x-10'>
        <Fact label={t(`${key}.fields.dateOfBirth`)} value={format.date(snapshot.dateOfBirth)} />
        <Fact
          label={t(`${key}.fields.height`)}
          value={details?.heightCm ? t(`${key}.height`, { value: details.heightCm }) : ''}
        />
        <Fact
          label={t(`${key}.fields.weight`)}
          value={details?.weightKg ? t(`${key}.weight`, { value: details.weightKg }) : ''}
        />
        <Fact label={t(`${key}.fields.phone`)} value={<PhoneValue phone={snapshot.phoneNumber} />} />
        <Fact className='col-span-2 sm:col-span-4 lg:col-span-1' label={t(`${key}.fields.address`)} value={address} />
      </dl>

      <div className='grid items-start gap-4 md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_minmax(0,1fr)]'>
        <div className='flex min-w-0 flex-col gap-4'>
          <ProfileSection icon='monitor_heart' title={t(`${key}.sections.health`)}>
            <Notes
              items={[
                { label: t(`${key}.fields.chronicConditions`), value: snapshot.chronicConditions },
                { label: t(`${key}.fields.medicalHistory`), value: details?.medicalHistory }
              ]}
            />
          </ProfileSection>
          <ProfileSection count={contacts.length} icon='contact_emergency' title={t(`${key}.sections.contacts`)}>
            {contacts.length ? (
              <ul className='flex flex-col divide-y divide-outline-variant'>
                {contacts.map((contact) => (
                  <ContactItem contact={contact} key={contact.id} />
                ))}
              </ul>
            ) : (
              <p className='text-sm text-on-surface-variant'>{t(`${key}.noContacts`)}</p>
            )}
          </ProfileSection>
        </div>

        <ProfileSection count={medications.length} icon='medication' title={t(`${key}.sections.medications`)}>
          {medications.length ? (
            <ul className='flex flex-col divide-y divide-outline-variant'>
              {medications.map((medication) => (
                <MedicationRow key={medication.id} medication={medication} />
              ))}
            </ul>
          ) : (
            <p className='text-sm text-on-surface-variant'>{t(`${key}.noMedications`)}</p>
          )}
        </ProfileSection>

        <ProfileSection className='md:col-span-2 lg:col-span-1' icon='self_care' title={t(`${key}.sections.daily`)}>
          <div className='flex flex-col gap-3'>
            {levels.length ? (
              <div className='flex flex-wrap gap-1.5'>
                {levels.map((label) => (
                  <span className='rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-primary' key={label}>
                    {label}
                  </span>
                ))}
              </div>
            ) : null}
            <DailyCard
              icon='restaurant'
              label={t(`${key}.fields.diet`)}
              value={snapshot.dietaryNotes}
            />
            <DailyCard
              icon='bedtime'
              label={t(`${key}.fields.sleep`)}
              value={details?.sleepHabits}
            />
            <DailyCard
              icon='psychology'
              label={t(`${key}.fields.behavior`)}
              value={snapshot.behaviorNotes}
            />
            <DailyCard
              icon='assignment_turned_in'
              label={t(`${key}.fields.requirements`)}
              value={snapshot.careRequirements}
            />
          </div>
        </ProfileSection>
      </div>
    </div>
  )
}

function ProfileSection({
  icon,
  title,
  count,
  className = '',
  children
}: {
  icon: string
  title: string
  count?: number
  className?: string
  children: ReactNode
}) {
  return (
    <section className={`min-w-0 rounded-xl border border-outline-variant p-4 ${className}`}>
      <h3 className='mb-2.5 flex items-center gap-1.5 text-sm font-semibold text-on-surface'>
        <Icon className='text-lg text-primary' name={icon} />
        {title}
        {count ? (
          <span className='rounded-full bg-brand-50 px-2 text-xs font-semibold text-primary tabular-nums'>{count}</span>
        ) : null}
      </h3>
      {children}
    </section>
  )
}

/** One fact of the facts row; an empty value reads "Not provided" so it does not look left out by mistake. */
function Fact({ label, value, className = '' }: { label: string; value: ReactNode; className?: string }) {
  const { t } = useTranslation()
  return (
    <div className={`min-w-0 ${className}`}>
      <dt className='text-xs text-on-surface-variant'>{label}</dt>
      <dd className='mt-0.5 text-sm font-semibold break-words text-on-surface tabular-nums'>
        {value || <span className='font-normal text-on-surface-variant'>{t(`${key}.notProvided`)}</span>}
      </dd>
    </div>
  )
}

/** Free-text notes, each label above its value. */
function Notes({ items }: { items: { label: string; value?: string }[] }) {
  const { t } = useTranslation()
  return (
    <dl className='flex flex-col gap-2.5'>
      {items.map((item) => (
        <div key={item.label}>
          <dt className='text-xs font-semibold text-on-surface-variant'>{item.label}</dt>
          <dd className='mt-0.5 text-sm leading-relaxed break-words whitespace-pre-line text-on-surface'>
            {item.value || <span className='text-on-surface-variant'>{t(`${key}.notProvided`)}</span>}
          </dd>
        </div>
      ))}
    </dl>
  )
}

function DailyCard({ icon, label, value }: { icon: string; label: string; value?: string }) {
  const { t } = useTranslation()
  return (
    <div className='rounded-xl border border-outline-variant/60 bg-surface-container-low p-3 transition-colors'>
      <span className='flex items-center gap-1.5 text-xs font-bold text-on-surface'>
        <Icon className='text-base text-primary' name={icon} />
        {label}
      </span>
      <p className='mt-1 text-sm leading-relaxed break-words whitespace-pre-line text-on-surface'>
        {value || <span className='text-xs italic text-on-surface-variant'>{t(`${key}.notProvided`)}</span>}
      </p>
    </div>
  )
}

function PhoneValue({ phone }: { phone?: string }) {
  if (!phone) return null
  const href = phoneHref(phone)
  return href ? (
    <a className='text-primary underline-offset-2 hover:underline' href={href}>
      {formatPhone(phone)}
    </a>
  ) : (
    <span>{formatPhone(phone)}</span>
  )
}

function MedicationRow({ medication }: { medication: MedicationRecord }) {
  const { t } = useTranslation()
  const format = useCaregiverFormat()
  const route = ROUTES.find((value) => value === medication.route)
  const period = medication.endDate
    ? t(`${key}.dateRange`, { from: format.date(medication.startDate), to: format.date(medication.endDate) })
    : t(`${key}.since`, { date: format.date(medication.startDate) })
  return (
    <li className='py-2.5 first:pt-0 last:pb-0'>
      <div className='flex items-start justify-between gap-3'>
        <p className='min-w-0 font-semibold break-words text-on-surface'>{medication.medicationName}</p>
        {medication.timeOfDay?.length ? (
          <span className='flex shrink-0 flex-wrap justify-end gap-1'>
            {[...medication.timeOfDay].sort().map((time) => (
              <span
                className='rounded-md bg-brand-50 px-1.5 py-0.5 text-xs font-semibold text-primary tabular-nums'
                key={time}
              >
                {time.slice(0, 5)}
              </span>
            ))}
          </span>
        ) : null}
      </div>
      <p className='text-sm text-on-surface-variant'>
        {[medication.dosage, route ? t(`${key}.routes.${route}`) : null, medication.frequency]
          .filter(Boolean)
          .join(' · ')}
      </p>
      {medication.usageNotes ? (
        <p className='mt-0.5 text-sm whitespace-pre-line text-on-surface'>{medication.usageNotes}</p>
      ) : null}
      <p className='mt-0.5 text-xs text-on-surface-variant tabular-nums'>
        {[period, medication.prescribedBy ? t(`${key}.prescribedBy`, { name: medication.prescribedBy }) : null]
          .filter(Boolean)
          .join(' · ')}
      </p>
    </li>
  )
}

function ContactItem({ contact }: { contact: EmergencyContactRecord }) {
  const { t } = useTranslation()
  const href = phoneHref(contact.phoneNumber)
  const phone = formatPhone(contact.phoneNumber)
  return (
    <li className='flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0'>
      <div className='min-w-0 text-sm'>
        <p className='flex flex-wrap items-center gap-x-2 font-semibold text-on-surface'>
          <span className='break-words'>{contact.fullName}</span>
          {contact.primary ? (
            <span className='rounded-full bg-brand-50 px-2 text-xs font-semibold text-primary'>
              {t(`${key}.primaryContact`)}
            </span>
          ) : null}
        </p>
        <p className='text-on-surface-variant'>
          {contact.relationship} · <span className='font-semibold text-on-surface tabular-nums'>{phone}</span>
        </p>
      </div>
      {href ? (
        <a
          aria-label={t('caregiver.ui.actions.callNumber', { phone })}
          className='cg-press grid h-11 w-11 shrink-0 place-items-center rounded-full border border-outline-variant text-primary hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-primary'
          href={href}
        >
          <Icon className='text-xl' name='call' />
        </a>
      ) : null}
    </li>
  )
}
