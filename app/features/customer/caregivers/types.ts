import type { resources } from '~/shared/i18n/resources'

type CaregiverCopy = (typeof resources)['vi']['translation']['customer']['caregivers']['results']

export type CaregiverGender = 'female' | 'male'
export type CaregiverSortOption = 'highestRating' | 'mostExperience' | 'priceAsc' | 'closest'
export type CaregiverViewMode = 'list' | 'grid'
export type ExperienceLevel = 'all' | 'under2' | 'from2to5' | 'over5' | 'over10'
export type GenderFilter = 'all' | 'female' | 'male'

export interface Caregiver {
  id: string
  name: string
  avatarUrl: string
  verified: boolean
  badgePrimary: keyof CaregiverCopy['badges']
  badgeSecondary: keyof CaregiverCopy['badges']
  badgeSecondaryType: 'success' | 'amber'
  hourlyRate: number
  hourlyRateFormatted: string
  shift8hRate: number
  shift8hRateFormatted: string
  rating: number
  reviewsCount: number
  completedShifts: number
  gender: CaregiverGender
  age: number
  districts: string
  experienceYears: number
  bioKey: keyof CaregiverCopy['bios']
  skillKeys: (keyof CaregiverCopy['cardSkills'])[]
  availabilityKey: keyof CaregiverCopy['availability']
}

export interface CaregiverFilterState {
  searchQuery: string
  location: string
  selectedTags: string[]
  skills: {
    elderly: boolean
    strokeRehab: boolean
    ivWound: boolean
    pressureUlcer: boolean
    acupressure: boolean
    postnatal: boolean
  }
  experience: ExperienceLevel
  gender: GenderFilter
  fixedShiftOnly: boolean
  minRating: number
  sortOption: CaregiverSortOption
  viewMode: CaregiverViewMode
  currentPage: number
}
