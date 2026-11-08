import { foldText } from '~/shared/lib/fold-text'

import type { AdminProvince } from './vn-admin-units.constants'

export type { AdminProvince }

/** The three parts of a Vietnamese address since 01/07/2025: street, ward / commune, province / city. */
export interface AddressParts {
  addressLine: string
  ward: string
  province: string
}

export type AddressField = keyof AddressParts
export type AddressIssue = 'required' | 'outdated'
export type AddressIssues = Partial<Record<AddressField, AddressIssue>>

export const EMPTY_ADDRESS: AddressParts = { addressLine: '', ward: '', province: '' }

/** Loads the unit list on demand (about 90 kB), so pages without an address form do not carry it. */
export function loadAdminUnits(): Promise<readonly AdminProvince[]> {
  return import('./vn-admin-units.constants').then((module) => module.VN_PROVINCES)
}

const UNIT_TYPES = ['Thành phố', 'Tỉnh', 'Phường', 'Xã', 'Đặc khu'] as const

/** "Phường Ba Đình" → { type: "Phường", name: "Ba Đình" }; a name without a known type keeps its whole text. */
export function splitUnitName(value: string): { type?: string; name: string } {
  const type = UNIT_TYPES.find((prefix) => value.startsWith(`${prefix} `))
  return type ? { type, name: value.slice(type.length + 1) } : { name: value }
}

// Older and informal prefixes are dropped too, so "TP. Hồ Chí Minh", "P. Bến Nghé" and "Tỉnh Bình Dương" compare by name.
const PREFIX =
  /^(?:(?:thanh pho|tinh|phuong|xa|dac khu|thi tran|thi xa|quan|huyen)\s+|(?:tp|tt)\.?\s*|[tpxqh]\.\s*)(?=\S)/

