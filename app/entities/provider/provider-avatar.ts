import type { ProviderMediaRecord } from '~/shared/api/generated/contracts'

/**
 * The one rule for a profile photo or center logo on every screen (U-11): the newest image, i.e. the highest
 * `displayOrder`. A replacement shows at once even while the old image is still being removed.
 */
export function pickAvatar(media: readonly ProviderMediaRecord[] | undefined) {
  return (media ?? [])
    .filter((item) => item.mediaFileType === 'IMAGE' && item.downloadUrl)
    .reduce<ProviderMediaRecord | undefined>(
      (newest, item) => (!newest || (item.displayOrder ?? 0) >= (newest.displayOrder ?? 0) ? item : newest),
      undefined
    )
}
