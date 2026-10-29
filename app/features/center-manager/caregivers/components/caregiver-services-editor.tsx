import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { careCatalogKeys, fetchCenterOfferings } from '~/entities/care-catalog/care-catalog-api'
import { fetchCaregiverServices, providerKeys, saveCaregiverServices } from '~/entities/provider/provider-api'
import { apiErrorCode, apiRequestErrorKey } from '~/shared/api/error-details'
import { Icon } from '~/shared/ui/icon'

const key = 'centerManager.provider.services' as const
// PRV-01 limit enforced by ProviderService.
const MAX_SERVICES = 50
const errorKeys: Record<number, 'notInCenter' | 'notActive' | 'tooMany' | 'catalogDown'> = {
  4207: 'notInCenter',
  4208: 'notActive',
  4209: 'tooMany',
  4701: 'catalogDown'
}

/**
 * PRV-01: the care services a caregiver provides. Booking only accepts a caregiver who covers every chosen service,
 * so a caregiver without services cannot be booked at all.
 */
export function CaregiverServicesEditor({ caregiverId, centerId }: { caregiverId: string; centerId: string }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState<string[] | null>(null)
  const assigned = useQuery({
    queryKey: providerKeys.caregiverServices(caregiverId),
    queryFn: () => fetchCaregiverServices(caregiverId),
    retry: false
  })
  const offerings = useQuery({
    queryKey: careCatalogKeys.centerOfferings(centerId),
    queryFn: () => fetchCenterOfferings(centerId),
    enabled: draft !== null,
    retry: false
  })
  const save = useMutation({
    mutationFn: (ids: string[]) => saveCaregiverServices(caregiverId, ids),
    onSuccess: async () => {
      setDraft(null)
      await queryClient.invalidateQueries({ queryKey: providerKeys.caregiverServices(caregiverId) })
    }
  })
  // Only offerings the center still sells can be assigned; ProviderService rejects the rest.
  const selectable = (offerings.data ?? []).filter(
    (offering) => offering.status === 'ACTIVE' && offering.catalogItem.status === 'ACTIVE'
  )
  const errorCode = apiErrorCode(save.error)

  function startEditing() {
    save.reset()
    setDraft((assigned.data ?? []).flatMap((service) => (service.centerServiceId ? [service.centerServiceId] : [])))
  }
  function toggle(id: string, checked: boolean) {
    setDraft((current) => {
      const ids = current ?? []
      return checked ? [...ids, id] : ids.filter((item) => item !== id)
    })
  }

  return (
    <section aria-labelledby='caregiver-services-title' className='rounded-xl bg-white p-5 shadow-sm'>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <h2 className='flex items-center gap-2 text-lg font-bold' id='caregiver-services-title'>
          <Icon className='text-primary' name='medical_services' />
          {t(`${key}.title`)}
        </h2>
        {draft === null && assigned.isSuccess ? (
          <button
            className='min-h-11 rounded-lg border border-outline-variant px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-container-low'
            onClick={startEditing}
            type='button'
          >
            {t(`${key}.edit`)}
          </button>
        ) : null}
      </div>
      <p className='mt-2 text-sm text-on-surface-variant'>{t(`${key}.hint`)}</p>

      {assigned.isPending ? (
        <p className='mt-4 text-sm text-on-surface-variant' role='status'>
          {t(`${key}.loading`)}
        </p>
      ) : null}
      {assigned.isError ? (
        <p className='mt-4 text-sm text-error' role='alert'>
          {t(`${key}.error`)}
        </p>
      ) : null}

      {draft === null && assigned.isSuccess ? (
        assigned.data.length === 0 ? (
          <p className='mt-4 rounded-lg bg-warning-container p-3 text-sm text-on-warning-container'>
            {t(`${key}.empty`)}
          </p>
        ) : (
          <ul className='mt-4 flex flex-wrap gap-2'>
            {assigned.data.map((service) => (
              <li
                className='rounded-full bg-secondary-container px-3 py-1.5 text-sm font-semibold text-on-secondary-container'
                key={service.centerServiceId}
              >
                {service.serviceName}
              </li>
            ))}
          </ul>
        )
      ) : null}

      {draft !== null ? (
        <form
          className='mt-4 space-y-4'
          onSubmit={(event) => {
            event.preventDefault()
            save.mutate(draft)
          }}
        >
          {offerings.isPending ? (
            <p className='text-sm text-on-surface-variant' role='status'>
              {t(`${key}.loadingOptions`)}
            </p>
          ) : null}
          {offerings.isError ? (
            <p className='text-sm text-error' role='alert'>
              {t(`${key}.optionsError`)}
            </p>
          ) : null}
          {offerings.isSuccess && selectable.length === 0 ? (
            <p className='rounded-lg bg-surface-container-low p-3 text-sm text-on-surface-variant'>
              {t(`${key}.noOptions`)}
            </p>
          ) : null}
          {selectable.length > 0 ? (
            <fieldset>
              <legend className='text-sm font-semibold'>{t(`${key}.choose`)}</legend>
              <ul className='mt-2 grid gap-1 sm:grid-cols-2'>
                {selectable.map((offering) => (
                  <li key={offering.id}>
                    <label className='flex min-h-11 items-center gap-3 rounded-lg px-2 hover:bg-surface-container-low'>
                      <input
                        checked={draft.includes(offering.id)}
                        className='h-5 w-5 accent-primary'
                        onChange={(event) => toggle(offering.id, event.target.checked)}
                        type='checkbox'
                      />
                      <span className='text-sm'>{offering.catalogItem.name}</span>
                    </label>
                  </li>
                ))}
              </ul>
              <p className='mt-2 text-sm text-on-surface-variant tabular-nums'>
                {t(`${key}.selected`, { count: draft.length })}
              </p>
            </fieldset>
          ) : null}
          {draft.length > MAX_SERVICES ? (
            <p className='text-sm text-error' role='alert'>
              {t(`${key}.errors.tooMany`)}
            </p>
          ) : null}
          {save.isError ? (
            <p className='text-sm text-error' role='alert'>
              {t(
                errorCode !== undefined && errorKeys[errorCode]
                  ? `${key}.errors.${errorKeys[errorCode]}`
                  : apiRequestErrorKey(save.error, `${key}.errors.generic`)
              )}
            </p>
          ) : null}
          <div className='flex flex-wrap gap-3'>
            <button
              className='min-h-11 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary hover:bg-primary-container disabled:opacity-50'
              disabled={save.isPending || !offerings.isSuccess || draft.length > MAX_SERVICES}
              type='submit'
            >
              {save.isPending ? t(`${key}.saving`) : t(`${key}.save`)}
            </button>
            <button
              className='min-h-11 rounded-lg border border-outline-variant px-4 py-2 text-sm font-semibold'
              onClick={() => setDraft(null)}
              type='button'
            >
              {t(`${key}.cancel`)}
            </button>
          </div>
        </form>
      ) : null}
    </section>
  )
}
