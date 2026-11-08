import type { PricePlanRecord, PricePlanRequest } from '~/shared/api/generated/contracts'
import { PricePlanRequestPricingUnit } from '~/shared/api/generated/contracts'

export type PricingUnit = PricePlanRequest['pricingUnit']
export const pricingUnits = Object.values(PricePlanRequestPricingUnit)

/** HOUR is always a 60-minute unit price (CareCatalogService rejects anything else); BookingService bills by minute. */
export const HOUR_MINUTES = 60
export const MAX_DISCOUNT = 90
/** A care day or a shift cannot run longer than a calendar day. */
export const MAX_UNIT_MINUTES = 24 * 60

/**
 * Managers think in hours: a DAY plan is "how many hours the caregiver works that day" (billed once per visit), a SHIFT
 * plan is "how long one shift lasts" (a visit may not run longer). The contract still stores minutes.
 */
export const durationPresetHours: Record<PricingUnit, number[]> = {
  HOUR: [1],
  DAY: [6, 8, 10, 12, 24],
  SHIFT: [2, 3, 4, 6, 8, 12]
}
const defaultHours: Record<PricingUnit, number> = { HOUR: 1, DAY: 8, SHIFT: 4 }

export interface PlanDraft {
  key: string
  id?: string
  version?: number
  planName: string
  pricingUnit: PricingUnit
  /** Inputs stay strings so a half-typed value is not coerced; hours may be decimal ("4.5"), money is digits only. */
  durationHours: string
  basePrice: string
  discountPercent: string
  isActive: boolean
}

export type PlanField = 'planName' | 'duration' | 'basePrice' | 'discountPercent'
export type PlanErrors = Partial<Record<PlanField, PlanField>>

let draftSequence = 0
function nextKey() {
  draftSequence += 1
  return `draft-${draftSequence}`
}

/** "4.5" from 270 minutes; whole hours without a decimal part. */
export function hoursText(minutes: number) {
  return String(Math.round((minutes / 60) * 100) / 100)
}

/** Accepts "4", "4.5" or the Vietnamese "4,5"; anything else is kept for the validator to flag. */
export function cleanHoursInput(value: string) {
  return value
    .replace(',', '.')
    .replace(/[^\d.]/g, '')
    .replace(/(\..*)\./g, '$1')
    .slice(0, 5)
}

export function draftMinutes(draft: Pick<PlanDraft, 'pricingUnit' | 'durationHours'>) {
  if (draft.pricingUnit === 'HOUR') return HOUR_MINUTES
  const hours = Number(draft.durationHours)
  return draft.durationHours === '' || !Number.isFinite(hours) ? NaN : Math.round(hours * 60)
}

export function newPlanDraft(pricingUnit: PricingUnit, planName = ''): PlanDraft {
  return {
    key: nextKey(),
    planName,
    pricingUnit,
    durationHours: String(defaultHours[pricingUnit]),
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
    durationHours: hoursText(plan.durationMinutes),
    basePrice: String(plan.basePrice),
    discountPercent: String(plan.discountPercent ?? 0),
    isActive: plan.isActive !== false
  }
}

/** A new unit means a different kind of length, so it starts from that unit's usual value. */
export function withUnit(draft: PlanDraft, pricingUnit: PricingUnit): PlanDraft {
  if (pricingUnit === draft.pricingUnit) return draft
  return { ...draft, pricingUnit, durationHours: String(defaultHours[pricingUnit]) }
}

export function planDraftErrors(draft: PlanDraft): PlanErrors {
  const errors: PlanErrors = {}
  const minutes = draftMinutes(draft)
  const price = Number(draft.basePrice)
  const discount = Number(draft.discountPercent)
  if (!draft.planName.trim() || draft.planName.length > 255) errors.planName = 'planName'
  if (!Number.isInteger(minutes) || minutes < 1 || minutes > MAX_UNIT_MINUTES) errors.duration = 'duration'
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
    durationMinutes: draftMinutes(draft),
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
    draftMinutes(draft) !== plan.durationMinutes ||
    Number(draft.basePrice) !== Number(original.basePrice) ||
    Number(draft.discountPercent) !== Number(original.discountPercent) ||
    draft.isActive !== original.isActive
  )
}
