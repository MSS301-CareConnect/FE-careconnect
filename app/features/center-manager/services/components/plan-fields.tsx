import { useTranslation } from 'react-i18next'

import { discountedPrice } from '~/entities/care-catalog/price-plan-price'
import { FormField, Input } from '~/shared/ui/form-field'
import { useFormat } from '~/shared/lib/format'
import { SegmentedControl } from '~/shared/ui/segmented-control'

import {
  durationPresets,
  MAX_DISCOUNT,
  pricingUnits,
  withUnit,
  type PlanDraft,
  type PlanErrors,
  type PricingUnit
} from '../plan-draft'

const key = 'centerManager.services' as const
const quickDiscounts = [0, 5, 10, 15, 20, 30]
const chipClass =
  'min-h-9 rounded-full border px-3 text-xs font-semibold tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-primary'

/** Digits only; the field shows them grouped ("400.000") while the draft keeps "400000". */
function PriceInput({
  value,
  onChange,
  ...controlProps
}: {
  value: string
  onChange: (value: string) => void
  id: string
  'aria-invalid'?: true
  'aria-describedby'?: string
}) {
  const { i18n } = useTranslation()
  const grouped = value === '' ? '' : new Intl.NumberFormat(i18n.language === 'en' ? 'en-US' : 'vi-VN').format(Number(value))
  return (
    <div className='relative'>
      <Input
        {...controlProps}
        autoComplete='off'
        className='pr-10 tabular-nums'
        inputMode='numeric'
        onChange={(event) => onChange(event.target.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '').slice(0, 12))}
        value={grouped}
      />
      <span className='pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-sm text-on-surface-variant'>
        ₫
      </span>
    </div>
  )
}

/**
 * One price plan in two columns: what is sold (name, unit, duration) and what it costs (price, discount, result).
 * Used by the single plan dialog and by every plan card of the new-service dialog.
 */
