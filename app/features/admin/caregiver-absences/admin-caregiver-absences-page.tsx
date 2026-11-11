import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'

import {
  bookingKeys,
  fetchCaregiverAbsenceStatistics,
  fetchCaregiverAbsences
} from '~/entities/booking/booking-api'
import { BookingGroupCard, groupByBooking } from '~/entities/booking/booking-group-card'
import { CaregiverAbsenceCard } from '~/entities/booking/caregiver-absence-card'
import { useCaregiverNames, useCenterNames } from '~/entities/provider/use-provider-names'
import { useCenterOptions } from '~/features/admin/data/use-center-options'
import { AdminStatCards } from '~/features/admin/ui/stat-cards'
import type { CaregiverAbsenceStatus, ListCaregiverAbsencesParams } from '~/shared/api/generated/contracts'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { BentoPageHeader, bentoCard, bentoContainer } from '~/shared/ui/bento-page-header'
import { Button } from '~/shared/ui/button'
import { Select } from '~/shared/ui/form-field'
import { Pagination, pageSizeOf } from '~/shared/ui/pagination'
import { Skeleton } from '~/shared/ui/skeleton'
import { EmptyState, ErrorState } from '~/shared/ui/state-panels'
import { StatusBadge } from '~/shared/ui/status-badge'

const STATUSES: CaregiverAbsenceStatus[] = ['PENDING', 'CONFIRMED', 'EXCUSED']
const key = 'caregiverAbsence.admin' as const
const DEFAULT_PAGE_SIZE = 10
const STAT_ICONS = { PENDING: 'pending_actions', CONFIRMED: 'gavel', EXCUSED: 'task_alt' } as const

/**
 * Platform-wide caregiver absences (2026-11-10), read-only: the center concludes each one. The page's visits are folded
 * per booking (2026-11-11, like the center's queue): one card per booking with its missed visits inside. The count
 * cards filter by status; status, center, page and page size live in URL search parameters; caregivers and centers
 * show by name, never by ID.
 */
export function AdminCaregiverAbsencesPage() {
  const { t } = useTranslation()
  useDocumentTitle(t(`${key}.title`))
  const [params, setParams] = useSearchParams()
  const status = STATUSES.find((item) => item === params.get('status'))
  const centerId = params.get('center') || undefined
  const page = Math.max(0, Number(params.get('page')) || 0)
  const pageSize = pageSizeOf(params.get('size'), DEFAULT_PAGE_SIZE)
  const request: ListCaregiverAbsencesParams = { status, centerId, page, size: pageSize }
  const absences = useQuery({
    queryKey: bookingKeys.absences(request),
    queryFn: () => fetchCaregiverAbsences(request),
    placeholderData: keepPreviousData,
    retry: false
  })
  const statistics = useQuery({
    queryKey: bookingKeys.absenceStatistics({ centerId }),
    queryFn: () => fetchCaregiverAbsenceStatistics({ centerId }),
    retry: false
  })
  const centers = useCenterOptions(true)
  const items = absences.data?.items ?? []
  const caregiverName = useCaregiverNames(items.map((item) => item.caregiverId))
  const centerName = useCenterNames(items.map((item) => item.centerId))

  function update(changes: Record<string, string | undefined>) {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        for (const [name, value] of Object.entries(changes)) {
          if (value) next.set(name, value)
          else next.delete(name)
        }
        if (!('page' in changes)) next.delete('page')
        return next
      },
      { replace: true }
    )
  }

  const counts = statistics.data
  const stats = [
    {
      id: 'all',
      icon: 'person_off',
      label: t(`${key}.stats.total`),
      value: counts?.total,
      selected: !status,
      onSelect: () => update({ status: undefined })
    },
    ...STATUSES.map((item) => ({
      id: item,
      icon: STAT_ICONS[item],
      label: t(`${key}.stats.${item.toLowerCase() as 'pending' | 'confirmed' | 'excused'}`),
      value: counts?.[item.toLowerCase() as 'pending' | 'confirmed' | 'excused'],
      selected: status === item,
      onSelect: () => update({ status: status === item ? undefined : item })
    }))
  ]

  return (
    <div className={bentoContainer}>
      <BentoPageHeader description={t(`${key}.description`)} title={t(`${key}.title`)} />

      <AdminStatCards items={stats} label={t(`${key}.statusLabel`)} />

      <section className={`${bentoCard} flex flex-wrap items-end gap-3 p-4`}>
        <label className='flex min-w-56 flex-1 flex-col gap-1 text-xs font-semibold text-on-surface-variant sm:max-w-sm'>
          {t(`${key}.centerFilter`)}
          <Select onChange={(event) => update({ center: event.target.value || undefined })} value={centerId ?? ''}>
            <option value=''>{t(`${key}.allCenters`)}</option>
            {(centers.data ?? []).map((center) => (
              <option key={center.id} value={center.id}>
                {center.centerName}
              </option>
            ))}
          </Select>
        </label>
        {status || centerId ? (
          <Button onClick={() => update({ status: undefined, center: undefined })} variant='ghost'>
            {t(`${key}.reset`)}
          </Button>
        ) : null}
      </section>

      {absences.isPending ? (
        <div aria-label={t(`${key}.loading`)} className='space-y-2' role='status'>
          <Skeleton className='h-24 w-full rounded-2xl' />
          <Skeleton className='h-24 w-full rounded-2xl' />
        </div>
      ) : absences.isError ? (
        <ErrorState message={t(`${key}.error`)} onRetry={() => void absences.refetch()} retryLabel={t(`${key}.retry`)} />
      ) : items.length === 0 ? (
        <EmptyState description={t(`${key}.emptyHint`)} icon='event_available' title={t(`${key}.empty`)} />
      ) : (
        <>
          <ul className='flex flex-col gap-3'>
            {groupByBooking(items).map(({ bookingId, rows }, index) => {
              const waiting = rows.filter((row) => row.status === 'PENDING').length
              return (
                <BookingGroupCard
                  badge={
                    waiting > 0 ? (
                      <StatusBadge dot tone='warning'>
                        {t('caregiverAbsence.pendingCount', { count: waiting })}
                      </StatusBadge>
                    ) : undefined
                  }
                  bookingCode={rows[0].bookingCode}
                  countLabel={`${t(`${key}.visitCount`, { count: rows.length })} · ${t(`${key}.center`, {
                    name: centerName(rows[0].centerId)
                  })}`}
                  defaultOpen={index === 0}
                  href={`/admin/bookings/${bookingId}`}
                  key={bookingId}
                  recipientName={rows[0].recipientName}
                >
                  {rows.map((item) => (
                    <CaregiverAbsenceCard
                      item={item}
                      key={item.id}
                      meta={t('caregiverAbsence.caregiver', { name: caregiverName(item.caregiverId) })}
                    />
                  ))}
                </BookingGroupCard>
              )
            })}
          </ul>
          <Pagination
            onPageChange={(next) => update({ page: next > 0 ? String(next) : undefined })}
            onPageSizeChange={(size) => update({ size: size === DEFAULT_PAGE_SIZE ? undefined : String(size) })}
            page={page}
            pageSize={pageSize}
            totalElements={absences.data.totalElements}
            totalPages={absences.data.totalPages}
          />
        </>
      )}
    </div>
  )
}
