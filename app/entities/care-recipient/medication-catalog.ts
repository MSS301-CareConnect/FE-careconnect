import { MEDICATION_CATALOG, type MedicationCatalogEntry } from './medication-catalog.constants'

const DEFAULT_LIMIT = 8

/** Lowercases and strips Vietnamese diacritics so "AML", "aml" and "ảml" match alike. */
function normalize(value: string): string {
  return value.normalize('NFD').replace(/\p{M}/gu, '').replace(/đ/gi, 'd').toLowerCase().trim()
}

const searchable = MEDICATION_CATALOG.map((entry) => {
  const name = normalize(entry.medicationName)
  return { entry, name, words: name.split(/[\s/+()-]+/).filter(Boolean) }
})

/**
 * Suggests catalog entries whose name, or any word in it, starts with the typed text.
 * Names that start with the text come first, so "gl" lists Gliclazide before "Insulin glargine".
 */
export function suggestMedications(query: string, limit = DEFAULT_LIMIT): MedicationCatalogEntry[] {
  const text = normalize(query)
  if (!text) return []
  const startsWithName = searchable.filter((item) => item.name.startsWith(text))
  const startsWithWord = searchable.filter(
    (item) => !item.name.startsWith(text) && item.words.some((word) => word.startsWith(text))
  )
  return [...startsWithName, ...startsWithWord].slice(0, limit).map((item) => item.entry)
}
