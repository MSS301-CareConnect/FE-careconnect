import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { useSelectedCenter } from '~/entities/care-center/selected-center'
import { fetchCaregiverCatalog, providerKeys } from '~/entities/provider/provider-api'
import { apiErrorStatus } from '~/shared/api/error-details'
import { Avatar } from '~/shared/ui/avatar'
import { Icon } from '~/shared/ui/icon'
import { Rating } from '~/shared/ui/rating'
import { Skeleton, SkeletonGroup } from '~/shared/ui/skeleton'
import { ErrorState } from '~/shared/ui/state-panels'

import { SignInHint } from './sign-in-hint'

const key = 'customer.centers.detail.caregivers' as const
const SHOWN = 6

/**
 * The first caregivers of this center from the provider catalog. Opening a profile never changes the header's
 * center; "See all" appears only when this center is the chosen one, since the caregivers page follows that choice.
 */
export function CenterCaregiversSection({ centerId }: { centerId: string }) {
  const { t } = useTranslation()
  const { center: selected } = useSelectedCenter()
  const caregivers = useQuery({
    queryKey: [...providerKeys.catalog, 'center', centerId],
    queryFn: () => fetchCaregiverCatalog({ page: 0, size: SHOWN, centerId }),
    retry: false
  })
  const total = caregivers.data?.totalElements ?? 0

  return (
    <section aria-labelledby='center-caregivers-title' className='flex flex-col gap-4'>
      <div className='flex flex-wrap items-baseline justify-between gap-3'>
        <h2 className='text-xl font-bold tracking-tight text-forest-950' id='center-caregivers-title'>
          {t(`${key}.title`)}
        </h2>
        {caregivers.isSuccess && total > SHOWN && selected?.id === centerId ? (
          <Link
            className='inline-flex items-center gap-1 rounded text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary'
            to='/customer/caregivers'
          >
            {t(`${key}.all`)}
            <Icon aria-hidden='true' className='text-base' name='arrow_forward' />
          </Link>
        ) : null}
      </div>
      {caregivers.isPending ? (
        <SkeletonGroup className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3' label={t(`${key}.title`)}>
          {[0, 1, 2].map((index) => (
            <Skeleton className='h-20 rounded-2xl' key={index} />
          ))}
        </SkeletonGroup>
      ) : null}
      {caregivers.isError && apiErrorStatus(caregivers.error) === 401 ? <SignInHint text={t(`${key}.signIn`)} /> : null}
      {caregivers.isError && apiErrorStatus(caregivers.error) !== 401 ? (
        <ErrorState message={t(`${key}.error`)} onRetry={() => void caregivers.refetch()} />
      ) : null}
      {caregivers.isSuccess && caregivers.data.items.length === 0 ? (
        <p className='text-sm text-on-surface-variant'>{t(`${key}.empty`)}</p>
      ) : null}
      {caregivers.isSuccess && caregivers.data.items.length > 0 ? (
        <>
          <ul className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            {caregivers.data.items.map((person) => (
              <li key={person.caregiverId}>
                <Link
                  className='cc-lift flex items-center gap-4 rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 hover:border-brand-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                  to={`/customer/caregivers/${person.caregiverId}`}
                >
                  <Avatar
                    className='h-14 w-14 rounded-full text-base'
                    decorative
                    name={person.fullName}
                    src={person.avatarUrl}
                  />
                  <span className='min-w-0'>
                    <span className='block truncate font-semibold text-on-surface'>{person.fullName}</span>
                    <span className='mt-1 block'>
                      <Rating average={person.ratingAverage} count={person.ratingCount} />
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {total > caregivers.data.items.length ? (
            <p className='text-sm text-on-surface-variant tabular-nums'>
              {t(`${key}.shown`, { shown: caregivers.data.items.length, total })}
            </p>
          ) : null}
        </>
      ) : null}
    </section>
  )
}
