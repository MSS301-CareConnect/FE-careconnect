import { useTranslation } from 'react-i18next'
import type { CaregiverFilterState, ExperienceLevel, GenderFilter } from '../types'

const ICON_TUNE = 'tune'
const ICON_STAR = 'star'
const ICON_STAR_HALF = 'star_half'

const SKILL_ITEMS = [
  { key: 'elderly', count: '142' },
  { key: 'strokeRehab', count: '89' },
  { key: 'ivWound', count: '115' },
  { key: 'pressureUlcer', count: '54' },
  { key: 'acupressure', count: '78' },
  { key: 'postnatal', count: '62' }
] as const

const EXPERIENCE_OPTIONS: ExperienceLevel[] = ['all', 'under2', 'from2to5', 'over5', 'over10']

const GENDER_OPTIONS: GenderFilter[] = ['all', 'female', 'male']

const RATING_OPTIONS = [
  { minRating: 5.0, count: '45', labelKey: 'star5', fullStars: 5, halfStar: false },
  { minRating: 4.8, count: '128', labelKey: 'star48', fullStars: 4, halfStar: true },
  { minRating: 4.5, count: '260', labelKey: 'star45', fullStars: 4, halfStar: false }
] as const

interface CaregiversFiltersSidebarProps {
  filters: CaregiverFilterState
  selectedSkillsCount: number
  onSkillToggle: (skill: keyof CaregiverFilterState['skills']) => void
  onExperienceChange: (exp: ExperienceLevel) => void
  onGenderChange: (gender: GenderFilter) => void
  onFixedShiftToggle: () => void
  onMinRatingChange: (rating: number) => void
  onReset: () => void
}

