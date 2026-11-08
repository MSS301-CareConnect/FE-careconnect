import { useTranslation } from 'react-i18next'

import { Skeleton, SkeletonGroup } from '~/shared/ui/skeleton'

import { cgCard } from './caregiver-page'

/** Placeholder shaped like visit cards so the list does not jump when it loads. */
export function VisitListSkeleton({ count = 3 }: { count?: number }) {
  const { t } = useTranslation()
  return (
    <SkeletonGroup className='flex flex-col gap-3' label={t('caregiver.visits.loading')}>
      <Skeleton className='h-5 w-40 rounded-md' />
      {Array.from({ length: count }, (_, index) => (
        <div className={`${cgCard} flex flex-col gap-3 p-4 sm:p-5`} key={index}>
          <div className='flex items-start justify-between'>
            <div className='flex flex-col gap-2'>
              <Skeleton className='h-6 w-36 rounded-md' />
              <Skeleton className='h-4 w-20 rounded-md' />
            </div>
            <Skeleton className='h-6 w-20 rounded-md' />
          </div>
          <Skeleton className='h-4 w-2/3 rounded-md' />
          <Skeleton className='h-4 w-1/2 rounded-md' />
          <Skeleton className='h-11 w-32 rounded-xl' />
        </div>
      ))}
    </SkeletonGroup>
  )
}
