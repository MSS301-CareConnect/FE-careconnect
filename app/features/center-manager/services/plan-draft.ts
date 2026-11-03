import type { PricePlanRecord, PricePlanRequest } from '~/shared/api/generated/contracts'
import { PricePlanRequestPricingUnit } from '~/shared/api/generated/contracts'

export type PricingUnit = PricePlanRequest['pricingUnit']
export const pricingUnits = Object.values(PricePlanRequestPricingUnit)

/** HOUR is always a 60-minute unit price (CareCatalogService rejects anything else); BookingService bills by minute. */
export const HOUR_MINUTES = 60
export const MAX_DISCOUNT = 90

/** Suggested lengths: a DAY is billed once per visit, a SHIFT caps how long one visit may run. */
export const durationPresets: Record<PricingUnit, number[]> = {
  HOUR: [HOUR_MINUTES],
  DAY: [480, 720, 1440],
  SHIFT: [240, 360, 480, 720]
}
const defaultDuration: Record<PricingUnit, number> = { HOUR: HOUR_MINUTES, DAY: 1440, SHIFT: 240 }

export interface PlanDraft {
  key: string
  id?: string
  version?: number
  planName: string
  pricingUnit: PricingUnit
  /** Inputs stay strings so a half-typed value is not coerced; digits only for money. */
  durationMinutes: string
  basePrice: string
  discountPercent: string
  isActive: boolean
}

export type PlanField = 'planName' | 'durationMinutes' | 'basePrice' | 'discountPercent'
export type PlanErrors = Partial<Record<PlanField, PlanField>>

let draftSequence = 0
function nextKey() {
  draftSequence += 1
  return `draft-${draftSequence}`
}

export function newPlanDraft(pricingUnit: PricingUnit, planName = ''): PlanDraft {
  return {
    key: nextKey(),
    planName,
    pricingUnit,
    durationMinutes: String(defaultDuration[pricingUnit]),
    basePrice: '',
    discountPercent: '0',
    isActive: true
  }
}

export function planDraftOf(plan: PricePlanRecord): PlanDraft {
  return {
    key: plan.id,
    id: plan.id,
    version: plan.version,
    planName: plan.planName,
    pricingUnit: plan.pricingUnit,
    durationMinutes: String(plan.durationMinutes),
    basePrice: String(plan.basePrice),
    discountPercent: String(plan.discountPercent ?? 0),
    isActive: plan.isActive !== false
  }
}

/** Switching unit keeps a duration that still makes sense and otherwise falls back to the unit's usual length. */
export function withUnit(draft: PlanDraft, pricingUnit: PricingUnit): PlanDraft {
  if (pricingUnit === 'HOUR') return { ...draft, pricingUnit, durationMinutes: String(HOUR_MINUTES) }
  const keep = draft.pricingUnit !== 'HOUR' && Number(draft.durationMinutes) > 0
  return { ...draft, pricingUnit, durationMinutes: keep ? draft.durationMinutes : String(defaultDuration[pricingUnit]) }
}

export function planDraftErrors(draft: PlanDraft): PlanErrors {
  const errors: PlanErrors = {}
  const duration = Number(draft.durationMinutes)
  const price = Number(draft.basePrice)
  const discount = Number(draft.discountPercent)
  if (!draft.planName.trim() || draft.planName.length > 255) errors.planName = 'planName'
  if (!Number.isInteger(duration) || duration < 1 || (draft.pricingUnit === 'HOUR' && duration !== HOUR_MINUTES)) {
    errors.durationMinutes = 'durationMinutes'
  }
  if (draft.basePrice === '' || !Number.isFinite(price) || price < 0) errors.basePrice = 'basePrice'
  if (draft.discountPercent === '' || !Number.isInteger(discount) || discount < 0 || discount > MAX_DISCOUNT) {
    errors.discountPercent = 'discountPercent'
  }
  return errors
}

export function hasErrors(errors: PlanErrors) {
  return Object.keys(errors).length > 0
}

/** Contract fields of a valid draft, without the offering it belongs to. */
export function planFields(draft: PlanDraft) {
  return {
    planName: draft.planName.trim(),
    pricingUnit: draft.pricingUnit,
    durationMinutes: Number(draft.durationMinutes),
    basePrice: Number(draft.basePrice),
    discountPercent: Number(draft.discountPercent),
    isActive: draft.isActive
  }
}

export function isPlanChanged(draft: PlanDraft, plan: PricePlanRecord) {
  const original = planDraftOf(plan)
  return (
    draft.planName !== original.planName ||
    draft.pricingUnit !== original.pricingUnit ||
    Number(draft.durationMinutes) !== Number(original.durationMinutes) ||
    Number(draft.basePrice) !== Number(original.basePrice) ||
    Number(draft.discountPercent) !== Number(original.discountPercent) ||
    draft.isActive !== original.isActive
  )
}
