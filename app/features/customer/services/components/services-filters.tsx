import { useTranslation } from 'react-i18next'

import { SERVICE_CATEGORY_ICONS } from '~/entities/care-catalog/service-category'
import { FilterChips } from '~/shared/ui/filter-chips'
import { Select } from '~/shared/ui/form-field'
import { SearchInput } from '~/shared/ui/search-input'

import type { CustomerServicesList } from '../hooks/use-customer-services'
import { SERVICE_SORTS } from '../services-data'

const key = 'customer.services' as const
/** With this many services or fewer, the search box alone is enough. */
const FEW_RESULTS = 6

/** One filter row: search + category chips + sort. A short list keeps only the search box. */
export function ServicesFilters({ list }: { list: CustomerServicesList }) {
  const { t } = useTranslation()
  const full = list.total > FEW_RESULTS || Boolean(list.category)

  return (
    <div className='mb-6 flex flex-col gap-3'>
      <div className='flex flex-wrap items-center gap-3'>
        <SearchInput
          className='min-w-0 flex-1 basis-64'
          label={t(`${key}.filters.search`)}
          onChange={(value) => list.update('q', value)}
          placeholder={t(`${key}.filters.searchPlaceholder`)}
          value={list.keyword}
        />
        {full ? (
          <Select
            aria-label={t(`${key}.sort.label`)}
            className='w-auto min-w-44'
            onChange={(event) => list.update('sort', event.target.value)}
            value={list.sort}
          >
            {SERVICE_SORTS.map((option) => (
              <option key={option} value={option}>
                {t(`${key}.sort.${option}`)}
              </option>
            ))}
          </Select>
        ) : null}
      </div>
      {full && list.categories.length > 1 ? (
        <FilterChips
          label={t(`${key}.filters.category`)}
          onChange={(value) => list.update('category', value)}
          options={[
            { value: '', label: t(`${key}.filters.allCategories`) },
            ...list.categories.map((item) => ({
              value: item,
              label: t(`common.serviceCategories.${item}`),
              icon: SERVICE_CATEGORY_ICONS[item]
            }))
          ]}
          value={list.category}
        />
      ) : null}
    </div>
  )
}