export function PlanFields({
  draft,
  errors,
  idPrefix,
  autoFocus = false,
  onChange
}: {
  draft: PlanDraft
  errors: PlanErrors
  idPrefix: string
  autoFocus?: boolean
  onChange: (draft: PlanDraft) => void
}) {
  const { t } = useTranslation()
  const { money, duration } = useFormat()
  const base = Number(draft.basePrice || 0)
  const discount = Math.min(MAX_DISCOUNT, Math.max(0, Number(draft.discountPercent) || 0))
  const finalPrice = discountedPrice(base, discount)
  const errorText = (field: keyof PlanErrors) => (errors[field] ? t(`${key}.planForm.errors.${field}`) : undefined)

  return (
    <div className='grid gap-x-6 gap-y-4 md:grid-cols-2'>
      <div className='space-y-4'>
        <FormField error={errorText('planName')} id={`${idPrefix}-name`} label={t(`${key}.planForm.name`)}>
          {(controlProps) => (
            <Input
              {...controlProps}
              autoFocus={autoFocus}
              maxLength={255}
              onChange={(event) => onChange({ ...draft, planName: event.target.value })}
              placeholder={t(`${key}.planForm.namePlaceholder`)}
              value={draft.planName}
            />
          )}
        </FormField>
        <div className='space-y-1.5'>
          <p className='text-sm font-semibold text-on-surface' id={`${idPrefix}-unit`}>
            {t(`${key}.planForm.unit`)}
          </p>
          <SegmentedControl<PricingUnit>
            legend={t(`${key}.planForm.unit`)}
            onChange={(unit) => onChange(withUnit(draft, unit))}
            options={pricingUnits.map((unit) => ({ value: unit, label: t(`${key}.units.${unit}`) }))}
            value={draft.pricingUnit}
          />
        </div>
        {draft.pricingUnit === 'HOUR' ? (
          <div className='space-y-1.5'>
            <p className='text-sm font-semibold text-on-surface'>{t(`${key}.planForm.duration`)}</p>
            <p className='flex min-h-11 items-center rounded-xl bg-surface-container-low px-3.5 text-sm font-semibold text-on-surface-variant'>
              {t(`${key}.planForm.hourFixed`)}
            </p>
            <p className='text-xs leading-5 text-on-surface-variant'>{t(`${key}.planForm.unitHints.HOUR`)}</p>
          </div>
        ) : (
          <FormField
            error={errorText('durationMinutes')}
            hint={t(`${key}.planForm.unitHints.${draft.pricingUnit}`)}
            id={`${idPrefix}-duration`}
            label={t(`${key}.planForm.duration`)}
          >
            {(controlProps) => (
              <div className='space-y-2'>
                <div className='flex items-center gap-3'>
                  <Input
                    {...controlProps}
                    className='max-w-32 tabular-nums'
                    inputMode='numeric'
                    min={1}
                    onChange={(event) => onChange({ ...draft, durationMinutes: event.target.value.replace(/\D/g, '') })}
                    value={draft.durationMinutes}
                  />
                  {Number(draft.durationMinutes) > 0 ? (
                    <span className='text-sm text-on-surface-variant'>= {duration(Number(draft.durationMinutes))}</span>
                  ) : null}
                </div>
                <div aria-label={t(`${key}.planForm.durationSuggestions`)} className='flex flex-wrap gap-2' role='group'>
                  {durationPresets[draft.pricingUnit].map((minutes) => {
                    const active = Number(draft.durationMinutes) === minutes
                    return (
                      <button
                        aria-pressed={active}
                        className={`${chipClass} ${active ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant text-on-surface-variant hover:border-primary/60'}`}
                        key={minutes}
                        onClick={() => onChange({ ...draft, durationMinutes: String(minutes) })}
                        type='button'
                      >
                        {duration(minutes)}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </FormField>
        )}
      </div>

      <div className='space-y-4'>
        <FormField error={errorText('basePrice')} id={`${idPrefix}-price`} label={t(`${key}.planForm.price`)}>
          {(controlProps) => (
            <PriceInput
              {...controlProps}
              onChange={(basePrice) => onChange({ ...draft, basePrice })}
              value={draft.basePrice}
            />
          )}
        </FormField>
        <FormField
          error={errorText('discountPercent')}
          hint={t(`${key}.planForm.discountHint`)}
          id={`${idPrefix}-discount`}
          label={t(`${key}.planForm.discount`)}
        >
          {(controlProps) => (
            <div className='space-y-2'>
              <div className='relative max-w-32'>
                <Input
                  {...controlProps}
                  className='pr-8 tabular-nums'
                  inputMode='numeric'
                  onChange={(event) =>
                    onChange({ ...draft, discountPercent: event.target.value.replace(/\D/g, '').slice(0, 3) })
                  }
                  value={draft.discountPercent}
                />
                <span className='pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-sm text-on-surface-variant'>
                  %
                </span>
              </div>
              <div aria-label={t(`${key}.planForm.discountQuick`)} className='flex flex-wrap gap-2' role='group'>
                {quickDiscounts.map((percent) => {
                  const active = Number(draft.discountPercent) === percent
                  return (
                    <button
                      aria-pressed={active}
                      className={`${chipClass} ${active ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant text-on-surface-variant hover:border-primary/60'}`}
                      key={percent}
                      onClick={() => onChange({ ...draft, discountPercent: String(percent) })}
                      type='button'
                    >
                      {percent}%
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </FormField>
        <div aria-live='polite' className='rounded-xl border border-primary/20 bg-primary/5 px-4 py-3'>
          <p className='text-xs font-semibold uppercase tracking-wide text-on-surface-variant'>
            {t(`${key}.planForm.preview`)}
          </p>
          <p className='mt-1 flex flex-wrap items-baseline gap-x-2'>
            <strong className='text-xl text-primary tabular-nums'>{money(finalPrice)}</strong>
            <span className='text-sm text-on-surface-variant'>{t(`${key}.perUnit.${draft.pricingUnit}`)}</span>
            {discount > 0 && base > 0 ? (
              <s className='text-sm text-on-surface-variant tabular-nums'>{money(base)}</s>
            ) : null}
          </p>
          {discount > 0 && base > 0 ? (
            <p className='mt-0.5 text-xs font-semibold text-success'>
              {t(`${key}.planForm.previewSaving`, { amount: money(base - finalPrice) })}
            </p>
          ) : null}
        </div>
        <label className='flex min-h-11 items-center gap-3 text-sm font-semibold'>
          <input
            checked={draft.isActive}
            className='size-5 accent-primary'
            onChange={(event) => onChange({ ...draft, isActive: event.target.checked })}
            type='checkbox'
          />
          {t(`${key}.planForm.active`)}
        </label>
      </div>
    </div>
  )
}
