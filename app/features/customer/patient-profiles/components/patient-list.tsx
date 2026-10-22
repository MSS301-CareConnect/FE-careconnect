import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { isForbiddenError } from '~/features/shared/auth/session-api'
import { Icon } from '~/shared/ui/icon'

import type { usePatientProfiles } from '../hooks/use-patient-profiles'
import { PatientCard } from './patient-card'

type PatientProfilesState = ReturnType<typeof usePatientProfiles>

export interface PatientListProps {
  profiles: PatientProfilesState['profiles']
  remove: PatientProfilesState['remove']
  hasFilters: boolean
  onPageChange: (page: number) => void
}

export function PatientList({ profiles, remove, hasFilters, onPageChange }: PatientListProps) {
  const { t } = useTranslation()

  if (profiles.isPending)
    return (
      <p role='status' className='rounded-xl bg-surface-container-lowest p-6 text-sm text-on-surface-variant shadow-sm'>
        {t('customer.patientProfiles.states.loading')}
      </p>
    )

  if (profiles.isError)
    return (
      <div
        role='alert'
        className='flex flex-col items-start gap-2 rounded-xl bg-surface-container-lowest p-6 shadow-sm'
      >
        <p className='text-sm text-error'>
          {isForbiddenError(profiles.error)
            ? t('customer.patientProfiles.states.forbidden')
            : t('customer.patientProfiles.states.error')}
        </p>
        <button
          type='button'
          onClick={() => void profiles.refetch()}
          className='text-xs font-semibold text-primary underline'
        >
          {t('customer.patientProfiles.states.retry')}
        </button>
      </div>
    )

  const { items, page, totalPages } = profiles.data

  if (items.length === 0)
    return hasFilters ? (
      <p className='rounded-xl bg-surface-container-lowest p-6 text-sm text-on-surface-variant shadow-sm'>
        {t('customer.patientProfiles.states.noResults')}
      </p>
    ) : (
      <div className='flex flex-col items-center gap-3 rounded-xl bg-surface-container-lowest p-10 text-center shadow-sm'>
        <Icon name='family_restroom' className='text-4xl text-primary' />
        <h2 className='text-base font-bold text-on-surface'>{t('customer.patientProfiles.states.emptyTitle')}</h2>
        <p className='max-w-md text-xs text-on-surface-variant'>
          {t('customer.patientProfiles.states.emptyDescription')}
        </p>
        <Link
          to='/customer/patient-profiles/new'
          className='rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-on-primary'
        >
          {t('customer.patientProfiles.header.addPatient')}
        </Link>
      </div>
    )

  return (
    <div className='flex flex-col gap-6'>
      {items.map((patient) => (
        <PatientCard
          key={patient.id}
          patient={patient}
          onDelete={(id) => remove.mutate(id)}
          isDeleting={remove.isPending && remove.variables === patient.id}
          deleteFailed={remove.isError && remove.variables === patient.id}
        />
      ))}

      {totalPages > 1 ? (
        <nav
          aria-label={t('customer.patientProfiles.pagination.label')}
          className='flex items-center justify-between rounded-xl bg-surface-container-lowest p-3 text-xs shadow-sm'
        >
          <button
            type='button'
            disabled={page <= 0}
            onClick={() => onPageChange(page - 1)}
            className='rounded-lg px-3 py-2 font-semibold text-primary disabled:text-outline'
          >
            {t('customer.patientProfiles.pagination.previous')}
          </button>
          <span className='text-on-surface-variant'>
            {t('customer.patientProfiles.pagination.pageOf', { page: page + 1, total: totalPages })}
          </span>
          <button
            type='button'
            disabled={page + 1 >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className='rounded-lg px-3 py-2 font-semibold text-primary disabled:text-outline'
          >
            {t('customer.patientProfiles.pagination.next')}
          </button>
        </nav>
      ) : null}
    </div>
  )
}
