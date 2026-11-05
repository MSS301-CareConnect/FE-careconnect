import { useTranslation } from 'react-i18next'

import { SERVICE_CATEGORIES, type ServiceCategoryGroup } from '~/entities/care-catalog/service-category'
import type { CatalogItemRequestStatus } from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'

import { catalogStatuses } from '../hooks/use-catalog-list'

const key = 'admin.servicesPage' as const

/** One height for every control of the bar, so the search, both selects and the reset button line up. */
const field =
  'h-11 w-full rounded-xl border border-outline-variant/60 bg-surface-container-low text-sm text-on-surface outline-none transition-colors hover:border-primary/40 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20'
const select = `${field} min-w-0 truncate whitespace-nowrap pl-3.5 pr-3 font-medium`

type CatalogFiltersProps = {
  keyword: string
  category: string
  status: CatalogItemRequestStatus | undefined
  /** Groups present in the catalog; "other" appears only when some service sits outside the six. */
  categories: readonly ServiceCategoryGroup[]
  onChange: (name: 'q' | 'category' | 'status', value: string) => void
  onReset: () => void
}

export function CatalogFilters({ keyword, category, status, categories, onChange, onReset }: CatalogFiltersProps) {
  const { t } = useTranslation()
  const hasFilters = Boolean(keyword || category || status)

  return (
    <section
      aria-label={t(`${key}.search`)}
      className='@container rounded-2xl border border-outline-variant/60 bg-white p-3 shadow-xs sm:p-4'
    >
      {/* Laid out by the card's own width: the admin sidebar leaves far less room than the viewport suggests. */}
      <div className='grid gap-3 @md:grid-cols-2 @xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] @4xl:grid-cols-[minmax(0,1fr)_14rem_12rem_auto]'>
        <div className='relative @md:col-span-2 @xl:col-span-3 @4xl:col-span-1'>
          <Icon
            className='pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xl text-outline'
            name='search'
          />
          <input
            aria-label={t(`${key}.search`)}
            className={`${field} pl-11 pr-10 placeholder:text-outline [&::-webkit-search-cancel-button]:hidden`}
            onChange={(event) => onChange('q', event.target.value)}
            placeholder={t(`${key}.search`)}
            type='search'
            value={keyword}
          />
          {keyword ? (
            <button
              aria-label={t(`${key}.clearSearch`)}
              className='absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-outline transition-colors hover:bg-surface-container hover:text-on-surface'
              onClick={() => onChange('q', '')}
              title={t(`${key}.clearSearch`)}
              type='button'
            >
              <Icon className='text-lg' name='close' />
            </button>
          ) : null}
        </div>

        <select
          aria-label={t(`${key}.category`)}
          className={select}
          onChange={(event) => onChange('category', event.target.value)}
          value={category || 'all'}
        >
          <option value='all'>{t(`${key}.allCategories`)}</option>
          {SERVICE_CATEGORIES.map((option) => (
            <option key={option.key} value={option.key}>
              {t(`common.serviceCategories.${option.key}`)}
            </option>
          ))}
          {categories.includes('other') ? <option value='other'>{t('common.serviceCategories.other')}</option> : null}
        </select>

        <select
          aria-label={t(`${key}.status`)}
          className={select}
          onChange={(event) => onChange('status', event.target.value)}
          value={status ?? 'all'}
        >
          <option value='all'>{t(`${key}.allStatuses`)}</option>
          {catalogStatuses.map((item) => (
            <option key={item} value={item}>
              {t(`${key}.statuses.${item}`)}
            </option>
          ))}
        </select>

        <button
          className='inline-flex h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-outline-variant/60 px-4 text-sm font-semibold text-primary transition-colors hover:border-primary/50 hover:bg-secondary-container/60 disabled:cursor-not-allowed disabled:border-outline-variant/40 disabled:text-outline disabled:hover:bg-transparent @md:col-span-2 @xl:col-span-1'
          disabled={!hasFilters}
          onClick={onReset}
          type='button'
        >
          <Icon className='text-lg' name='restart_alt' />
          {t(`${key}.reset`)}
        </button>
      </div>
    </section>
  )
}
