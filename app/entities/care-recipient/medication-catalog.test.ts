import { describe, expect, it } from 'vitest'

import { suggestMedications } from './medication-catalog'
import { MEDICATION_CATALOG } from './medication-catalog.constants'

const names = (query: string, limit?: number) => suggestMedications(query, limit).map((entry) => entry.medicationName)

describe('MEDICATION_CATALOG', () => {
  it('fits the create-medication request limits and has no duplicate names', () => {
    const all = MEDICATION_CATALOG.map((entry) => entry.medicationName)
    expect(new Set(all).size).toBe(all.length)
    expect(all.every((name) => name.trim() === name && name.length > 0 && name.length <= 255)).toBe(true)
  })
})

describe('suggestMedications', () => {
  it('matches the first typed characters regardless of case', () => {
    expect(names('am')).toEqual(['Amlodipine 5 mg', 'Amlodipine 10 mg'])
    expect(names('AML')).toEqual(['Amlodipine 5 mg', 'Amlodipine 10 mg'])
  })

  it('ignores Vietnamese diacritics typed by the user', () => {
    expect(names('ăml')).toEqual(['Amlodipine 5 mg', 'Amlodipine 10 mg'])
  })

  it('lists names starting with the text before names with a later matching word', () => {
    const results = names('gl', 20)
    expect(results.slice(0, 3)).toEqual(['Gliclazide MR 30 mg', 'Glimepiride 2 mg', 'Glucosamine 1500 mg'])
    expect(results).toContain('Insulin glargine 100 IU/ml')
    expect(results.indexOf('Insulin glargine 100 IU/ml')).toBeGreaterThan(2)
  })

  it('matches combination components after a slash', () => {
    expect(names('carb')).toEqual(['Levodopa/Carbidopa 250/25 mg', 'Calcium carbonate 1250 mg + Vitamin D3'])
  })

  it('returns nothing for blank text and caps the number of suggestions', () => {
    expect(suggestMedications('   ')).toEqual([])
    expect(suggestMedications('m')).toHaveLength(8)
  })
})