const fold = (value: string) =>
  foldText(value)
    .replace(/[-–—_,]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

/** Folded name without its unit type: "Thành phố Hà Nội", "TP Hà Nội" and "ha noi" all give "ha noi". */
export function unitKey(value: string) {
  return fold(value).replace(PREFIX, '')
}

/**
 * Keys a stored name may match: with and without a leading type word, because some names start with one ("Xà Phìn"
 * stored without "Xã" folds to "xa phin", like the official "Xã Xà Phìn" without its type).
 */
function candidateKeys(value: string) {
  const full = fold(value)
  return full ? new Set([full, unitKey(value)]) : new Set<string>()
}

/** Informal names of today's provinces → their code. */
const ALIASES: Record<string, number> = { hcm: 79, tphcm: 79, 'sai gon': 79, 'ho chi minh city': 79, hanoi: 1 }

/**
 * Provinces merged on 01/07/2025 (Resolution 202/2025/QH15), by their former name → the code of the province that now
 * includes them. Unchanged provinces match by name and are not listed.
 */
const MERGED_INTO: Record<string, number> = {
  'ha giang': 8,
  'yen bai': 15,
  'bac kan': 19,
  'vinh phuc': 25,
  'hoa binh': 25,
  'bac giang': 24,
  'thai binh': 33,
  'hai duong': 31,
  'ha nam': 37,
  'nam dinh': 37,
  'quang binh': 44,
  'thua thien hue': 46,
  'quang nam': 48,
  'kon tum': 51,
  'binh dinh': 52,
  'ninh thuan': 56,
  'phu yen': 66,
  'dak nong': 68,
  'binh thuan': 68,
  'binh phuoc': 75,
  'ba ria vung tau': 79,
  'binh duong': 79,
  'long an': 80,
  'tien giang': 82,
  'ben tre': 86,
  'tra vinh': 86,
  'kien giang': 91,
  'soc trang': 92,
  'hau giang': 92,
  'bac lieu': 96
}

export interface ProvinceMatch {
  province: AdminProvince
  /** True when the text named a former province that is now part of `province`. */
  merged: boolean
}

/** Today's province for a stored name, accepting short names, informal names and provinces merged in 2025. */
export function findProvince(provinces: readonly AdminProvince[], value: string): ProvinceMatch | undefined {
  const keys = candidateKeys(value)
  if (keys.size === 0) return undefined
  const direct = provinces.find((province) => keys.has(unitKey(province.name)))
  if (direct) return { province: direct, merged: false }
  for (const key of keys) {
    const alias = ALIASES[key] ?? ALIASES[key.replaceAll(' ', '')]
    const province = alias === undefined ? undefined : provinces.find((item) => item.code === alias)
    if (province) return { province, merged: false }
  }
  for (const key of keys) {
    const code = MERGED_INTO[key]
    const province = code === undefined ? undefined : provinces.find((item) => item.code === code)
    if (province) return { province, merged: true }
  }
  return undefined
}

/** The official ward / commune name of `province` matching a stored name ("Ba Đình", "P. Ba Đình"…). */
export function findWard(province: AdminProvince, value: string) {
  const keys = candidateKeys(value)
  if (keys.size === 0) return undefined
  return province.wards.find((ward) => ward === value.trim()) ?? province.wards.find((ward) => keys.has(unitKey(ward)))
}

/** Replaces names that match the list with their official spelling; anything else is kept as typed. */
export function normalizeAddress(parts: AddressParts, provinces: readonly AdminProvince[] | undefined): AddressParts {
  const addressLine = parts.addressLine.trim()
  const province = provinces ? findProvince(provinces, parts.province)?.province : undefined
  const ward = province ? findWard(province, parts.ward) : undefined
  return {
    addressLine,
    ward: ward ?? parts.ward.trim(),
    province: province?.name ?? parts.province.trim()
  }
}

/**
 * Problems that block saving: a missing part, or a province / ward that is not in today's list (an address typed
 * before 2025). With `optional`, an address left entirely empty is fine. While the list is not loaded only missing
 * parts are reported.
 */
export function addressIssues(
  parts: AddressParts,
  provinces: readonly AdminProvince[] | undefined,
  { optional = false }: { optional?: boolean } = {}
): AddressIssues {
  const line = parts.addressLine.trim()
  const provinceText = parts.province.trim()
  const wardText = parts.ward.trim()
  if (optional && !line && !provinceText && !wardText) return {}
  const issues: AddressIssues = {}
  if (!line) issues.addressLine = 'required'
  if (!provinceText) issues.province = 'required'
  if (!wardText) issues.ward = 'required'
  if (!provinces) return issues
  const province = provinceText ? findProvince(provinces, provinceText) : undefined
  if (provinceText && !province) issues.province = 'outdated'
  if (wardText && (!province || !findWard(province.province, wardText))) issues.ward = 'outdated'
  return issues
}

export const hasAddressIssues = (issues: AddressIssues) => Object.keys(issues).length > 0

/** "45 Kim Mã, Phường Ngọc Hà, Thành phố Hà Nội" — for contracts that keep the address as one text. */
export function joinAddress(parts: AddressParts) {
  return [parts.addressLine, parts.ward, parts.province]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(', ')
}

const DISTRICT = /^(quan|huyen|thi xa|q\.|h\.)\s*\S/

/**
 * Reads a one-line address back into its parts: the last part names the province, the part before it (skipping a former
 * district) the ward, and the rest is the street. Parts that do not match the list stay in the street line, so nothing
 * typed is lost; the province and ward are then picked again.
 */
export function splitAddressText(value: string, provinces: readonly AdminProvince[]): AddressParts {
  const segments = value
    .split(',')
    .map((segment) => segment.trim())
    .filter(Boolean)
  if (segments.length === 0) return EMPTY_ADDRESS
  const province = findProvince(provinces, segments[segments.length - 1])
  if (!province || segments.length === 1) return { addressLine: value.trim(), ward: '', province: '' }
  const rest = segments.slice(0, -1)
  const skipDistrict = rest.length > 1 && DISTRICT.test(foldText(rest[rest.length - 1]))
  const wardIndex = skipDistrict ? rest.length - 2 : rest.length - 1
  const ward = wardIndex > 0 ? findWard(province.province, rest[wardIndex]) : undefined
  if (!ward) return { addressLine: rest.join(', '), ward: '', province: province.province.name }
  return { addressLine: rest.slice(0, wardIndex).join(', '), ward, province: province.province.name }
}
