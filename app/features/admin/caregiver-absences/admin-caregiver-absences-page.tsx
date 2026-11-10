import { useQueries, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router'

import {
  bookingKeys,
  fetchCaregiverAbsenceStatistics,
  fetchCaregiverAbsences
} from '~/entities/booking/booking-api'
import { CaregiverAbsenceCard } from '~/entities/booking/caregiver-absence-card'
import { fetchCaregiver, fetchCenter, providerKeys } from '~/entities/provider/provider-api'
import type { CaregiverAbsenceStatus, ListCaregiverAbsencesParams } from '~/shared/api/generated/contracts'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { BentoPageHeader, bentoContainer } from '~/shared/ui/bento-page-header'
import { Pagination } from '~/shared/ui/pagination'
import { Skeleton } from '~/shared/ui/skeleton'
import { EmptyState, ErrorState } from '~/shared/ui/state-panels'

const STATUSES: CaregiverAbsenceStatus[] = ['PENDING', 'CONFIRMED', 'EXCUSED']
const key = 'caregiverAbsence.admin' as const
const chip =
  'min-h-10 rounded-full border px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

/**
 * Platform-wide caregiver absences (2026-11-10), read-only: the center concludes each one. Status and page live in URL
 * search parameters; caregivers and centers show by name, never by ID.
 */
export function AdminCaregiverAbsencesPage() {
  const { t } = useTranslation()
  useDocumentTitle(t(`${key}.title`))
  const [params, setParams] = useSearchParams()
  const status = STATUSES.find((item) => item === params.get('status'))
  const page = Math.max(0, Number(params.get('page')) || 0)
  const request: ListCaregiverAbsencesParams = { status, page, size: 20 }
  const absences = useQuery({
    queryKey: bookingKeys.absences(request),
    queryFn: () => fetchCaregiverAbsences(request),
    retry: false
  })
  const statistics = useQuery({
    queryKey: bookingKeys.absenceStatistics({}),
    queryFn: () => fetchCaregiverAbsenceStatistics({}),
    retry: false
  })
  const items = absences.data?.items ?? []
  const caregiverIds = [...new Set(items.map((item) => item.caregiverId))]
  const centerIds = [...new Set(items.map((item) => item.centerId))]
  const caregivers = useQueries({
    queries: caregiverIds.map((id) => ({
      queryKey: providerKeys.caregiver(id),
      queryFn: () => fetchCaregiver(id),
      retry: false,
      staleTime: 5 * 60_000
    }))
  })
  const centers = useQueries({
    queries: centerIds.map((id) => ({
      queryKey: providerKeys.center(id),
      queryFn: () => fetchCenter(id),
      retry: false,
      staleTime: 5 * 60_000
    }))
  })
  const caregiverName = (id: string) => caregivers[caregiverIds.indexOf(id)]?.data?.fullName
  const centerName = (id: string) => centers[centerIds.indexOf(id)]?.data?.centerName

  function update(changes: Record<string, string | undefined>) {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        for (const [name, value] of Object.entries(changes)) {
          if (value) next.set(name, value)
          else next.delete(name)
        }
        return next
      },
      { replace: true }
    )
  }

  const counts = statistics.data
  const stats = [
    { label: t(`${key}.stats.pending`), value: counts?.pending },
    { label: t(`${key}.stats.confirmed`), value: counts?.confirmed },
    { label: t(`${key}.stats.excused`), value: counts?.excused },
    { label: t(`${key}.stats.total`), value: counts?.total }
  ]

  return (
    <div className={bentoContainer}>
      <BentoPageHeader description={t(`${key}.description`)} title={t(`${key}.title`)} />

      <dl className='mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4'>
        {stats.map((stat) => (
          <div className='rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-4' key={stat.label}>
            <dt className='text-sm text-on-surface-variant'>{stat.label}</dt>
            <dd className='mt-1 text-2xl font-extrabold text-on-surface tabular-nums'>{stat.value ?? '—'}</dd>
          </div>
        ))}
      </dl>

      <div aria-label={t(`${key}.statusLabel`)} className='mb-4 flex flex-wrap gap-2' role='group'>
        {[undefined, ...STATUSES].map((value) => {
          const selected = value === status
          return (
            <button
              aria-pressed={selected}
              className={`${chip} ${selected ? 'border-primary bg-primary text-on-primary' : 'border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-low'}`}
              key={value ?? 'all'}
              onClick={() => update({ status: value, page: undefined })}
              type='button'
            >
              {value ? t(`caregiverAbsence.status.${value}`) : t(`${key}.all`)}
            </button>
          )
        })}
      </div>

      {absences.isPending ? (
        <div aria-label={t(`${key}.loading`)} className='space-y-2' role='status'>
          <Skeleton className='h-24 w-full rounded-xl' />
          <Skeleton className='h-24 w-full rounded-xl' />
        </div>
      ) : absences.isError ? (
        <ErrorState message={t(`${key}.error`)} onRetry={() => void absences.refetch()} retryLabel={t(`${key}.retry`)} />
      ) : items.length === 0 ? (
        <EmptyState description={t(`${key}.emptyHint`)} title={t(`${key}.empty`)} />
      ) : (
        <>
          <ul className='flex flex-col gap-2'>
            {items.map((item) => (
              <CaregiverAbsenceCard
                actions={
                  <Link
                    className='inline-flex min-h-10 items-center rounded-xl border border-outline-variant bg-surface-container-lowest px-4 text-sm font-semibold text-on-surface hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                    to={`/admin/bookings/${item.bookingId}`}
                  >
                    {t('caregiverAbsence.openBooking')}
                  </Link>
                }
                item={item}
                key={item.id}
                meta={`${t('caregiverAbsence.caregiver', {
                  name: caregiverName(item.caregiverId) ?? t('caregiverAbsence.unknownCaregiver')
                })} · ${t(`${key}.center`, { name: centerName(item.centerId) ?? t(`${key}.unknownCenter`) })}`}
              />
            ))}
          </ul>
          <Pagination
            onPageChange={(next) => update({ page: next > 0 ? String(next) : undefined })}
            page={page}
            totalPages={absences.data.totalPages}
          />
        </>
      )}
    </div>
  )
}
