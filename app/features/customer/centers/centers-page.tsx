import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'

import { useServiceCentersPage } from '~/entities/care-center/care-center-api'
import { CenterContextLine } from '~/entities/care-center/center-scope'
import { apiErrorStatus } from '~/shared/api/error-details'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Button } from '~/shared/ui/button'
import { pageContainer } from '~/shared/ui/page-header'
import { CustomerPageHeader } from '~/features/customer/ui/customer-page-header'
import { Pagination, pageSizeOf } from '~/shared/ui/pagination'
import { SearchInput } from '~/shared/ui/search-input'
import { Skeleton, SkeletonGroup } from '~/shared/ui/skeleton'
import { EmptyState, ErrorState } from '~/shared/ui/state-panels'

import { CenterCard } from './components/center-card'
import { SignInHint } from './components/sign-in-hint'

const key = 'customer.centers' as const
/** Rows of the three-column grid. */
const PAGE_SIZES = [9, 18, 36] as const

/**
 * `/customer/centers` (CR-6): ACTIVE centers from the public directory, one server page at a time (2026-11-11).
 * ProviderService searches name and address without diacritics (`?q=`) and pages (`?page=`, `?size=`). Each card
 * opens the center page or makes it the header's center.
 */
export function CentersPage() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const keyword = (params.get('q') ?? '').trim()
  const page = Math.max(0, Number(params.get('page')) || 0)
  const pageSize = pageSizeOf(params.get('size'), PAGE_SIZES[0], PAGE_SIZES)
  const centers = useServiceCentersPage({ page, size: pageSize, keyword: keyword || undefined })
  useDocumentTitle(t(`${key}.documentTitle`))

  const visible = centers.data?.items ?? []
  const total = centers.data?.totalElements ?? 0

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
  function search(value: string) {
    update({ q: value || undefined })
  }

  return (
    <div className={`${pageContainer} pb-16`}>
      <CustomerPageHeader
        breadcrumb={[
          { label: t(`${key}.breadcrumb.home`), to: '/customer' },
          { label: t(`${key}.breadcrumb.current`) }
        ]}
        breadcrumbLabel={t(`${key}.breadcrumb.label`)}
        description={t(`${key}.subtitle`)}
        meta={<CenterContextLine />}
        title={t(`${key}.title`)}
      />

      {centers.isSuccess && (total > 0 || keyword) ? (
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
      {centers.isSuccess && total === 0 && !keyword ? (
        <EmptyState icon='home_health' title={t(`${key}.states.empty`)} />
      ) : null}
      {centers.isSuccess && total === 0 && keyword ? (
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
            {t(`${key}.count`, { count: total })}
          </p>
          <div className='cc-stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {visible.map((center) => (
              <CenterCard center={center} key={center.id} />
            ))}
          </div>
          <Pagination
            className='mt-8'
            onPageChange={(next) => update({ page: next > 0 ? String(next) : undefined })}
            onPageSizeChange={(size) => update({ size: size === PAGE_SIZES[0] ? undefined : String(size) })}
            page={page}
            pageSize={pageSize}
            pageSizeOptions={PAGE_SIZES}
            totalElements={total}
            totalPages={centers.data?.totalPages ?? 0}
          />
        </>
      ) : null}
    </div>
  )
}
