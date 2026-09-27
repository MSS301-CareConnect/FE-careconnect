import { useMemo, useState } from 'react'
import { MOCK_CAREGIVERS } from '../data/mock-caregivers'
import type {
  Caregiver,
  CaregiverFilterState,
  CaregiverSortOption,
  CaregiverViewMode,
  ExperienceLevel,
  GenderFilter
} from '../types'

const INITIAL_FILTER_STATE: CaregiverFilterState = {
  searchQuery: 'Phục hồi tai biến, Bình Thạnh',
  location: 'binhthanh',
  selectedTags: ['postStroke', 'binhThanh'],
  skills: {
    elderly: true,
    strokeRehab: true,
    ivWound: false,
    pressureUlcer: false,
    acupressure: false,
    postnatal: false
  },
  experience: 'from2to5',
  gender: 'all',
  fixedShiftOnly: true,
  minRating: 0,
  sortOption: 'highestRating',
  viewMode: 'list',
  currentPage: 1
}

export function useCaregiversSearch() {
  const [filters, setFilters] = useState<CaregiverFilterState>(INITIAL_FILTER_STATE)

  const setSearchQuery = (searchQuery: string) => {
    setFilters((prev) => ({ ...prev, searchQuery, currentPage: 1 }))
  }

  const setLocation = (location: string) => {
    setFilters((prev) => ({ ...prev, location, currentPage: 1 }))
  }

  const toggleTag = (tag: string) => {
    setFilters((prev) => {
      const exists = prev.selectedTags.includes(tag)
      const selectedTags = exists ? prev.selectedTags.filter((t) => t !== tag) : [...prev.selectedTags, tag]
      return { ...prev, selectedTags, currentPage: 1 }
    })
  }

  const toggleSkill = (skill: keyof CaregiverFilterState['skills']) => {
    setFilters((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        [skill]: !prev.skills[skill]
      },
      currentPage: 1
    }))
  }

  const setExperience = (experience: ExperienceLevel) => {
    setFilters((prev) => ({ ...prev, experience, currentPage: 1 }))
  }

  const setGender = (gender: GenderFilter) => {
    setFilters((prev) => ({ ...prev, gender, currentPage: 1 }))
  }

  const toggleFixedShiftOnly = () => {
    setFilters((prev) => ({ ...prev, fixedShiftOnly: !prev.fixedShiftOnly, currentPage: 1 }))
  }

  const setMinRating = (minRating: number) => {
    setFilters((prev) => ({ ...prev, minRating, currentPage: 1 }))
  }

  const setSortOption = (sortOption: CaregiverSortOption) => {
    setFilters((prev) => ({ ...prev, sortOption }))
  }

  const setViewMode = (viewMode: CaregiverViewMode) => {
    setFilters((prev) => ({ ...prev, viewMode }))
  }

  const setCurrentPage = (currentPage: number) => {
    setFilters((prev) => ({ ...prev, currentPage }))
  }

  const resetFilters = () => {
    setFilters({
      ...INITIAL_FILTER_STATE,
      searchQuery: '',
      location: 'all',
      selectedTags: [],
      skills: {
        elderly: false,
        strokeRehab: false,
        ivWound: false,
        pressureUlcer: false,
        acupressure: false,
        postnatal: false
      },
      experience: 'all',
      gender: 'all',
      fixedShiftOnly: false,
      minRating: 0,
      currentPage: 1
    })
  }

  const filteredCaregivers = useMemo(() => {
    return MOCK_CAREGIVERS.filter((item: Caregiver) => {
      if (filters.gender !== 'all' && item.gender !== filters.gender) {
        return false
      }
      if (filters.minRating > 0 && item.rating < filters.minRating) {
        return false
      }
      return true
    })
  }, [filters.gender, filters.minRating])

  const selectedSkillsCount = useMemo(() => {
    return Object.values(filters.skills).filter(Boolean).length
  }, [filters.skills])

  return {
    filters,
    caregivers: filteredCaregivers,
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
  }
}
