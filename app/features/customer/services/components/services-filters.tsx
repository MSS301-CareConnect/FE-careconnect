import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'

const key = 'customer.services' as const
const control =
  'mt-2 h-12 w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 text-sm text-on-surface outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15'

type ServicesFiltersProps = {
  keyword: string
  category: string
  categories: readonly string[]
  onChange: (name: 'q' | 'category', value: string) => void
  onReset: () => void
}

export function ServicesFilters({ keyword, category, categories, onChange, onReset }: ServicesFiltersProps) {
  const { t } = useTranslation()
  return (
    <section className='mt-4 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-4 shadow-xs sm:p-5'>
      <div className='mb-4 flex items-center justify-between gap-4'>
        <h2 className='flex items-center gap-2 text-sm font-bold text-on-surface'>
          <Icon aria-hidden='true' className='text-xl text-primary' name='tune' />
          {t(`${key}.filters.title`)}
        </h2>
        <button
          className='text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:rounded focus-visible:outline-2 focus-visible:outline-primary'
          onClick={onReset}
          type='button'
        >
          {t(`${key}.filters.reset`)}
        </button>
      </div>
      <div className='grid gap-4 md:grid-cols-[minmax(0,1.6fr)_minmax(220px,1fr)] lg:gap-5'>
        <label className='block text-sm font-semibold text-on-surface'>
          {t(`${key}.filters.search`)}
          <span className='relative block'>
            <Icon
              aria-hidden='true'
              className='pointer-events-none absolute left-4 top-1/2 mt-1 -translate-y-1/2 text-xl text-on-surface-variant'
              name='search'
            />
            <input
              className={`${control} pl-11`}
              onChange={(event) => onChange('q', event.target.value)}
              placeholder={t(`${key}.filters.searchPlaceholder`)}
              type='search'
              value={keyword}
            />
          </span>
        </label>
        <label className='block text-sm font-semibold text-on-surface'>
          {t(`${key}.filters.category`)}
          <select className={control} onChange={(event) => onChange('category', event.target.value)} value={category}>
            <option value=''>{t(`${key}.filters.allCategories`)}</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  )
}
