import { useTranslation } from 'react-i18next'

import { SectionCard } from '~/shared/ui/section-card'

import type { useBookingForm } from '../hooks/use-booking-form'
import { BookingServiceOption } from './booking-service-option'

type Form = ReturnType<typeof useBookingForm>
const MAX_SERVICES = 10

export function BookingServicesSection({ form }: { form: Form }) {
  const { t } = useTranslation()
  const { offerings } = form
  const count = Object.keys(form.services).length
  // A service chosen on /customer/services is listed first so the customer finds it at once.
  const items = [...(offerings.data ?? [])].sort(
    (first, second) =>
      Number(second.catalogItem.id === form.preselectedService) -
      Number(first.catalogItem.id === form.preselectedService)
  )

  return (
    <SectionCard
      action={
        <span className='text-xs text-on-surface-variant'>
          {t('customer.booking.services.limit', { count: MAX_SERVICES })}
        </span>
      }
      icon='medical_services'
      title={t('customer.booking.services.title')}
    >
      {offerings.isPending ? (
        <p className='text-sm text-on-surface-variant' role='status'>
          {t('customer.booking.services.loading')}
        </p>
      ) : null}
      {offerings.isError ? (
        <p className='text-sm text-error' role='alert'>
          {t('customer.booking.services.error')}
        </p>
      ) : null}
      {offerings.isSuccess && items.length === 0 ? (
        <p className='rounded-lg bg-surface-container-low p-4 text-sm text-on-surface-variant'>
          {t('customer.booking.services.empty')}
        </p>
      ) : null}
      {items.length > 0 ? (
        <ul className='flex flex-col gap-3'>
          {items.map((offering) => {
            const selection = form.services[offering.id]
            return (
              <BookingServiceOption
                highlighted={offering.catalogItem.id === form.preselectedService}
                key={offering.id}
                offering={offering}
                onChoosePlan={(pricePlanId) => form.choosePlan(offering.id, offering.catalogItem.id, pricePlanId)}
                onToggle={() => {
                  if (selection || count < MAX_SERVICES) form.toggleService(offering.id, offering.catalogItem.id)
                }}
                selection={selection}
              />
            )
          })}
        </ul>
      ) : null}
      {count > 0 && !form.plansChosen ? (
        <p className='mt-3 text-sm text-on-surface-variant'>{t('customer.booking.services.planRequired')}</p>
      ) : null}
    </SectionCard>
  )
}
