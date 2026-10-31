import { useTranslation } from 'react-i18next'

import { SERVICE_CATEGORIES, serviceCategoryGroup } from '~/entities/care-catalog/service-category'

type CategorySelectProps = {
  controlProps: { id: string; 'aria-invalid': boolean; 'aria-describedby'?: string }
  className: string
  value: string
  onChange: (value: string) => void
}

/**
 * The six platform categories (U-06), stored as their short Vietnamese value. A service saved earlier with a value
 * outside the six keeps it visible as "Other (current: …)" until the admin picks one of the groups.
 */
export function CategorySelect({ controlProps, className, value, onChange }: CategorySelectProps) {
  const { t } = useTranslation()
  const outsideGroups = value !== '' && serviceCategoryGroup(value) === 'other'

  return (
    <select {...controlProps} className={className} onChange={(event) => onChange(event.target.value)} value={value}>
      <option value=''>{t('admin.servicesPage.form.categoryChoose')}</option>
      {SERVICE_CATEGORIES.map((category) => (
        <option key={category.key} value={category.value}>
          {t(`common.serviceCategories.${category.key}`)}
        </option>
      ))}
      {outsideGroups ? (
        <option disabled value={value}>
          {t('admin.servicesPage.form.categoryLegacy', { value })}
        </option>
      ) : null}
    </select>
  )
}
