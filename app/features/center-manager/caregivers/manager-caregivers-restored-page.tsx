import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router'

import { fetchCaregivers, providerKeys } from '~/entities/provider/provider-api'
import { useAuthUser } from '~/features/shared/auth/auth-user-context'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'
import { CreateCaregiver } from './manager-caregivers-live-page'

const key = 'centerManager.management' as const
const providerKey = 'centerManager.provider' as const
const fieldClass =
  'w-full rounded-lg bg-surface-container-low px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary'
const statusLabels = { ACTIVE: 'active', INACTIVE: 'inactive', SUSPENDED: 'suspended', ARCHIVED: 'archived' } as const
const verificationLabels = { PENDING: 'pending', VERIFIED: 'verified', REJECTED: 'rejected' } as const

function csvCell(value: string) {
  return `"${(/^[=+@-]/.test(value) ? `'${value}` : value).replaceAll('"', '""')}"`
}

export function ManagerCaregiversPage() {
  const { t, i18n } = useTranslation()
  const centerId = useAuthUser()?.centerId ?? ''
  const [params, setParams] = useSearchParams()
  const [creating, setCreating] = useState(false)
  const page = Math.max(0, Number(params.get('page')) || 0)
  const size = [10, 20, 50].includes(Number(params.get('size'))) ? Number(params.get('size')) : 20
  const verification = params.get('verification')
  const status = params.get('status')
  const keyword = params.get('q') ?? ''
  const experience = params.get('experience') ?? ''
  const sort = params.get('sort') ?? 'rating'
  const caregivers = useQuery({
    queryKey: [...providerKeys.caregivers(centerId), page, size, verification, status],
    queryFn: () =>
      fetchCaregivers(centerId, {
        page,
        size,
        verification:
          verification === 'PENDING' || verification === 'VERIFIED' || verification === 'REJECTED'
            ? verification
            : undefined,
        status:
          status === 'ACTIVE' || status === 'INACTIVE' || status === 'SUSPENDED' || status === 'ARCHIVED'
            ? status
            : undefined
      }),
    enabled: Boolean(centerId),
    retry: false
  })
  const visible = useMemo(() => {
    const people =
      caregivers.data?.items.filter((person) => {
        const years = person.experienceYears
        const matchesSearch =
          !keyword || `${person.fullName} ${person.id}`.toLocaleLowerCase().includes(keyword.toLocaleLowerCase())
        if (!matchesSearch) return false
        if (experience === 'lt2') return years !== undefined && years < 2
        if (experience === '2-5') return years !== undefined && years >= 2 && years < 5
        if (experience === '5-10') return years !== undefined && years >= 5 && years <= 10
        if (experience === 'gt10') return years !== undefined && years > 10
        return true
      }) ?? []
    return [...people].sort((a, b) =>
      sort === 'experience'
        ? (b.experienceYears ?? -1) - (a.experienceYears ?? -1)
        : sort === 'newest'
          ? (b.createdAt ?? '').localeCompare(a.createdAt ?? '')
          : (b.ratingAverage ?? -1) - (a.ratingAverage ?? -1)
    )
  }, [caregivers.data, keyword, experience, sort])
  useDocumentTitle(t(`${key}.documentTitle`))

  function update(name: string, value: string) {
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      if (value) next.set(name, value)
      else next.delete(name)
      if (name !== 'page') next.delete('page')
      return next
    })
  }
  function exportCsv() {
    const rows = [
      [
        t(`${key}.downloadCode`),
        t(`${key}.downloadName`),
        t(`${key}.downloadStatus`),
        t(`${key}.downloadVerification`)
      ],
      ...visible.map((person) => [
        person.id,
        person.fullName,
        t(`${providerKey}.${statusLabels[person.caregiverStatus]}`),
        t(`${providerKey}.${verificationLabels[person.verificationStatus]}`)
      ])
    ]
    const url = URL.createObjectURL(
      new Blob(['\uFEFF' + rows.map((row) => row.map(csvCell).join(',')).join('\r\n')], {
        type: 'text/csv;charset=utf-8'
      })
    )
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'caregivers.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const number = (value: number) => new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 1 }).format(value)
  const verified = caregivers.data?.items.filter((person) => person.verificationStatus === 'VERIFIED').length ?? 0
  const pending = caregivers.data?.items.filter((person) => person.verificationStatus === 'PENDING').length ?? 0
  const rated = caregivers.data?.items.filter((person) => person.ratingAverage !== undefined) ?? []
  const average = rated.length
    ? rated.reduce((sum, person) => sum + (person.ratingAverage ?? 0), 0) / rated.length
    : undefined
  const stats = [
    {
      key: 'total',
      icon: 'group',
      value: caregivers.data?.totalElements,
      hint: t('centerManager.provider.pageScopeTotal')
    },
    { key: 'verifiedTotal', icon: 'health_and_safety', value: verified, hint: t('centerManager.provider.pageScope') },
    { key: 'pendingTotal', icon: 'pending_actions', value: pending, hint: t('centerManager.provider.pageScope') },
    { key: 'average', icon: 'hotel_class', value: average, hint: t('centerManager.provider.pageScope') }
  ] as const

  if (!centerId)
    return (
      <main className='mx-auto max-w-7xl px-4 py-8' role='alert'>
        {t(`${providerKey}.noCenter`)}
      </main>
    )
  return (
    <main className='mx-auto max-w-7xl space-y-6 px-4 py-7 sm:px-6'>
      <header>
        <div className='flex flex-wrap items-start justify-between gap-4'>
          <div>
            <div className='flex flex-wrap items-center gap-3'>
              <h1 className='text-2xl font-extrabold tracking-tight sm:text-3xl'>{t(`${key}.title`)}</h1>
              <span className='rounded-full bg-secondary-container px-3 py-1 text-xs font-semibold text-primary'>
                {t(`${key}.count`, { count: caregivers.data?.totalElements ?? 0 })}
              </span>
            </div>
            <p className='mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant'>{t(`${key}.subtitle`)}</p>
          </div>
          <div className='flex flex-wrap gap-2'>
            <button
              className='flex items-center gap-2 rounded-lg bg-surface-container px-3 py-2.5 text-sm font-semibold disabled:opacity-50'
              disabled={!visible.length}
              onClick={exportCsv}
              type='button'
            >
              <Icon name='download' />
              {t(`${key}.export`)}
            </button>
            <button
              className='flex items-center gap-2 rounded-lg bg-surface-container-high px-3 py-2.5 text-sm font-semibold text-primary'
              onClick={() => update('verification', 'PENDING')}
              type='button'
            >
              <Icon name='verified_user' />
              {t(`${key}.queue`)}
              <span className='rounded-full bg-error px-2 text-xs text-white'>{number(pending)}</span>
            </button>
            <button
              className='flex items-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-white'
              onClick={() => setCreating(true)}
              type='button'
            >
              <Icon name='person_add' />
              {t(`${key}.add`)}
            </button>
          </div>
        </div>
      </header>
      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {stats.map((stat) => (
          <section className='rounded-xl bg-white p-5 shadow-sm' key={stat.key}>
            <div className='flex items-center justify-between gap-3'>
              <h2 className='text-xs font-semibold uppercase tracking-wide text-on-surface-variant'>
                {t(`${key}.${stat.key}`)}
              </h2>
              <Icon className='text-2xl text-primary' name={stat.icon} />
            </div>
            <p className='mt-3 text-3xl font-extrabold'>
              {caregivers.isSuccess && stat.value !== undefined ? number(stat.value) : '—'}
            </p>
            <p className='mt-2 text-xs text-outline'>{stat.hint}</p>
          </section>
        ))}
      </div>
      <section className='space-y-4 rounded-xl bg-white p-4 shadow-sm sm:p-5'>
        <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-12'>
          <label className='relative xl:col-span-4'>
            <span className='sr-only'>{t(`${key}.search`)}</span>
            <Icon className='absolute top-3 left-3 text-outline' name='search' />
            <input
              className={`${fieldClass} pl-10`}
              onChange={(event) => update('q', event.target.value)}
              placeholder={t(`${key}.search`)}
              type='search'
              value={keyword}
            />
          </label>
          <label className='xl:col-span-2'>
            <span className='sr-only'>{t(`${key}.experience`)}</span>
            <select
              className={fieldClass}
              onChange={(event) => update('experience', event.target.value)}
              value={experience}
            >
              <option value=''>
                {t(`${key}.experience`)}: {t(`${key}.all`)}
              </option>
              {(['lt2', '2-5', '5-10', 'gt10'] as const).map((value, index) => (
                <option key={value} value={value}>
                  {t(`${key}.${(['lt2', 'range2to5', 'range5to10', 'gt10'] as const)[index]}`)}
                </option>
              ))}
            </select>
          </label>
          <label className='xl:col-span-3'>
            <span className='sr-only'>{t(`${key}.status`)}</span>
            <select
              className={fieldClass}
              onChange={(event) => update('status', event.target.value)}
              value={status ?? ''}
            >
              <option value=''>
                {t(`${key}.status`)}: {t(`${key}.all`)}
              </option>
              {(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'ARCHIVED'] as const).map((value) => (
                <option key={value} value={value}>
                  {t(`${providerKey}.${statusLabels[value]}`)}
                </option>
              ))}
            </select>
          </label>
          <label className='xl:col-span-3'>
            <span className='sr-only'>{t(`${key}.verification`)}</span>
            <select
              className={fieldClass}
              onChange={(event) => update('verification', event.target.value)}
              value={verification ?? ''}
            >
              <option value=''>
                {t(`${key}.verification`)}: {t(`${key}.all`)}
              </option>
              {(['VERIFIED', 'PENDING', 'REJECTED'] as const).map((value) => (
                <option key={value} value={value}>
                  {t(`${providerKey}.${verificationLabels[value]}`)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className='flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/20 pt-4'>
          <div className='flex items-center gap-2 text-xs text-outline'>
            {t(`${key}.selected`)}
            <span className='font-semibold text-primary'>
              {[keyword, experience, status, verification].filter(Boolean).length}
            </span>
            <button className='text-primary underline' onClick={() => setParams({})} type='button'>
              {t(`${key}.reset`)}
            </button>
          </div>
          <label className='flex items-center gap-2 text-xs text-outline'>
            {t(`${key}.sort`)}
            <select
              className='rounded-lg bg-surface-container-low px-3 py-2 text-xs text-on-surface'
              onChange={(event) => update('sort', event.target.value)}
              value={sort}
            >
              <option value='rating'>{t(`${key}.ratingSort`)}</option>
              <option value='experience'>{t(`${key}.experienceSort`)}</option>
              <option value='newest'>{t(`${key}.newestSort`)}</option>
            </select>
          </label>
        </div>
        <p className='text-xs text-outline'>{t('centerManager.provider.localFilterHint')}</p>
      </section>
      <section className='overflow-hidden rounded-xl bg-white shadow-sm'>
        {caregivers.isPending ? (
          <p className='p-8' role='status'>
            {t(`${providerKey}.loading`)}
          </p>
        ) : null}
        {caregivers.isError ? (
          <div className='p-8' role='alert'>
            <p>{t(`${providerKey}.caregiversError`)}</p>
            <button className='mt-2 text-primary underline' onClick={() => void caregivers.refetch()} type='button'>
              {t(`${providerKey}.retry`)}
            </button>
          </div>
        ) : null}
        {caregivers.isSuccess ? (
          <div className='overflow-x-auto'>
            <table className='w-full min-w-[900px] text-left text-sm'>
              <thead className='bg-surface-container-low text-xs uppercase tracking-wide text-on-surface-variant'>
                <tr>
                  {(['name', 'experience', 'hospital', 'status', 'verification', 'actions'] as const).map((column) => (
                    <th className='p-4 font-semibold' key={column} scope='col'>
                      {column === 'hospital' ? t(`${providerKey}.centerName`) : t(`${key}.${column}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className='divide-y divide-outline-variant/20'>
                {visible.map((person) => (
                  <tr className='hover:bg-surface-container-low/40' key={person.id}>
                    <td className='p-4'>
                      <div className='flex items-center gap-3'>
                        <span className='flex h-11 w-11 items-center justify-center rounded-xl bg-secondary-container text-primary'>
                          <Icon name='person' />
                        </span>
                        <div>
                          <Link className='font-bold hover:text-primary' to={`/center-manager/caregivers/${person.id}`}>
                            {person.fullName}
                          </Link>
                          <small className='mt-1 block text-outline'>{person.id}</small>
                        </div>
                      </div>
                    </td>
                    <td className='p-4'>
                      {person.experienceYears !== undefined
                        ? t(`${providerKey}.yearsValue`, { count: person.experienceYears })
                        : '—'}
                    </td>
                    <td className='p-4'>{person.centerName || '—'}</td>
                    <td className='p-4'>
                      <span className='rounded-full bg-secondary-container px-2.5 py-1 text-xs font-semibold text-primary'>
                        {t(`${providerKey}.${statusLabels[person.caregiverStatus]}`)}
                      </span>
                    </td>
                    <td className='p-4'>{t(`${providerKey}.${verificationLabels[person.verificationStatus]}`)}</td>
                    <td className='p-4'>
                      <Link
                        className='font-semibold text-primary hover:underline'
                        to={`/center-manager/caregivers/${person.id}`}
                      >
                        {t(`${providerKey}.viewDetails`, { name: person.fullName })}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        {caregivers.isSuccess && !visible.length ? (
          <div className='p-14 text-center'>
            <Icon className='text-4xl text-outline' name='person_search' />
            <h2 className='mt-3 font-bold'>{t(`${key}.empty`)}</h2>
          </div>
        ) : null}
        {caregivers.isSuccess ? (
          <div className='flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/20 px-4 py-3 text-xs text-outline'>
            <span aria-live='polite'>
              {t(`${key}.showing`, {
                from: visible.length ? page * size + 1 : 0,
                to: page * size + visible.length,
                total: caregivers.data.totalElements
              })}
            </span>
            <div className='flex items-center gap-2'>
              <label>
                {t(`${key}.pageSize`)}{' '}
                <select
                  className='ml-2 rounded border border-outline-variant/30 p-2'
                  onChange={(event) => update('size', event.target.value)}
                  value={size}
                >
                  {[10, 20, 50].map((value) => (
                    <option key={value} value={value}>
                      {number(value)}
                    </option>
                  ))}
                </select>
              </label>
              <button
                aria-label={t(`${key}.previous`)}
                className='rounded-lg border border-outline-variant/30 p-2 disabled:opacity-30'
                disabled={page === 0}
                onClick={() => update('page', String(page - 1))}
                type='button'
              >
                <Icon name='chevron_left' />
              </button>
              <button
                aria-label={t(`${key}.next`)}
                className='rounded-lg border border-outline-variant/30 p-2 disabled:opacity-30'
                disabled={page + 1 >= caregivers.data.totalPages}
                onClick={() => update('page', String(page + 1))}
                type='button'
              >
                <Icon name='chevron_right' />
              </button>
            </div>
          </div>
        ) : null}
      </section>
      {creating ? (
        <div className='fixed inset-0 z-50 overflow-y-auto bg-on-surface/50 p-4'>
          <div className='mx-auto my-10 max-w-2xl'>
            <CreateCaregiver centerId={centerId} onDone={() => setCreating(false)} />
          </div>
        </div>
      ) : null}
    </main>
  )
}
