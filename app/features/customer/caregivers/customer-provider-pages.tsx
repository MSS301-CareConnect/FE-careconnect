import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'

import { useServiceCenters } from '~/entities/care-center/care-center-api'
import { CenterContextLine, CenterReminder } from '~/entities/care-center/center-scope'
import { useSelectedCenter } from '~/entities/care-center/selected-center'
import { fetchCaregiverCatalog, providerKeys } from '~/entities/provider/provider-api'
import type { ProviderCaregiverCardRecord } from '~/shared/api/generated/contracts'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Button } from '~/shared/ui/button'
import { ActiveFilters, FilterMenuChip } from '~/shared/ui/filter-menu-chip'
import { Icon } from '~/shared/ui/icon'
import { PageHeader, pageContainer } from '~/shared/ui/page-header'
import { SearchInput } from '~/shared/ui/search-input'
import { Skeleton, SkeletonGroup } from '~/shared/ui/skeleton'
import { EmptyState, ErrorState } from '~/shared/ui/state-panels'

import { CaregiverCard } from './components/caregiver-card'

const key = 'customer.provider' as const
const GENDERS = ['ALL', 'FEMALE', 'MALE', 'OTHER'] as const
const EXPERIENCE = [0, 2, 5, 10] as const
const SORTS = ['recommended', 'experience', 'rating', 'name'] as const
type Gender = (typeof GENDERS)[number]
type Sort = (typeof SORTS)[number]
/** With this many caregivers or fewer, the search box alone is enough. */
const FEW_RESULTS = 6

function sortCaregivers(items: ProviderCaregiverCardRecord[], sort: Sort) {
  const sorted = [...items]
  if (sort === 'experience') sorted.sort((a, b) => (b.experienceYears ?? 0) - (a.experienceYears ?? 0))
  if (sort === 'rating') sorted.sort((a, b) => (b.ratingAverage ?? 0) - (a.ratingAverage ?? 0))
  if (sort === 'name') sorted.sort((a, b) => a.fullName.localeCompare(b.fullName, 'vi'))
  return sorted
}

/**
 * Caregivers (2026-11 redesign): title block, one filter row (name, gender and experience chips, sort) and a
 * three-column card grid. Gender, experience and sort apply to the page of results already loaded.
 */
