import { useId } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { formatMoney } from '~/entities/booking/booking-format'
import { careCatalogKeys, fetchPricePlans } from '~/entities/care-catalog/care-catalog-api'
import type { BookingServiceRequest, CenterOfferingRecord } from '~/shared/api/generated/contracts'

import { bookingField, bookingOption } from './booking-panel'

export interface BookingServiceOptionProps {
  offering: CenterOfferingRecord
  selection?: BookingServiceRequest
  highlighted: boolean
  onToggle: () => void
  onChoosePlan: (pricePlanId: string) => void
}

/** One center offering; its active price plans load only once the customer selects it. */
export function BookingServiceOption({
  offering,
  selection,
  highlighted,
  onToggle,
  onChoosePlan
}: BookingServiceOptionProps) {
  const { t, i18n } = useTranslation()
  const planId = useId()
  const selected = Boolean(selection)
  const plans = useQuery({
    queryKey: careCatalogKeys.pricePlans(offering.id),
    queryFn: () => fetchPricePlans(offering.id),
    enabled: selected,
    retry: false,
    select: (items) => items.filter((plan) => plan.isActive !== false)
  })

  return (
    <li className={`p-4 sm:p-5 ${bookingOption(selected)}`}>
      <label className='flex cursor-pointer items-start gap-3'>
        <input checked={selected} className='mt-1 h-4 w-4 accent-primary' onChange={onToggle} type='checkbox' />
        <span className='min-w-0 flex-1'>
          <span className='flex flex-wrap items-center gap-2'>
            <span className='font-bold text-on-surface'>{offering.catalogItem.name}</span>
            {highlighted ? (
              <span className='rounded-md bg-primary-fixed px-2 py-0.5 text-xs font-bold text-primary'>
                {t('customer.booking.services.fromServices')}
              </span>
            ) : null}
          </span>
          {offering.description || offering.catalogItem.description ? (
            <span className='mt-1 block text-sm leading-6 text-on-surface-variant'>
              {offering.description ?? offering.catalogItem.description}
            </span>
          ) : null}
        </span>
      </label>
      {selected ? (
        <div className='mt-3 pl-7'>
          {plans.isPending ? (
            <p className='text-sm text-on-surface-variant' role='status'>
              {t('customer.booking.services.plansLoading')}
            </p>
          ) : null}
          {plans.isError ? (
            <p className='text-sm text-error' role='alert'>
              {t('customer.booking.services.plansError')}
            </p>
          ) : null}
          {plans.isSuccess && plans.data.length === 0 ? (
            <p className='text-sm text-on-surface-variant'>{t('customer.booking.services.plansEmpty')}</p>
          ) : null}
          {plans.isSuccess && plans.data.length > 0 ? (
            <>
              <label className='text-sm font-semibold text-on-surface' htmlFor={planId}>
                {t('customer.booking.services.plan')}
              </label>
              <select
                className={`${bookingField} bg-surface-container-lowest`}
                id={planId}
                onChange={(event) => onChoosePlan(event.target.value)}
                value={selection?.pricePlanId ?? ''}
              >
                <option value=''>{t('customer.booking.services.choosePlan')}</option>
                {plans.data.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {t('customer.booking.services.planOption', {
                      name: plan.planName,
                      price: formatMoney(plan.basePrice, i18n.language),
                      unit: t(`booking.unitType.${plan.pricingUnit}`),
                      minutes: plan.durationMinutes
                    })}
                  </option>
                ))}
              </select>
            </>
          ) : null}
        </div>
      ) : null}
    </li>
  )
}