export function CaregiversFiltersSidebar({
  filters,
  selectedSkillsCount,
  onSkillToggle,
  onExperienceChange,
  onGenderChange,
  onFixedShiftToggle,
  onMinRatingChange,
  onReset
}: CaregiversFiltersSidebarProps) {
  const { t } = useTranslation()

  return (
    <aside className='flex flex-col gap-6 rounded-2xl bg-surface-container-lowest p-6 shadow-sm'>
      {/* Header */}
      <div className='flex items-center justify-between border-b border-outline-variant/30 pb-4'>
        <div className='flex items-center gap-2'>
          <span className='material-symbols-outlined text-[22px] text-primary'>{ICON_TUNE}</span>
          <h2 className='text-base font-bold text-on-surface'>{t('customer.caregivers.filters.title')}</h2>
        </div>
        <button
          className='text-xs font-semibold text-primary transition-colors hover:text-primary-container'
          type='button'
          onClick={onReset}
        >
          {t('customer.caregivers.filters.reset')}
        </button>
      </div>

      {/* Filter 1: Skills */}
      <div className='flex flex-col gap-3'>
        <div className='flex items-center justify-between text-sm font-semibold text-on-surface'>
          <span>{t('customer.caregivers.filters.skillsTitle')}</span>
          <span className='text-xs font-medium text-primary'>
            {t('customer.caregivers.filters.selectedCount', {
              count: selectedSkillsCount
            })}
          </span>
        </div>
        <div className='flex flex-col gap-1.5 pt-1'>
          {SKILL_ITEMS.map(({ key, count }) => (
            <label
              key={key}
              className='flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 transition-colors hover:bg-surface-container-low'
            >
              <div className='flex items-center gap-2.5'>
                <input
                  checked={filters.skills[key]}
                  className='h-4 w-4 rounded accent-primary text-primary focus:ring-0'
                  type='checkbox'
                  onChange={() => onSkillToggle(key)}
                />
                <span className='text-xs leading-tight text-on-surface sm:text-sm'>
                  {t(`customer.caregivers.filters.skills.${key}`)}
                </span>
              </div>
              <span className='shrink-0 rounded bg-surface-container px-2 py-0.5 text-xs font-medium text-on-surface-variant'>
                {count}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Filter 2: Experience */}
      <div className='flex flex-col gap-2.5 rounded-xl bg-surface-container-low/50 p-4'>
        <span className='text-sm font-semibold text-on-surface'>
          {t('customer.caregivers.filters.experienceTitle')}
        </span>
        <div className='grid grid-cols-1 gap-2 pt-1'>
          {EXPERIENCE_OPTIONS.map((exp) => {
            const isSelected = filters.experience === exp
            return (
              <label
                key={exp}
                className={`flex cursor-pointer items-center gap-2.5 text-xs transition-colors sm:text-sm ${
                  isSelected ? 'font-semibold text-primary' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <input
                  checked={isSelected}
                  className='h-4 w-4 accent-primary'
                  name='experience'
                  type='radio'
                  onChange={() => onExperienceChange(exp)}
                />
                <span>{t(`customer.caregivers.filters.experience.${exp}`)}</span>
              </label>
            )
          })}
        </div>
      </div>

      {/* Filter 3: Gender */}
      <div className='flex flex-col gap-2'>
        <span className='text-sm font-semibold text-on-surface'>{t('customer.caregivers.filters.genderTitle')}</span>
        <div className='grid grid-cols-3 gap-1 rounded-xl bg-surface-container p-1'>
          {GENDER_OPTIONS.map((g) => {
            const isSelected = filters.gender === g
            return (
              <button
                key={g}
                className={`rounded-lg py-1.5 text-center text-xs transition-all ${
                  isSelected
                    ? 'bg-surface-container-lowest font-bold text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                type='button'
                onClick={() => onGenderChange(g)}
              >
                {t(`customer.caregivers.filters.gender.${g}`)}
              </button>
            )
          })}
        </div>
      </div>

      {/* Filter 4: Price */}
      <div className='flex flex-col gap-3'>
        <div className='flex items-center justify-between text-sm'>
          <span className='font-semibold text-on-surface'>{t('customer.caregivers.filters.priceTitle')}</span>
          <span className='font-bold text-secondary text-xs'>{t('customer.caregivers.filters.priceRange')}</span>
        </div>
        <div className='relative py-2'>
          <div className='h-2 overflow-hidden rounded-full bg-surface-container'>
            <div className='ml-[15%] h-full w-[60%] rounded-full bg-primary' />
          </div>
          <div className='absolute top-1/2 left-[15%] h-4 w-4 -translate-y-1/2 cursor-pointer rounded-full border-2 border-primary bg-surface-container-lowest shadow-md' />
          <div className='absolute top-1/2 left-[75%] h-4 w-4 -translate-y-1/2 cursor-pointer rounded-full border-2 border-primary bg-surface-container-lowest shadow-md' />
        </div>
        <div className='grid grid-cols-2 gap-2'>
          <div className='flex flex-col rounded-lg bg-surface-container-low p-2'>
            <span className='text-[11px] text-outline'>{t('customer.caregivers.filters.minPerHour')}</span>
            <span className='text-xs font-bold text-on-surface sm:text-sm'>
              {t('customer.caregivers.filters.minPriceValue')}
            </span>
          </div>
          <div className='flex flex-col rounded-lg bg-surface-container-low p-2'>
            <span className='text-[11px] text-outline'>{t('customer.caregivers.filters.maxPerHour')}</span>
            <span className='text-xs font-bold text-on-surface sm:text-sm'>
              {t('customer.caregivers.filters.maxPriceValue')}
            </span>
          </div>
        </div>
        <label className='mt-1 flex cursor-pointer items-center justify-between rounded-lg bg-surface-container-low/50 p-2.5'>
          <span className='text-xs font-medium text-on-surface'>
            {t('customer.caregivers.filters.fixedShiftPackage')}
          </span>
          <input
            checked={filters.fixedShiftOnly}
            className='h-4 w-4 rounded accent-primary'
            type='checkbox'
            onChange={onFixedShiftToggle}
          />
        </label>
      </div>

      {/* Filter 5: Ratings */}
      <div className='flex flex-col gap-2'>
        <span className='text-sm font-semibold text-on-surface'>{t('customer.caregivers.filters.ratingTitle')}</span>
        <div className='flex flex-col gap-1'>
          {RATING_OPTIONS.map((item) => {
            const isSelected = filters.minRating === item.minRating
            return (
              <label
                key={item.minRating}
                className={`flex cursor-pointer items-center justify-between rounded-lg p-2 transition-colors ${
                  isSelected ? 'bg-surface-container-low' : 'hover:bg-surface-container-low'
                }`}
              >
                <div className='flex items-center gap-2'>
                  <input
                    checked={isSelected}
                    className='h-4 w-4 rounded accent-primary'
                    type='checkbox'
                    onChange={() => onMinRatingChange(isSelected ? 0 : item.minRating)}
                  />
                  <div className='flex text-amber-500'>
                    {Array.from({ length: item.fullStars }).map((_, i) => (
                      <span
                        key={i}
                        className='material-symbols-outlined text-[16px]'
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {ICON_STAR}
                      </span>
                    ))}
                    {item.halfStar ? (
                      <span
                        className='material-symbols-outlined text-[16px]'
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {ICON_STAR_HALF}
                      </span>
                    ) : null}
                  </div>
                  <span
                    className={`text-xs text-on-surface sm:text-sm ${isSelected ? 'font-semibold' : 'font-medium'}`}
                  >
                    {t(`customer.caregivers.filters.rating.${item.labelKey}`)}
                  </span>
                </div>
                <span className={`text-xs ${isSelected ? 'font-bold text-primary' : 'text-outline'}`}>
                  {item.count}
                </span>
              </label>
            )
          })}
        </div>
      </div>
    </aside>
  )
}
