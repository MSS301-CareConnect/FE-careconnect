import { useState, type FormEvent, type ReactNode } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import {
  careCatalogErrorStatus,
  careCatalogErrorCode,
  careCatalogKeys,
  createOffering,
  createOfferingPricePlan,
  saveOffering,
  saveOfferingPricePlan
} from '~/entities/care-catalog/care-catalog-api'
import type {
  CatalogItemRecord,
  CenterOfferingRecord,
  CenterOfferingRequest,
  PricePlanRecord,
  PricePlanRequest
} from '~/shared/api/generated/contracts'
import { PricePlanRequestPricingUnit } from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'

const key = 'centerManager.services' as const
const inputClass =
  'mt-2 min-h-11 w-full rounded-xl border border-outline-variant/60 bg-white px-3 py-2.5 text-sm text-on-surface outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15'
const labelClass = 'block text-sm font-semibold text-on-surface'
const statusOptions = ['ACTIVE', 'INACTIVE'] as const
const pricingUnits = Object.values(PricePlanRequestPricingUnit)

function errorKind(error: unknown): 'invalid' | 'duplicate' | 'unauthenticated' | 'forbidden' | 'notFound' | 'failed' {
  const status = careCatalogErrorStatus(error)
  if (status === 400 || status === 422) return 'invalid'
  if (status === 409) return 'duplicate'
  if (status === 401) return 'unauthenticated'
  if (status === 403) return 'forbidden'
  if (status === 404) return 'notFound'
  return 'failed'
}

function EditorShell({
  title,
  children,
  onClose,
  pending
}: {
  title: string
  children: ReactNode
  onClose: () => void
  pending: boolean
}) {
  const { t } = useTranslation()
  return (
    <div className='fixed inset-0 z-50 flex items-end justify-center bg-on-surface/35 p-0 sm:items-center sm:p-5'>
      <section
        aria-label={title}
        aria-modal='true'
        className='max-h-[95dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-surface p-6 shadow-xl sm:rounded-3xl sm:p-8'
        role='dialog'
      >
        <div className='mb-6 flex items-start justify-between gap-4'>
          <h2 className='text-2xl font-bold tracking-tight'>{title}</h2>
          <button
            aria-label={t(`${key}.close`)}
            className='flex size-11 shrink-0 items-center justify-center rounded-full border border-outline-variant/60 text-lg text-on-surface-variant hover:bg-surface-container-low'
            disabled={pending}
            onClick={onClose}
            type='button'
          >
            <Icon name='close' />
          </button>
        </div>
        {children}
      </section>
    </div>
  )
}

export function OfferingEditor({
  centerId,
  catalog,
  catalogError,
  catalogLoading,
  existingCatalogIds,
  offering,
  onClose,
  onRetryCatalog
}: {
  centerId: string
  catalog: CatalogItemRecord[]
  catalogError: boolean
  catalogLoading: boolean
  existingCatalogIds: Set<string>
  offering?: CenterOfferingRecord
  onClose: () => void
  onRetryCatalog: () => void
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const available = catalog.filter((item) => item.status === 'ACTIVE' && !existingCatalogIds.has(item.id))
  const [catalogItemId, setCatalogItemId] = useState(offering?.catalogItem.id ?? '')
  const [description, setDescription] = useState(offering?.description ?? '')
  const [status, setStatus] = useState<CenterOfferingRequest['status']>(offering?.status ?? 'ACTIVE')
  const [invalid, setInvalid] = useState(false)
  const save = useMutation({
    mutationFn: (request: CenterOfferingRequest) =>
      offering ? saveOffering(offering.id, request) : createOffering(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: careCatalogKeys.all })
      onClose()
    }
  })

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!catalogItemId || description.length > 1000) {
      setInvalid(true)
      return
    }
    setInvalid(false)
    save.mutate({ catalogItemId, centerId, description: description.trim() || undefined, status })
  }

  return (
    <EditorShell
      onClose={onClose}
      pending={save.isPending}
      title={t(offering ? `${key}.offeringForm.editTitle` : `${key}.offeringForm.createTitle`)}
    >
      <form className='space-y-5' onSubmit={submit}>
        <label className={labelClass}>
          {t(`${key}.offeringForm.catalogItem`)}
          <select
            autoFocus
            className={inputClass}
            disabled={Boolean(offering) || save.isPending}
            onChange={(event) => setCatalogItemId(event.target.value)}
            required
            value={catalogItemId}
          >
            <option value=''>{t(`${key}.offeringForm.chooseCatalog`)}</option>
            {offering ? <option value={offering.catalogItem.id}>{offering.catalogItem.name}</option> : null}
            {available.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} · {item.category}
              </option>
            ))}
          </select>
        </label>
        {!offering && catalogError ? (
          <p className='text-sm text-error' role='alert'>
            {t(`${key}.offeringForm.catalogError`)}{' '}
            <button className='font-semibold underline' onClick={onRetryCatalog} type='button'>
              {t(`${key}.retry`)}
            </button>
          </p>
        ) : null}
        {!offering && !catalogError && !catalogLoading && available.length === 0 ? (
          <p className='text-sm text-on-surface-variant'>{t(`${key}.offeringForm.noCatalog`)}</p>
        ) : null}
        <label className={labelClass}>
          {t(`${key}.offeringForm.description`)}
          <textarea
            className={`${inputClass} min-h-28 resize-y`}
            maxLength={1000}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={t(`${key}.offeringForm.descriptionPlaceholder`)}
            value={description}
          />
        </label>
        <label className={labelClass}>
          {t(`${key}.offeringForm.status`)}
          <select
            className={inputClass}
            onChange={(event) => setStatus(event.target.value as CenterOfferingRequest['status'])}
            value={status}
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {t(`${key}.statuses.${option}`)}
              </option>
            ))}
          </select>
        </label>
        {invalid || save.isError ? (
          <p className='rounded-xl bg-error/10 px-4 py-3 text-sm text-error' role='alert'>
            {t(invalid ? `${key}.offeringForm.invalid` : `${key}.offeringForm.${errorKind(save.error)}`)}
          </p>
        ) : null}
        <div className='flex justify-end gap-3 border-t border-outline-variant/40 pt-5'>
          <button
            className='min-h-11 rounded-xl px-4 text-sm font-semibold hover:bg-surface-container'
            onClick={onClose}
            type='button'
          >
            {t(`${key}.cancel`)}
          </button>
          <button
            className='min-h-11 rounded-xl bg-primary px-5 text-sm font-bold text-white transition-transform active:translate-y-0.5 disabled:opacity-50'
            disabled={save.isPending || (!offering && (catalogLoading || catalogError || available.length === 0))}
            type='submit'
          >
            {t(save.isPending ? `${key}.saving` : offering ? `${key}.save` : `${key}.create`)}
          </button>
        </div>
      </form>
    </EditorShell>
  )
}

