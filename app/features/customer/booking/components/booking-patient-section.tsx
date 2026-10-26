import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Icon } from '~/shared/ui/icon'
import { SectionCard } from '~/shared/ui/section-card'

import type { useBookingForm } from '../hooks/use-booking-form'

type Form = ReturnType<typeof useBookingForm>

export function BookingPatientSection({ form }: { form: Form }) {
  const { t } = useTranslation()
  const { recipients } = form

  return (
    <SectionCard
      action={
        <Link className='text-sm font-semibold text-primary hover:underline' to='/customer/patient-profiles/new'>
          {t('customer.booking.patient.add')}
        </Link>
      }
      icon='person'
      title={t('customer.booking.patient.title')}
    >
      {recipients.isPending ? (
        <p className='text-sm text-on-surface-variant' role='status'>
          {t('customer.booking.patient.loading')}
        </p>
      ) : null}
      {recipients.isError ? (
        <p className='text-sm text-error' role='alert'>
          {t('customer.booking.patient.error')}
        </p>
      ) : null}
      {recipients.isSuccess && recipients.data.items.length === 0 ? (
        <p className='rounded-lg bg-surface-container-low p-4 text-sm text-on-surface-variant'>
          {t('customer.booking.patient.empty')}
        </p>
      ) : null}
      {recipients.isSuccess && recipients.data.items.length > 0 ? (
        <fieldset>
          <legend className='sr-only'>{t('customer.booking.patient.title')}</legend>
          <div className='grid gap-3 sm:grid-cols-2'>
            {recipients.data.items.map((patient) => {
              const checked = form.recipientId === patient.id
              return (
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-xl p-4 transition-colors ${checked ? 'bg-secondary-container ring-2 ring-primary' : 'bg-surface-container-low hover:bg-surface-container'}`}
                  key={patient.id}
                >
                  <input
                    checked={checked}
                    className='sr-only'
                    name='recipient'
                    onChange={() => form.setRecipientId(patient.id)}
                    type='radio'
                    value={patient.id}
                  />
                  <span
                    aria-hidden='true'
                    className='grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white font-bold text-primary'
                  >
                    {patient.fullName.trim().charAt(0).toUpperCase()}
                  </span>
                  <span className='min-w-0 flex-1'>
                    <span className='block truncate font-semibold text-on-surface'>{patient.fullName}</span>
                    <span className='block truncate text-xs text-on-surface-variant'>
                      {[
                        patient.age !== undefined ? t('booking.recipient.age', { age: patient.age }) : null,
                        patient.district,
                        patient.province
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  </span>
                  {checked ? <Icon className='text-primary' filled name='check_circle' /> : null}
                </label>
              )
            })}
          </div>
        </fieldset>
      ) : null}
    </SectionCard>
  )
}
