import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'

import type { ServiceCenter } from '../services-data'

const key = 'customer.services' as const
const control = 'mt-2 w-full rounded-xl bg-surface-container-low px-4 py-3 text-sm'

type ServicesFiltersProps = {
  keyword: string
  category: string
  centerId: string
  centers: readonly ServiceCenter[]
  categories: readonly string[]
  onChange: (name: 'q' | 'category' | 'center', value: string) => void
  onReset: () => void
}

export function ServicesFilters({
  keyword,
  category,
  centerId,
  centers,
  categories,
  onChange,
  onReset
}: ServicesFiltersProps) {
  const { t } = useTranslation()
  return (
    <aside className='space-y-6 rounded-2xl bg-surface-container-lowest p-6 shadow-sm lg:col-span-4'>
      <div className='flex items-center justify-between border-b border-outline-variant/30 pb-4'>
        <h2 className='flex items-center gap-2 text-base font-bold'>
          <Icon className='text-primary' name='tune' />
          {t(`${key}.filters.title`)}
        </h2>
        <button className='text-xs font-semibold text-primary' onClick={onReset} type='button'>
          {t(`${key}.filters.reset`)}
        </button>
      </div>
      <label className='block text-sm font-semibold'>
        {t(`${key}.filters.search`)}
        <input
          className={control}
          onChange={(event) => onChange('q', event.target.value)}
          placeholder={t(`${key}.filters.searchPlaceholder`)}
          type='search'
          value={keyword}
        />
      </label>
      <label className='block text-sm font-semibold'>
        {t(`${key}.filters.center`)}
        <select className={control} onChange={(event) => onChange('center', event.target.value)} value={centerId}>
          <option value=''>{t(`${key}.filters.allCenters`)}</option>
          {centers.map((center) => (
            <option key={center.id} value={center.id}>
              {center.name}
            </option>
          ))}
        </select>
      </label>
      <label className='block text-sm font-semibold'>
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
      <p className='rounded-xl bg-secondary-container/40 p-4 text-xs leading-5 text-on-surface-variant'>
        {t(`${key}.filters.hint`)}
      </p>
    </aside>
  )
}
