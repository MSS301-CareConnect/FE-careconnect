import type { CareRecipientRecord, StrokeScreeningRequest } from '~/shared/api/generated/contracts'

/**
 * Form state and rules of the stroke screening (AIService `POST /ai/stroke-screening/predict`, 2026-11-12). Every
 * answer starts empty — a medical question never has a default — and the request is built only from a valid draft.
 * The ranges mirror `StrokeScreeningRequest` in AIService (age 18–120 whole years, BMI 10–80).
 */
export const AGE_MIN = 18
export const AGE_MAX = 120
export const BMI_MIN = 10
export const BMI_MAX = 80

export const METABOLIC_FIELDS = ['hypertension', 'highCholesterol', 'diabetes'] as const
export const CARDIO_FIELDS = ['myocardialInfarctionHistory', 'anginaOrChdHistory'] as const
export const HABIT_FIELDS = ['currentSmoker'] as const
export const YES_NO_FIELDS = [...METABOLIC_FIELDS, ...CARDIO_FIELDS, ...HABIT_FIELDS] as const

export type YesNoField = (typeof YES_NO_FIELDS)[number]
export type Sex = StrokeScreeningRequest['sex']
export type DraftField = 'sex' | 'age' | 'bmi' | YesNoField

export type ScreeningDraft = {
  sex: Sex | null
  age: string
  bmi: string
} & Record<YesNoField, boolean | null>

export const EMPTY_DRAFT: ScreeningDraft = {
  sex: null,
  age: '',
  bmi: '',
  hypertension: null,
  highCholesterol: null,
  diabetes: null,
  myocardialInfarctionHistory: null,
  anginaOrChdHistory: null,
  currentSmoker: null
}

/** Total number of answers the model needs. */
export const TOTAL_ANSWERS = 3 + YES_NO_FIELDS.length

export type FieldErrorKey =
  'sexRequired' | 'answerRequired' | 'ageRequired' | 'ageWhole' | 'ageRange' | 'bmiRequired' | 'bmiNumber' | 'bmiRange'

/** A typed number in either language: "22,5" and "22.5" both read 22.5; anything else is null. */
export function parseDecimal(value: string): number | null {
  const text = value.trim().replace(',', '.')
  if (!/^\d+(\.\d+)?$/.test(text)) return null
  return Number(text)
}

export function validateDraft(draft: ScreeningDraft): Partial<Record<DraftField, FieldErrorKey>> {
  const errors: Partial<Record<DraftField, FieldErrorKey>> = {}
  if (!draft.sex) errors.sex = 'sexRequired'

  const age = parseDecimal(draft.age)
  if (!draft.age.trim()) errors.age = 'ageRequired'
  else if (age === null || !Number.isInteger(age)) errors.age = 'ageWhole'
  else if (age < AGE_MIN || age > AGE_MAX) errors.age = 'ageRange'

  const bmi = parseDecimal(draft.bmi)
  if (!draft.bmi.trim()) errors.bmi = 'bmiRequired'
  else if (bmi === null) errors.bmi = 'bmiNumber'
  else if (bmi < BMI_MIN || bmi > BMI_MAX) errors.bmi = 'bmiRange'

  for (const field of YES_NO_FIELDS) {
    if (draft[field] === null) errors[field] = 'answerRequired'
  }
  return errors
}

/** How many of the nine answers are filled in (a typed but invalid number still counts as answered). */
export function answeredCount(draft: ScreeningDraft) {
  const basics = [draft.sex !== null, draft.age.trim() !== '', draft.bmi.trim() !== '']
  return [...basics, ...YES_NO_FIELDS.map((field) => draft[field] !== null)].filter(Boolean).length
}

/** The request of a valid draft, or null while any answer is missing or out of range. */
export function toRequest(draft: ScreeningDraft): StrokeScreeningRequest | null {
  if (Object.keys(validateDraft(draft)).length > 0) return null
  const age = parseDecimal(draft.age)
  const bmi = parseDecimal(draft.bmi)
  if (!draft.sex || age === null || bmi === null) return null
  return {
    sex: draft.sex,
    age,
    bmi,
    hypertension: draft.hypertension === true,
    highCholesterol: draft.highCholesterol === true,
    diabetes: draft.diabetes === true,
    myocardialInfarctionHistory: draft.myocardialInfarctionHistory === true,
    anginaOrChdHistory: draft.anginaOrChdHistory === true,
    currentSmoker: draft.currentSmoker === true
  }
}

export function sameRequest(a: StrokeScreeningRequest, b: StrokeScreeningRequest) {
  return (Object.keys(a) as (keyof StrokeScreeningRequest)[]).every((key) => a[key] === b[key])
}

/** BMI = kg / m², one decimal; null outside plausible human sizes (50–250 cm, 10–300 kg). */
export function bmiFrom(heightCm: number | undefined, weightKg: number | undefined): number | null {
  if (!heightCm || !weightKg || heightCm < 50 || heightCm > 250 || weightKg < 10 || weightKg > 300) return null
  const meters = heightCm / 100
  return Math.round((weightKg / (meters * meters)) * 10) / 10
}

/** Whole years between a yyyy-mm-dd birth date and `today`; null when the date cannot be read. */
export function ageFrom(dateOfBirth: string | undefined, today: Date): number | null {
  const match = dateOfBirth ? /^(\d{4})-(\d{2})-(\d{2})/.exec(dateOfBirth) : null
  if (!match) return null
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])]
  let age = today.getFullYear() - year
  const beforeBirthday = today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day)
  if (beforeBirthday) age -= 1
  return age >= 0 ? age : null
}

export type PrefilledField = 'age' | 'sex' | 'bmi'

/**
 * A fresh draft for the chosen family profile: age from the birth date, sex when MALE / FEMALE (OTHER is asked), BMI
 * from height and weight. Health history is never guessed from the free-text chronic conditions.
 */
export function draftFromProfile(
  profile: Pick<CareRecipientRecord, 'dateOfBirth' | 'gender' | 'heightCm' | 'weightKg'>,
  today: Date
): { draft: ScreeningDraft; prefilled: PrefilledField[] } {
  const draft = { ...EMPTY_DRAFT }
  const prefilled: PrefilledField[] = []
  const age = ageFrom(profile.dateOfBirth, today)
  if (age !== null) {
    draft.age = String(age)
    prefilled.push('age')
  }
  if (profile.gender === 'MALE' || profile.gender === 'FEMALE') {
    draft.sex = profile.gender
    prefilled.push('sex')
  }
  const bmi = bmiFrom(profile.heightCm, profile.weightKg)
  if (bmi !== null) {
    draft.bmi = String(bmi)
    prefilled.push('bmi')
  }
  return { draft, prefilled }
}
