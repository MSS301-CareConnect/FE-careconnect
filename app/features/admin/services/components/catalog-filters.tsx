import { useTranslation } from 'react-i18next'

import type { CatalogItemRequestStatus } from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'

import { catalogStatuses } from '../hooks/use-catalog-list'
import type { CategoryOption } from '../service-categories'

const key = 'admin.servicesPage' as const

type CatalogFiltersProps = {
  keyword: string
  category: string
  status: CatalogItemRequestStatus | undefined
  categories: readonly CategoryOption[]
  onChange: (name: 'q' | 'category' | 'status', value: string) => void
  onReset: () => void
}

export function CatalogFilters({ keyword, category, status, categories, onChange, onReset }: CatalogFiltersProps) {
  const { t } = useTranslation()
  return (
    <section aria-label={t(`${key}.search`)} className='space-y-4 rounded-xl bg-white p-5 shadow-sm'>
      <div className='relative'>
        <Icon className='absolute left-3 top-2.5 text-xl text-outline' name='search' />
        <input
          aria-label={t(`${key}.search`)}
          className='w-full rounded-lg bg-surface-container-low py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/30'
          onChange={(event) => onChange('q', event.target.value)}
          placeholder={t(`${key}.search`)}
          type='search'
          value={keyword}
        />
      </div>
      <div className='flex flex-wrap items-end gap-3'>
        <label className='min-w-44 flex-1 text-xs font-semibold text-on-surface-variant'>
          {t(`${key}.category`)}
          <select
            className='mt-1 block w-full rounded-lg bg-surface-container-low p-2.5 text-sm'
            onChange={(event) => onChange('category', event.target.value)}
            value={category || 'all'}
          >
            <option value='all'>{t(`${key}.all`)}</option>
            {categories.map((option) => (
              <option key={option.value} value={option.value}>
                {option.standardKey ? t(`${key}.categories.${option.standardKey}`) : option.value}
              </option>
            ))}
          </select>
        </label>
        <label className='min-w-44 flex-1 text-xs font-semibold text-on-surface-variant'>
          {t(`${key}.status`)}
          <select
            className='mt-1 block w-full rounded-lg bg-surface-container-low p-2.5 text-sm'
            onChange={(event) => onChange('status', event.target.value)}
            value={status ?? 'all'}
          >
            <option value='all'>{t(`${key}.all`)}</option>
            {catalogStatuses.map((item) => (
              <option key={item} value={item}>
                {t(`${key}.statuses.${item}`)}
              </option>
            ))}
          </select>
        </label>
        <button
          className='rounded-lg bg-surface-container px-4 py-2.5 text-sm font-semibold text-primary'
          onClick={onReset}
          type='button'
        >
          {t(`${key}.reset`)}
        </button>
      </div>
    </section>
  )
}
