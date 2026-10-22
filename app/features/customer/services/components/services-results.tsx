import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'

import type { useCustomerServices } from '../hooks/use-customer-services'
import { SERVICE_SORTS, type CustomerService } from '../services-data'
import { ServiceCard } from './service-card'

const key = 'customer.services' as const

/** Consecutive services of the same center, so a center-sorted page reads as one section per center. */
function groupByCenter(services: readonly CustomerService[]) {
  const groups: { centerId: string | undefined; centerName: string | undefined; services: CustomerService[] }[] = []
  for (const service of services) {
    const last = groups.at(-1)
    if (last && last.centerId === service.center?.id) last.services.push(service)
    else groups.push({ centerId: service.center?.id, centerName: service.center?.name, services: [service] })
  }
  return groups
}

export function ServicesResults({ list }: { list: ReturnType<typeof useCustomerServices> }) {
  const { t } = useTranslation()
  const sortId = useId()
  const { rows, filtered, page, pageCount, sort, isPending, isError } = list
  const ready = !isPending && !isError
  const groups = sort === 'center' ? groupByCenter(rows) : [{ centerId: 'all', centerName: undefined, services: rows }]

  return (
    <div className='flex flex-col gap-6 lg:col-span-8'>
      <div className='flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-surface-container-lowest p-4 shadow-sm'>
        <div>
          <strong className='text-2xl'>{ready ? filtered.length : 0}</strong>{' '}
          <span className='text-sm text-on-surface-variant'>{t(`${key}.results`)}</span>
        </div>
        <div className='flex items-center gap-2'>
          <label className='text-sm font-semibold text-on-surface-variant' htmlFor={sortId}>
            {t(`${key}.sort.label`)}
          </label>
          <select
            className='rounded-xl bg-surface-container-low px-4 py-2.5 text-sm'
            id={sortId}
            onChange={(event) => list.update('sort', event.target.value)}
            value={sort}
          >
            {SERVICE_SORTS.map((option) => (
              <option key={option} value={option}>
                {t(`${key}.sort.${option}`)}
              </option>
            ))}
          </select>
        </div>
      </div>
      {isPending ? (
        <div className='rounded-2xl bg-white p-10 text-center shadow-sm' role='status'>
          {t(`${key}.states.loading`)}
        </div>
      ) : null}
      {isError ? (
        <div className='rounded-2xl bg-white p-10 text-center shadow-sm' role='alert'>
          <Icon className='text-4xl text-outline' name='wifi_off' />
          <p className='mt-3'>{t(`${key}.states.error`)}</p>
          <button
            className='mt-4 rounded-xl bg-primary px-5 py-2 text-sm font-bold text-white'
            onClick={list.retry}
            type='button'
          >
            {t(`${key}.states.retry`)}
          </button>
        </div>
      ) : null}
      {ready && list.hasPartialError ? (
        <div
          className='flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-secondary-container/40 p-4 text-sm'
          role='status'
        >
          <span className='flex items-center gap-2 text-on-surface-variant'>
            <Icon className='text-primary' name='info' />
            {t(`${key}.states.partial`)}
          </span>
          <button className='font-semibold text-primary' onClick={list.retry} type='button'>
            {t(`${key}.states.retry`)}
          </button>
        </div>
      ) : null}
      {ready && !rows.length ? (
        <div className='rounded-2xl bg-white p-10 text-center shadow-sm'>
          <Icon className='text-4xl text-outline' name='medical_services' />
          <p className='mt-3'>{t(list.hasFilters ? `${key}.states.noResults` : `${key}.states.empty`)}</p>
        </div>
      ) : null}
      {ready && rows.length
        ? groups.map((group) => (
            <section
              aria-label={sort === 'center' ? (group.centerName ?? t(`${key}.unassignedGroup`)) : undefined}
              className='flex flex-col gap-4'
              key={`${group.centerId ?? 'none'}-${group.services[0].id}`}
            >
              {sort === 'center' ? (
                <h2 className='flex items-center gap-2 text-base font-bold text-on-surface'>
                  <Icon className='text-primary' name={group.centerName ? 'home_health' : 'schedule'} />
                  {group.centerName ?? t(`${key}.unassignedGroup`)}
                  <span className='text-xs font-medium text-outline'>
                    {t(`${key}.groupCount`, { count: group.services.length })}
                  </span>
                </h2>
              ) : null}
              <div className='grid gap-6 md:grid-cols-2'>
                {group.services.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            </section>
          ))
        : null}
      {ready && filtered.length > 0 ? (
        <nav
          aria-label={t(`${key}.pagination`)}
          className='flex items-center justify-between rounded-2xl bg-white p-4 text-sm shadow-sm'
        >
          <button
            className='font-semibold text-primary disabled:opacity-40'
            disabled={page === 0}
            onClick={() => list.update('page', String(page - 1))}
            type='button'
          >
            {t(`${key}.previous`)}
          </button>
          <span>{t(`${key}.page`, { page: page + 1, pages: pageCount })}</span>
          <button
            className='font-semibold text-primary disabled:opacity-40'
            disabled={page + 1 >= pageCount}
            onClick={() => list.update('page', String(page + 1))}
            type='button'
          >
            {t(`${key}.next`)}
          </button>
        </nav>
      ) : null}
    </div>
  )
}
