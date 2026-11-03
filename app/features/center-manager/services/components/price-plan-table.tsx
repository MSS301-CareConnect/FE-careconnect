import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { careCatalogKeys, saveOfferingPricePlans } from '~/entities/care-catalog/care-catalog-api'
import { planPrice } from '~/entities/care-catalog/price-plan-price'
import type { PricePlanRecord } from '~/shared/api/generated/contracts'
import { useFormat } from '~/shared/lib/format'
import { Icon } from '~/shared/ui/icon'

import {
  hasErrors,
  HOUR_MINUTES,
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
import { PlanPrice } from './plan-price'

const key = 'centerManager.services' as const
const cellInput =
  'min-h-10 w-full rounded-lg border border-outline-variant/70 bg-white px-2.5 text-sm tabular-nums outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 aria-[invalid=true]:border-error aria-[invalid=true]:bg-error/5'
const headCell = 'px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-on-surface-variant'

/** Read-only plan list with an inline "edit several plans" mode that saves every change in one request. */
export function PricePlanTable({
  offeringId,
  plans,
  onEditPlan
}: {
  offeringId: string
  plans: PricePlanRecord[]
  onEditPlan: (plan: PricePlanRecord) => void
}) {
  const { t } = useTranslation()
  const { duration } = useFormat()
  const queryClient = useQueryClient()
  const [drafts, setDrafts] = useState<Record<string, PlanDraft> | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkDiscount, setBulkDiscount] = useState('10')
  const [showErrors, setShowErrors] = useState(false)
  const save = useMutation({
    mutationFn: saveOfferingPricePlans,
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
    bulkDiscount !== '' && Number.isInteger(bulkDiscountValue) && bulkDiscountValue >= 0 && bulkDiscountValue <= MAX_DISCOUNT

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        {editing ? (
          <p className='max-w-xl text-sm text-on-surface-variant'>{t(`${key}.bulk.hint`)}</p>
        ) : (
          <span />
        )}
        {editing ? (
          <div className='flex flex-wrap gap-2'>
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
          </div>
        ) : plans.length > 1 ? (
          <button
            className='inline-flex min-h-11 items-center gap-2 rounded-xl border border-outline-variant/70 px-4 text-sm font-bold hover:bg-surface-container-low'
            onClick={startEditing}
            type='button'
          >
            <Icon name='edit_note' /> {t(`${key}.bulk.start`)}
          </button>
        ) : null}
      </div>

      {editing && selected.size > 0 ? (
        <div
          aria-label={t(`${key}.bulk.selected`, { count: selected.size })}
          className='flex flex-wrap items-end gap-3 rounded-2xl bg-primary/5 px-4 py-3'
          role='group'
        >
          <span className='self-center text-sm font-bold text-primary'>
            {t(`${key}.bulk.selected`, { count: selected.size })}
          </span>
          <label className='flex items-center gap-2 text-sm font-semibold'>
            <span className='sr-only'>{t(`${key}.bulk.discountLabel`)}</span>
            <input
              aria-invalid={bulkDiscountValid ? undefined : true}
              className={`${cellInput} w-20`}
              inputMode='numeric'
              onChange={(event) => setBulkDiscount(event.target.value.replace(/\D/g, '').slice(0, 3))}
              value={bulkDiscount}
            />
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

      {(showErrors && invalid) || save.isError ? (
        <p className='rounded-xl bg-error/10 px-4 py-3 text-sm text-error' role='alert'>
          {t(showErrors && invalid ? `${key}.bulk.invalid` : editorErrorKey(save.error, 'bulk'))}
        </p>
      ) : null}

      <div className='overflow-x-auto rounded-2xl border border-outline-variant/50'>
        <table className='w-full min-w-[760px] border-collapse text-sm'>
          <thead className='bg-surface-container-low'>
            <tr>
              {editing ? (
                <th className={`${headCell} w-10`} scope='col'>
                  <input
                    aria-label={t(`${key}.bulk.selectAll`)}
                    checked={selected.size === plans.length}
                    className='size-4 accent-primary'
                    onChange={(event) => setSelected(event.target.checked ? new Set(plans.map((plan) => plan.id)) : new Set())}
                    type='checkbox'
                  />
                </th>
              ) : null}
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
              {editing ? null : (
                <th className={`${headCell} text-right`} scope='col'>
                  <span className='sr-only'>{t(`${key}.table.actions`)}</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody className='divide-y divide-outline-variant/40'>
            {plans.map((plan) =>
              editing ? (
                <EditableRow
                  checked={selected.has(plan.id)}
                  draft={drafts[plan.id]}
                  edited={isPlanChanged(drafts[plan.id], plan)}
                  key={plan.id}
                  onChange={(change) => update(plan.id, change)}
                  onToggle={() => toggle(plan.id)}
                  showErrors={showErrors}
                />
              ) : (
                <tr className='bg-white' key={plan.id}>
                  <td className='px-3 py-3.5'>
                    <strong className='break-words'>{plan.planName}</strong>
                  </td>
                  <td className='px-3 py-3.5 text-on-surface-variant'>
                    {t(`${key}.units.${plan.pricingUnit}`)} · {duration(plan.durationMinutes)}
                  </td>
                  <td className='px-3 py-3.5 text-right tabular-nums text-on-surface-variant'>
                    <PlainMoney value={planPrice(plan).basePrice} />
                  </td>
                  <td className='px-3 py-3.5 text-right tabular-nums'>
                    {planPrice(plan).discountPercent ? (
                      <span className='font-bold text-error'>
                        {t(`${key}.discountBadge`, { percent: planPrice(plan).discountPercent })}
                      </span>
                    ) : (
                      <span className='text-on-surface-variant'>—</span>
                    )}
                  </td>
                  <td className='px-3 py-3.5 text-right'>
                    <PlanPrice basePrice={plan.basePrice} discountPercent={planPrice(plan).discountPercent} />
                  </td>
                  <td className='px-3 py-3.5'>
                    <ActiveBadge active={plan.isActive !== false} />
                  </td>
                  <td className='px-3 py-2 text-right'>
                    <button
                      aria-label={t(`${key}.editPlanNamed`, { name: plan.planName })}
                      className='inline-flex min-h-10 items-center gap-1 rounded-lg px-3 text-xs font-bold text-primary hover:bg-primary/10'
                      onClick={() => onEditPlan(plan)}
                      type='button'
                    >
                      <Icon name='edit' /> {t(`${key}.editPlan`)}
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function PlainMoney({ value }: { value: number }) {
  const { money } = useFormat()
  return <>{money(value)}</>
}

function ActiveBadge({ active }: { active: boolean }) {
  const { t } = useTranslation()
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${active ? 'bg-success/10 text-success' : 'bg-surface-container text-on-surface-variant'}`}
    >
      <span aria-hidden='true' className={`size-1.5 rounded-full ${active ? 'bg-success' : 'bg-outline'}`} />
      {t(active ? `${key}.planActive` : `${key}.planInactive`)}
    </span>
  )
}

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
  const { duration } = useFormat()
  const errors = showErrors && edited ? planDraftErrors(draft) : {}
  const name = draft.planName || t(`${key}.noPlans`)
  const label = (column: 'plan' | 'unit' | 'basePrice' | 'discount' | 'status') =>
    `${t(`${key}.table.${column}`)} · ${name}`

  return (
    <tr className={edited ? 'bg-primary/[0.03]' : 'bg-white'}>
      <td className='px-3 py-2.5 align-top'>
        <input
          aria-label={t(`${key}.bulk.selectRow`, { name })}
          checked={checked}
          className='mt-3 size-4 accent-primary'
          onChange={onToggle}
          type='checkbox'
        />
      </td>
      <td className='px-3 py-2.5 align-top'>
        <input
          aria-invalid={errors.planName ? true : undefined}
          aria-label={label('plan')}
          className={cellInput}
          maxLength={255}
          onChange={(event) => onChange((current) => ({ ...current, planName: event.target.value }))}
          value={draft.planName}
        />
        {edited ? <span className='mt-1 block text-[11px] font-semibold text-primary'>{t(`${key}.bulk.changed`)}</span> : null}
      </td>
      <td className='px-3 py-2.5 align-top'>
        <div className='flex gap-2'>
          <select
            aria-label={label('unit')}
            className={`${cellInput} w-28`}
            onChange={(event) => onChange((current) => withUnit(current, event.target.value as PricingUnit))}
            value={draft.pricingUnit}
          >
            {pricingUnits.map((unit) => (
              <option key={unit} value={unit}>
                {t(`${key}.units.${unit}`)}
              </option>
            ))}
          </select>
          {draft.pricingUnit === 'HOUR' ? (
            <span className='flex min-h-10 items-center whitespace-nowrap text-xs text-on-surface-variant'>
              {duration(HOUR_MINUTES)}
            </span>
          ) : (
            <input
              aria-invalid={errors.durationMinutes ? true : undefined}
              aria-label={`${t(`${key}.planForm.duration`)} · ${name}`}
              className={`${cellInput} w-20`}
              inputMode='numeric'
              onChange={(event) =>
                onChange((current) => ({ ...current, durationMinutes: event.target.value.replace(/\D/g, '') }))
              }
              value={draft.durationMinutes}
            />
          )}
        </div>
      </td>
      <td className='px-3 py-2.5 align-top'>
        <input
          aria-invalid={errors.basePrice ? true : undefined}
          aria-label={label('basePrice')}
          className={`${cellInput} w-32 text-right`}
          inputMode='numeric'
          onChange={(event) =>
            onChange((current) => ({ ...current, basePrice: event.target.value.replace(/\D/g, '').slice(0, 12) }))
          }
          value={draft.basePrice}
        />
      </td>
      <td className='px-3 py-2.5 align-top'>
        <input
          aria-invalid={errors.discountPercent ? true : undefined}
          aria-label={label('discount')}
          className={`${cellInput} ml-auto block w-16 text-right`}
          inputMode='numeric'
          onChange={(event) =>
            onChange((current) => ({ ...current, discountPercent: event.target.value.replace(/\D/g, '').slice(0, 3) }))
          }
          value={draft.discountPercent}
        />
      </td>
      <td className='px-3 py-2.5 text-right align-top'>
        <div className='pt-1.5'>
          <PlanPrice
            basePrice={Number(draft.basePrice) || 0}
            discountPercent={Math.min(MAX_DISCOUNT, Number(draft.discountPercent) || 0)}
          />
        </div>
      </td>
      <td className='px-3 py-2.5 align-top'>
        <label className='flex min-h-10 items-center gap-2 text-xs font-semibold'>
          <input
            aria-label={label('status')}
            checked={draft.isActive}
            className='size-4 accent-primary'
            onChange={(event) => onChange((current) => ({ ...current, isActive: event.target.checked }))}
            type='checkbox'
          />
          <span aria-hidden='true'>{t(draft.isActive ? `${key}.planActive` : `${key}.planInactive`)}</span>
        </label>
      </td>
    </tr>
  )
}
