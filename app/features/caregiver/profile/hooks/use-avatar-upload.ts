import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { invalidateOwnerMedia } from '~/entities/provider/invalidate-provider-media'
import { providerKeys, removeMedia, uploadMedia } from '~/entities/provider/provider-api'
import type { ProviderCaregiverRecord, ProviderMediaRecord } from '~/shared/api/generated/contracts'

/**
 * Replaces the caregiver's profile photo: the picked file shows at once (U-11), the new image is uploaded, then the
 * older ones are removed so every screen shows a single photo. Same requests as before the redesign.
 */
export function useAvatarUpload(
  profile: ProviderCaregiverRecord | undefined,
  current: ProviderMediaRecord[] | undefined
) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [preview, setPreview] = useState<string | null>(null)

  const upload = useMutation({
    mutationFn: async (file: File) => {
      const ownerId = profile?.id ?? ''
      const previous = current ?? []
      const uploaded = await uploadMedia('CAREGIVER_PROFILE', ownerId, [file])
      queryClient.setQueryData(providerKeys.media('CAREGIVER_PROFILE', ownerId), [...previous, ...(uploaded ?? [])])
      const results = await Promise.allSettled(
        previous.map((item) =>
          removeMedia('CAREGIVER_PROFILE', ownerId, item.mediaFileId).catch(() =>
            removeMedia('CAREGIVER_PROFILE', ownerId, item.mediaFileId)
          )
        )
      )
      return results.some((outcome) => outcome.status === 'rejected')
    },
    onMutate: (file) => setPreview(URL.createObjectURL(file)),
    onSuccess: (leftOld) => {
      toast.success(t('caregiver.me.header.photoUpdated'))
      if (leftOld) toast.warning(t('caregiver.me.header.oldPhotoLeft'))
    },
    onError: () => toast.error(t('caregiver.me.header.photoError')),
    onSettled: async () => {
      setPreview((value) => {
        if (value) URL.revokeObjectURL(value)
        return null
      })
      if (!profile?.id) return
      await invalidateOwnerMedia(queryClient, 'CAREGIVER_PROFILE', profile.id, { centerId: profile.centerId })
    }
  })

  return { upload, preview }
}
