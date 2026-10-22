import { STANDARD_SERVICE_CATEGORIES, type StandardServiceCategoryKey } from './service-category.constants'

export type CategoryOption = { value: string; standardKey?: StandardServiceCategoryKey }

/** Comparison key that treats case, surrounding spaces and Unicode composition as equal. */
export function categoryKey(value: string) {
  return value.trim().normalize('NFC').toLocaleLowerCase('vi')
}

/**
 * Standard categories first, in their defined order, then categories already stored in the
 * database that do not duplicate a standard one or each other, sorted alphabetically.
 */
export function mergeCategoryOptions(stored: readonly string[]): CategoryOption[] {
  const options: CategoryOption[] = STANDARD_SERVICE_CATEGORIES.map(({ key, value }) => ({ value, standardKey: key }))
  const seen = new Set(options.map((option) => categoryKey(option.value)))
  const extra = stored
    .filter((value) => {
      const normalized = categoryKey(value)
      if (!normalized || seen.has(normalized)) return false
      seen.add(normalized)
      return true
    })
    .sort((a, b) => a.localeCompare(b, 'vi'))
  return [...options, ...extra.map((value) => ({ value }))]
}
