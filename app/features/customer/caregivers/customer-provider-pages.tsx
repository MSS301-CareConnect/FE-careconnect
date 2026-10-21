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
import { CaregiversSearchBanner } from './components/caregivers-search-banner'

const key = 'customer.provider' as const
type GenderFilter = 'ALL' | 'FEMALE' | 'MALE' | 'OTHER'

function ProviderCaregiverCard({ person }: { person: ProviderCaregiverRecord }) {
  const { t, i18n } = useTranslation()
  return (
    <article className='flex flex-col gap-5 rounded-2xl bg-surface-container-lowest p-5 shadow-sm transition-shadow hover:shadow-md md:p-6'>
      <div className='flex flex-col gap-5 sm:flex-row'>
        <div className='flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-secondary-container text-primary sm:h-28 sm:w-28'>
          <Icon className='text-5xl' name='person' />
        </div>
        <div className='min-w-0 flex-1 space-y-3'>
          <div className='flex flex-wrap items-center gap-2'>
            <h2 className='text-xl font-bold text-on-surface'>{person.fullName}</h2>
            {person.verificationStatus === 'VERIFIED' ? (
              <span className='inline-flex items-center gap-1 rounded-full bg-secondary-container px-3 py-1 text-xs font-bold text-primary'>
                <Icon className='text-base' name='verified' />
                {t(`${key}.verified`)}
              </span>
            ) : null}
          </div>
          {person.centerName ? (
            <p className='flex items-center gap-1 text-sm text-on-surface-variant'>
              <Icon className='text-lg text-primary' name='home_health' />
              {person.centerName}
            </p>
          ) : null}
          <div className='flex flex-wrap gap-2 text-sm text-on-surface-variant'>
            {person.experienceYears !== undefined ? (
              <span className='rounded-lg bg-surface-container px-3 py-1.5'>
                {t(`${key}.experienceValue`, {
                  years: new Intl.NumberFormat(i18n.language).format(person.experienceYears)
                })}
              </span>
            ) : null}
            {person.ratingAverage !== undefined ? (
              <span className='inline-flex items-center gap-1 rounded-lg bg-surface-container px-3 py-1.5'>
                <Icon className='text-base text-amber-500' filled name='star' />
                {new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 1 }).format(person.ratingAverage)}
                {person.ratingCount !== undefined ? t(`${key}.reviews`, { count: person.ratingCount }) : null}
              </span>
            ) : null}
          </div>
          {person.bio ? <p className='line-clamp-3 text-sm leading-6 text-on-surface-variant'>{person.bio}</p> : null}
        </div>
      </div>
      <div className='flex items-center justify-between gap-3 rounded-xl bg-surface-container-low p-3 sm:p-4'>
        <span className='text-xs font-medium text-on-surface-variant'>
          {person.centerName ?? t(`${key}.caregiver`)}
        </span>
        {person.userId ? (
          <Link
            className='inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-on-primary'
            to={`/customer/caregivers/${person.userId}`}
          >
            {t(`${key}.details`)}
            <Icon className='text-lg' name='arrow_forward' />
          </Link>
        ) : (
          <span className='text-xs text-outline'>{t(`${key}.profileUnavailable`)}</span>
        )}
      </div>
    </article>
  )
}

