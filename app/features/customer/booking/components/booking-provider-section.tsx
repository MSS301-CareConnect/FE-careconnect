import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import type { useBookingForm } from '../hooks/use-booking-form'
import { BookingPanel, bookingField } from './booking-panel'

type Form = ReturnType<typeof useBookingForm>

/** The care center; its caregivers are chosen after the services (Q10). */
export function BookingProviderSection({ form }: { form: Form }) {
  const { t } = useTranslation()
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
        </div>
      ) : null}
    </BookingPanel>
  )
}
