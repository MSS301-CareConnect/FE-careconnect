import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router'

import { fetchCaregiverCatalog, providerKeys } from '~/entities/provider/provider-api'
import { CenterReminder, CenterScope } from '~/entities/care-center/center-scope'
import { useSelectedCenter } from '~/entities/care-center/selected-center'
import type { ProviderCaregiverCardRecord } from '~/shared/api/generated/contracts'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'
import { ProviderCatalogSearch } from './components/provider-catalog-search'

const key = 'customer.provider' as const
type GenderFilter = 'ALL' | 'FEMALE' | 'MALE' | 'OTHER'

function ProviderCaregiverCard({ person }: { person: ProviderCaregiverCardRecord }) {
  const { t, i18n } = useTranslation()
  return (
    <article className='group flex h-full flex-col rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-5 shadow-xs transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-outline sm:p-6'>
      <div className='flex min-w-0 items-start gap-4 sm:gap-5'>
        <div
          aria-hidden='true'
          className='grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-primary-fixed text-primary sm:h-20 sm:w-20'
        >
          <Icon className='text-4xl' name='person' />
        </div>
        <div className='min-w-0 flex-1'>
          <div className='flex flex-wrap items-center gap-x-3 gap-y-2'>
            <h2 className='text-xl font-bold tracking-[-0.025em] text-on-surface'>{person.fullName}</h2>
            {/* The catalog lists only verified, active caregivers. */}
            <span className='inline-flex items-center gap-1 rounded-md bg-primary-fixed px-2 py-1 text-xs font-bold text-primary'>
              <Icon className='text-sm' name='verified' />
              {t(`${key}.verified`)}
            </span>
          </div>
          {person.centerName && (
            <p className='mt-2 flex items-center gap-1.5 text-sm text-on-surface-variant'>
              <Icon className='text-base text-primary' name='home_health' />
              {person.centerName}
            </p>
          )}
        </div>
      </div>

      <div className='mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-outline-variant/40 pt-4 text-sm text-on-surface-variant tabular-nums'>
        {person.experienceYears !== undefined && (
          <span className='inline-flex items-center gap-1.5'>
            <Icon className='text-lg text-primary' name='workspace_premium' />
            {t(`${key}.experienceValue`, {
              years: new Intl.NumberFormat(i18n.language).format(person.experienceYears)
            })}
          </span>
        )}
        {person.ratingAverage !== undefined && (
          <span className='inline-flex items-center gap-1.5'>
            <Icon className='text-lg text-warning' filled name='star' />
            {new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 1 }).format(person.ratingAverage)}
            {person.ratingCount !== undefined && t(`${key}.reviews`, { count: person.ratingCount })}
          </span>
        )}
      </div>

      {person.bio && <p className='mt-4 line-clamp-2 text-sm leading-6 text-on-surface-variant'>{person.bio}</p>}

      <div className='mt-auto flex items-center justify-between gap-4 pt-6'>
        <span className='min-w-0 truncate text-xs font-semibold uppercase tracking-[0.08em] text-outline'>
          {t(`${key}.caregiver`)}
        </span>
        <Link
          className='inline-flex shrink-0 items-center gap-2 text-sm font-bold text-primary hover:text-primary-container focus-visible:outline-2 focus-visible:outline-primary'
          to={`/customer/caregivers/${person.caregiverId}`}
        >
          {t(`${key}.details`)}
          <Icon className='text-lg transition-transform group-hover:translate-x-1' name='arrow_forward' />
        </Link>
      </div>
    </article>
  )
}