export function CustomerProviderCatalogPage() {
  const { t } = useTranslation()
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
    <div className='flex w-full flex-1 flex-col bg-surface'>
      <CaregiversSearchBanner
        catalogMode
        location='all'
        searchQuery={keyword}
        selectedTags={[]}
        onLocationChange={() => undefined}
        onSearchChange={(value) => update('q', value)}
        onTagToggle={() => undefined}
      />
      <section className='mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 items-start gap-8 lg:grid-cols-12'>
          <aside className='space-y-6 rounded-2xl bg-surface-container-lowest p-6 shadow-sm lg:col-span-4'>
            <div className='flex items-center justify-between border-b border-outline-variant/30 pb-4'>
              <h2 className='flex items-center gap-2 text-base font-bold'>
                <Icon className='text-primary' name='tune' />
                {t(`${key}.filters`)}
              </h2>
              <button
                className='text-xs font-semibold text-primary'
                onClick={() => {
                  setGender('ALL')
                  setMinimumExperience(0)
                }}
                type='button'
              >
                {t(`${key}.reset`)}
              </button>
            </div>
            <label className='block text-sm font-semibold'>
              {t(`${key}.gender`)}
              <select
                className='mt-2 w-full rounded-xl bg-surface-container-low px-4 py-3 text-sm'
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
            <label className='block text-sm font-semibold'>
              {t(`${key}.minimumExperience`)}
              <select
                className='mt-2 w-full rounded-xl bg-surface-container-low px-4 py-3 text-sm'
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
            <p className='rounded-xl bg-secondary-container/40 p-4 text-xs leading-5 text-on-surface-variant'>
              {t(`${key}.pageFilterHint`)}
            </p>
          </aside>
          <div className='flex flex-col gap-6 lg:col-span-8'>
            <div className='flex items-center justify-between gap-4 rounded-2xl bg-surface-container-lowest p-4 shadow-sm'>
              <div>
                <strong className='text-2xl'>{catalog.data?.totalElements ?? 0}</strong>{' '}
                <span className='text-sm text-on-surface-variant'>{t(`${key}.results`)}</span>
              </div>
              <div className='flex items-center rounded-lg bg-surface-container p-1'>
                {(['list', 'grid'] as const).map((mode) => (
                  <button
                    aria-label={t(`${key}.views.${mode}`)}
                    className={`rounded-md p-1.5 ${view === mode ? 'bg-white text-primary shadow-xs' : 'text-outline'}`}
                    key={mode}
                    onClick={() => setView(mode)}
                    type='button'
                  >
                    <Icon name={mode === 'list' ? 'view_list' : 'grid_view'} />
                  </button>
                ))}
              </div>
            </div>
            {catalog.isPending ? (
              <div className='rounded-2xl bg-white p-10 text-center shadow-sm' role='status'>
                {t(`${key}.loading`)}
              </div>
            ) : null}
            {catalog.isError ? (
              <div className='rounded-2xl bg-white p-10 text-center shadow-sm' role='alert'>
                <Icon className='text-4xl text-outline' name='wifi_off' />
                <p className='mt-3'>{t(`${key}.error`)}</p>
                <button
                  className='mt-4 rounded-xl bg-primary px-5 py-2 text-sm font-bold text-white'
                  onClick={() => catalog.refetch()}
                  type='button'
                >
                  {t(`${key}.retry`)}
                </button>
              </div>
            ) : null}
            {catalog.isSuccess && visible.length === 0 ? (
              <div className='rounded-2xl bg-white p-10 text-center shadow-sm'>
                <Icon className='text-4xl text-outline' name='person_search' />
                <p className='mt-3'>{t(`${key}.empty`)}</p>
              </div>
            ) : null}
            {catalog.isSuccess && visible.length > 0 ? (
              <div className={view === 'grid' ? 'grid gap-6 md:grid-cols-2' : 'flex flex-col gap-6'}>
                {visible.map((person) => (
                  <ProviderCaregiverCard key={person.id} person={person} />
                ))}
              </div>
            ) : null}
            {catalog.isSuccess ? (
              <div className='flex items-center justify-between rounded-2xl bg-white p-4 text-sm shadow-sm'>
                <button
                  className='font-semibold text-primary disabled:opacity-40'
                  disabled={page === 0}
                  onClick={() => update('page', String(page - 1))}
                  type='button'
                >
                  {t(`${key}.previous`)}
                </button>
                <span>{t(`${key}.page`, { page: page + 1, pages: Math.max(1, catalog.data.totalPages) })}</span>
                <button
                  className='font-semibold text-primary disabled:opacity-40'
                  disabled={page + 1 >= catalog.data.totalPages}
                  onClick={() => update('page', String(page + 1))}
                  type='button'
                >
                  {t(`${key}.next`)}
                </button>
              </div>
            ) : null}
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
