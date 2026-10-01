import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'
import { servicesPreview } from './services-preview'

const key = 'admin.servicesPage' as const
const card = 'rounded-xl bg-white p-5 shadow-sm'

export function AdminServicesPage() {
  const { t, i18n } = useTranslation()
  const [params, setParams] = useSearchParams()
  const get = (name: string) => params.get(name) ?? ''
  const locale = i18n.language === 'en' ? 'en-US' : 'vi-VN'
  const number = new Intl.NumberFormat(locale)
  const money = new Intl.NumberFormat(locale, { style: 'currency', currency: 'VND', maximumFractionDigits: 0 })
  function update(name: string, value: string) {
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      if (value && value !== 'all') next.set(name, value)
      else next.delete(name)
      if (name !== 'service') next.delete('service')
      return next
    })
  }
  const tab = get('tab') === 'master' || get('tab') === 'surcharge' ? get('tab') : 'center'
  const search = get('q').trim().toLocaleLowerCase(locale)
  const filtered = servicesPreview.filter((service) => {
    const matchesSearch =
      !search || `${t(`${key}.serviceNames.${service.name}`)} ${service.id}`.toLocaleLowerCase(locale).includes(search)
    return (
      matchesSearch &&
      (!get('group') || service.group === get('group')) &&
      (!get('status') || service.status === get('status')) &&
      (!get('unit') || service.unit === get('unit'))
    )
  })
  const selected = servicesPreview.find((service) => service.id === get('service'))
  useDocumentTitle(t(`${key}.documentTitle`))
  return (
    <div className='mx-auto max-w-7xl space-y-6 px-4 py-7 sm:px-6'>
      <nav aria-label={t('admin.menu')} className='flex items-center gap-2 text-xs text-outline'>
        <Link to='/admin/dashboard'>{t('admin.dashboard')}</Link>
        <Icon className='text-sm' name='chevron_right' />
        <span className='text-primary'>{t('admin.services')}</span>
      </nav>
      <header className='flex flex-wrap items-start justify-between gap-5'>
        <div className='max-w-3xl'>
          <div className='flex flex-wrap items-center gap-2 text-xs'>
            <span className='rounded-full bg-secondary-container px-3 py-1 font-bold text-primary'>
              {t(`${key}.badge`)}
            </span>
            <span className='text-outline'>{t(`${key}.priceVersion`)}</span>
          </div>
          <h1 className='mt-3 text-2xl font-bold tracking-tight sm:text-3xl'>{t(`${key}.title`)}</h1>
          <p className='mt-2 text-sm leading-6 text-on-surface-variant'>{t(`${key}.subtitle`)}</p>
          <p className='mt-2 text-xs font-semibold text-primary'>{t(`${key}.sample`)}</p>
        </div>
        <div className='flex flex-wrap gap-2'>
          {(['history', 'importExport', 'add'] as const).map((action) => (
            <button
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold disabled:opacity-50 ${action === 'add' ? 'bg-primary text-white' : 'bg-surface-container-low'}`}
              disabled
              key={action}
              title={t(`${key}.unavailable`)}
              type='button'
            >
              <Icon
                className='text-lg'
                name={action === 'history' ? 'history' : action === 'add' ? 'add_circle' : 'file_download'}
              />
              {t(`${key}.${action}`)}
            </button>
          ))}
        </div>
      </header>
      <section aria-label={t(`${key}.metrics.total`)} className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {(
          [
            ['total', number.format(16), 'medical_services'],
            ['centers', number.format(12), 'storefront'],
            ['average', money.format(385000), 'payments'],
            ['fee', '15%', 'pie_chart']
          ] as const
        ).map(([name, value, icon]) => (
          <div className={card} key={name}>
            <div className='flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-outline'>
              <span>{t(`${key}.metrics.${name}`)}</span>
              <Icon className='text-xl text-primary' name={icon} />
            </div>
            <strong className='mt-5 block text-3xl'>{value}</strong>
            <p className='mt-2 text-xs text-on-surface-variant'>{t(`${key}.metricHints.${name}`)}</p>
          </div>
        ))}
      </section>
      <div
        className='flex flex-wrap gap-2 rounded-xl bg-surface-container-low p-1.5'
        role='tablist'
        aria-label={t('admin.services')}
      >
        {(['center', 'master', 'surcharge'] as const).map((item) => (
          <button
            aria-selected={tab === item}
            className={`rounded-lg px-4 py-2.5 text-sm font-semibold ${tab === item ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:bg-white/60'}`}
            key={item}
            onClick={() => update('tab', item)}
            role='tab'
            type='button'
          >
            {t(`${key}.tabs.${item}`)}
          </button>
        ))}
      </div>
      {tab === 'center' && (
        <>
          <section aria-label={t(`${key}.search`)} className={`${card} space-y-4`}>
            <div className='relative'>
              <Icon className='absolute left-3 top-2.5 text-xl text-outline' name='search' />
              <input
                aria-label={t(`${key}.search`)}
                className='w-full rounded-lg bg-surface-container-low py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/30'
                onChange={(event) => update('q', event.target.value)}
                placeholder={t(`${key}.search`)}
                type='search'
                value={get('q')}
              />
            </div>
            <div className='flex flex-wrap items-end gap-3'>
              <label className='min-w-44 flex-1 text-xs font-semibold text-on-surface-variant'>
                {t(`${key}.group`)}
                <select
                  className='mt-1 block w-full rounded-lg bg-surface-container-low p-2.5 text-sm'
                  onChange={(event) => update('group', event.target.value)}
                  value={get('group') || 'all'}
                >
                  <option value='all'>{t(`${key}.all`)}</option>
                  {(['elderly', 'rehab', 'surgery', 'chronic', 'mother'] as const).map((item) => (
                    <option key={item} value={item}>
                      {t(`${key}.groups.${item}`)}
                    </option>
                  ))}
                </select>
              </label>
              <label className='min-w-44 flex-1 text-xs font-semibold text-on-surface-variant'>
                {t(`${key}.status`)}
                <select
                  className='mt-1 block w-full rounded-lg bg-surface-container-low p-2.5 text-sm'
                  onChange={(event) => update('status', event.target.value)}
                  value={get('status') || 'all'}
                >
                  <option value='all'>{t(`${key}.all`)}</option>
                  {(['active', 'paused', 'disabled'] as const).map((item) => (
                    <option key={item} value={item}>
                      {t(`${key}.statuses.${item}`)}
                    </option>
                  ))}
                </select>
              </label>
              <label className='min-w-44 flex-1 text-xs font-semibold text-on-surface-variant'>
                {t(`${key}.unit`)}
                <select
                  className='mt-1 block w-full rounded-lg bg-surface-container-low p-2.5 text-sm'
                  onChange={(event) => update('unit', event.target.value)}
                  value={get('unit') || 'all'}
                >
                  <option value='all'>{t(`${key}.all`)}</option>
                  {(['hour', 'shift', 'daily'] as const).map((item) => (
                    <option key={item} value={item}>
                      {t(`${key}.units.${item}`)}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className='rounded-lg bg-surface-container px-4 py-2.5 text-sm font-semibold text-primary'
                onClick={() => setParams({})}
                type='button'
              >
                {t(`${key}.reset`)}
              </button>
            </div>
          </section>
          <section className='overflow-hidden rounded-xl bg-white shadow-sm'>
            <div className='flex items-center justify-between gap-3 px-5 py-4'>
              <h2 className='text-lg font-bold'>{t(`${key}.tabs.center`)}</h2>
              <span className='text-xs text-outline'>{t(`${key}.results`, { count: filtered.length })}</span>
            </div>
            <div className='overflow-x-auto'>
              <table className='w-full min-w-[1100px] text-left text-sm'>
                <thead className='bg-surface-container-low text-xs uppercase tracking-wide text-on-surface-variant'>
                  <tr>
                    {(['service', 'category', 'price', 'allocation', 'bookings', 'status', 'actions'] as const).map(
                      (column) => (
                        <th className='px-4 py-3' key={column} scope='col'>
                          {t(`${key}.columns.${column}`)}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className='divide-y divide-outline-variant/25'>
                  {filtered.map((service) => (
                    <tr className='align-top hover:bg-surface-container-low/40' key={service.id}>
                      <td className='px-4 py-4'>
                        <div className='flex items-start gap-2'>
                          <Icon
                            className='rounded-lg bg-secondary-container/35 p-2 text-2xl text-primary'
                            name={service.icon}
                          />
                          <span>
                            <strong className='block max-w-52 leading-5'>
                              {t(`${key}.serviceNames.${service.name}`)}
                            </strong>
                            <small className='mt-1 block text-outline'>
                              {t(`${key}.sku`)}: {service.id}
                            </small>
                          </span>
                        </div>
                      </td>
                      <td className='px-4 py-4'>
                        <strong className='block text-xs'>{t(`${key}.groups.${service.group}`)}</strong>
                        <small className='mt-1 block text-outline'>{t(`${key}.certified`)}</small>
                      </td>
                      <td className='px-4 py-4'>
                        {service.prices.map((price) => (
                          <p className='mb-1 text-xs' key={price.label}>
                            <span className='text-outline'>{t(`${key}.priceLabels.${price.label}`)}: </span>
                            <strong>{money.format(price.amount)}</strong>
                          </p>
                        ))}
                      </td>
                      <td className='px-4 py-4'>
                        <strong className='block text-primary'>{t(`${key}.caregiverShare`)}</strong>
                        <small className='text-outline'>{t(`${key}.platformShare`)}</small>
                      </td>
                      <td className='px-4 py-4'>
                        <strong className='block'>{t(`${key}.bookingCount`, { count: service.bookings })}</strong>
                        <span className='text-xs text-outline'>
                          ★ {number.format(service.rating)} · {t(`${key}.ratingCount`, { count: service.reviews })}
                        </span>
                      </td>
                      <td className='px-4 py-4'>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${service.status === 'active' ? 'bg-secondary-container/40 text-primary' : 'bg-surface-container text-outline'}`}
                        >
                          {t(`${key}.statuses.${service.status}`)}
                        </span>
                      </td>
                      <td className='px-4 py-4'>
                        <button
                          aria-label={`${t(`${key}.edit`)}: ${t(`${key}.serviceNames.${service.name}`)}`}
                          className='rounded-lg p-2 text-primary hover:bg-surface-container-low'
                          onClick={() => update('service', service.id)}
                          type='button'
                        >
                          <Icon name='tune' />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!filtered.length && <p className='p-8 text-center text-sm text-outline'>{t(`${key}.empty`)}</p>}
          </section>
        </>
      )}
      {tab === 'master' && (
        <section className={card}>
          <h2 className='text-lg font-bold'>{t(`${key}.tabs.master`)}</h2>
          <p className='mt-1 text-sm text-outline'>{t(`${key}.masterHint`)}</p>
          <div className='mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            {(['elderly', 'rehab', 'surgery', 'chronic', 'mother'] as const).map((group) => (
              <div className='rounded-lg bg-surface-container-low p-4' key={group}>
                <h3 className='font-semibold text-primary'>{t(`${key}.groups.${group}`)}</h3>
                <p className='mt-2 text-sm'>
                  {t(`${key}.masterCount`, {
                    count: servicesPreview.filter((service) => service.group === group).length
                  })}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
      {tab === 'surcharge' && (
        <section className='grid gap-4 lg:grid-cols-3'>
          {(
            [
              ['night', '+30%', 'nightlight'],
              ['holiday', '+100%', 'celebration'],
              ['senior', '+20%', 'verified_user']
            ] as const
          ).map(([name, value, icon]) => (
            <div className={card} key={name}>
              <Icon className='text-2xl text-primary' name={icon} />
              <h2 className='mt-3 font-bold'>{t(`${key}.surchargeItems.${name}`)}</h2>
              <p className='mt-3 text-2xl font-bold text-primary'>{value}</p>
            </div>
          ))}
        </section>
      )}
      <section className='grid gap-4 lg:grid-cols-3'>
        <div className={card}>
          <h2 className='font-bold'>{t(`${key}.allocation`)}</h2>
          <div className='mx-auto my-5 flex h-32 w-32 items-center justify-center rounded-full bg-[conic-gradient(#006b2c_0_45%,#62df7d_45%_75%,#d9e3f6_75%_100%)]'>
            <span className='flex h-20 w-20 items-center justify-center rounded-full bg-white text-lg font-bold'>
              {number.format(6300)}
            </span>
          </div>
          <p className='text-xs text-outline'>{t(`${key}.allocationHint`)}</p>
        </div>
        <div className={card}>
          <h2 className='font-bold'>{t(`${key}.surcharge`)}</h2>
          <ul className='mt-4 space-y-3 text-sm'>
            {(
              [
                ['night', '+30%'],
                ['holiday', '+100%'],
                ['senior', '+20%']
              ] as const
            ).map(([name, value]) => (
              <li className='flex justify-between gap-2 border-b border-outline-variant/25 pb-2' key={name}>
                <span>{t(`${key}.surchargeItems.${name}`)}</span>
                <strong className='text-primary'>{value}</strong>
              </li>
            ))}
          </ul>
        </div>
        <div className={card}>
          <h2 className='font-bold'>{t(`${key}.medical`)}</h2>
          <Icon className='my-5 text-5xl text-primary' name='health_and_safety' />
          <p className='text-sm leading-6 text-on-surface-variant'>{t(`${key}.medicalHint`)}</p>
        </div>
      </section>
      <aside className='rounded-xl bg-secondary-container/25 p-5'>
        <h2 className='font-bold text-primary'>{t(`${key}.policy`)}</h2>
        <p className='mt-2 text-sm text-on-surface-variant'>{t(`${key}.policyHint`)}</p>
      </aside>
      {selected && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-on-surface/50 p-4'
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) update('service', '')
          }}
          role='presentation'
        >
          <section
            aria-label={t(`${key}.priceDetails`)}
            aria-modal='true'
            className='w-full max-w-xl rounded-xl bg-white p-6 shadow-xl'
            role='dialog'
          >
            <div className='flex items-start justify-between gap-4'>
              <div>
                <h2 className='text-xl font-bold'>{t(`${key}.priceDetails`)}</h2>
                <p className='mt-1 text-sm text-outline'>
                  {t(`${key}.serviceNames.${selected.name}`)} · {selected.id}
                </p>
              </div>
              <button
                aria-label={t(`${key}.close`)}
                className='rounded-lg p-1 text-outline hover:bg-surface-container-low'
                onClick={() => update('service', '')}
                type='button'
              >
                <Icon name='close' />
              </button>
            </div>
            <p className='mt-4 rounded-lg bg-surface-container-low p-3 text-sm text-on-surface-variant'>
              {t(`${key}.detailHint`)}
            </p>
            <dl className='mt-4 space-y-3'>
              {selected.prices.map((price) => (
                <div className='flex justify-between border-b border-outline-variant/25 pb-3 text-sm' key={price.label}>
                  <dt>{t(`${key}.priceLabels.${price.label}`)}</dt>
                  <dd className='font-bold text-primary'>{money.format(price.amount)}</dd>
                </div>
              ))}
            </dl>
            <p className='mt-4 text-sm'>{t(`${key}.required`)}</p>
            <div className='mt-5 text-right'>
              <button
                className='rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white'
                onClick={() => update('service', '')}
                type='button'
              >
                {t(`${key}.close`)}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
