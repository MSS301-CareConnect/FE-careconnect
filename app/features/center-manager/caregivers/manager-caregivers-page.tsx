import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'
import { managerCaregivers, type ManagerCaregiver, type ManagerSpecialty } from './caregiver-preview'
import { CaregiverRow } from './components/caregiver-row'

const specialties = ['general', 'rehab', 'elderly', 'therapy', 'postop', 'infant', 'emergency'] as const
const fieldClass =
  'w-full rounded-lg bg-surface-container-low px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary'
const filters = ['q', 'specialty', 'experience', 'status', 'verification', 'sort'] as const

function filterExperience(years: number, value: string) {
  if (value === 'lt2') return years < 2
  if (value === '2-5') return years >= 2 && years < 5
  if (value === '5-10') return years >= 5 && years <= 10
  if (value === 'gt10') return years > 10
  return true
}
function csvCell(value: string) {
  return `"${(/^[=+@-]/.test(value) ? `'${value}` : value).replaceAll('"', '""')}"`
}

export function ManagerCaregiversPage() {
  const { t, i18n } = useTranslation()
  const [params, setParams] = useSearchParams()
  const locale = i18n.resolvedLanguage ?? 'vi'
  const number = (value: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value)
  const get = (key: string) => params.get(key) ?? ''
  function update(key: string, value: string) {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        if (value) next.set(key, value)
        else next.delete(key)
        if (key !== 'page') next.delete('page')
        return next
      },
      { replace: true }
    )
  }
  const query = get('q').trim().toLocaleLowerCase(locale)
  const filtered = managerCaregivers
    .filter(
      (person) =>
        `${person.name} ${person.id} ${person.license ?? ''} ${person.phone}`
          .toLocaleLowerCase(locale)
          .includes(query) &&
        (!get('specialty') || person.specialties.includes(get('specialty') as ManagerSpecialty)) &&
        filterExperience(person.years, get('experience')) &&
        (!get('status') || person.status === get('status')) &&
        (!get('verification') || person.verification === get('verification'))
    )
    .sort((a, b) =>
      get('sort') === 'experience'
        ? b.years - a.years
        : get('sort') === 'newest'
          ? (b.joined ?? '').localeCompare(a.joined ?? '')
          : b.rating - a.rating
    )
  const perPage = [10, 25, 50].includes(Number(get('size'))) ? Number(get('size')) : 10
  const pages = Math.max(1, Math.ceil(filtered.length / perPage))
  const page = Math.min(pages, Math.max(1, Math.floor(Number(get('page')) || 1)))
  const displayed = filtered.slice((page - 1) * perPage, page * perPage)
  const active = managerCaregivers.filter((person) => person.status !== 'disabled').length
  const verified = managerCaregivers.filter((person) => person.verification === 'verified').length
  const pending = managerCaregivers.filter((person) => person.verification === 'pending').length
  const totalReviews = managerCaregivers.reduce((sum, person) => sum + person.reviews, 0)
  const average = totalReviews
    ? managerCaregivers.reduce((sum, person) => sum + person.rating * person.reviews, 0) / totalReviews
    : 0
  const stats = [
    {
      key: 'total',
      icon: 'group',
      value: number(managerCaregivers.length),
      detail: t('centerManager.management.activeCount', { count: active })
    },
    {
      key: 'verifiedTotal',
      icon: 'health_and_safety',
      value: number(verified),
      detail: t('centerManager.management.count', { count: verified })
    },
    {
      key: 'pendingTotal',
      icon: 'pending_actions',
      value: number(pending),
      detail: t('centerManager.management.count', { count: pending })
    },
    {
      key: 'average',
      icon: 'hotel_class',
      value: number(average),
      detail: t('centerManager.management.reviews', { count: totalReviews })
    }
  ] as const
  useDocumentTitle(t('centerManager.management.documentTitle'))
  function exportCsv() {
    const rows = [
      [
        t('centerManager.management.downloadCode'),
        t('centerManager.management.downloadName'),
        t('centerManager.management.downloadStatus'),
        t('centerManager.management.downloadVerification')
      ],
      ...filtered.map((person: ManagerCaregiver) => [
        person.id,
        person.name,
        t(`centerManager.management.statuses.${person.status}`),
        t(`centerManager.management.verifications.${person.verification}`)
      ])
    ]
    const csv = '\uFEFF' + rows.map((row) => row.map(csvCell).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'caregivers-preview.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }
  return (
    <div className='mx-auto max-w-7xl space-y-6 px-4 py-7 sm:px-6'>
      <header>
        <p className='mb-3 flex items-center gap-2 text-xs text-outline'>
          <Icon className='text-base' name='admin_panel_settings' />
          {t('centerManager.portal')}
          <Icon className='text-base' name='chevron_right' />
          {t('centerManager.management.list')}
        </p>
        <div className='flex flex-wrap items-start justify-between gap-4'>
          <div>
            <div className='flex flex-wrap items-center gap-3'>
              <h1 className='text-2xl font-extrabold tracking-tight sm:text-3xl'>
                {t('centerManager.management.title')}
              </h1>
              <span className='rounded-full bg-secondary-container px-3 py-1 text-xs font-semibold text-primary'>
                {t('centerManager.management.count', { count: managerCaregivers.length })}
              </span>
            </div>
            <p className='mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant'>
              {t('centerManager.management.subtitle')}
            </p>
          </div>
          <div className='flex flex-wrap gap-2'>
            <button
              className='flex items-center gap-2 rounded-lg bg-surface-container px-3 py-2.5 text-sm font-semibold disabled:opacity-50'
              disabled={!filtered.length}
              onClick={exportCsv}
              type='button'
            >
              <Icon className='text-lg' name='download' />
              {t('centerManager.management.export')}
            </button>
            <button
              className='flex items-center gap-2 rounded-lg bg-surface-container-high px-3 py-2.5 text-sm font-semibold text-primary'
              onClick={() => update('verification', 'pending')}
              type='button'
            >
              <Icon className='text-lg' name='verified_user' />
              {t('centerManager.management.queue')}
              <span className='rounded-full bg-error px-2 text-xs text-white'>{number(pending)}</span>
            </button>
            <button
              className='flex cursor-not-allowed items-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-white opacity-60'
              disabled
              title={t('centerManager.unavailable')}
              type='button'
            >
              <Icon className='text-lg' name='person_add' />
              {t('centerManager.management.add')}
            </button>
          </div>
        </div>
      </header>
      <p className='rounded-lg bg-secondary-container/45 px-4 py-3 text-xs leading-5 text-primary'>
        {t('centerManager.management.preview')}
      </p>
      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {stats.map((stat) => (
          <section className='rounded-xl bg-white p-5 shadow-sm' key={stat.key}>
            <div className='flex items-center justify-between gap-3'>
              <h2 className='text-xs font-semibold uppercase tracking-wide text-on-surface-variant'>
                {t(`centerManager.management.${stat.key}`)}
              </h2>
              <Icon className='text-2xl text-primary' name={stat.icon} />
            </div>
            <p className='mt-3 text-3xl font-extrabold'>{stat.value}</p>
            <p className='mt-2 text-xs text-outline'>{stat.detail}</p>
          </section>
        ))}
      </div>
      <section className='space-y-4 rounded-xl bg-white p-4 shadow-sm sm:p-5'>
        <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-12'>
          <label className='relative xl:col-span-4'>
            <span className='sr-only'>{t('centerManager.management.search')}</span>
            <Icon className='absolute left-3 top-3 text-outline' name='search' />
            <input
              className={`${fieldClass} pl-10`}
              onChange={(event) => update('q', event.target.value)}
              placeholder={t('centerManager.management.search')}
              type='search'
              value={get('q')}
            />
          </label>
          <label className='xl:col-span-2'>
            <span className='sr-only'>{t('centerManager.management.specialty')}</span>
            <select
              className={fieldClass}
              onChange={(event) => update('specialty', event.target.value)}
              value={get('specialty')}
            >
              <option value=''>
                {t('centerManager.management.specialty')}: {t('centerManager.management.all')}
              </option>
              {specialties.map((key) => (
                <option key={key} value={key}>
                  {t(`centerManager.management.specialties.${key}`)}
                </option>
              ))}
            </select>
          </label>
          <label className='xl:col-span-2'>
            <span className='sr-only'>{t('centerManager.management.experience')}</span>
            <select
              className={fieldClass}
              onChange={(event) => update('experience', event.target.value)}
              value={get('experience')}
            >
              <option value=''>
                {t('centerManager.management.experience')}: {t('centerManager.management.all')}
              </option>
              {(['lt2', '2-5', '5-10', 'gt10'] as const).map((value, index) => (
                <option key={value} value={value}>
                  {t(`centerManager.management.${(['lt2', 'range2to5', 'range5to10', 'gt10'] as const)[index]}`)}
                </option>
              ))}
            </select>
          </label>
          <label className='xl:col-span-2'>
            <span className='sr-only'>{t('centerManager.management.status')}</span>
            <select
              className={fieldClass}
              onChange={(event) => update('status', event.target.value)}
              value={get('status')}
            >
              <option value=''>
                {t('centerManager.management.status')}: {t('centerManager.management.all')}
              </option>
              {(['active', 'disabled', 'onduty'] as const).map((key) => (
                <option key={key} value={key}>
                  {t(`centerManager.management.statuses.${key}`)}
                </option>
              ))}
            </select>
          </label>
          <label className='xl:col-span-2'>
            <span className='sr-only'>{t('centerManager.management.verification')}</span>
            <select
              className={fieldClass}
              onChange={(event) => update('verification', event.target.value)}
              value={get('verification')}
            >
              <option value=''>
                {t('centerManager.management.verification')}: {t('centerManager.management.all')}
              </option>
              {(['verified', 'pending', 'update'] as const).map((key) => (
                <option key={key} value={key}>
                  {t(`centerManager.management.verifications.${key}`)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className='flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/20 pt-4'>
          <div className='flex items-center gap-2 text-xs text-outline'>
            {t('centerManager.management.selected')}
            <span className='font-semibold text-primary'>{filters.filter((key) => get(key)).length}</span>
            <button
              className='text-primary underline disabled:opacity-40'
              disabled={!filters.some((key) => get(key))}
              onClick={() => setParams({})}
              type='button'
            >
              {t('centerManager.management.reset')}
            </button>
          </div>
          <label className='flex items-center gap-2 text-xs text-outline'>
            {t('centerManager.management.sort')}
            <select
              className='rounded-lg bg-surface-container-low px-3 py-2 text-xs text-on-surface'
              onChange={(event) => update('sort', event.target.value)}
              value={get('sort')}
            >
              <option value='rating'>{t('centerManager.management.ratingSort')}</option>
              <option value='experience'>{t('centerManager.management.experienceSort')}</option>
              <option value='newest'>{t('centerManager.management.newestSort')}</option>
            </select>
          </label>
        </div>
      </section>
      <section className='overflow-hidden rounded-xl bg-white shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='w-full min-w-[1050px] text-left text-sm'>
            <thead className='bg-surface-container-low text-xs uppercase tracking-wide text-on-surface-variant'>
              <tr>
                {(['name', 'skills', 'hospital', 'status', 'verification', 'actions'] as const).map((key) => (
                  <th className='p-4 font-semibold' key={key} scope='col'>
                    {t(`centerManager.management.${key}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.map((person) => (
                <CaregiverRow key={person.id} person={person} />
              ))}
            </tbody>
          </table>
        </div>
        {!displayed.length && (
          <div className='p-14 text-center'>
            <Icon className='text-4xl text-outline' name='person_search' />
            <h2 className='mt-3 font-bold'>{t('centerManager.management.empty')}</h2>
            <p className='mt-2 text-sm text-outline'>{t('centerManager.management.emptyHint')}</p>
            <button
              className='mt-4 text-sm font-semibold text-primary underline'
              onClick={() => setParams({})}
              type='button'
            >
              {t('centerManager.management.reset')}
            </button>
          </div>
        )}
        <div className='flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/20 px-4 py-3 text-xs text-outline'>
          <span aria-live='polite'>
            {t('centerManager.management.showing', {
              from: filtered.length ? (page - 1) * perPage + 1 : 0,
              to: Math.min(page * perPage, filtered.length),
              total: filtered.length
            })}
          </span>
          <div className='flex items-center gap-2'>
            <label>
              {t('centerManager.management.pageSize')}{' '}
              <select
                className='ml-2 rounded border border-outline-variant/30 p-2'
                onChange={(event) => update('size', event.target.value)}
                value={perPage}
              >
                {[10, 25, 50].map((size) => (
                  <option key={size} value={size}>
                    {number(size)}
                  </option>
                ))}
              </select>
            </label>
            <button
              aria-label={t('centerManager.management.previous')}
              className='rounded-lg border border-outline-variant/30 p-2 disabled:opacity-30'
              disabled={page === 1}
              onClick={() => update('page', String(page - 1))}
              type='button'
            >
              <Icon className='text-lg' name='chevron_left' />
            </button>
            <button
              aria-label={t('centerManager.management.next')}
              className='rounded-lg border border-outline-variant/30 p-2 disabled:opacity-30'
              disabled={page === pages}
              onClick={() => update('page', String(page + 1))}
              type='button'
            >
              <Icon className='text-lg' name='chevron_right' />
            </button>
          </div>
        </div>
      </section>
      <p className='text-center text-xs text-outline'>{t('centerManager.management.policy')}</p>
    </div>
  )
}
