import { findProvince, splitAddressText, type AdminProvince } from '~/entities/address/admin-units'

/**
 * Checks whether a center's operating address belongs to the same province / city as the patient / care address.
 * Matches by official province code so variations like "TP.HCM" and "Thành phố Hồ Chí Minh" compare equal.
 */
export function isCenterInServiceArea(
  centerAddress: string | undefined,
  patientProvince: string | undefined,
  provinces: readonly AdminProvince[] | undefined
): boolean {
  if (!centerAddress?.trim() || !patientProvince?.trim() || !provinces?.length) {
    return true
  }
  const patientMatch = findProvince(provinces, patientProvince)
  if (!patientMatch) return true

  const centerParts = splitAddressText(centerAddress, provinces)
  if (!centerParts.province) {
    const directMatch = findProvince(provinces, centerAddress)
    if (directMatch) return directMatch.province.code === patientMatch.province.code
    return true
  }
  const centerMatch = findProvince(provinces, centerParts.province)
  if (!centerMatch) return true

  return centerMatch.province.code === patientMatch.province.code
}

/** Extracts the display name of a center's province, or undefined if unknown. */
export function getCenterProvinceName(
  centerAddress: string | undefined,
  provinces: readonly AdminProvince[] | undefined
): string | undefined {
  if (!centerAddress?.trim() || !provinces?.length) return undefined
  const centerParts = splitAddressText(centerAddress, provinces)
  if (centerParts.province) return centerParts.province
  return findProvince(provinces, centerAddress)?.province.name
}
