import { useTranslation } from 'react-i18next'

import type { BookingRecipientSnapshotRecord } from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'

/** Patient details frozen into the booking when it was created; caregivers and managers read this copy. */
export function BookingRecipientSnapshot({ snapshot }: { snapshot: BookingRecipientSnapshotRecord }) {
  const { t } = useTranslation()
  const address = [snapshot.addressLine, snapshot.ward, snapshot.district, snapshot.province].filter(Boolean).join(', ')
  const notes = [
    ['allergies', snapshot.allergies],
    ['chronicConditions', snapshot.chronicConditions],
    ['careRequirements', snapshot.careRequirements],
    ['dietaryNotes', snapshot.dietaryNotes],
    ['behaviorNotes', snapshot.behaviorNotes]
  ] as const

  return (
    <div className='flex flex-col gap-4 text-sm'>
      <div className='flex items-start gap-3'>
        <span
          aria-hidden='true'
          className='grid h-11 w-11 shrink-0 place-items-center rounded-full bg-secondary-container text-base font-bold text-primary'
        >
          {snapshot.fullName?.trim().charAt(0).toUpperCase() ?? '?'}
        </span>
        <div className='min-w-0'>
          <p className='text-base font-bold text-on-surface'>{snapshot.fullName}</p>
          <p className='text-on-surface-variant'>
            {[
              snapshot.age !== undefined ? t('booking.recipient.age', { age: snapshot.age }) : null,
              snapshot.gender,
              snapshot.bloodType
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
          {address ? (
            <p className='mt-1 flex items-start gap-1 text-on-surface-variant'>
              <Icon className='mt-0.5 text-base text-primary' name='home_pin' />
              {address}
            </p>
          ) : null}
        </div>
      </div>
      <dl className='grid gap-3 sm:grid-cols-2'>
        {notes
          .filter(([, value]) => Boolean(value))
          .map(([key, value]) => (
            <div className='rounded-lg bg-surface-container-low p-3' key={key}>
              <dt className='text-xs font-semibold text-on-surface-variant'>{t(`booking.recipient.${key}`)}</dt>
              <dd className='mt-1 text-on-surface'>{value}</dd>
            </div>
          ))}
      </dl>
      {snapshot.activeMedications?.length ? (
        <div>
          <h4 className='text-xs font-semibold text-on-surface-variant'>{t('booking.recipient.medications')}</h4>
          <ul className='mt-2 flex flex-col gap-1'>
            {snapshot.activeMedications.map((medication, index) => (
              <li className='text-on-surface' key={medication.id ?? index}>
                <strong className='font-semibold'>{medication.medicationName}</strong>
                {[medication.dosage, medication.frequency, medication.timeOfDay?.join(', ')]
                  .filter(Boolean)
                  .map((part) => ` · ${part}`)
                  .join('')}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {snapshot.primaryEmergencyContact?.fullName ? (
        <p className='flex items-center gap-2 text-on-surface-variant'>
          <Icon className='text-base text-primary' name='emergency' />
          {t('booking.recipient.emergencyContact', {
            name: snapshot.primaryEmergencyContact.fullName,
            phone: snapshot.primaryEmergencyContact.phoneNumber ?? ''
          })}
        </p>
      ) : null}
    </div>
  )
}
