import { useState, type ReactNode } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { careCatalogKeys, saveOfferingPricePlans } from '~/entities/care-catalog/care-catalog-api'
import { discountedPrice, planPrice } from '~/entities/care-catalog/price-plan-price'
import type { PricePlanBatchUpdateRequest, PricePlanRecord } from '~/shared/api/generated/contracts'
import { useFormat } from '~/shared/lib/format'
import { Icon } from '~/shared/ui/icon'

import {
  cleanHoursInput,
  hasErrors,
  isPlanChanged,
  MAX_DISCOUNT,
  planDraftErrors,
  planDraftOf,
  planFields,
  pricingUnits,
  withUnit,
  type PlanDraft,
  type PricingUnit
} from '../plan-draft'
import { editorErrorKey } from '../service-editors'

const key = 'centerManager.services' as const
const cellInput =
  'min-h-10 rounded-lg border border-outline-variant/70 bg-white px-2.5 text-sm tabular-nums outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 aria-[invalid=true]:border-error aria-[invalid=true]:bg-error/5'
const headCell =
  'px-3 py-3 text-left text-xs font-bold uppercase tracking-wide whitespace-nowrap text-on-surface-variant'
const fieldLabel = 'mb-1 block text-[11px] font-bold uppercase tracking-wide text-on-surface-variant'

/** Title row of the price plan section; the page uses it alone while the plans load, fail or are empty. */
export function PlansHeading({ actions }: { actions: ReactNode }) {
  const { t } = useTranslation()
  return (
    <div className='mb-5 flex flex-wrap items-start justify-between gap-4'>
      <div>
        <h3 className='text-lg font-bold'>{t(`${key}.plans`)}</h3>
        <p className='mt-1 text-sm text-on-surface-variant'>{t(`${key}.plansHint`)}</p>
      </div>
      <div className='flex flex-wrap gap-2'>{actions}</div>
    </div>
  )
}

