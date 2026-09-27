import { useTranslation } from 'react-i18next'
import type { CaregiverSortOption, CaregiverViewMode } from '../types'

const ICON_EXPAND_MORE = 'expand_more'
const ICON_VIEW_LIST = 'view_list'
const ICON_GRID_VIEW = 'grid_view'

const SORT_OPTIONS: CaregiverSortOption[] = ['highestRating', 'mostExperience', 'priceAsc', 'closest']

interface CaregiversToolbarProps {
  matchCount: number
  sortOption: CaregiverSortOption
  viewMode: CaregiverViewMode
  onSortChange: (sort: CaregiverSortOption) => void
  onViewModeChange: (mode: CaregiverViewMode) => void
}

export function CaregiversToolbar({
  matchCount,
  sortOption,
  viewMode,
  onSortChange,
  onViewModeChange
}: CaregiversToolbarProps) {
  const { t } = useTranslation()

  return (
    <div className='flex flex-col items-start justify-between gap-4 rounded-2xl bg-surface-container-lowest p-4 shadow-sm sm:flex-row sm:items-center'>
      <div className='flex items-center gap-2'>
        <span className='text-2xl font-bold text-on-surface'>{matchCount}</span>
        <span className='text-sm text-on-surface-variant'>{t('customer.caregivers.results.matchCount')}</span>
      </div>

      <div className='flex w-full items-center justify-between gap-4 sm:w-auto sm:justify-end'>
        {/* Sort dropdown */}
        <div className='flex items-center gap-2'>
          <span className='whitespace-nowrap text-xs text-on-surface-variant'>
            {t('customer.caregivers.results.sortLabel')}
          </span>
          <div className='relative'>
            <select
              className='cursor-pointer appearance-none rounded-lg bg-surface-container-low py-2 pr-8 pl-3 text-xs font-semibold text-on-surface focus:outline-none hover:bg-surface-container'
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value as CaregiverSortOption)}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {t(`customer.caregivers.results.sortOptions.${opt}`)}
                </option>
              ))}
            </select>
            <span className='pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 material-symbols-outlined text-[18px] text-outline'>
              {ICON_EXPAND_MORE}
            </span>
          </div>
        </div>

        {/* View toggle */}
        <div className='flex items-center rounded-lg bg-surface-container p-1'>
          <button
            aria-label={t('customer.caregivers.results.viewList')}
            className={`rounded-md p-1 transition-all ${
              viewMode === 'list'
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            type='button'
            onClick={() => onViewModeChange('list')}
          >
            <span className='material-symbols-outlined text-[20px]'>{ICON_VIEW_LIST}</span>
          </button>
          <button
            aria-label={t('customer.caregivers.results.viewGrid')}
            className={`rounded-md p-1 transition-all ${
              viewMode === 'grid'
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            type='button'
            onClick={() => onViewModeChange('grid')}
          >
            <span className='material-symbols-outlined text-[20px]'>{ICON_GRID_VIEW}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
