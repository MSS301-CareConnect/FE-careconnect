import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'

import { careCatalogKeys, fetchCenterOfferings } from '~/entities/care-catalog/care-catalog-api'
import { fetchCenters, providerKeys } from '~/entities/provider/provider-api'
import { Icon } from '~/shared/ui/icon'

import { CatalogStatusBadge } from './catalog-status-badge'
import { OfferingPricePlans } from './offering-price-plans'
import { TablePagination } from './table-pagination'

const key = 'admin.servicesPage.centerPricing' as const
const OFFERING_PAGE_SIZE = 10
const CENTER_OPTIONS_SIZE = 50

export function CenterPricingPanel() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const centerKeyword = params.get('centerQ') ?? ''
  const centerId = params.get('center') ?? ''
  const centers = useQuery({
    queryKey: [...providerKeys.centers, { page: 0, size: CENTER_OPTIONS_SIZE, keyword: centerKeyword.trim() }],
    queryFn: () => fetchCenters({ page: 0, size: CENTER_OPTIONS_SIZE, keyword: centerKeyword.trim() || undefined }),
    retry: false
  })
  const offerings = useQuery({
    queryKey: careCatalogKeys.centerOfferings(centerId),
    queryFn: () => fetchCenterOfferings(centerId),
    enabled: Boolean(centerId),
    retry: false
  })

  const all = offerings.data ?? []
  const pageCount = Math.max(1, Math.ceil(all.length / OFFERING_PAGE_SIZE))
  const page = Math.min(Math.max(0, Number(params.get('cpage')) || 0), pageCount - 1)
  const rows = all.slice(page * OFFERING_PAGE_SIZE, (page + 1) * OFFERING_PAGE_SIZE)
  const centerOptions = centers.data?.items ?? []

  function update(name: 'centerQ' | 'center' | 'cpage', value: string) {
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      if (value && !(name === 'cpage' && value === '0')) next.set(name, value)
      else next.delete(name)
      if (name !== 'cpage') next.delete('cpage')
      return next
    })
  }

  return (
    <>
      <section className='space-y-4 rounded-xl bg-white p-5 shadow-sm'>
        <div>
          <h2 className='text-lg font-bold'>{t(`${key}.title`)}</h2>
          <p className='mt-1 text-sm text-outline'>{t(`${key}.hint`)}</p>
        </div>
        <div className='grid gap-3 md:grid-cols-2'>
          <label className='text-xs font-semibold text-on-surface-variant'>
            {t(`${key}.centerSearch`)}
            <input
              className='mt-1 block w-full rounded-lg bg-surface-container-low p-2.5 text-sm'
              onChange={(event) => update('centerQ', event.target.value)}
              placeholder={t(`${key}.centerSearch`)}
              type='search'
              value={centerKeyword}
            />
          </label>
          <label className='text-xs font-semibold text-on-surface-variant'>
            {t(`${key}.center`)}
            <select
              className='mt-1 block w-full rounded-lg bg-surface-container-low p-2.5 text-sm'
              disabled={!centers.isSuccess}
              onChange={(event) => update('center', event.target.value)}
              value={centerId}
            >
              <option value=''>{t(`${key}.chooseCenter`)}</option>
              {centerId && !centerOptions.some((center) => center.id === centerId) ? (
                <option value={centerId}>{centerId}</option>
              ) : null}
              {centerOptions.map((center) => (
                <option key={center.id} value={center.id}>
                  {center.centerName}
                </option>
              ))}
            </select>
          </label>
        </div>
        {centers.isPending ? (
          <p className='text-xs text-outline' role='status'>
            {t(`${key}.centersLoading`)}
          </p>
        ) : null}
        {centers.isError ? (
          <p className='text-xs text-error' role='alert'>
            {t(`${key}.centersError`)}{' '}
            <button className='text-primary underline' onClick={() => void centers.refetch()} type='button'>
              {t('admin.servicesPage.retry')}
            </button>
          </p>
        ) : null}
        {centers.isSuccess && !centerOptions.length ? (
          <p className='text-xs text-outline'>{t(`${key}.noCenters`)}</p>
        ) : null}
      </section>
      <section className='overflow-hidden rounded-xl bg-white shadow-sm'>
        <div className='flex items-center justify-between gap-3 px-5 py-4'>
          <h2 className='text-lg font-bold'>{t('admin.servicesPage.tabs.center')}</h2>
          {offerings.isSuccess ? (
            <span className='text-xs text-outline'>{t(`${key}.results`, { count: all.length })}</span>
          ) : null}
        </div>
        {!centerId ? (
          <p className='flex items-center justify-center gap-2 p-8 text-center text-sm text-outline'>
            <Icon name='storefront' />
            {t(`${key}.selectPrompt`)}
          </p>
        ) : null}
        {centerId && offerings.isPending ? (
          <p className='p-8 text-center text-sm text-outline' role='status'>
            {t(`${key}.loading`)}
          </p>
        ) : null}
        {offerings.isError ? (
          <div className='p-8 text-center text-sm' role='alert'>
            <p>{t(`${key}.loadError`)}</p>
            <button className='mt-3 text-primary underline' onClick={() => void offerings.refetch()} type='button'>
              {t('admin.servicesPage.retry')}
            </button>
          </div>
        ) : null}
        {offerings.isSuccess && !all.length ? (
          <p className='p-8 text-center text-sm text-outline'>{t(`${key}.empty`)}</p>
        ) : null}
        {offerings.isSuccess && rows.length > 0 ? (
          <div className='max-h-[70vh] overflow-x-auto'>
            <table className='w-full min-w-[860px] text-left text-sm'>
              <thead className='sticky top-0 z-10 bg-surface-container-low text-xs uppercase tracking-wide text-on-surface-variant'>
                <tr>
                  {(['service', 'category', 'plans', 'status'] as const).map((column) => (
                    <th className='px-4 py-3' key={column} scope='col'>
                      {t(`${key}.columns.${column}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className='divide-y divide-outline-variant/25'>
                {rows.map((offering) => (
                  <tr className='align-top hover:bg-surface-container-low/40' key={offering.id}>
                    <td className='px-4 py-4'>
                      <strong className='block max-w-60 break-words leading-5'>{offering.catalogItem.name}</strong>
                      {offering.description ? (
                        <small className='mt-1 block max-w-60 text-outline'>{offering.description}</small>
                      ) : null}
                    </td>
                    <td className='px-4 py-4 text-xs font-semibold'>{offering.catalogItem.category}</td>
                    <td className='px-4 py-4'>
                      <OfferingPricePlans centerOfferingId={offering.id} />
                    </td>
                    <td className='px-4 py-4'>
                      <CatalogStatusBadge status={offering.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        {offerings.isSuccess && all.length > 0 ? (
          <TablePagination onPageChange={(next) => update('cpage', String(next))} page={page} pageCount={pageCount} />
        ) : null}
      </section>
    </>
  )
}
