import { useEffect, useRef, useState, type FormEvent, type ReactNode, type RefObject } from 'react'
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
import { apiRequestErrorKey } from '~/shared/api/error-details'
import { Icon } from '~/shared/ui/icon'
import { SegmentedControl } from '~/shared/ui/segmented-control'

import { PlanFields } from './components/plan-fields'
import {
  hasErrors,
  newPlanDraft,
  planDraftErrors,
  planDraftOf,
  planFields,
  pricingUnits,
  type PlanDraft,
  type PricingUnit
} from './plan-draft'

const key = 'centerManager.services' as const
const inputClass =
  'mt-2 min-h-11 w-full rounded-xl border border-outline-variant/60 bg-white px-3 py-2.5 text-sm text-on-surface outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:bg-surface-container-low disabled:text-on-surface-variant aria-[invalid=true]:border-error'
const labelClass = 'block text-sm font-semibold text-on-surface'
const statusOptions = ['ACTIVE', 'INACTIVE'] as const
const primaryButton =
  'min-h-11 rounded-xl bg-primary px-5 text-sm font-bold text-white transition-transform active:translate-y-0.5 disabled:opacity-50'
const ghostButton = 'min-h-11 rounded-xl px-4 text-sm font-semibold hover:bg-surface-container'

function errorKind(
  error: unknown
): 'invalid' | 'duplicate' | 'stale' | 'unauthenticated' | 'forbidden' | 'notFound' | 'failed' {
  const status = careCatalogErrorStatus(error)
  if (status === 400 || status === 422) return 'invalid'
  // M-04: someone else saved this record after the form opened.
  if (careCatalogErrorCode(error) === 3006) return 'stale'
  if (status === 409) return 'duplicate'
  if (status === 401) return 'unauthenticated'
  if (status === 403) return 'forbidden'
  if (status === 404) return 'notFound'
  return 'failed'
}

export function editorErrorKey(error: unknown, form: 'offeringForm' | 'planForm' | 'bulk') {
  const kind = errorKind(error)
  return kind === 'failed'
    ? apiRequestErrorKey(error, `${key}.${form}.failed` as const)
    : (`${key}.${form}.${kind}` as const)
}

/** Moves focus to the first field the client marked invalid, after React has rendered the marks. */
function useFocusFirstInvalid() {
  const formRef = useRef<HTMLFormElement>(null)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    if (!attempt) return
    const invalid = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')
    invalid?.scrollIntoView({ block: 'center' })
    invalid?.focus()
  }, [attempt])
  return { formRef, focusFirstInvalid: () => setAttempt((value) => value + 1) }
}

function EditorShell({
  title,
  description,
  children,
  footer,
  onClose,
  onSubmit,
  pending,
  formRef,
  widthClass = 'sm:max-w-lg'
}: {
  title: string
  description?: string
  children: ReactNode
  footer: ReactNode
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  pending: boolean
  formRef?: RefObject<HTMLFormElement | null>
  widthClass?: string
}) {
  const { t } = useTranslation()
  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && !pending) onClose()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose, pending])

  return (
    <div className='fixed inset-0 z-50 flex items-end justify-center bg-on-surface/35 sm:items-center sm:p-5'>
      <section
        aria-label={title}
        aria-modal='true'
        className={`flex max-h-[95dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-surface shadow-xl sm:rounded-3xl ${widthClass}`}
        role='dialog'
      >
        <header className='flex shrink-0 items-start justify-between gap-4 border-b border-outline-variant/40 px-6 py-5 sm:px-8'>
          <div>
            <h2 className='text-xl font-bold tracking-tight sm:text-2xl'>{title}</h2>
            {description ? <p className='mt-1 text-sm text-on-surface-variant'>{description}</p> : null}
          </div>
          <button
            aria-label={t(`${key}.close`)}
            className='flex size-11 shrink-0 items-center justify-center rounded-full border border-outline-variant/60 text-lg text-on-surface-variant hover:bg-surface-container-low'
            disabled={pending}
            onClick={onClose}
            type='button'
          >
            <Icon name='close' />
          </button>
        </header>
        <form className='flex min-h-0 flex-1 flex-col' noValidate onSubmit={onSubmit} ref={formRef}>
          <div className='min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8'>{children}</div>
          <footer className='flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-outline-variant/40 bg-surface-container-low px-6 py-4 sm:px-8'>
            {footer}
          </footer>
        </form>
      </section>
    </div>
  )
}

