import {
  serviceCategoryGroup,
  serviceCategoryValue,
  type ServiceCategoryGroup
} from '~/entities/care-catalog/service-category'
import type { CatalogItemRecord, CatalogItemRequest, CatalogItemRequestStatus } from '~/shared/api/generated/contracts'

/** Column limits of the CareCatalogService `catalog_items` table. */
export const NAME_MAX_LENGTH = 255
export const DESCRIPTION_MAX_LENGTH = 1000

export type CatalogItemDraft = {
  name: string
  category: string
  description: string
  status: CatalogItemRequestStatus | ''
}

export type CatalogItemField = keyof CatalogItemDraft
export type CatalogItemFieldError =
  'nameRequired' | 'nameTooLong' | 'categoryRequired' | 'categoryOutside' | 'descriptionTooLong' | 'statusRequired'
export type CatalogItemErrors = Partial<Record<CatalogItemField, CatalogItemFieldError>>

export const EMPTY_CATALOG_ITEM: CatalogItemDraft = { name: '', category: '', description: '', status: 'ACTIVE' }

/** A legacy long category opens as its short group, so saving the item moves it into the six categories. */
function draftCategory(stored: string) {
  const group: ServiceCategoryGroup = serviceCategoryGroup(stored)
  return group === 'other' ? stored : serviceCategoryValue(group)
}

export function draftFromRecord(record: CatalogItemRecord): CatalogItemDraft {
  return {
    name: record.name,
    category: draftCategory(record.category),
    description: record.description ?? '',
    status: record.status
  }
}

export function validateCatalogItem(draft: CatalogItemDraft): CatalogItemErrors {
  const errors: CatalogItemErrors = {}
  const name = draft.name.trim()
  const category = draft.category.trim()
  if (!name) errors.name = 'nameRequired'
  else if (name.length > NAME_MAX_LENGTH) errors.name = 'nameTooLong'
  if (!category) errors.category = 'categoryRequired'
  else if (serviceCategoryGroup(category) === 'other') errors.category = 'categoryOutside'
  if (draft.description.trim().length > DESCRIPTION_MAX_LENGTH) errors.description = 'descriptionTooLong'
  if (!draft.status) errors.status = 'statusRequired'
  return errors
}

/** Call only after validateCatalogItem returned no errors. */
export function toCatalogItemRequest(draft: CatalogItemDraft): CatalogItemRequest {
  const description = draft.description.trim()
  return {
    name: draft.name.trim(),
    category: draft.category.trim(),
    ...(description ? { description } : {}),
    status: draft.status || 'ACTIVE'
  }
}

/** CareCatalogService validation codes that name exactly one form field. */
const SERVER_FIELD_ERRORS: Record<number, CatalogItemErrors> = {
  3101: { name: 'nameRequired' },
  3102: { category: 'categoryRequired' },
  3103: { status: 'statusRequired' }
}

export function fieldErrorsFromServerCode(code: number | undefined): CatalogItemErrors | undefined {
  return code === undefined ? undefined : SERVER_FIELD_ERRORS[code]
}
