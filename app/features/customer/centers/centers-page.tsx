import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'

import { useServiceCenters } from '~/entities/care-center/care-center-api'
import { CenterContextLine } from '~/entities/care-center/center-scope'
import { apiErrorStatus } from '~/shared/api/error-details'
import { foldText } from '~/shared/lib/fold-text'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Button } from '~/shared/ui/button'
import { PageHeader, pageContainer } from '~/shared/ui/page-header'
import { SearchInput } from '~/shared/ui/search-input'
import { Skeleton, SkeletonGroup } from '~/shared/ui/skeleton'
import { EmptyState, ErrorState } from '~/shared/ui/state-panels'

import { CenterCard } from './components/center-card'
import { SignInHint } from './components/sign-in-hint'

const key = 'customer.centers' as const

/**
 * `/customer/centers` (CR-6): every ACTIVE center from the public directory, searched by name or address without
 * diacritics (`?q=`). Each card opens the center page or makes it the header's center.
 */
export function CentersPage() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const keyword = params.get('q') ?? ''
  const centers = useServiceCenters()
  useDocumentTitle(t(`${key}.documentTitle`))

  const needle = foldText(keyword.trim())
  const visible = (centers.data ?? []).filter(
    (center) => !needle || foldText(`${center.name} ${center.address ?? ''}`).includes(needle)
  )

  function search(value: string) {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        if (value) next.set('q', value)
        else next.delete('q')
        return next
      },
      { replace: true }
    )
  }

  return (
    <div className={`${pageContainer} pb-16`}>
      <PageHeader
        breadcrumb={[
          { label: t(`${key}.breadcrumb.home`), to: '/customer' },
          { label: t(`${key}.breadcrumb.current`) }
        ]}
        breadcrumbLabel={t(`${key}.breadcrumb.label`)}
        description={t(`${key}.subtitle`)}
        meta={<CenterContextLine />}
        title={t(`${key}.title`)}
      />

      {centers.isSuccess && centers.data.length > 0 ? (
        <SearchInput
          className='mb-6 max-w-xl'
          label={t(`${key}.search`)}
          onChange={(value) => search(value.trim())}
          placeholder={t(`${key}.search`)}
          value={keyword}
        />
      ) : null}

      {centers.isPending ? (
        <SkeletonGroup className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3' label={t(`${key}.states.loading`)}>
          {[0, 1, 2].map((index) => (
            <div className='overflow-hidden rounded-2xl border border-outline-variant' key={index}>
              <Skeleton className='aspect-[16/9] w-full' />
              <div className='space-y-2 p-5'>
                <Skeleton className='h-5 w-2/3 rounded' />
                <Skeleton className='h-4 w-full rounded' />
                <Skeleton className='h-4 w-1/2 rounded' />
              </div>
            </div>
          ))}
        </SkeletonGroup>
      ) : null}
      {centers.isError && apiErrorStatus(centers.error) === 401 ? (
        <SignInHint
          text={t('customer.centerPicker.states.signInText')}
          title={t('customer.centerPicker.states.signInTitle')}
        />
      ) : null}
      {centers.isError && apiErrorStatus(centers.error) !== 401 ? (
        <ErrorState message={t(`${key}.states.error`)} onRetry={() => void centers.refetch()} />
      ) : null}
      {centers.isSuccess && centers.data.length === 0 ? (
        <EmptyState icon='home_health' title={t(`${key}.states.empty`)} />
      ) : null}
      {centers.isSuccess && centers.data.length > 0 && visible.length === 0 ? (
        <EmptyState
          action={
            <Button onClick={() => search('')} variant='outline'>
              {t(`${key}.states.clearSearch`)}
            </Button>
          }
          icon='search_off'
          title={t(`${key}.states.noMatch`)}
        />
      ) : null}
      {visible.length > 0 ? (
        <>
          <p aria-live='polite' className='mb-4 text-sm text-on-surface-variant tabular-nums'>
            {t(`${key}.count`, { count: visible.length })}
          </p>
          <div className='cc-stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {visible.map((center) => (
              <CenterCard center={center} key={center.id} />
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}