export function CustomerProviderCatalogPage() {
  const { t, i18n } = useTranslation()
  const [params, setParams] = useSearchParams()
  const [gender, setGender] = useState<GenderFilter>('ALL')
  const [minimumExperience, setMinimumExperience] = useState(0)
  const [view, setView] = useState<'list' | 'grid'>('list')
  const page = Math.max(0, Number(params.get('page')) || 0)
  const keyword = params.get('q') ?? ''
  const { center } = useSelectedCenter()
  const centerId = center?.id
  const catalog = useQuery({
    queryKey: [...providerKeys.catalog, { page, keyword, centerId }],
    queryFn: () => fetchCaregiverCatalog({ page, size: 20, keyword: keyword.trim() || undefined, centerId }),
    retry: false
  })
  // Without a center, a failed platform-wide list asks for a center instead of reporting an error.
  const needsCenter = !center && catalog.isError
  const visible = useMemo(
    () =>
      (catalog.data?.items ?? []).filter(
        (person) => (gender === 'ALL' || person.gender === gender) && (person.experienceYears ?? 0) >= minimumExperience
      ),
    [catalog.data?.items, gender, minimumExperience]
  )
  useDocumentTitle(t(`${key}.title`))
  function update(name: string, value: string) {
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      if (value) next.set(name, value)
      else next.delete(name)
      if (name === 'q') next.delete('page')
      return next
    })
  }
  return (
    <div className='flex w-full flex-1 flex-col bg-surface text-on-surface'>
      <ProviderCatalogSearch key={keyword} keyword={keyword} onSearch={(value) => update('q', value)} />
      <section className='mx-auto w-full max-w-[1440px] px-5 py-10 sm:px-8 lg:px-12 lg:py-14'>
        <div className='grid grid-cols-1 items-start gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12'>
          <aside className='rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-5 shadow-xs lg:sticky lg:top-24 lg:p-6'>
            <div className='flex items-center justify-between gap-3 border-b border-outline-variant/40 pb-5'>
              <h2 className='flex items-center gap-2 text-base font-bold text-on-surface'>
                <Icon className='text-xl text-primary' name='tune' />
                {t(`${key}.filters`)}
              </h2>
              <button
                className='text-xs font-bold text-primary underline-offset-4 hover:underline'
                onClick={() => {
                  setGender('ALL')
                  setMinimumExperience(0)
                }}
                type='button'
              >
                {t(`${key}.reset`)}
              </button>
            </div>
            <label className='mt-6 block text-sm font-semibold text-on-surface'>
              {t(`${key}.gender`)}
              <select
                className='mt-2 w-full rounded-xl border border-outline-variant bg-surface-container-low px-3 py-3 text-sm text-on-surface focus:border-primary focus:outline-none'
                onChange={(event) => setGender(event.target.value as GenderFilter)}
                value={gender}
              >
                {(['ALL', 'FEMALE', 'MALE', 'OTHER'] as const).map((option) => (
                  <option key={option} value={option}>
                    {t(`${key}.genders.${option}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className='mt-5 block text-sm font-semibold text-on-surface'>
              {t(`${key}.minimumExperience`)}
              <select
                className='mt-2 w-full rounded-xl border border-outline-variant bg-surface-container-low px-3 py-3 text-sm text-on-surface focus:border-primary focus:outline-none'
                onChange={(event) => setMinimumExperience(Number(event.target.value))}
                value={minimumExperience}
              >
                {[0, 2, 5, 10].map((years) => (
                  <option key={years} value={years}>
                    {years === 0 ? t(`${key}.all`) : t(`${key}.experienceValue`, { years })}
                  </option>
                ))}
              </select>
            </label>
            <p className='mt-6 border-t border-outline-variant/40 pt-5 text-xs leading-5 text-on-surface-variant'>
              {t(`${key}.pageFilterHint`)}
            </p>
          </aside>
          <div className='min-w-0'>
            <div className='mb-6'>
              <CenterScope generalText={t(`${key}.scopeGeneral`)} />
            </div>
            <div className='flex flex-wrap items-end justify-between gap-4 border-b border-outline-variant/60 pb-5'>
              <div>
                <h2 className='text-2xl font-bold tracking-[-0.04em] text-on-surface'>{t(`${key}.resultsTitle`)}</h2>
                <p className='mt-1 text-sm text-on-surface-variant tabular-nums'>
                  {catalog.isSuccess ? (
                    <>
                      <strong className='font-bold text-primary'>
                        {new Intl.NumberFormat(i18n.language).format(catalog.data.totalElements)}
                      </strong>{' '}
                      {t(`${key}.results`)}
                    </>
                  ) : (
                    t(needsCenter ? `${key}.reminderTitle` : catalog.isError ? `${key}.error` : `${key}.loading`)
                  )}
                </p>
              </div>
              <div className='flex items-center gap-1 rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-1'>
                {(['list', 'grid'] as const).map((mode) => (
                  <button
                    aria-label={t(`${key}.views.${mode}`)}
                    aria-pressed={view === mode}
                    className={`grid h-9 w-9 place-items-center rounded-lg transition-colors ${view === mode ? 'bg-primary-fixed text-primary' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
                    key={mode}
                    onClick={() => setView(mode)}
                    type='button'
                  >
                    <Icon name={mode === 'list' ? 'view_list' : 'grid_view'} />
                  </button>
                ))}
              </div>
            </div>
            {catalog.isPending && (
              <div
                className='mt-6 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest px-6 py-16 text-center text-on-surface-variant'
                role='status'
              >
                <Icon className='mb-4 text-4xl text-primary' name='progress_activity' />
                <p>{t(`${key}.loading`)}</p>
              </div>
            )}
            {needsCenter && (
              <div className='mt-6'>
                <CenterReminder text={t(`${key}.reminderText`)} title={t(`${key}.reminderTitle`)} />
              </div>
            )}
            {catalog.isError && !needsCenter && (
              <div
                className='mt-6 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest px-6 py-16 text-center'
                role='alert'
              >
                <Icon className='text-4xl text-primary' name='wifi_off' />
                <h3 className='mt-4 text-xl font-bold text-on-surface'>{t(`${key}.error`)}</h3>
                <p className='mt-2 text-sm text-on-surface-variant'>{t(`${key}.errorHelp`)}</p>
                <button
                  className='mt-6 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-on-primary transition-colors hover:bg-primary-container'
                  onClick={() => catalog.refetch()}
                  type='button'
                >
                  {t(`${key}.retry`)}
                </button>
              </div>
            )}
            {catalog.isSuccess && visible.length === 0 && (
              <div className='mt-6 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest px-6 py-16 text-center'>
                <Icon className='text-4xl text-primary' name='person_search' />
                <h3 className='mt-4 text-xl font-bold text-on-surface'>{t(`${key}.empty`)}</h3>
                <p className='mt-2 text-sm text-on-surface-variant'>{t(`${key}.emptyHelp`)}</p>
              </div>
            )}
            {catalog.isSuccess && visible.length > 0 && (
              <div className={view === 'grid' ? 'mt-6 grid gap-4 xl:grid-cols-2' : 'mt-6 flex flex-col gap-4'}>
                {visible.map((person) => (
                  <ProviderCaregiverCard key={person.caregiverId} person={person} />
                ))}
              </div>
            )}
            {catalog.isSuccess && catalog.data.totalPages > 1 && (
              <div className='mt-8 flex items-center justify-between border-t border-outline-variant/60 pt-5 text-sm tabular-nums'>
                <button
                  className='font-semibold text-primary disabled:opacity-40'
                  disabled={page === 0}
                  onClick={() => update('page', String(page - 1))}
                  type='button'
                >
                  {t(`${key}.previous`)}
                </button>
                <span className='text-on-surface-variant'>
                  {t(`${key}.page`, { page: page + 1, pages: catalog.data.totalPages })}
                </span>
                <button
                  className='font-semibold text-primary disabled:opacity-40'
                  disabled={page + 1 >= catalog.data.totalPages}
                  onClick={() => update('page', String(page + 1))}
                  type='button'
                >
                  {t(`${key}.next`)}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
