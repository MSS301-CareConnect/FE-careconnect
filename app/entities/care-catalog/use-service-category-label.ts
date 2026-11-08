import { useTranslation } from 'react-i18next'

import { serviceCategoryGroup } from './service-category'

/** Short label of a stored category; a value outside the six groups is shown as stored. */
export function useServiceCategoryLabel() {
  const { t } = useTranslation()
  return (stored: string | undefined) => {
    const group = serviceCategoryGroup(stored)
    return group === 'other' ? stored || t('common.serviceCategories.other') : t(`common.serviceCategories.${group}`)
  }
}
