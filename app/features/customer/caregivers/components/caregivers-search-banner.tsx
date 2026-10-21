import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

const ICON_CHEVRON_RIGHT = 'chevron_right'
const ICON_VERIFIED_USER = 'verified_user'
const ICON_SEARCH = 'search'
const ICON_CLOSE = 'close'
const ICON_LOCATION = 'location_on'
const ICON_EXPAND_MORE = 'expand_more'
const ICON_DONE = 'done'

const LOCATIONS = ['all', 'binhthanh', 'q1', 'q7', 'thuduc'] as const
const SUGGESTION_TAGS = ['postStroke', 'ivInjection', 'binhThanh', 'eightHours', 'dementia'] as const

interface CaregiversSearchBannerProps {
  searchQuery: string
  location: string
  selectedTags: string[]
  onSearchChange: (value: string) => void
  onLocationChange: (value: string) => void
  onTagToggle: (tag: string) => void
  catalogMode?: boolean
}

export function CaregiversSearchBanner({
  searchQuery,
  location,
  selectedTags,
  onSearchChange,
  onLocationChange,
  onTagToggle,
  catalogMode = false
}: CaregiversSearchBannerProps) {
  const { t } = useTranslation()

  return (
    <section className='w-full border-b border-outline-variant/30 bg-surface-container-lowest shadow-sm'>
      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        <nav
          aria-label={t('customer.caregivers.breadcrumb.current')}
          className='mb-4 flex items-center gap-2 text-sm text-on-surface-variant'
        >
          <Link className='transition-colors hover:text-primary' to='/customer'>
            {t('customer.caregivers.breadcrumb.home')}
          </Link>
          <span className='material-symbols-outlined text-[18px] text-outline'>{ICON_CHEVRON_RIGHT}</span>
          <span className='font-semibold text-on-surface'>{t('customer.caregivers.breadcrumb.current')}</span>
        </nav>

        <div className='mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end'>
          <div className='max-w-3xl'>
            <div className='mb-2 inline-flex items-center gap-1.5 rounded-full bg-surface-container-low px-3 py-1 text-xs font-semibold text-primary'>
              <span className='material-symbols-outlined text-[16px]'>{ICON_VERIFIED_USER}</span>
              <span>
                {t(catalogMode ? 'customer.provider.catalogBadge' : 'customer.caregivers.banner.verifiedBadge')}
              </span>
            </div>
            <h1 className='text-2xl font-bold tracking-tight text-on-surface sm:text-3xl md:text-4xl'>
              {t('customer.caregivers.banner.title')}
            </h1>
          </div>
        </div>

        <div className='rounded-2xl bg-surface-container p-4 shadow-sm md:p-6'>
          <form className='flex flex-col items-stretch gap-3 md:flex-row' onSubmit={(e) => e.preventDefault()}>
            <div className='relative flex flex-1 items-center rounded-xl bg-surface-container-lowest px-4 shadow-inner'>
              <span className='material-symbols-outlined mr-3 select-none text-[24px] text-primary'>{ICON_SEARCH}</span>
              <input
                aria-label={t(
                  catalogMode ? 'customer.provider.searchPlaceholder' : 'customer.caregivers.banner.searchPlaceholder'
                )}
                className='w-full bg-transparent py-3.5 text-base text-on-surface placeholder:text-outline focus:outline-none'
                placeholder={t(
                  catalogMode ? 'customer.provider.searchPlaceholder' : 'customer.caregivers.banner.searchPlaceholder'
                )}
                type='text'
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
              {searchQuery ? (
                <button
                  aria-label={t('customer.caregivers.banner.clearSearch')}
                  className='p-1 text-outline transition-colors hover:text-on-surface'
                  type='button'
                  onClick={() => onSearchChange('')}
                >
                  <span className='material-symbols-outlined text-[20px]'>{ICON_CLOSE}</span>
                </button>
              ) : null}
            </div>

            <div className='flex items-center gap-3'>
              {!catalogMode && (
                <div className='relative hidden min-w-[200px] items-center rounded-xl bg-surface-container-lowest px-4 sm:flex'>
                  <span className='material-symbols-outlined mr-2 text-[20px] text-outline'>{ICON_LOCATION}</span>
                  <select
                    className='w-full cursor-pointer appearance-none bg-transparent py-3.5 pr-8 text-sm text-on-surface focus:outline-none'
                    value={location}
                    onChange={(e) => onLocationChange(e.target.value)}
                  >
                    {LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {t(`customer.caregivers.banner.locations.${loc}`)}
                      </option>
                    ))}
                  </select>
                  <span className='pointer-events-none absolute right-3 material-symbols-outlined text-[18px] text-outline'>
                    {ICON_EXPAND_MORE}
                  </span>
                </div>
              )}

              <button
                className='flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary-container sm:w-auto'
                type='submit'
              >
                <span className='material-symbols-outlined text-[20px]'>{ICON_SEARCH}</span>
                <span>{t('customer.caregivers.banner.searchBtn')}</span>
              </button>
            </div>
          </form>

          {!catalogMode && (
            <div className='mt-3 flex flex-wrap items-center gap-2 pt-1'>
              <span className='mr-1 text-xs font-medium text-on-surface-variant'>
                {t('customer.caregivers.banner.suggestionsLabel')}
              </span>
              {SUGGESTION_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag)
                return (
                  <button
                    key={tag}
                    className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-colors ${
                      isSelected
                        ? 'bg-surface-container-lowest font-medium text-primary shadow-xs'
                        : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                    type='button'
                    onClick={() => onTagToggle(tag)}
                  >
                    <span>{t(`customer.caregivers.banner.tags.${tag}`)}</span>
                    {isSelected ? <span className='material-symbols-outlined text-[14px]'>{ICON_DONE}</span> : null}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
