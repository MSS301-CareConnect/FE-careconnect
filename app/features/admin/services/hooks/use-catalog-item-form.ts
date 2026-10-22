import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import {
  careCatalogErrorCode,
  careCatalogErrorStatus,
  careCatalogKeys,
  createCatalog,
  saveCatalog
} from '~/entities/care-catalog/care-catalog-api'
import type { CatalogItemRecord } from '~/shared/api/generated/contracts'

import {
  draftFromRecord,
  EMPTY_CATALOG_ITEM,
  fieldErrorsFromServerCode,
  toCatalogItemRequest,
  validateCatalogItem,
  type CatalogItemDraft,
  type CatalogItemErrors
} from '../catalog-item-form'

export type CatalogFormError = 'forbidden' | 'notFound' | 'invalid' | 'failed'

/** Maps a failed save without a field-specific code to the single form-level message. */
export function catalogFormError(error: unknown): CatalogFormError {
  const status = careCatalogErrorStatus(error)
  if (status === 401 || status === 403) return 'forbidden'
  if (status === 404 || careCatalogErrorCode(error) === 3100) return 'notFound'
  if (status === 400) return 'invalid'
  return 'failed'
}

export function useCatalogItemForm(item: CatalogItemRecord | undefined, onSaved: (saved: CatalogItemRecord) => void) {
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState<CatalogItemDraft>(() => (item ? draftFromRecord(item) : EMPTY_CATALOG_ITEM))
  const [errors, setErrors] = useState<CatalogItemErrors>({})
  const [formError, setFormError] = useState<CatalogFormError | null>(null)
  // Incremented on every failed submit so the dialog moves focus to the first invalid control again.
  const [focusRequest, setFocusRequest] = useState(0)

  const save = useMutation({
    mutationFn: (request: ReturnType<typeof toCatalogItemRequest>) =>
      item ? saveCatalog(item.id, request) : createCatalog(request),
    onSuccess: async (saved) => {
      await queryClient.invalidateQueries({ queryKey: careCatalogKeys.all })
      onSaved(saved)
    },
    onError: (error) => {
      const fieldErrors = fieldErrorsFromServerCode(careCatalogErrorCode(error))
      if (fieldErrors) {
        setErrors(fieldErrors)
        setFocusRequest((count) => count + 1)
      } else {
        setFormError(catalogFormError(error))
      }
    }
  })

  function update<K extends keyof CatalogItemDraft>(field: K, value: CatalogItemDraft[K]) {
    setDraft((previous) => ({ ...previous, [field]: value }))
    setErrors((previous) => {
      if (!(field in previous)) return previous
      const next = { ...previous }
      delete next[field]
      return next
    })
  }

  function submit() {
    if (save.isPending) return
    const nextErrors = validateCatalogItem(draft)
    setErrors(nextErrors)
    setFormError(null)
    if (Object.keys(nextErrors).length > 0) {
      setFocusRequest((count) => count + 1)
      return
    }
    save.mutate(toCatalogItemRequest(draft))
  }

  return { draft, update, errors, formError, focusRequest, submit, isSaving: save.isPending }
}
