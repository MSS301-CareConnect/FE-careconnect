import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'
import { ComplaintCard } from './components/complaint-card'
import { ComplaintDialog } from './components/complaint-dialog'
import { ComplaintsSidebar } from './components/complaints-sidebar'
import { complaintsPreview } from './complaints-preview'

const key = 'admin.reviewsComplaintsPage' as const
const tabs = ['reviews', 'complaints', 'violations'] as const
type Tab = (typeof tabs)[number]

export function AdminReviewsComplaintsPage() {
  const { t, i18n } = useTranslation()
  const [params, setParams] = useSearchParams()
  const get = (name: string) => params.get(name) ?? ''
  const locale = i18n.language === 'en' ? 'en-US' : 'vi-VN'
  const tab: Tab = tabs.find((item) => item === get('tab')) ?? 'complaints'
  const search = get('q').trim().toLocaleLowerCase(locale)
  const filtered = complaintsPreview.filter(
    (item) =>
      (!search ||
        [item.id, item.booking, item.customer, item.caregiver].some((value) =>
          value.toLocaleLowerCase(locale).includes(search)
        )) &&
      (!get('level') || get('level') === item.level) &&
      (!get('status') || get('status') === item.status)
  )
  const selected = complaintsPreview.find((item) => item.id === get('case'))
  useDocumentTitle(t(`${key}.documentTitle`))
  function update(name: string, value: string) {
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      if (value && value !== 'all') next.set(name, value)
      else next.delete(name)
      if (name !== 'case') next.delete('case')
      return next
    })
  }
  function exportSample() {
    const rows = [
      [t(`${key}.customer`), t(`${key}.booking`), t(`${key}.feedback.title`)],
      ...(['first', 'second'] as const).map((item) => [
        t(`${key}.feedback.${item}Name`),
        t(`${key}.feedback.${item}Booking`),
        t(`${key}.feedback.${item}Quote`)
      ])
    ]
    const csv = rows
      .map((row) =>
        row.map((cell) => `"${(/^[=+@-]/.test(cell) ? `'${cell}` : cell).replaceAll('"', '""')}"`).join(',')
      )
      .join('\r\n')
    const url = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'admin-csat-preview.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }
  return (
    <div className='mx-auto max-w-7xl space-y-6 px-4 py-7 sm:px-6'>
      <nav aria-label={t('admin.menu')} className='flex flex-wrap items-center gap-2 text-xs text-outline'>
        <Link to='/admin/dashboard'>{t('admin.dashboard')}</Link>
        <Icon className='text-sm' name='chevron_right' />
        <span>{t(`${key}.breadcrumb`)}</span>
        <Icon className='text-sm' name='chevron_right' />
        <span className='text-primary'>{t('admin.reviewsComplaints')}</span>
      </nav>
      <header className='flex flex-wrap items-start justify-between gap-4'>
        <div className='max-w-3xl'>
          <h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>{t(`${key}.title`)}</h1>
          <p className='mt-2 inline-flex rounded-full bg-error-container px-3 py-1 text-xs font-semibold text-on-error-container'>
            {t(`${key}.subtitle`)}
          </p>
          <p className='mt-2 text-xs font-semibold text-error'>{t(`${key}.sample`)}</p>
        </div>
        <div className='flex flex-wrap gap-2'>
          <button
            className='rounded-lg bg-surface-container-low px-3 py-2 text-xs font-semibold opacity-50'
            disabled
            title={t(`${key}.unavailable`)}
            type='button'
          >
            {t(`${key}.actions.policies`)}
          </button>
          <button
            className='rounded-lg bg-surface-container-low px-3 py-2 text-xs font-semibold hover:bg-surface-container'
            onClick={exportSample}
            type='button'
          >
            {t(`${key}.actions.export`)}
          </button>
          <button
            className='rounded-lg bg-error px-3 py-2 text-xs font-semibold text-white opacity-50'
            disabled
            title={t(`${key}.unavailable`)}
            type='button'
          >
            {t(`${key}.actions.sos`)}
          </button>
        </div>
      </header>
      <section aria-label={t(`${key}.metrics.csat`)} className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {(
          [
            ['csat', '4.88 / 5.0', 'star'],
            ['urgent', '03', 'notification_important'],
            ['resolved', '45', 'task_alt'],
            ['satisfaction', '96.5%', 'handshake']
          ] as const
        ).map(([name, value, icon]) => (
          <div className='rounded-xl bg-white p-5 shadow-sm' key={name}>
            <div className='flex items-start justify-between gap-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant'>
              <span>{t(`${key}.metrics.${name}`)}</span>
              <Icon className={`text-2xl ${name === 'urgent' ? 'text-error' : 'text-primary'}`} name={icon} />
            </div>
            <strong className={`mt-4 block text-3xl ${name === 'urgent' ? 'text-error' : ''}`}>{value}</strong>
            <p className='mt-3 border-t border-outline-variant/20 pt-3 text-xs text-on-surface-variant'>
              {t(`${key}.metrics.${name}Hint`)}
            </p>
          </div>
        ))}
      </section>
      <div className='flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-2 shadow-sm'>
        <div aria-label={t('admin.reviewsComplaints')} className='flex flex-wrap gap-1' role='tablist'>
          {tabs.map((item) => (
            <button
              aria-selected={tab === item}
              className={`rounded-lg px-3 py-2 text-sm font-semibold ${tab === item ? 'bg-primary text-white' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
              key={item}
              onClick={() => update('tab', item)}
              role='tab'
              type='button'
            >
              {t(`${key}.tabs.${item}`)}
            </button>
          ))}
        </div>
        <span className='px-2 text-xs text-outline'>{t(`${key}.sample`)}</span>
      </div>
      {tab === 'complaints' ? (
        <>
          <section className='grid gap-3 rounded-xl bg-white p-4 shadow-sm sm:grid-cols-2 xl:grid-cols-[1fr_13rem_13rem_auto]'>
            <label className='text-xs font-semibold text-on-surface-variant'>
              {t(`${key}.filters.search`)}
              <input
                className='mt-1 block w-full rounded-lg bg-surface-container-low px-3 py-2.5 text-sm'
                onChange={(event) => update('q', event.target.value)}
                placeholder={t(`${key}.filters.search`)}
                type='search'
                value={get('q')}
              />
            </label>
            <label className='text-xs font-semibold text-on-surface-variant'>
              {t(`${key}.filters.severity`)}
              <select
                className='mt-1 block w-full rounded-lg bg-surface-container-low px-3 py-2.5 text-sm'
                onChange={(event) => update('level', event.target.value)}
                value={get('level') || 'all'}
              >
                <option value='all'>{t(`${key}.filters.all`)}</option>
                {(['critical', 'clinical', 'low'] as const).map((level) => (
                  <option key={level} value={level}>
                    {t(`${key}.levels.${level}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className='text-xs font-semibold text-on-surface-variant'>
              {t(`${key}.filters.status`)}
              <select
                className='mt-1 block w-full rounded-lg bg-surface-container-low px-3 py-2.5 text-sm'
                onChange={(event) => update('status', event.target.value)}
                value={get('status') || 'all'}
              >
                <option value='all'>{t(`${key}.filters.all`)}</option>
                {(['new', 'review', 'resolved'] as const).map((status) => (
                  <option key={status} value={status}>
                    {t(`${key}.statuses.${status}`)}
                  </option>
                ))}
              </select>
            </label>
            <button
              className='self-end rounded-lg bg-surface-container-low px-3 py-2.5 text-sm font-semibold hover:bg-surface-container'
              onClick={() => setParams(new URLSearchParams({ tab: 'complaints' }))}
              type='button'
            >
              {t(`${key}.filters.reset`)}
            </button>
          </section>
          <div className='grid items-start gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]'>
            <section className='space-y-4'>
              <div className='flex flex-wrap items-center justify-between gap-2'>
                <h2 className='text-xl font-bold'>{t(`${key}.casesTitle`)}</h2>
                <span className='text-xs text-outline'>{t(`${key}.results`, { count: filtered.length })}</span>
              </div>
              {filtered.map((item) => (
                <ComplaintCard complaint={item} key={item.id} onSelect={() => update('case', item.id)} />
              ))}
              {!filtered.length && (
                <p className='rounded-xl bg-white p-8 text-center text-sm text-outline'>{t(`${key}.empty`)}</p>
              )}
            </section>
            <ComplaintsSidebar />
          </div>
        </>
      ) : tab === 'reviews' ? (
        <section className='grid gap-4 lg:grid-cols-2'>
          <div className='lg:col-span-2 rounded-xl bg-white p-5 text-sm text-on-surface-variant'>
            {t(`${key}.reviewsHint`)}
          </div>
          <ComplaintsSidebar />
        </section>
      ) : (
        <section className='rounded-xl bg-white p-8 text-sm text-on-surface-variant shadow-sm'>
          <Icon className='mb-3 block text-3xl text-primary' name='gavel' />
          {t(`${key}.violationsHint`)}
        </section>
      )}
      <section className='flex flex-wrap items-center justify-between gap-4 rounded-xl bg-secondary-container/25 p-5'>
        <div>
          <h2 className='font-bold text-primary'>{t(`${key}.support`)}</h2>
          <p className='mt-1 text-sm text-on-surface-variant'>{t(`${key}.supportHint`)}</p>
        </div>
        <div className='flex gap-2'>
          <button
            className='rounded-lg bg-white px-3 py-2 text-xs font-semibold opacity-50'
            disabled
            title={t(`${key}.unavailable`)}
            type='button'
          >
            {t(`${key}.actions.archive`)}
          </button>
          <button
            className='rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white opacity-50'
            disabled
            title={t(`${key}.unavailable`)}
            type='button'
          >
            {t(`${key}.actions.create`)}
          </button>
        </div>
      </section>
      {selected && <ComplaintDialog complaint={selected} onClose={() => update('case', '')} />}
    </div>
  )
}