/** Read-only plan table with an "edit several plans" mode that saves every change in one all-or-nothing request. */
export function PricePlanTable({
  offeringId,
  plans,
  addPlanButton,
  onEditPlan,
  onDeletePlan
}: {
  offeringId: string
  plans: PricePlanRecord[]
  addPlanButton: ReactNode
  onEditPlan: (plan: PricePlanRecord) => void
  onDeletePlan: (plan: PricePlanRecord) => void
}) {
  const { t } = useTranslation()
  const { duration, money } = useFormat()
  const queryClient = useQueryClient()
  const [drafts, setDrafts] = useState<Record<string, PlanDraft> | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkDiscount, setBulkDiscount] = useState('10')
  const [showErrors, setShowErrors] = useState(false)
  const save = useMutation({
    mutationFn: (request: PricePlanBatchUpdateRequest) => saveOfferingPricePlans(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: careCatalogKeys.all })
      stopEditing()
    }
  })

  const editing = drafts !== null
  const changed = editing ? plans.filter((plan) => drafts[plan.id] && isPlanChanged(drafts[plan.id], plan)) : []
  const invalid = changed.some((plan) => hasErrors(planDraftErrors(drafts![plan.id])))

  function startEditing() {
    setDrafts(Object.fromEntries(plans.map((plan) => [plan.id, planDraftOf(plan)])))
    setSelected(new Set())
    setShowErrors(false)
    save.reset()
  }

  function stopEditing() {
    setDrafts(null)
    setSelected(new Set())
    setShowErrors(false)
  }

  function update(id: string, change: (draft: PlanDraft) => PlanDraft) {
    setDrafts((current) => (current ? { ...current, [id]: change(current[id]) } : current))
  }

  function updateSelected(change: (draft: PlanDraft) => PlanDraft) {
    setDrafts((current) =>
      current
        ? Object.fromEntries(
            Object.entries(current).map(([id, draft]) => [id, selected.has(id) ? change(draft) : draft])
          )
        : current
    )
  }

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function submit() {
    if (!drafts || changed.length === 0) return
    if (invalid) {
      setShowErrors(true)
      return
    }
    save.mutate({
      items: changed.map((plan) => ({
        id: plan.id,
        plan: { centerOfferingId: offeringId, ...planFields(drafts[plan.id]), version: plan.version }
      }))
    })
  }

  const bulkDiscountValue = Number(bulkDiscount)
  const bulkDiscountValid =
    bulkDiscount !== '' &&
    Number.isInteger(bulkDiscountValue) &&
    bulkDiscountValue >= 0 &&
    bulkDiscountValue <= MAX_DISCOUNT

  return (
    <div>
      <PlansHeading
        actions={
          editing ? (
            <>
              <button
                className='min-h-11 rounded-xl px-4 text-sm font-semibold hover:bg-surface-container'
                disabled={save.isPending}
                onClick={stopEditing}
                type='button'
              >
                {t(`${key}.bulk.cancel`)}
              </button>
              <button
                className='min-h-11 rounded-xl bg-primary px-5 text-sm font-bold text-white disabled:opacity-50'
                disabled={changed.length === 0 || save.isPending}
                onClick={submit}
                type='button'
              >
                {save.isPending
                  ? t(`${key}.saving`)
                  : changed.length
                    ? t(`${key}.bulk.save`, { count: changed.length })
                    : t(`${key}.bulk.noChanges`)}
              </button>
            </>
          ) : (
            <>
              {plans.length > 1 ? (
                <button
                  className='inline-flex min-h-11 items-center gap-2 rounded-xl border border-outline-variant/70 px-4 text-sm font-bold hover:bg-surface-container-low'
                  onClick={startEditing}
                  type='button'
                >
                  <Icon name='edit_note' /> {t(`${key}.bulk.start`)}
                </button>
              ) : null}
              {addPlanButton}
            </>
          )
        }
      />

      {editing ? (
        <div className='space-y-3'>
          <p className='text-sm text-on-surface-variant'>{t(`${key}.bulk.hint`)}</p>
          <div className='flex flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl bg-primary/5 px-4 py-3'>
            <label className='flex min-h-10 items-center gap-2 text-sm font-semibold'>
              <input
                checked={selected.size === plans.length}
                className='size-4 accent-primary'
                onChange={(event) =>
                  setSelected(event.target.checked ? new Set(plans.map((plan) => plan.id)) : new Set())
                }
                type='checkbox'
              />
              {t(`${key}.bulk.selectAll`)}
            </label>
            {selected.size > 0 ? (
              <div
                aria-label={t(`${key}.bulk.selected`, { count: selected.size })}
                className='flex flex-wrap items-center gap-2'
                role='group'
              >
                <span className='text-sm font-bold text-primary'>
                  {t(`${key}.bulk.selected`, { count: selected.size })}
                </span>
                <label className='relative'>
                  <span className='sr-only'>{t(`${key}.bulk.discountLabel`)}</span>
                  <input
                    aria-invalid={bulkDiscountValid ? undefined : true}
                    className={`${cellInput} w-20 pr-7 text-right`}
                    inputMode='numeric'
                    onChange={(event) => setBulkDiscount(event.target.value.replace(/\D/g, '').slice(0, 3))}
                    value={bulkDiscount}
                  />
                  <span
                    aria-hidden='true'
                    className='pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-sm text-on-surface-variant'
                  >
                    %
                  </span>
                </label>
                <button
                  className='min-h-10 rounded-lg bg-primary px-3 text-sm font-bold text-white disabled:opacity-50'
                  disabled={!bulkDiscountValid}
                  onClick={() => updateSelected((draft) => ({ ...draft, discountPercent: String(bulkDiscountValue) }))}
                  type='button'
                >
                  {t(`${key}.bulk.apply`)}
                </button>
                <button
                  className='min-h-10 rounded-lg border border-outline-variant bg-white px-3 text-sm font-semibold'
                  onClick={() => updateSelected((draft) => ({ ...draft, isActive: true }))}
                  type='button'
                >
                  {t(`${key}.bulk.activate`)}
                </button>
                <button
                  className='min-h-10 rounded-lg border border-outline-variant bg-white px-3 text-sm font-semibold'
                  onClick={() => updateSelected((draft) => ({ ...draft, isActive: false }))}
                  type='button'
                >
                  {t(`${key}.bulk.deactivate`)}
                </button>
              </div>
            ) : null}
          </div>
          {(showErrors && invalid) || save.isError ? (
            <p className='rounded-xl bg-error/10 px-4 py-3 text-sm text-error' role='alert'>
              {t(showErrors && invalid ? `${key}.bulk.invalid` : editorErrorKey(save.error, 'bulk'))}
            </p>
          ) : null}
          <ul className='space-y-3'>
            {plans.map((plan) => (
              <EditableRow
                checked={selected.has(plan.id)}
                draft={drafts[plan.id]}
                edited={isPlanChanged(drafts[plan.id], plan)}
                key={plan.id}
                onChange={(change) => update(plan.id, change)}
                onToggle={() => toggle(plan.id)}
                showErrors={showErrors}
              />
            ))}
          </ul>
        </div>
      ) : (
        <div className='relative overflow-x-auto rounded-2xl border border-outline-variant/50'>
          <table className='w-full min-w-[600px] border-collapse text-sm'>
            <thead className='bg-surface-container-low'>
              <tr>
                <th className={headCell} scope='col'>
                  {t(`${key}.table.plan`)}
                </th>
                <th className={headCell} scope='col'>
                  {t(`${key}.table.unit`)}
                </th>
                <th className={`${headCell} text-right`} scope='col'>
                  {t(`${key}.table.basePrice`)}
                </th>
                <th className={`${headCell} text-right`} scope='col'>
                  {t(`${key}.table.discount`)}
                </th>
                <th className={`${headCell} text-right`} scope='col'>
                  {t(`${key}.table.finalPrice`)}
                </th>
                <th className={headCell} scope='col'>
                  {t(`${key}.table.status`)}
                </th>
                <th className='w-24 px-2' scope='col'>
                  <span className='sr-only'>{t(`${key}.table.actions`)}</span>
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-outline-variant/40'>
              {plans.map((plan) => {
                const price = planPrice(plan)
                return (
                  <tr className='bg-white' key={plan.id}>
                    <td className='min-w-32 px-3 py-3.5'>
                      <strong className='break-words'>{plan.planName}</strong>
                    </td>
                    <td className='px-3 py-3.5 whitespace-nowrap text-on-surface-variant'>
                      {t(`${key}.units.${plan.pricingUnit}`)} · {duration(plan.durationMinutes)}
                    </td>
                    <td className='px-3 py-3.5 text-right whitespace-nowrap tabular-nums text-on-surface-variant'>
                      {money(price.basePrice)}
                    </td>
                    <td className='px-3 py-3.5 text-right tabular-nums'>
                      {price.discountPercent ? (
                        <span className='font-bold text-error'>
                          {t(`${key}.discountBadge`, { percent: price.discountPercent })}
                        </span>
                      ) : (
                        <span aria-hidden='true' className='text-outline'>
                          ·
                        </span>
                      )}
                    </td>
                    <td className='px-3 py-3.5 text-right'>
                      <FinalPrice value={price.finalPrice} />
                    </td>
                    <td className='px-3 py-3.5'>
                      <ActiveBadge active={plan.isActive !== false} />
                    </td>
                    <td className='whitespace-nowrap px-2 py-2 text-right'>
                      <button
                        aria-label={t(`${key}.editPlanNamed`, { name: plan.planName })}
                        className='inline-flex size-10 items-center justify-center rounded-lg text-primary hover:bg-primary/10'
                        onClick={() => onEditPlan(plan)}
                        title={t(`${key}.editPlan`)}
                        type='button'
                      >
                        <Icon name='edit' />
                      </button>
                      <button
                        aria-label={t(`${key}.deletePlanNamed`, { name: plan.planName })}
                        className='inline-flex size-10 items-center justify-center rounded-lg text-on-surface-variant hover:bg-error/10 hover:text-error'
                        onClick={() => onDeletePlan(plan)}
                        title={t(`${key}.deletePlanDialog.confirm`)}
                        type='button'
                      >
                        <Icon name='delete' />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function FinalPrice({ value }: { value: number }) {
  const { money } = useFormat()
  return <strong className='whitespace-nowrap text-primary tabular-nums'>{money(value)}</strong>
}

function ActiveBadge({ active }: { active: boolean }) {
  const { t } = useTranslation()
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${active ? 'bg-success/10 text-success' : 'bg-surface-container text-on-surface-variant'}`}
    >
      <span aria-hidden='true' className={`size-1.5 rounded-full ${active ? 'bg-success' : 'bg-outline'}`} />
      {t(active ? `${key}.planActive` : `${key}.planInactive`)}
    </span>
  )
}

/** One plan in edit mode: what is sold on the first row, its price on the second; no horizontal scrolling. */
function EditableRow({
  draft,
  checked,
  edited,
  showErrors,
  onChange,
  onToggle
}: {
  draft: PlanDraft
  checked: boolean
  edited: boolean
  showErrors: boolean
  onChange: (change: (draft: PlanDraft) => PlanDraft) => void
  onToggle: () => void
}) {
  const { t } = useTranslation()
  const errors = showErrors && edited ? planDraftErrors(draft) : {}
  const name = draft.planName
  const label = (column: 'plan' | 'unit' | 'basePrice' | 'discount' | 'status') =>
    `${t(`${key}.table.${column}`)} · ${name}`
  const finalPrice = discountedPrice(
    Number(draft.basePrice) || 0,
    Math.min(MAX_DISCOUNT, Number(draft.discountPercent) || 0)
  )

  return (
    <li
      className={`flex gap-3 rounded-2xl border p-4 ${edited ? 'border-primary/40 bg-primary/[0.03]' : 'border-outline-variant/60 bg-white'}`}
    >
      <input
        aria-label={t(`${key}.bulk.selectRow`, { name })}
        checked={checked}
        className='mt-7 size-4 shrink-0 accent-primary'
        onChange={onToggle}
        type='checkbox'
      />
      <div className='grid min-w-0 flex-1 gap-3 sm:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,0.8fr)]'>
        <label className='min-w-0'>
          <span className={fieldLabel}>{t(`${key}.table.plan`)}</span>
          <input
            aria-invalid={errors.planName ? true : undefined}
            aria-label={label('plan')}
            className={`${cellInput} w-full`}
            maxLength={255}
            onChange={(event) => onChange((current) => ({ ...current, planName: event.target.value }))}
            value={draft.planName}
          />
        </label>
        <label className='min-w-0'>
          <span className={fieldLabel}>{t(`${key}.planForm.unit`)}</span>
          <select
            aria-label={label('unit')}
            className={`${cellInput} w-full`}
            onChange={(event) => onChange((current) => withUnit(current, event.target.value as PricingUnit))}
            value={draft.pricingUnit}
          >
            {pricingUnits.map((unit) => (
              <option key={unit} value={unit}>
                {t(`${key}.units.${unit}`)}
              </option>
            ))}
          </select>
        </label>
        <label className='min-w-0'>
          <span className={fieldLabel}>{t(`${key}.planForm.durationShort`)}</span>
          {draft.pricingUnit === 'HOUR' ? (
            <span className='flex min-h-10 items-center rounded-lg bg-surface-container-low px-2.5 text-sm text-on-surface-variant'>
              {t(`${key}.planForm.hourFixedShort`)}
            </span>
          ) : (
            <input
              aria-invalid={errors.duration ? true : undefined}
              aria-label={`${t(`${key}.planForm.durationShort`)} · ${name}`}
              className={`${cellInput} w-full`}
              inputMode='decimal'
              onChange={(event) =>
                onChange((current) => ({ ...current, durationHours: cleanHoursInput(event.target.value) }))
              }
              value={draft.durationHours}
            />
          )}
        </label>
        <label className='min-w-0'>
          <span className={fieldLabel}>{t(`${key}.table.basePrice`)}</span>
          <input
            aria-invalid={errors.basePrice ? true : undefined}
            aria-label={label('basePrice')}
            className={`${cellInput} w-full text-right`}
            inputMode='numeric'
            onChange={(event) =>
              onChange((current) => ({ ...current, basePrice: event.target.value.replace(/\D/g, '').slice(0, 12) }))
            }
            value={draft.basePrice}
          />
        </label>
        <div className='flex min-w-0 items-end gap-3'>
          <label className='w-20 shrink-0'>
            <span className={fieldLabel}>{t(`${key}.table.discount`)}</span>
            <input
              aria-invalid={errors.discountPercent ? true : undefined}
              aria-label={label('discount')}
              className={`${cellInput} w-full text-right`}
              inputMode='numeric'
              onChange={(event) =>
                onChange((current) => ({
                  ...current,
                  discountPercent: event.target.value.replace(/\D/g, '').slice(0, 3)
                }))
              }
              value={draft.discountPercent}
            />
          </label>
          <span className='min-w-0'>
            <span className={fieldLabel}>{t(`${key}.table.finalPrice`)}</span>
            <span className='flex min-h-10 items-center'>
              <FinalPrice value={finalPrice} />
            </span>
          </span>
        </div>
        <div className='flex items-end justify-between gap-2'>
          <label className='flex min-h-10 items-center gap-2 text-sm font-semibold'>
            <input
              aria-label={label('status')}
              checked={draft.isActive}
              className='size-4 accent-primary'
              onChange={(event) => onChange((current) => ({ ...current, isActive: event.target.checked }))}
              type='checkbox'
            />
            <span aria-hidden='true'>{t(draft.isActive ? `${key}.planActive` : `${key}.planInactive`)}</span>
          </label>
          {edited ? (
            <span className='mb-2.5 text-[11px] font-bold uppercase text-primary'>{t(`${key}.bulk.changed`)}</span>
          ) : null}
        </div>
      </div>
    </li>
  )
}
