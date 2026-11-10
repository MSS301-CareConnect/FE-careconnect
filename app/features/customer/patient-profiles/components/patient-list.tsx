import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { isForbiddenError } from '~/features/shared/auth/session-api'
import type { CareRecipientSummaryRecord } from '~/shared/api/generated/contracts'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'
import { Pagination } from '~/shared/ui/pagination'
import { Skeleton, SkeletonGroup } from '~/shared/ui/skeleton'
import { EmptyState, ErrorState } from '~/shared/ui/state-panels'

import type { usePatientProfiles } from '../hooks/use-patient-profiles'
import { PatientCard } from './patient-card'

const key = 'customer.patientProfiles' as const
export const addProfileClass =
  'inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-on-primary shadow-xs transition-[background-color,transform] hover:bg-primary-container active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

type PatientProfilesState = ReturnType<typeof usePatientProfiles>

/** Loading, error, empty and the two-column grid of profiles with its pages. */
export function PatientList({
  profiles,
  hasFilters,
  onClearFilters,
  onPageChange,
  onDelete
}: {
  profiles: PatientProfilesState['profiles']
  hasFilters: boolean
  onClearFilters: () => void
  onPageChange: (page: number) => void
  onDelete: (patient: CareRecipientSummaryRecord) => void
}) {
  const { t } = useTranslation()

  if (profiles.isPending)
    return (
      <SkeletonGroup className='grid gap-4 md:grid-cols-2' label={t(`${key}.states.loading`)}>
        {[0, 1, 2, 3].map((index) => (
          <div className='rounded-2xl border border-outline-variant bg-surface-container-lowest p-5' key={index}>
            <div className='flex items-center gap-4'>
              <Skeleton className='h-14 w-14 rounded-full' />
              <div className='flex-1 space-y-2'>
                <Skeleton className='h-5 w-1/2 rounded' />
                <Skeleton className='h-4 w-2/3 rounded' />
              </div>
            </div>
            <Skeleton className='mt-6 ml-auto h-11 w-40 rounded-xl' />
          </div>
        ))}
      </SkeletonGroup>
    )

  if (profiles.isError)
    return (
      <ErrorState
        message={isForbiddenError(profiles.error) ? t(`${key}.states.forbidden`) : t(`${key}.states.error`)}
        onRetry={() => void profiles.refetch()}
        retryLabel={t(`${key}.states.retry`)}
      />
    )

  const { items, page, totalPages } = profiles.data
  if (items.length === 0)
    return hasFilters ? (
      <EmptyState
        action={
          <Button onClick={onClearFilters} variant='outline'>
            {t(`${key}.toolbar.clear`)}
          </Button>
        }
        description={t(`${key}.states.noResultsHint`)}
        icon='search_off'
        title={t(`${key}.states.noResults`)}
      />
    ) : (
      <EmptyState
        action={
          <Link className={addProfileClass} to='/customer/patient-profiles/new'>
            <Icon className='text-lg' name='person_add' />
            {t(`${key}.header.addPatient`)}
          </Link>
        }
        description={t(`${key}.states.emptyDescription`)}
        icon='family_restroom'
        title={t(`${key}.states.emptyTitle`)}
      />
    )

  return (
    <div className='flex flex-col gap-4'>
      <div className='cc-stagger grid gap-4 md:grid-cols-2'>
        {items.map((patient) => (
          <PatientCard key={patient.id} onDelete={onDelete} patient={patient} />
        ))}
      </div>
      <Pagination
        ariaLabel={t(`${key}.pagination.label`)}
        onPageChange={onPageChange}
        page={page}
        totalPages={totalPages}
      />
    </div>
  )
}
