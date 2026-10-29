import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import { CenterReminder } from '~/entities/care-center/center-scope'
import { Icon } from '~/shared/ui/icon'

import type { useCustomerServices } from '../hooks/use-customer-services'
import { SERVICE_SORTS } from '../services-data'
import { ServiceCard } from './service-card'

const key = 'customer.services' as const

export function ServicesResults({ list }: { list: ReturnType<typeof useCustomerServices> }) {
  const { t } = useTranslation()
  const sortId = useId()
  const { center, rows, filtered, page, pageCount, sort, isPending, isError } = list
  const ready = !isPending && !isError
  // Without a center, a failed or empty platform-wide list asks for a center instead of reporting an error.
  const needsCenter = !center && !isPending && (isError || !rows.length) && !list.hasFilters

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-wrap items-end justify-between gap-4 border-b border-outline-variant/60 pb-5'>
        <div className='flex items-baseline gap-2 tabular-nums'>
          <strong className='text-3xl font-bold tracking-tight text-on-surface'>{ready ? filtered.length : 0}</strong>
          <span className='text-base text-on-surface-variant'>{t(`${key}.results`)}</span>
        </div>
        <div className='flex items-center gap-3'>
          <label className='text-sm font-semibold text-on-surface-variant' htmlFor={sortId}>
            {t(`${key}.sort.label`)}
          </label>
          <select
            className='min-w-48 rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/15'
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
        <div
          className='rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-10 text-center text-on-surface-variant'
          role='status'
        >
          {t(`${key}.states.loading`)}
        </div>
      ) : null}
      {needsCenter ? <CenterReminder text={t(`${key}.reminder.text`)} title={t(`${key}.reminder.title`)} /> : null}
      {isError && !needsCenter ? (
        <div
          className='rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-10 text-center'
          role='alert'
        >
          <Icon className='text-4xl text-outline' name='wifi_off' />
          <p className='mt-3 text-on-surface'>{t(`${key}.states.error`)}</p>
          <button
            className='mt-4 rounded-xl bg-primary px-5 py-2 text-sm font-bold text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
            onClick={list.retry}
            type='button'
          >
            {t(`${key}.states.retry`)}
          </button>
        </div>
      ) : null}
      {ready && !rows.length && !needsCenter ? (
        <div className='rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-10 text-center'>
          <Icon className='text-4xl text-outline' name='medical_services' />
          <p className='mt-3 text-on-surface-variant'>
            {t(list.hasFilters ? `${key}.states.noResults` : `${key}.states.empty`)}
          </p>
        </div>
      ) : null}
      {ready && rows.length ? (
        <div className='grid gap-4'>
          {rows.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      ) : null}
      {ready && filtered.length > 0 ? (
        <nav
          aria-label={t(`${key}.pagination`)}
          className='flex items-center justify-between rounded-2xl border border-outline-variant/60 bg-surface-container-lowest px-5 py-4 text-sm tabular-nums'
        >
          <button
            className='font-semibold text-primary disabled:opacity-40'
            disabled={page === 0}
            onClick={() => list.update('page', String(page - 1))}
            type='button'
          >
            {t(`${key}.previous`)}
          </button>
          <span className='text-on-surface-variant'>{t(`${key}.page`, { page: page + 1, pages: pageCount })}</span>
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
