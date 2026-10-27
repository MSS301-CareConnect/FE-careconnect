import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'

const key = 'customer.services' as const
const control =
  'mt-2 h-12 w-full rounded-xl border border-[#d9e4da] bg-[#fbfcfa] px-4 text-sm text-[#1b2922] outline-none transition-colors focus:border-[#075b31] focus:ring-2 focus:ring-[#075b31]/10'

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
    <section className='mt-4 rounded-2xl border border-[#dfe8de] bg-white p-4 shadow-[0_8px_28px_-24px_rgba(15,55,29,0.4)] sm:p-5'>
      <div className='mb-4 flex items-center justify-between gap-4'>
        <h2 className='flex items-center gap-2 text-sm font-bold text-[#244331]'>
          <Icon aria-hidden='true' className='text-xl text-[#075b31]' name='tune' />
          {t(`${key}.filters.title`)}
        </h2>
        <button
          className='text-sm font-semibold text-[#075b31] underline-offset-4 hover:underline focus-visible:rounded focus-visible:outline-2 focus-visible:outline-[#075b31]'
          onClick={onReset}
          type='button'
        >
          {t(`${key}.filters.reset`)}
        </button>
      </div>
      <div className='grid gap-4 md:grid-cols-[minmax(0,1.6fr)_minmax(220px,1fr)] lg:gap-5'>
        <label className='block text-sm font-semibold text-[#32493a]'>
          {t(`${key}.filters.search`)}
          <span className='relative block'>
            <Icon
              aria-hidden='true'
              className='pointer-events-none absolute left-4 top-1/2 mt-1 -translate-y-1/2 text-xl text-[#6b806e]'
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
        <label className='block text-sm font-semibold text-[#32493a]'>
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
