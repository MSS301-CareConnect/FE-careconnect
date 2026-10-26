import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Icon } from '~/shared/ui/icon'
import { SectionCard } from '~/shared/ui/section-card'

import type { useBookingForm } from '../hooks/use-booking-form'

type Form = ReturnType<typeof useBookingForm>

/** The center comes from the chosen caregiver, or from the service the customer picked on /customer/services. */
export function BookingProviderSection({ form }: { form: Form }) {
  const { t } = useTranslation()
  const { caregiver } = form

  return (
    <SectionCard
      action={
        <Link className='text-sm font-semibold text-primary hover:underline' to='/customer/caregivers'>
          {t('customer.booking.provider.change')}
        </Link>
      }
      icon='home_health'
      title={t('customer.booking.provider.title')}
    >
      {form.caregiverUserId && caregiver.isPending ? (
        <p className='text-sm text-on-surface-variant' role='status'>
          {t('customer.booking.provider.loading')}
        </p>
      ) : null}
      {form.caregiverUserId && caregiver.isError ? (
        <p className='text-sm text-error' role='alert'>
          {t('customer.booking.provider.error')}
        </p>
      ) : null}
      {caregiver.isSuccess ? (
        <div className='flex flex-col gap-4'>
          <div className='flex items-start gap-4 rounded-xl bg-surface-container-low p-4'>
            <span
              aria-hidden='true'
              className='grid h-12 w-12 shrink-0 place-items-center rounded-full bg-secondary-container text-lg font-bold text-primary'
            >
              {caregiver.data.fullName.trim().charAt(0).toUpperCase()}
            </span>
            <div className='min-w-0'>
              <p
                className={`font-bold ${form.withoutCaregiver ? 'text-on-surface-variant line-through' : 'text-on-surface'}`}
              >
                {caregiver.data.fullName}
              </p>
              <p className='flex items-center gap-1 text-sm text-on-surface-variant'>
                <Icon className='text-base text-primary' name='home_health' />
                {caregiver.data.centerName ?? t('customer.booking.provider.centerFallback')}
              </p>
            </div>
          </div>
          <label className='flex items-start gap-3 text-sm text-on-surface'>
            <input
              checked={form.withoutCaregiver}
              className='mt-1 h-4 w-4 accent-primary'
              onChange={(event) => form.setWithoutCaregiver(event.target.checked)}
              type='checkbox'
            />
            <span>
              {t('customer.booking.provider.letCenterAssign')}
              <span className='block text-xs text-on-surface-variant'>
                {t('customer.booking.provider.letCenterAssignHint')}
              </span>
            </span>
          </label>
        </div>
      ) : null}
      {!form.caregiverUserId && form.centerId ? (
        <p className='flex items-start gap-2 rounded-xl bg-surface-container-low p-4 text-sm text-on-surface-variant'>
          <Icon className='text-primary' name='info' />
          {t('customer.booking.provider.centerAssigns')}
        </p>
      ) : null}
    </SectionCard>
  )
}
