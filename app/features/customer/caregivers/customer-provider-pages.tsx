import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link, useParams, useSearchParams } from 'react-router'

import {
  fetchCaregiverByUser,
  fetchCaregiverCatalog,
  fetchVerifiedCertificates,
  providerKeys
} from '~/entities/provider/provider-api'
import type { ProviderCaregiverRecord } from '~/shared/api/generated/contracts'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'
import { ProviderCatalogSearch } from './components/provider-catalog-search'

const key = 'customer.provider' as const
type GenderFilter = 'ALL' | 'FEMALE' | 'MALE' | 'OTHER'

function ProviderCaregiverCard({ person }: { person: ProviderCaregiverRecord }) {
  const { t, i18n } = useTranslation()
  return (
    <article className='group flex h-full flex-col rounded-2xl border border-[#dbe4db] bg-white p-5 transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-[#a8c2ad] sm:p-6'>
      <div className='flex min-w-0 items-start gap-4 sm:gap-5'>
        <div
          aria-hidden='true'
          className='grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-[#e8f0e8] text-[#075b31] sm:h-20 sm:w-20'
        >
          <Icon className='text-4xl' name='person' />
        </div>
        <div className='min-w-0 flex-1'>
          <div className='flex flex-wrap items-center gap-x-3 gap-y-2'>
            <h2 className='text-xl font-bold tracking-[-0.025em] text-[#1b2922]'>{person.fullName}</h2>
            {person.verificationStatus === 'VERIFIED' && (
              <span className='inline-flex items-center gap-1 rounded-md bg-[#e8f0e8] px-2 py-1 text-xs font-bold text-[#075b31]'>
                <Icon className='text-sm' name='verified' />
                {t(`${key}.verified`)}
              </span>
            )}
          </div>
          {person.centerName && (
            <p className='mt-2 flex items-center gap-1.5 text-sm text-[#637469]'>
              <Icon className='text-base text-[#075b31]' name='home_health' />
              {person.centerName}
            </p>
          )}
        </div>
      </div>

      <div className='mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-[#e6ece5] pt-4 text-sm text-[#415548]'>
        {person.experienceYears !== undefined && (
          <span className='inline-flex items-center gap-1.5'>
            <Icon className='text-lg text-[#075b31]' name='workspace_premium' />
            {t(`${key}.experienceValue`, {
              years: new Intl.NumberFormat(i18n.language).format(person.experienceYears)
            })}
          </span>
        )}
        {person.ratingAverage !== undefined && (
          <span className='inline-flex items-center gap-1.5'>
            <Icon className='text-lg text-[#a06a12]' filled name='star' />
            {new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 1 }).format(person.ratingAverage)}
            {person.ratingCount !== undefined && t(`${key}.reviews`, { count: person.ratingCount })}
          </span>
        )}
      </div>

      {person.bio && <p className='mt-4 line-clamp-2 text-sm leading-6 text-[#617267]'>{person.bio}</p>}

      <div className='mt-auto flex items-center justify-between gap-4 pt-6'>
        <span className='min-w-0 truncate text-xs font-semibold uppercase tracking-[0.08em] text-[#76867a]'>
          {t(`${key}.caregiver`)}
        </span>
        {person.userId ? (
          <Link
            className='inline-flex shrink-0 items-center gap-2 text-sm font-bold text-[#075b31] hover:text-[#043b20] focus-visible:outline-2 focus-visible:outline-[#075b31]'
            to={`/customer/caregivers/${person.userId}`}
          >
            {t(`${key}.details`)}
            <Icon className='text-lg transition-transform group-hover:translate-x-1' name='arrow_forward' />
          </Link>
        ) : (
          <span className='text-xs text-[#76867a]'>{t(`${key}.profileUnavailable`)}</span>
        )}
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
  const catalog = useQuery({
    queryKey: [...providerKeys.catalog, { page, keyword }],
    queryFn: () => fetchCaregiverCatalog({ page, size: 20, keyword: keyword.trim() || undefined }),
    retry: false
  })
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
    <div className='flex w-full flex-1 flex-col bg-[#fbfcfa] text-[#1b2922]'>
      <ProviderCatalogSearch key={keyword} keyword={keyword} onSearch={(value) => update('q', value)} />
      <section className='mx-auto w-full max-w-[1440px] px-5 py-10 sm:px-8 lg:px-12 lg:py-14'>
        <div className='grid grid-cols-1 items-start gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12'>
          <aside className='rounded-2xl border border-[#dbe4db] bg-white p-5 lg:sticky lg:top-6 lg:p-6'>
            <div className='flex items-center justify-between gap-3 border-b border-[#e3eae2] pb-5'>
              <h2 className='flex items-center gap-2 text-base font-bold'>
                <Icon className='text-xl text-[#075b31]' name='tune' />
                {t(`${key}.filters`)}
              </h2>
              <button
                className='text-xs font-bold text-[#075b31] underline-offset-4 hover:underline'
                onClick={() => {
                  setGender('ALL')
                  setMinimumExperience(0)
                }}
                type='button'
              >
                {t(`${key}.reset`)}
              </button>
            </div>
            <label className='mt-6 block text-sm font-semibold'>
              {t(`${key}.gender`)}
              <select
                className='mt-2 w-full rounded-lg border border-[#d5e0d5] bg-[#f8faf7] px-3 py-3 text-sm text-[#1b2922] focus:border-[#075b31] focus:outline-none'
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
            <label className='mt-5 block text-sm font-semibold'>
              {t(`${key}.minimumExperience`)}
              <select
                className='mt-2 w-full rounded-lg border border-[#d5e0d5] bg-[#f8faf7] px-3 py-3 text-sm text-[#1b2922] focus:border-[#075b31] focus:outline-none'
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
            <p className='mt-6 border-t border-[#e3eae2] pt-5 text-xs leading-5 text-[#697b6e]'>
              {t(`${key}.pageFilterHint`)}
            </p>
          </aside>
          <div className='min-w-0'>
            <div className='flex flex-wrap items-end justify-between gap-4 border-b border-[#dce5dc] pb-5'>
              <div>
                <h2 className='text-2xl font-bold tracking-[-0.04em]'>{t(`${key}.resultsTitle`)}</h2>
                <p className='mt-1 text-sm text-[#647568]'>
                  {catalog.isSuccess ? (
                    <>
                      <strong className='font-bold text-[#075b31]'>
                        {new Intl.NumberFormat(i18n.language).format(catalog.data.totalElements)}
                      </strong>{' '}
                      {t(`${key}.results`)}
                    </>
                  ) : (
                    t(catalog.isError ? `${key}.error` : `${key}.loading`)
                  )}
                </p>
              </div>
              <div className='flex items-center gap-1 rounded-lg border border-[#dce5dc] bg-white p-1'>
                {(['list', 'grid'] as const).map((mode) => (
                  <button
                    aria-label={t(`${key}.views.${mode}`)}
                    aria-pressed={view === mode}
                    className={`grid h-9 w-9 place-items-center rounded-md transition-colors ${view === mode ? 'bg-[#e8f0e8] text-[#075b31]' : 'text-[#728275] hover:bg-[#f2f6f1]'}`}
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
                className='mt-6 rounded-2xl border border-[#dbe4db] bg-white px-6 py-16 text-center text-[#53675a]'
                role='status'
              >
                <Icon className='mb-4 text-4xl text-[#075b31]' name='progress_activity' />
                <p>{t(`${key}.loading`)}</p>
              </div>
            )}
            {catalog.isError && (
              <div className='mt-6 rounded-2xl border border-[#dbe4db] bg-white px-6 py-16 text-center' role='alert'>
                <Icon className='text-4xl text-[#075b31]' name='wifi_off' />
                <h3 className='mt-4 text-xl font-bold'>{t(`${key}.error`)}</h3>
                <p className='mt-2 text-sm text-[#647568]'>{t(`${key}.errorHelp`)}</p>
                <button
                  className='mt-6 rounded-lg bg-[#075b31] px-5 py-3 text-sm font-bold text-white hover:bg-[#064a29]'
                  onClick={() => catalog.refetch()}
                  type='button'
                >
                  {t(`${key}.retry`)}
                </button>
              </div>
            )}
            {catalog.isSuccess && visible.length === 0 && (
              <div className='mt-6 rounded-2xl border border-[#dbe4db] bg-white px-6 py-16 text-center'>
                <Icon className='text-4xl text-[#075b31]' name='person_search' />
                <h3 className='mt-4 text-xl font-bold'>{t(`${key}.empty`)}</h3>
                <p className='mt-2 text-sm text-[#647568]'>{t(`${key}.emptyHelp`)}</p>
              </div>
            )}
            {catalog.isSuccess && visible.length > 0 && (
              <div className={view === 'grid' ? 'mt-6 grid gap-4 xl:grid-cols-2' : 'mt-6 flex flex-col gap-4'}>
                {visible.map((person) => (
                  <ProviderCaregiverCard key={person.id} person={person} />
                ))}
              </div>
            )}
            {catalog.isSuccess && catalog.data.totalPages > 1 && (
              <div className='mt-8 flex items-center justify-between border-t border-[#dce5dc] pt-5 text-sm'>
                <button
                  className='font-semibold text-[#075b31] disabled:opacity-40'
                  disabled={page === 0}
                  onClick={() => update('page', String(page - 1))}
                  type='button'
                >
                  {t(`${key}.previous`)}
                </button>
                <span className='text-[#647568]'>
                  {t(`${key}.page`, { page: page + 1, pages: catalog.data.totalPages })}
                </span>
                <button
                  className='font-semibold text-[#075b31] disabled:opacity-40'
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

export function CustomerProviderDetailPage() {
  const { userId = '' } = useParams()
  const { t, i18n } = useTranslation()
  const profile = useQuery({
    queryKey: ['provider', 'by-user', userId],
    queryFn: () => fetchCaregiverByUser(userId),
    enabled: Boolean(userId),
    retry: false
  })
  const certificates = useQuery({
    queryKey: ['provider', 'verified-certificates', profile.data?.id],
    queryFn: () => fetchVerifiedCertificates(profile.data!.id),
    enabled: Boolean(profile.data?.id),
    retry: false
  })
  useDocumentTitle(profile.data?.fullName ?? t(`${key}.title`))
  return (
    <div className='mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8'>
      <Link
        className='inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm'
        to='/customer/caregivers'
      >
        <Icon name='arrow_back' />
        {t(`${key}.back`)}
      </Link>
      {profile.isPending ? (
        <p className='rounded-2xl bg-white p-8 shadow-sm' role='status'>
          {t(`${key}.loading`)}
        </p>
      ) : null}
      {profile.isError ? (
        <p className='rounded-2xl bg-white p-8 shadow-sm' role='alert'>
          {t(`${key}.profileError`)}
        </p>
      ) : null}
      {profile.isSuccess ? (
        <section className='overflow-hidden rounded-2xl bg-white shadow-sm'>
          <div className='h-3 bg-primary' />
          <div className='flex flex-wrap items-start gap-6 p-6 sm:p-8'>
            <div className='flex h-28 w-28 items-center justify-center rounded-2xl bg-secondary-container text-primary'>
              <Icon className='text-6xl' name='person' />
            </div>
            <div className='flex-1 space-y-3'>
              <h1 className='text-3xl font-extrabold'>{profile.data.fullName}</h1>
              <p className='text-sm text-on-surface-variant'>{profile.data.centerName}</p>
              {profile.data.experienceYears !== undefined ? (
                <p className='text-sm'>
                  {t(`${key}.experienceValue`, {
                    years: new Intl.NumberFormat(i18n.language).format(profile.data.experienceYears)
                  })}
                </p>
              ) : null}
              {profile.data.bio ? (
                <p className='max-w-3xl leading-7 text-on-surface-variant'>{profile.data.bio}</p>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}
      {profile.isSuccess ? (
        <section className='rounded-2xl bg-white p-6 shadow-sm sm:p-8'>
          <h2 className='mb-4 text-xl font-bold'>{t(`${key}.certificates`)}</h2>
          {certificates.isPending ? <p role='status'>{t(`${key}.loading`)}</p> : null}
          {certificates.isError ? <p role='alert'>{t(`${key}.error`)}</p> : null}
          {certificates.isSuccess && certificates.data.length === 0 ? (
            <p className='text-outline'>{t(`${key}.certificatesEmpty`)}</p>
          ) : null}
          {certificates.isSuccess ? (
            <ul className='grid gap-3 sm:grid-cols-2'>
              {certificates.data.map((item) => (
                <li className='flex items-start gap-3 rounded-xl bg-surface-container-low p-4' key={item.id}>
                  <Icon className='text-primary' name='verified' />
                  <div>
                    <strong>{item.certificateName}</strong>
                    <p className='text-sm text-outline'>{item.issuedBy}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}
    </div>
  )
}