function FormError({ children }: { children: ReactNode }) {
  return (
    <p className='mr-auto rounded-xl bg-error/10 px-4 py-2.5 text-sm text-error' role='alert'>
      {children}
    </p>
  )
}

function StatusField({
  value,
  onChange
}: {
  value: CenterOfferingRequest['status']
  onChange: (value: CenterOfferingRequest['status']) => void
}) {
  const { t } = useTranslation()
  return (
    <div className='space-y-2'>
      <p aria-hidden='true' className={labelClass}>
        {t(`${key}.offeringForm.status`)}
      </p>
      <SegmentedControl
        legend={t(`${key}.offeringForm.status`)}
        onChange={onChange}
        options={statusOptions.map((option) => ({ value: option, label: t(`${key}.statuses.${option}`) }))}
        value={value}
      />
    </div>
  )
}

/** New service and its price plans in one save (CareCatalogService creates them in one transaction). */
export function OfferingCreateDialog({
  centerId,
  catalog,
  catalogError,
  catalogLoading,
  existingCatalogIds,
  onClose,
  onCreated,
  onRetryCatalog
}: {
  centerId: string
  catalog: CatalogItemRecord[]
  catalogError: boolean
  catalogLoading: boolean
  existingCatalogIds: Set<string>
  onClose: () => void
  onCreated: (offeringId: string) => void
  onRetryCatalog: () => void
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const available = catalog.filter((item) => item.status === 'ACTIVE' && !existingCatalogIds.has(item.id))
  const [catalogItemId, setCatalogItemId] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<CenterOfferingRequest['status']>('ACTIVE')
  const [plans, setPlans] = useState<PlanDraft[]>(() => [
    newPlanDraft('HOUR', t(`${key}.offeringForm.templateNames.HOUR`))
  ])
  const [showErrors, setShowErrors] = useState(false)
  const { formRef, focusFirstInvalid } = useFocusFirstInvalid()
  const save = useMutation({
    mutationFn: (request: CenterOfferingRequest) => createOffering(request),
    onSuccess: async (created) => {
      await queryClient.invalidateQueries({ queryKey: careCatalogKeys.all })
      onCreated(created.id)
    }
  })
  const planErrors = plans.map(planDraftErrors)
  const catalogMissing = !catalogItemId

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (catalogMissing || description.length > 1000 || planErrors.some(hasErrors)) {
      setShowErrors(true)
      focusFirstInvalid()
      return
    }
    save.mutate({
      catalogItemId,
      centerId,
      description: description.trim() || undefined,
      status,
      pricePlans: plans.length ? plans.map(planFields) : undefined
    })
  }

  function updatePlan(index: number, draft: PlanDraft) {
    setPlans((current) => current.map((plan, position) => (position === index ? draft : plan)))
  }

  const blocked = catalogLoading || catalogError || available.length === 0

  return (
    <EditorShell
      description={t(`${key}.offeringForm.createDescription`)}
      footer={
        <>
          {showErrors && (catalogMissing || planErrors.some(hasErrors)) ? (
            <FormError>{t(`${key}.offeringForm.invalid`)}</FormError>
          ) : save.isError ? (
            <FormError>{t(editorErrorKey(save.error, 'offeringForm'))}</FormError>
          ) : plans.length ? (
            <p className='mr-auto text-sm text-on-surface-variant'>
              {t(`${key}.offeringForm.planCountSummary`, { count: plans.length })}
            </p>
          ) : null}
          <button className={ghostButton} onClick={onClose} type='button'>
            {t(`${key}.cancel`)}
          </button>
          <button className={primaryButton} disabled={save.isPending || blocked} type='submit'>
            {t(save.isPending ? `${key}.saving` : `${key}.create`)}
          </button>
        </>
      }
      formRef={formRef}
      onClose={onClose}
      onSubmit={submit}
      pending={save.isPending}
      title={t(`${key}.offeringForm.createTitle`)}
      widthClass='sm:max-w-6xl'
    >
      <div className='grid gap-8 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]'>
        <div className='space-y-5 lg:sticky lg:top-0 lg:self-start'>
          <h3 className='text-xs font-bold uppercase tracking-[0.16em] text-primary'>
            {t(`${key}.offeringForm.infoTitle`)}
          </h3>
          <label className={labelClass}>
            {t(`${key}.offeringForm.catalogItem`)}
            <select
              aria-invalid={showErrors && catalogMissing ? true : undefined}
              autoFocus
              className={inputClass}
              disabled={save.isPending}
              onChange={(event) => setCatalogItemId(event.target.value)}
              value={catalogItemId}
            >
              <option value=''>{t(`${key}.offeringForm.chooseCatalog`)}</option>
              {available.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} · {item.category}
                </option>
              ))}
            </select>
          </label>
          {catalogError ? (
            <p className='text-sm text-error' role='alert'>
              {t(`${key}.offeringForm.catalogError`)}{' '}
              <button className='font-semibold underline' onClick={onRetryCatalog} type='button'>
                {t(`${key}.retry`)}
              </button>
            </p>
          ) : !catalogLoading && available.length === 0 ? (
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
          <StatusField onChange={setStatus} value={status} />
        </div>

        <section aria-labelledby='new-offering-plans' className='min-w-0 space-y-4'>
          <div className='flex flex-wrap items-start justify-between gap-3'>
            <div>
              <h3 className='text-lg font-bold' id='new-offering-plans'>
                {t(`${key}.offeringForm.plansTitle`)}
              </h3>
              <p className='mt-1 text-sm text-on-surface-variant'>{t(`${key}.offeringForm.plansHint`)}</p>
            </div>
            <div className='flex flex-wrap gap-2'>
              {pricingUnits.map((unit: PricingUnit) => (
                <button
                  className='inline-flex min-h-10 items-center gap-1 rounded-xl bg-primary/10 px-3 text-sm font-bold text-primary hover:bg-primary/15'
                  key={unit}
                  onClick={() =>
                    setPlans((current) => [...current, newPlanDraft(unit, t(`${key}.offeringForm.templateNames.${unit}`))])
                  }
                  type='button'
                >
                  <Icon name='add' />
                  {t(`${key}.offeringForm.addPlanOf`, { unit: t(`${key}.units.${unit}`).toLocaleLowerCase() })}
                </button>
              ))}
            </div>
          </div>
          {plans.length === 0 ? (
            <p className='rounded-2xl border border-dashed border-outline-variant p-6 text-center text-sm text-on-surface-variant'>
              {t(`${key}.offeringForm.noPlans`)}
            </p>
          ) : (
            <ol className='space-y-4'>
              {plans.map((plan, index) => (
                <li className='rounded-2xl border border-outline-variant/60 bg-white p-5' key={plan.key}>
                  <div className='mb-4 flex items-center justify-between gap-3'>
                    <span className='text-xs font-bold uppercase tracking-[0.16em] text-on-surface-variant'>
                      {t(`${key}.offeringForm.planIndex`, { index: index + 1 })}
                    </span>
                    <button
                      aria-label={t(`${key}.offeringForm.removePlan`, { index: index + 1 })}
                      className='flex size-10 items-center justify-center rounded-full text-on-surface-variant hover:bg-error/10 hover:text-error'
                      onClick={() => setPlans((current) => current.filter((item) => item.key !== plan.key))}
                      type='button'
                    >
                      <Icon name='delete' />
                    </button>
                  </div>
                  <PlanFields
                    draft={plan}
                    errors={showErrors ? planErrors[index] : {}}
                    idPrefix={plan.key}
                    onChange={(draft) => updatePlan(index, draft)}
                  />
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </EditorShell>
  )
}

export function OfferingEditDialog({
  centerId,
  offering,
  onClose
}: {
  centerId: string
  offering: CenterOfferingRecord
  onClose: () => void
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [description, setDescription] = useState(offering.description ?? '')
  const [status, setStatus] = useState<CenterOfferingRequest['status']>(offering.status)
  const save = useMutation({
    mutationFn: (request: CenterOfferingRequest) =>
      saveOffering(offering.id, { ...request, version: offering.version }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: careCatalogKeys.all })
      onClose()
    }
  })

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    save.mutate({
      catalogItemId: offering.catalogItem.id,
      centerId,
      description: description.trim() || undefined,
      status
    })
  }

  return (
    <EditorShell
      footer={
        <>
          {save.isError ? <FormError>{t(editorErrorKey(save.error, 'offeringForm'))}</FormError> : null}
          <button className={ghostButton} onClick={onClose} type='button'>
            {t(`${key}.cancel`)}
          </button>
          <button className={primaryButton} disabled={save.isPending} type='submit'>
            {t(save.isPending ? `${key}.saving` : `${key}.save`)}
          </button>
        </>
      }
      onClose={onClose}
      onSubmit={submit}
      pending={save.isPending}
      title={t(`${key}.offeringForm.editTitle`)}
      widthClass='sm:max-w-3xl'
    >
      <div className='grid gap-6 md:grid-cols-2'>
        <div className='space-y-5'>
          <label className={labelClass}>
            {t(`${key}.offeringForm.catalogItem`)}
            <select className={inputClass} disabled value={offering.catalogItem.id}>
              <option value={offering.catalogItem.id}>{offering.catalogItem.name}</option>
            </select>
          </label>
          <StatusField onChange={setStatus} value={status} />
        </div>
        <label className={labelClass}>
          {t(`${key}.offeringForm.description`)}
          <textarea
            autoFocus
            className={`${inputClass} min-h-36 resize-y`}
            maxLength={1000}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={t(`${key}.offeringForm.descriptionPlaceholder`)}
            value={description}
          />
        </label>
      </div>
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
  const [draft, setDraft] = useState<PlanDraft>(() => (plan ? planDraftOf(plan) : newPlanDraft('HOUR')))
  const [showErrors, setShowErrors] = useState(false)
  const { formRef, focusFirstInvalid } = useFocusFirstInvalid()
  const errors = planDraftErrors(draft)
  const save = useMutation({
    mutationFn: (request: PricePlanRequest) =>
      plan ? saveOfferingPricePlan(plan.id, { ...request, version: plan.version }) : createOfferingPricePlan(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: careCatalogKeys.all })
      onClose()
    }
  })

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (hasErrors(errors)) {
      setShowErrors(true)
      focusFirstInvalid()
      return
    }
    save.mutate({ centerOfferingId: offeringId, ...planFields(draft) })
  }

  return (
    <EditorShell
      footer={
        <>
          {showErrors && hasErrors(errors) ? (
            <FormError>{t(`${key}.planForm.invalid`)}</FormError>
          ) : save.isError ? (
            <FormError>{t(editorErrorKey(save.error, 'planForm'))}</FormError>
          ) : null}
          <button className={ghostButton} onClick={onClose} type='button'>
            {t(`${key}.cancel`)}
          </button>
          <button className={primaryButton} disabled={save.isPending} type='submit'>
            {t(save.isPending ? `${key}.saving` : plan ? `${key}.save` : `${key}.create`)}
          </button>
        </>
      }
      formRef={formRef}
      onClose={onClose}
      onSubmit={submit}
      pending={save.isPending}
      title={t(plan ? `${key}.planForm.editTitle` : `${key}.planForm.createTitle`)}
      widthClass='sm:max-w-3xl'
    >
      <PlanFields
        autoFocus
        draft={draft}
        errors={showErrors ? errors : {}}
        idPrefix='plan-editor'
        onChange={setDraft}
      />
    </EditorShell>
  )
}
