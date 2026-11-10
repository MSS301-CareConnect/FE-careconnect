import { useTranslation } from 'react-i18next'

import { useServiceCenters } from '~/entities/care-center/care-center-api'
import { CenterReminder } from '~/entities/care-center/center-scope'
import { Button } from '~/shared/ui/button'
import { Pagination } from '~/shared/ui/pagination'
import { Skeleton, SkeletonGroup } from '~/shared/ui/skeleton'
import { EmptyState, ErrorState } from '~/shared/ui/state-panels'

import type { CustomerServicesList } from '../hooks/use-customer-services'
import { ServiceCard } from './service-card'

const key = 'customer.services' as const

export function ServicesResults({ list }: { list: CustomerServicesList }) {
  const { t } = useTranslation()
  const centers = useServiceCenters()
  const { center, rows, filtered, page, pageCount, isPending, isError } = list
  const ready = !isPending && !isError
  // Without a center, a failed or empty platform-wide list asks for a center instead of reporting an error.
  const needsCenter = !center && !isPending && (isError || !rows.length) && !list.hasFilters
  // The center name on each card only helps when there is more than one center.
  const showCenter = (centers.data?.length ?? 0) > 1

  if (isPending)
    return (
      <SkeletonGroup className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3' label={t(`${key}.states.loading`)}>
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <div
            className='space-y-3 rounded-2xl border border-outline-variant bg-surface-container-lowest p-5'
            key={index}
          >
            <Skeleton className='h-10 w-10 rounded-xl' />
            <Skeleton className='h-5 w-3/4 rounded' />
            <Skeleton className='h-4 w-full rounded' />
            <Skeleton className='h-4 w-1/2 rounded' />
          </div>
        ))}
      </SkeletonGroup>
    )
  if (needsCenter) return <CenterReminder text={t(`${key}.reminder.text`)} title={t(`${key}.reminder.title`)} />
  if (isError) return <ErrorState message={t(`${key}.states.error`)} onRetry={list.retry} />
  if (ready && !rows.length)
    return (
      <EmptyState
        action={
          list.hasFilters ? (
            <Button onClick={list.reset} variant='outline'>
              {t(`${key}.clearFilters`)}
            </Button>
          ) : undefined
        }
        icon='medical_services'
        title={t(list.hasFilters ? `${key}.states.noResults` : `${key}.states.empty`)}
      />
    )

  return (
    <div className='flex flex-col gap-4'>
      <p aria-live='polite' className='text-sm text-on-surface-variant tabular-nums'>
        {t(`${key}.count`, { count: filtered.length })}
      </p>
      <div className='cc-stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {rows.map((service) => (
          <ServiceCard key={service.id} service={service} showCenter={showCenter} />
        ))}
      </div>
      {pageCount > 1 ? (
        <Pagination
          ariaLabel={t(`${key}.pagination`)}
          className='mt-4'
          onPageChange={(next) => list.update('page', String(next))}
          page={page}
          totalPages={pageCount}
        />
      ) : null}
    </div>
  )
}
