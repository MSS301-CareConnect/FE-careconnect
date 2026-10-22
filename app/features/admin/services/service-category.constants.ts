/**
 * Default medical categories suggested for standard services. `value` is the stable string stored
 * in `CatalogItemRequest.category`, never UI copy; the dropdown shows the translated
 * `admin.servicesPage.categories.<key>` label so both languages save the same value.
 */
export const STANDARD_SERVICE_CATEGORIES = [
  { key: 'elderly', value: 'Chăm sóc người cao tuổi' },
  { key: 'postSurgery', value: 'Chăm sóc hậu phẫu' },
  { key: 'stroke', value: 'Chăm sóc sau tai biến & đột quỵ' },
  { key: 'chronicDementia', value: 'Chăm sóc bệnh mạn tính & sa sút trí tuệ' },
  { key: 'nursing', value: 'Điều dưỡng & kỹ thuật y tế' },
  { key: 'palliative', value: 'Chăm sóc giảm nhẹ' },
  { key: 'rehabilitation', value: 'Vật lý trị liệu & phục hồi' },
  { key: 'postpartum', value: 'Chăm sóc mẹ và bé sau sinh' }
] as const

export type StandardServiceCategoryKey = (typeof STANDARD_SERVICE_CATEGORIES)[number]['key']

/** Select value of the trailing "add a new category" option; never sent to the backend. */
export const NEW_CATEGORY_OPTION = '__new-category__'
