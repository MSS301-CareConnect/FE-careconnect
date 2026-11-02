import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'

import type { useBookingForm } from '../hooks/use-booking-form'
import { BookingPanel, bookingOption } from './booking-panel'

type Form = ReturnType<typeof useBookingForm>

/**
 * A caregiver of the chosen center who provides every chosen service (Q10), or the center's own assignment for
 * RECURRING / CUSTOM. SHIFT always books a named caregiver's shift (spec §4).
 */
export function BookingCaregiverSection({ form }: { form: Form }) {
  const { t, i18n } = useTranslation()
  if (!form.centerId) return null
  const shift = form.schedule.bookingType === 'SHIFT'
  const { caregivers } = form.providers

  return (
    <BookingPanel
      description={
        form.caregiversFiltered
          ? t('customer.booking.caregiver.filtered')
          : t('customer.booking.caregiver.chooseServicesFirst')
      }
      icon='person_search'
      id='booking-caregiver'
      title={t('customer.booking.provider.caregiver')}
    >
      {caregivers.isPending ? (
        <p className='text-sm text-on-surface-variant' role='status'>
          {t('customer.booking.provider.loading')}
        </p>
      ) : null}
      {caregivers.isError ? (
        <p className='text-sm text-error' role='alert'>
          {t('customer.booking.caregiver.error')}
        </p>
      ) : null}
      {caregivers.isSuccess && form.centerCaregivers.length === 0 ? (
        <p className='mb-3 rounded-xl bg-surface-container-low p-4 text-sm text-on-surface-variant'>
          {t('customer.booking.caregiver.empty')}
        </p>
      ) : null}
      <fieldset>
        <legend className='sr-only'>{t('customer.booking.provider.caregiver')}</legend>
        <div className='grid gap-3 sm:grid-cols-2'>
          {shift ? null : (
            <label
              className={`flex cursor-pointer items-start gap-3 p-4 has-focus-visible:outline-2 has-focus-visible:outline-primary ${bookingOption(form.selectedCaregiverId === '')}`}
            >
              <input
                checked={form.selectedCaregiverId === ''}
                className='sr-only'
                name='caregiver'
                onChange={() => form.selectCaregiver('')}
                type='radio'
              />
              <Icon className='mt-0.5 text-2xl text-primary' name='diversity_1' />
              <span className='min-w-0'>
                <span className='block font-bold text-on-surface'>
                  {t('customer.booking.provider.letCenterAssign')}
                </span>
                <span className='block text-sm leading-5 text-on-surface-variant'>
                  {t('customer.booking.provider.letCenterAssignHint')}
                </span>
              </span>
            </label>
          )}
          {form.centerCaregivers.map((caregiver) => {
            const id = caregiver.id
            const checked = form.selectedCaregiverId === id
            return (
              <label
                className={`flex cursor-pointer items-start gap-3 p-4 has-focus-visible:outline-2 has-focus-visible:outline-primary ${bookingOption(checked)}`}
                key={id}
              >
                <input
                  checked={checked}
                  className='sr-only'
                  name='caregiver'
                  onChange={() => form.selectCaregiver(id)}
                  type='radio'
                />
                <span
                  aria-hidden='true'
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-full font-bold ${checked ? 'bg-primary text-on-primary' : 'bg-primary-fixed text-primary'}`}
                >
                  {caregiver.fullName.trim().charAt(0).toUpperCase()}
                </span>
                <span className='min-w-0'>
                  <span className='block truncate font-bold text-on-surface'>{caregiver.fullName}</span>
                  <span className='flex flex-wrap gap-x-3 text-sm text-on-surface-variant tabular-nums'>
                    {caregiver.experienceYears !== undefined ? (
                      <span>{t('customer.booking.provider.experience', { years: caregiver.experienceYears })}</span>
                    ) : null}
                    {caregiver.ratingAverage !== undefined ? (
                      <span className='inline-flex items-center gap-0.5'>
                        <Icon className='text-base text-warning' filled name='star' />
                        {new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 1 }).format(
                          caregiver.ratingAverage
                        )}
                      </span>
                    ) : null}
                  </span>
                </span>
              </label>
            )
          })}
        </div>
      </fieldset>
      {shift && !form.selectedCaregiverId ? (
        <p className='mt-3 text-sm text-on-surface-variant'>{t('customer.booking.caregiver.shiftRequired')}</p>
      ) : null}
    </BookingPanel>
  )
}
