import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Icon } from '~/shared/ui/icon'

import type { HealthStatusFilter, RelationshipFilter } from '../types'

export interface PatientToolbarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  relationshipFilter: RelationshipFilter
  onRelationshipChange: (value: RelationshipFilter) => void
  statusFilter: HealthStatusFilter
  onStatusChange: (value: HealthStatusFilter) => void
  totalCount: number
}

export function PatientToolbar({
  searchQuery,
  onSearchChange,
  relationshipFilter,
  onRelationshipChange,
  statusFilter,
  onStatusChange,
  totalCount
}: PatientToolbarProps) {
  const { t } = useTranslation()

  return (
    <div className='flex flex-col gap-6'>
      {/* Section Header */}
      <div className='flex flex-col justify-between gap-4 rounded-xl bg-surface-container-lowest p-6 shadow-sm sm:flex-row sm:items-center'>
        <div className='flex max-w-xl flex-col gap-1'>
          <div className='flex items-center gap-2'>
            <Icon name='clinical_notes' className='text-2xl text-primary' />
            <h1 className='text-2xl font-bold tracking-tight text-on-surface'>
              {t('customer.patientProfiles.header.title')}
            </h1>
          </div>
          <p className='text-xs text-on-surface-variant leading-relaxed'>
            {t('customer.patientProfiles.header.subtitle')}
          </p>
        </div>

        <Link
          to='/customer/patient-profiles/new'
          className='inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-xs font-semibold text-on-primary shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary-container hover:shadow'
        >
          <Icon name='person_add' className='text-lg' />
          <span>{t('customer.patientProfiles.header.addPatient')}</span>
        </Link>
      </div>

      {/* Search & Filters Toolbar */}
      <div className='flex flex-col items-stretch justify-between gap-4 rounded-xl bg-surface-container-lowest p-4 shadow-sm md:flex-row md:items-center'>
        <div className='relative flex-1'>
          <span className='pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-outline'>
            <Icon name='search' className='text-lg' />
          </span>
          <input
            type='text'
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('customer.patientProfiles.toolbar.searchPlaceholder')}
            className='w-full rounded-lg bg-surface-container-low py-2.5 pr-4 pl-10 text-xs text-on-surface placeholder:text-outline-variant transition-all focus:ring-2 focus:ring-primary/40 focus:outline-none'
          />
        </div>

        <div className='flex flex-wrap items-center gap-3'>
          {/* Relationship Filter */}
          <div className='relative'>
            <select
              value={relationshipFilter}
              onChange={(e) => onRelationshipChange(e.target.value as RelationshipFilter)}
              className='cursor-pointer appearance-none rounded-lg bg-surface-container-low py-2.5 pr-8 pl-3 text-xs font-semibold text-on-surface transition-all focus:ring-2 focus:ring-primary/40 focus:outline-none'
            >
              <option value='all'>{t('customer.patientProfiles.toolbar.filterRelationship.all')}</option>
              <option value='parents'>{t('customer.patientProfiles.toolbar.filterRelationship.parents')}</option>
              <option value='grandparents'>
                {t('customer.patientProfiles.toolbar.filterRelationship.grandparents')}
              </option>
              <option value='children'>{t('customer.patientProfiles.toolbar.filterRelationship.children')}</option>
            </select>
            <span className='pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-outline'>
              <Icon name='expand_more' className='text-base' />
            </span>
          </div>

          {/* Health Status Filter */}
          <div className='relative'>
            <select
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value as HealthStatusFilter)}
              className='cursor-pointer appearance-none rounded-lg bg-surface-container-low py-2.5 pr-8 pl-3 text-xs font-semibold text-on-surface transition-all focus:ring-2 focus:ring-primary/40 focus:outline-none'
            >
              <option value='all'>{t('customer.patientProfiles.toolbar.filterStatus.all')}</option>
              <option value='special'>{t('customer.patientProfiles.toolbar.filterStatus.special')}</option>
              <option value='monitoring'>{t('customer.patientProfiles.toolbar.filterStatus.monitoring')}</option>
              <option value='rehab'>{t('customer.patientProfiles.toolbar.filterStatus.rehab')}</option>
            </select>
            <span className='pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-outline'>
              <Icon name='expand_more' className='text-base' />
            </span>
          </div>

          {/* Active Stats Chip */}
          <div className='inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-surface-container px-3 py-2 text-xs font-semibold text-primary'>
            <span className='h-2 w-2 animate-ping rounded-full bg-primary' />
            <span>{t('customer.patientProfiles.toolbar.activeCount', { count: totalCount })}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