export function PricePlanEditor({
  offeringId,
  plan,
  onClose
}: {
  offeringId: string
  plan?: PricePlanRecord
  onClose: () => void
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [name, setName] = useState(plan?.planName ?? '')
  const [unit, setUnit] = useState<PricePlanRequest['pricingUnit']>(plan?.pricingUnit ?? 'HOUR')
  const [duration, setDuration] = useState(String(plan?.durationMinutes ?? 60))
  const [price, setPrice] = useState(String(plan?.basePrice ?? 0))
  const [active, setActive] = useState(plan?.isActive !== false)
  const [invalid, setInvalid] = useState(false)
  const save = useMutation({
    mutationFn: (request: PricePlanRequest) =>
      plan ? saveOfferingPricePlan(plan.id, request) : createOfferingPricePlan(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: careCatalogKeys.pricePlans(offeringId) })
      onClose()
    }
  })
  const saveErrorCode = careCatalogErrorCode(save.error)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const durationMinutes = Number(duration)
    const basePrice = Number(price)
    if (
      !name.trim() ||
      !Number.isInteger(durationMinutes) ||
      durationMinutes < 1 ||
      !Number.isFinite(basePrice) ||
      basePrice < 0
    ) {
      setInvalid(true)
      return
    }
    setInvalid(false)
    save.mutate({
      centerOfferingId: offeringId,
      planName: name.trim(),
      pricingUnit: unit,
      durationMinutes,
      basePrice,
      isActive: active
    })
  }

  return (
    <EditorShell
      onClose={onClose}
      pending={save.isPending}
      title={t(plan ? `${key}.planForm.editTitle` : `${key}.planForm.createTitle`)}
    >
      <form className='space-y-5' onSubmit={submit}>
        <label className={labelClass}>
          {t(`${key}.planForm.name`)}
          <input
            autoFocus
            className={inputClass}
            maxLength={255}
            onChange={(event) => setName(event.target.value)}
            placeholder={t(`${key}.planForm.namePlaceholder`)}
            required
            value={name}
          />
        </label>
        <div className='grid gap-5 sm:grid-cols-2'>
          <label className={labelClass}>
            {t(`${key}.planForm.unit`)}
            <select
              className={inputClass}
              onChange={(event) => setUnit(event.target.value as PricePlanRequest['pricingUnit'])}
              value={unit}
            >
              {pricingUnits.map((option) => (
                <option key={option} value={option}>
                  {t(`${key}.units.${option}`)}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            {t(`${key}.planForm.duration`)}
            <input
              className={inputClass}
              min={1}
              onChange={(event) => setDuration(event.target.value)}
              required
              step={1}
              type='number'
              value={duration}
            />
          </label>
        </div>
        <label className={labelClass}>
          {t(`${key}.planForm.price`)}
          <input
            className={inputClass}
            min={0}
            onChange={(event) => setPrice(event.target.value)}
            required
            step={1}
            type='number'
            value={price}
          />
        </label>
        <label className='flex min-h-11 items-center gap-3 text-sm font-semibold'>
          <input
            checked={active}
            className='size-5 accent-primary'
            onChange={(event) => setActive(event.target.checked)}
            type='checkbox'
          />
          {t(`${key}.planForm.active`)}
        </label>
        {invalid || save.isError ? (
          <p className='rounded-xl bg-error/10 px-4 py-3 text-sm text-error' role='alert'>
            {t(invalid ? `${key}.planForm.invalid` : `${key}.planForm.${errorKind(save.error)}`)}
            {!invalid && saveErrorCode !== undefined
              ? ` ${t(`${key}.planForm.apiErrorCode`, { code: saveErrorCode })}`
              : null}
          </p>
        ) : null}
        <div className='flex justify-end gap-3 border-t border-outline-variant/40 pt-5'>
          <button
            className='min-h-11 rounded-xl px-4 text-sm font-semibold hover:bg-surface-container'
            onClick={onClose}
            type='button'
          >
            {t(`${key}.cancel`)}
          </button>
          <button
            className='min-h-11 rounded-xl bg-primary px-5 text-sm font-bold text-white transition-transform active:translate-y-0.5 disabled:opacity-50'
            disabled={save.isPending}
            type='submit'
          >
            {t(save.isPending ? `${key}.saving` : plan ? `${key}.save` : `${key}.create`)}
          </button>
        </div>
      </form>
    </EditorShell>
  )
}
