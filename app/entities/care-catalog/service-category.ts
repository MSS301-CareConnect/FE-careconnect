/**
 * The platform's six service categories (U-06). `value` is the short Vietnamese string stored in
 * `CatalogItemRequest.category`; the UI shows `common.serviceCategories.<key>` in the active language.
 */
export const SERVICE_CATEGORIES = [
  { key: 'elderly', value: 'Người cao tuổi' },
  { key: 'postSurgery', value: 'Sau phẫu thuật' },
  { key: 'rehabilitation', value: 'Phục hồi chức năng' },
  { key: 'chronic', value: 'Bệnh mạn tính' },
  { key: 'nursing', value: 'Điều dưỡng y tế' },
  { key: 'motherBaby', value: 'Mẹ và bé' }
] as const

export type ServiceCategoryKey = (typeof SERVICE_CATEGORIES)[number]['key']
/** A stored category outside the six groups. */
export type ServiceCategoryGroup = ServiceCategoryKey | 'other'

/** Material Symbols icon of each group, so a service card is recognisable before its name is read. */
export const SERVICE_CATEGORY_ICONS: Record<ServiceCategoryGroup, string> = {
  elderly: 'elderly',
  postSurgery: 'healing',
  rehabilitation: 'accessible_forward',
  chronic: 'monitor_heart',
  nursing: 'vaccines',
  motherBaby: 'child_care',
  other: 'medical_services'
}

/** Comparison form that ignores case, surrounding spaces and Unicode composition. */
function normalize(value: string) {
  return value.trim().normalize('NFC').toLocaleLowerCase('vi')
}

/** Long categories saved before the short list existed; read into their group without a data migration. */
const LEGACY_CATEGORIES: Record<string, ServiceCategoryKey> = {
  'chăm sóc người cao tuổi': 'elderly',
  'chăm sóc hậu phẫu': 'postSurgery',
  'chăm sóc sau tai biến & đột quỵ': 'rehabilitation',
  'vật lý trị liệu & phục hồi': 'rehabilitation',
  'chăm sóc bệnh mạn tính & sa sút trí tuệ': 'chronic',
  'chăm sóc giảm nhẹ': 'chronic',
  'điều dưỡng & kỹ thuật y tế': 'nursing',
  'chăm sóc mẹ và bé sau sinh': 'motherBaby',
  // Enum-style codes some seed data stores (e.g. ELDERLY_CARE); never shown raw.
  elderly_care: 'elderly',
  elderly: 'elderly',
  post_surgery: 'postSurgery',
  post_surgery_care: 'postSurgery',
  rehabilitation: 'rehabilitation',
  physiotherapy: 'rehabilitation',
  chronic_care: 'chronic',
  chronic_disease: 'chronic',
  palliative_care: 'chronic',
  nursing: 'nursing',
  medical_nursing: 'nursing',
  mother_baby: 'motherBaby',
  mother_and_baby: 'motherBaby'
}

const BY_VALUE = new Map<string, ServiceCategoryKey>(
  SERVICE_CATEGORIES.map((category) => [normalize(category.value), category.key])
)

export function serviceCategoryGroup(value: string | undefined): ServiceCategoryGroup {
  if (!value) return 'other'
  const normalized = normalize(value)
  return BY_VALUE.get(normalized) ?? LEGACY_CATEGORIES[normalized] ?? 'other'
}

export function serviceCategoryValue(key: ServiceCategoryKey) {
  return SERVICE_CATEGORIES.find((category) => category.key === key)!.value
}

export function isServiceCategoryKey(value: string): value is ServiceCategoryKey {
  return SERVICE_CATEGORIES.some((category) => category.key === value)
}