export function CustomerProviderCatalogPage() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const [gender, setGender] = useState<Gender>('ALL')
  const [minimumExperience, setMinimumExperience] = useState(0)
  const [sort, setSort] = useState<Sort>('recommended')
  const page = Math.max(0, Number(params.get('page')) || 0)
  const keyword = params.get('q') ?? ''
  const { center } = useSelectedCenter()
  const centerId = center?.id
  const centers = useServiceCenters()
  const catalog = useQuery({
    queryKey: [...providerKeys.catalog, { page, keyword, centerId }],
    queryFn: () => fetchCaregiverCatalog({ page, size: 20, keyword: keyword.trim() || undefined, centerId }),
    retry: false
  })
  useDocumentTitle(t(`${key}.title`))

  // Without a center, a failed platform-wide list asks for a center instead of reporting an error.
  const needsCenter = !center && catalog.isError
  const visible = sortCaregivers(
    (catalog.data?.items ?? []).filter(
      (person) => (gender === 'ALL' || person.gender === gender) && (person.experienceYears ?? 0) >= minimumExperience
    ),
    sort
  )
  const filtered = gender !== 'ALL' || minimumExperience > 0
  const fullBar = (catalog.data?.totalElements ?? 0) > FEW_RESULTS || filtered
  const showCenter = (centers.data?.length ?? 0) > 1

  function update(name: string, value: string) {
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      if (value) next.set(name, value)
      else next.delete(name)
      if (name === 'q') next.delete('page')
      return next
    })
  }
  function clearFilters() {
    setGender('ALL')
    setMinimumExperience(0)
  }
  const experienceLabel = (years: number) =>
    years === 0 ? t(`${key}.all`) : t(`${key}.list.experienceAtLeast`, { years })

  return (
    <div className={`${pageContainer} pb-16`}>
      <PageHeader
        breadcrumb={[{ label: t(`${key}.list.breadcrumb.home`), to: '/customer' }, { label: t(`${key}.list.title`) }]}
        breadcrumbLabel={t(`${key}.list.breadcrumb.label`)}
        description={t(`${key}.list.subtitle`)}
        meta={<CenterContextLine />}
        title={t(`${key}.list.title`)}
      />

      <div className='mb-6 flex flex-col gap-3'>
        <div className='flex flex-wrap items-center gap-2'>
          <SearchInput
            className='min-w-0 flex-1 basis-64'
            label={t(`${key}.searchPlaceholder`)}
            onChange={(value) => update('q', value.trim())}
            placeholder={t(`${key}.searchPlaceholder`)}
            value={keyword}
          />
          {fullBar ? (
            <>
              <FilterMenuChip
                defaultValue='ALL'
                label={t(`${key}.gender`)}
                onChange={(value) => setGender(value as Gender)}
                options={GENDERS.map((value) => ({ value, label: t(`${key}.genders.${value}`) }))}
                value={gender}
              />
              <FilterMenuChip
                defaultValue='0'
                label={t(`${key}.list.experience`)}
                onChange={(value) => setMinimumExperience(Number(value))}
                options={EXPERIENCE.map((years) => ({ value: String(years), label: experienceLabel(years) }))}
                value={String(minimumExperience)}
              />
              <FilterMenuChip
                defaultValue='recommended'
                icon='sort'
                label={t(`${key}.list.sort`)}
                onChange={(value) => setSort(value as Sort)}
                options={SORTS.map((value) => ({ value, label: t(`${key}.list.sorts.${value}`) }))}
                value={sort}
              />
            </>
          ) : null}
        </div>
        <ActiveFilters
          clearLabel={t(`${key}.list.clearAll`)}
          items={[
            ...(gender !== 'ALL'
              ? [{ id: 'gender', label: t(`${key}.genders.${gender}`), onRemove: () => setGender('ALL') }]
              : []),
            ...(minimumExperience > 0
              ? [
                  {
                    id: 'experience',
                    label: experienceLabel(minimumExperience),
                    onRemove: () => setMinimumExperience(0)
                  }
                ]
              : [])
          ]}
          label={t(`${key}.list.filtering`)}
          onClear={clearFilters}
          removeLabel={(label) => t(`${key}.list.removeFilter`, { label })}
        />
      </div>

      {catalog.isPending ? (
        <SkeletonGroup className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3' label={t(`${key}.loading`)}>
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <div className='rounded-2xl border border-outline-variant bg-surface-container-lowest p-5' key={index}>
              <div className='flex items-center gap-3'>
                <Skeleton className='h-16 w-16 rounded-full' />
                <div className='flex-1 space-y-2'>
                  <Skeleton className='h-5 w-2/3 rounded' />
                  <Skeleton className='h-4 w-1/2 rounded' />
                </div>
              </div>
              <Skeleton className='mt-5 h-10 w-full rounded-lg' />
            </div>
          ))}
        </SkeletonGroup>
      ) : null}
      {needsCenter ? <CenterReminder text={t(`${key}.reminderText`)} title={t(`${key}.reminderTitle`)} /> : null}
      {catalog.isError && !needsCenter ? (
        <ErrorState message={t(`${key}.error`)} onRetry={() => void catalog.refetch()} />
      ) : null}
      {catalog.isSuccess && visible.length === 0 ? (
        <EmptyState
          action={
            filtered ? (
              <Button onClick={clearFilters} variant='outline'>
                {t(`${key}.list.clearAll`)}
              </Button>
            ) : undefined
          }
          description={t(`${key}.emptyHelp`)}
          icon='person_search'
          title={t(`${key}.empty`)}
        />
      ) : null}
      {catalog.isSuccess && visible.length > 0 ? (
        <>
          <p aria-live='polite' className='mb-4 text-sm text-on-surface-variant tabular-nums'>
            {t(`${key}.list.count`, { count: filtered ? visible.length : catalog.data.totalElements })}
          </p>
          <div className='cc-stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {visible.map((person) => (
              <CaregiverCard key={person.caregiverId} person={person} showCenter={showCenter} />
            ))}
          </div>
        </>
      ) : null}
      {catalog.isSuccess && catalog.data.totalPages > 1 ? (
        <nav
          aria-label={t(`${key}.title`)}
          className='mt-8 flex items-center justify-center gap-3 text-sm tabular-nums'
        >
          <Button
            disabled={page === 0}
            leftIcon={<Icon className='text-lg' name='chevron_left' />}
            onClick={() => update('page', String(page - 1))}
            size='sm'
            variant='outline'
          >
            {t(`${key}.previous`)}
          </Button>
          <span className='text-on-surface-variant'>
            {t(`${key}.page`, { page: page + 1, pages: catalog.data.totalPages })}
          </span>
          <Button
            disabled={page + 1 >= catalog.data.totalPages}
            onClick={() => update('page', String(page + 1))}
            rightIcon={<Icon className='text-lg' name='chevron_right' />}
            size='sm'
            variant='outline'
          >
            {t(`${key}.next`)}
          </Button>
        </nav>
      ) : null}
    </div>
  )
}
