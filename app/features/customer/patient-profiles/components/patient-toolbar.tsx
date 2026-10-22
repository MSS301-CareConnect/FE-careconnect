import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Icon } from '~/shared/ui/icon'

import { STATUS_OPTIONS, type StatusFilter } from '../types'

export interface PatientToolbarProps {
  keyword: string
  onSearch: (value: string) => void
  statusFilter: StatusFilter
  onStatusChange: (value: StatusFilter) => void
  totalCount?: number
}

export function PatientToolbar({ keyword, onSearch, statusFilter, onStatusChange, totalCount }: PatientToolbarProps) {
  const { t } = useTranslation()
  const [draft, setDraft] = useState(keyword)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSearch(draft)
  }

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
        <form className='relative flex flex-1 items-center gap-2' onSubmit={submit} role='search'>
          <span className='pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-outline'>
            <Icon name='search' className='text-lg' />
          </span>
          <input
            type='search'
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            aria-label={t('customer.patientProfiles.toolbar.searchLabel')}
            placeholder={t('customer.patientProfiles.toolbar.searchPlaceholder')}
            className='w-full rounded-lg bg-surface-container-low py-2.5 pr-4 pl-10 text-xs text-on-surface placeholder:text-outline-variant transition-all focus:ring-2 focus:ring-primary/40 focus:outline-none'
          />
          <button
            type='submit'
            className='shrink-0 rounded-lg bg-surface-container px-3 py-2.5 text-xs font-semibold text-primary transition-colors hover:bg-surface-container-high'
          >
            {t('customer.patientProfiles.toolbar.searchButton')}
          </button>
        </form>

        <div className='flex flex-wrap items-center gap-3'>
          {/* Profile Status Filter */}
          <div className='relative'>
            <select
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value as StatusFilter)}
              aria-label={t('customer.patientProfiles.toolbar.filterStatusLabel')}
              className='cursor-pointer appearance-none rounded-lg bg-surface-container-low py-2.5 pr-8 pl-3 text-xs font-semibold text-on-surface transition-all focus:ring-2 focus:ring-primary/40 focus:outline-none'
            >
              <option value='ALL'>{t('customer.patientProfiles.toolbar.filterStatus.all')}</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {t(`customer.careRecipient.status.${status}`)}
                </option>
              ))}
            </select>
            <span className='pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-outline'>
              <Icon name='expand_more' className='text-base' />
            </span>
          </div>

          {/* Result Count Chip */}
          {totalCount !== undefined ? (
            <div className='inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-surface-container px-3 py-2 text-xs font-semibold text-primary'>
              <span className='h-2 w-2 rounded-full bg-primary' />
              <span>{t('customer.patientProfiles.toolbar.totalCount', { count: totalCount })}</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
