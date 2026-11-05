import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'

import {
  careCatalogErrorCode,
  careCatalogErrorStatus,
  uploadCatalogImage
} from '~/entities/care-catalog/care-catalog-api'

/** Same limits as CareCatalogService (CATALOG_ITEM_IMAGE): checked here first so a wrong file never leaves the browser. */
export const CATALOG_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
export const CATALOG_IMAGE_MAX_BYTES = 5 * 1024 * 1024

export type CatalogImageUploadError = 'type' | 'size' | 'forbidden' | 'failed'

function localError(file: File): CatalogImageUploadError | null {
  if (!CATALOG_IMAGE_TYPES.some((type) => type === file.type)) return 'type'
  if (file.size > CATALOG_IMAGE_MAX_BYTES) return 'size'
  return null
}

/** Maps CareCatalogService upload failures (3111–3113) and auth answers to one message under the image field. */
function serverError(error: unknown): CatalogImageUploadError {
  const code = careCatalogErrorCode(error)
  if (code === 3112 || code === 3111) return 'type'
  if (code === 3113) return 'size'
  const status = careCatalogErrorStatus(error)
  if (status === 401 || status === 403) return 'forbidden'
  return 'failed'
}

/**
 * Uploads a cover image as soon as it is picked or dropped; on success the caller stores the returned permanent
 * catalog URL in the draft. Nothing is saved on the service until the dialog itself is submitted.
 */
export function useCatalogImageUpload(onUploaded: (imageUrl: string) => void) {
  const [error, setError] = useState<CatalogImageUploadError | null>(null)
  const upload = useMutation({
    mutationFn: uploadCatalogImage,
    onSuccess: (image) => {
      setError(null)
      onUploaded(image.imageUrl)
    },
    onError: (failure) => setError(serverError(failure))
  })

  function pick(file: File | undefined) {
    if (!file) return
    const invalid = localError(file)
    if (invalid) {
      setError(invalid)
      return
    }
    setError(null)
    upload.mutate(file)
  }

  return { pick, error, isUploading: upload.isPending, clearError: () => setError(null) }
}
