import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { CaregiverCard } from './components/caregiver-card'
import { CaregiversFiltersSidebar } from './components/caregivers-filters-sidebar'
import { CaregiversPagination } from './components/caregivers-pagination'
import { CaregiversSearchBanner } from './components/caregivers-search-banner'
import { CaregiversToolbar } from './components/caregivers-toolbar'
import { useCaregiversSearch } from './hooks/use-caregivers-search'

export function CustomerCaregiversPage() {
  const { t } = useTranslation()
  const {
    filters,
    caregivers,
    selectedSkillsCount,
    setSearchQuery,
    setLocation,
    toggleTag,
    toggleSkill,
    setExperience,
    setGender,
    toggleFixedShiftOnly,
    setMinRating,
    setSortOption,
    setViewMode,
    setCurrentPage,
    resetFilters
  } = useCaregiversSearch()

  useEffect(() => {
    document.title = t('customer.caregivers.documentTitle')
  }, [t])

  return (
    <div className='flex w-full flex-1 flex-col bg-surface'>
      {/* Top Banner & Search */}
      <CaregiversSearchBanner
        location={filters.location}
        searchQuery={filters.searchQuery}
        selectedTags={filters.selectedTags}
        onLocationChange={setLocation}
        onSearchChange={setSearchQuery}
        onTagToggle={toggleTag}
      />

      {/* Main 2-Column Section */}
      <section className='mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 items-start gap-8 lg:grid-cols-12'>
          {/* Left Sidebar Filters */}
          <div className='lg:col-span-4'>
            <CaregiversFiltersSidebar
              filters={filters}
              selectedSkillsCount={selectedSkillsCount}
              onExperienceChange={setExperience}
              onFixedShiftToggle={toggleFixedShiftOnly}
              onGenderChange={setGender}
              onMinRatingChange={setMinRating}
              onReset={resetFilters}
              onSkillToggle={toggleSkill}
            />
          </div>

          {/* Right Results Column */}
          <div className='flex flex-col gap-6 lg:col-span-8'>
            <CaregiversToolbar
              matchCount={28}
              sortOption={filters.sortOption}
              viewMode={filters.viewMode}
              onSortChange={setSortOption}
              onViewModeChange={setViewMode}
            />

            <div
              className={filters.viewMode === 'grid' ? 'grid grid-cols-1 gap-6 sm:grid-cols-2' : 'flex flex-col gap-6'}
            >
              {caregivers.map((caregiver) => (
                <CaregiverCard key={caregiver.id} caregiver={caregiver} />
              ))}
            </div>

            <CaregiversPagination currentPage={filters.currentPage} onPageChange={setCurrentPage} />
          </div>
        </div>
      </section>
    </div>
  )
}
