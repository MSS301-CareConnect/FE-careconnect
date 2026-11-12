import { describe, expect, it } from 'vitest'

import {
  EMPTY_DRAFT,
  ageFrom,
  answeredCount,
  bmiFrom,
  draftFromProfile,
  parseDecimal,
  toRequest,
  validateDraft,
  type ScreeningDraft
} from '../stroke-screening-form'

const complete: ScreeningDraft = {
  sex: 'FEMALE',
  age: '68',
  bmi: '31,5',
  hypertension: true,
  highCholesterol: true,
  diabetes: true,
  myocardialInfarctionHistory: false,
  anginaOrChdHistory: true,
  currentSmoker: true
}

describe('stroke screening form rules', () => {
  it('starts with no answer and nine missing items', () => {
    expect(answeredCount(EMPTY_DRAFT)).toBe(0)
    expect(Object.keys(validateDraft(EMPTY_DRAFT))).toHaveLength(9)
    expect(toRequest(EMPTY_DRAFT)).toBeNull()
  })

  it('builds the AIService request from a complete draft, reading a decimal comma', () => {
    expect(toRequest(complete)).toEqual({
      sex: 'FEMALE',
      age: 68,
      bmi: 31.5,
      hypertension: true,
      highCholesterol: true,
      diabetes: true,
      myocardialInfarctionHistory: false,
      anginaOrChdHistory: true,
      currentSmoker: true
    })
  })

  it('blocks ages and BMIs outside the backend ranges before sending', () => {
    expect(validateDraft({ ...complete, age: '10' }).age).toBe('ageRange')
    expect(validateDraft({ ...complete, age: '121' }).age).toBe('ageRange')
    expect(validateDraft({ ...complete, age: '68.5' }).age).toBe('ageWhole')
    expect(validateDraft({ ...complete, bmi: '5' }).bmi).toBe('bmiRange')
    expect(validateDraft({ ...complete, bmi: 'abc' }).bmi).toBe('bmiNumber')
    expect(toRequest({ ...complete, bmi: '80.1' })).toBeNull()
    expect(validateDraft({ ...complete, age: '18', bmi: '80' })).toEqual({})
  })

  it('parses numbers in either language and rejects anything else', () => {
    expect(parseDecimal('22,5')).toBe(22.5)
    expect(parseDecimal(' 22.5 ')).toBe(22.5)
    expect(parseDecimal('-3')).toBeNull()
    expect(parseDecimal('1e2')).toBeNull()
  })

  it('works out age and BMI for the prefill', () => {
    expect(ageFrom('1958-11-13', new Date(2026, 10, 12))).toBe(67)
    expect(ageFrom('1958-11-12', new Date(2026, 10, 12))).toBe(68)
    expect(ageFrom(undefined, new Date())).toBeNull()
    expect(bmiFrom(160, 64)).toBe(25)
    expect(bmiFrom(20, 64)).toBeNull()
  })

  it('prefills only age, sex and BMI from a family profile and leaves the history unanswered', () => {
    const { draft, prefilled } = draftFromProfile(
      { dateOfBirth: '1958-01-01', gender: 'OTHER', heightCm: 170, weightKg: 72.25 },
      new Date(2026, 10, 12)
    )
    expect(prefilled).toEqual(['age', 'bmi'])
    expect(draft).toEqual({ ...EMPTY_DRAFT, age: '68', bmi: '25' })
  })
})
