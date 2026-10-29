import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'

import type { useBookingForm } from '../hooks/use-booking-form'
import { BookingPanel, bookingField, bookingOption } from './booking-panel'

type Form = ReturnType<typeof useBookingForm>

/** The center first, then a caregiver of that center or the center's own assignment. */
export function BookingProviderSection({ form }: { form: Form }) {
  const { t, i18n } = useTranslation()
  const centerFieldId = useId()
  const { centers: centerList } = form.providers
  const centers = centerList.data ?? []
  const loading = centerList.isPending || (Boolean(form.caregiverParam) && form.caregiver.isPending)
  const knownCenter = centers.some((center) => center.id === form.centerId)

  return (
    <BookingPanel
      description={t('customer.booking.provider.description')}
      icon='home_health'
      id='booking-provider'
      title={t('customer.booking.provider.title')}
    >
      {loading ? (
        <p className='text-sm text-on-surface-variant' role='status'>
          {t('customer.booking.provider.loading')}
        </p>
      ) : null}
      {centerList.isError ? (
        <p className='text-sm text-error' role='alert'>
          {t('customer.booking.provider.error')}
        </p>
      ) : null}
      {centerList.isSuccess && centers.length === 0 && !form.centerId ? (
        <p className='rounded-xl bg-surface-container-low p-4 text-sm text-on-surface-variant'>
          {t('customer.booking.provider.empty')}
        </p>
      ) : null}

      {!loading && (centers.length > 0 || form.centerId) ? (
        <div className='flex flex-col gap-5'>
          <div>
            <label className='text-sm font-semibold text-on-surface' htmlFor={centerFieldId}>
              {t('customer.booking.provider.center')}
            </label>
            <select
              className={bookingField}
              id={centerFieldId}
              onChange={(event) => form.selectCenter(event.target.value)}
              value={form.centerId}
            >
              <option disabled value=''>
                {t('customer.booking.provider.chooseCenter')}
              </option>
              {!knownCenter && form.centerId ? (
                <option value={form.centerId}>
                  {form.centerName ?? t('customer.booking.provider.centerFallback')}
                </option>
              ) : null}
              {centers.map((center) => (
                <option key={center.id} value={center.id}>
                  {center.name}
                </option>
              ))}
            </select>
          </div>

          {form.centerId ? (
            <fieldset>
              <legend className='text-sm font-semibold text-on-surface'>
                {t('customer.booking.provider.caregiver')}
              </legend>
              <div className='mt-2 grid gap-3 sm:grid-cols-2'>
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
                            <span>
                              {t('customer.booking.provider.experience', { years: caregiver.experienceYears })}
                            </span>
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
          ) : null}
        </div>
      ) : null}
    </BookingPanel>
  )
}
