import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Icon } from '~/shared/ui/icon'

import type { useBookingForm } from '../hooks/use-booking-form'
import { BookingPanel, bookingOption } from './booking-panel'

type Form = ReturnType<typeof useBookingForm>

export function BookingPatientSection({ form }: { form: Form }) {
  const { t } = useTranslation()
  const { recipients } = form

  return (
    <BookingPanel
      action={
        <Link
          className='inline-flex items-center gap-1 text-sm font-bold text-[#075b31] underline-offset-4 hover:underline'
          to='/customer/patient-profiles/new'
        >
          <Icon className='text-lg' name='add' />
          {t('customer.booking.patient.add')}
        </Link>
      }
      description={t('customer.booking.patient.description')}
      icon='person'
      id='booking-patient'
      title={t('customer.booking.patient.title')}
    >
      {recipients.isPending ? (
        <p className='text-sm text-[#637469]' role='status'>
          {t('customer.booking.patient.loading')}
        </p>
      ) : null}
      {recipients.isError ? (
        <p className='text-sm text-[#ba1a1a]' role='alert'>
          {t('customer.booking.patient.error')}
        </p>
      ) : null}
      {recipients.isSuccess && recipients.data.items.length === 0 ? (
        <p className='rounded-xl bg-[#f5f9f4] p-4 text-sm text-[#526a57]'>{t('customer.booking.patient.empty')}</p>
      ) : null}
      {recipients.isSuccess && recipients.data.items.length > 0 ? (
        <fieldset>
          <legend className='sr-only'>{t('customer.booking.patient.title')}</legend>
          <div className='grid gap-3 sm:grid-cols-2'>
            {recipients.data.items.map((patient) => {
              const checked = form.recipientId === patient.id
              return (
                <label
                  className={`flex cursor-pointer items-center gap-3 p-4 has-focus-visible:outline-2 has-focus-visible:outline-[#075b31] ${bookingOption(checked)}`}
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
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-base font-bold ${checked ? 'bg-[#075b31] text-white' : 'bg-[#e8f0e8] text-[#075b31]'}`}
                  >
                    {patient.fullName.trim().charAt(0).toUpperCase()}
                  </span>
                  <span className='min-w-0 flex-1'>
                    <span className='block truncate font-bold text-[#1b2922]'>{patient.fullName}</span>
                    <span className='block truncate text-sm text-[#637469]'>
                      {[
                        patient.age !== undefined ? t('booking.recipient.age', { age: patient.age }) : null,
                        patient.district,
                        patient.province
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  </span>
                  {checked ? <Icon className='text-[#075b31]' filled name='check_circle' /> : null}
                </label>
              )
            })}
          </div>
        </fieldset>
      ) : null}
    </BookingPanel>
  )
}
