import { useTranslation } from 'react-i18next'

import type { CatalogItemRecord } from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'

import type { useCatalogList } from '../hooks/use-catalog-list'
import { CatalogStatusBadge } from './catalog-status-badge'
import { TablePagination } from './table-pagination'

const key = 'admin.servicesPage' as const

type CatalogTableProps = {
  list: ReturnType<typeof useCatalogList>
  onEdit: (item: CatalogItemRecord) => void
  onDelete: (item: CatalogItemRecord) => void
}

export function CatalogTable({ list, onEdit, onDelete }: CatalogTableProps) {
  const { t } = useTranslation()
  const { query, items, filtered, rows, page, pageCount } = list
  return (
    <section className='overflow-hidden rounded-xl bg-white shadow-sm'>
      <div className='flex items-center justify-between gap-3 px-5 py-4'>
        <h2 className='text-lg font-bold'>{t(`${key}.tabs.master`)}</h2>
        {query.isSuccess ? (
          <span className='text-xs text-outline'>{t(`${key}.results`, { count: filtered.length })}</span>
        ) : null}
      </div>
      {query.isPending ? (
        <p className='p-8 text-center text-sm text-outline' role='status'>
          {t(`${key}.loading`)}
        </p>
      ) : null}
      {query.isError ? (
        <div className='p-8 text-center text-sm' role='alert'>
          <p>{t(`${key}.loadError`)}</p>
          <button className='mt-3 text-primary underline' onClick={() => void query.refetch()} type='button'>
            {t(`${key}.retry`)}
          </button>
        </div>
      ) : null}
      {query.isSuccess && rows.length > 0 ? (
        <div className='overflow-x-auto'>
          <table className='w-full min-w-[860px] text-left text-sm'>
            <thead className='bg-surface-container-low text-xs uppercase tracking-wide text-on-surface-variant'>
              <tr>
                {(['service', 'category', 'description', 'status', 'actions'] as const).map((column) => (
                  <th className='px-4 py-3' key={column} scope='col'>
                    {t(`${key}.columns.${column}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className='divide-y divide-outline-variant/25'>
              {rows.map((item) => (
                <tr className='align-top hover:bg-surface-container-low/40' key={item.id}>
                  <td className='px-4 py-4'>
                    <div className='flex items-start gap-2'>
                      <Icon
                        className='rounded-lg bg-secondary-container/35 p-2 text-2xl text-primary'
                        name='medical_services'
                      />
                      <span>
                        <strong className='block max-w-60 break-words leading-5'>{item.name}</strong>
                        <small className='mt-1 block text-outline'>{item.id}</small>
                      </span>
                    </div>
                  </td>
                  <td className='px-4 py-4'>
                    <strong className='block max-w-44 break-words text-xs'>{item.category}</strong>
                  </td>
                  <td className='px-4 py-4'>
                    <p className='line-clamp-3 max-w-md whitespace-pre-line text-xs leading-5 text-on-surface-variant'>
                      {item.description || t(`${key}.noDescription`)}
                    </p>
                  </td>
                  <td className='px-4 py-4'>
                    <CatalogStatusBadge status={item.status} />
                  </td>
                  <td className='px-4 py-4'>
                    <div className='flex gap-1'>
                      <button
                        aria-label={`${t(`${key}.edit`)}: ${item.name}`}
                        className='rounded-lg p-2 text-primary hover:bg-surface-container-low'
                        onClick={() => onEdit(item)}
                        title={t(`${key}.edit`)}
                        type='button'
                      >
                        <Icon name='tune' />
                      </button>
                      <button
                        aria-label={`${t(`${key}.delete`)}: ${item.name}`}
                        className='rounded-lg p-2 text-error hover:bg-error-container/40'
                        onClick={() => onDelete(item)}
                        title={t(`${key}.delete`)}
                        type='button'
                      >
                        <Icon name='delete' />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {query.isSuccess && !rows.length ? (
        <p className='p-8 text-center text-sm text-outline'>
          {t(items.length ? `${key}.empty` : `${key}.emptyCatalog`)}
        </p>
      ) : null}
      {query.isSuccess && filtered.length > 0 ? (
        <TablePagination onPageChange={(next) => list.update('page', String(next))} page={page} pageCount={pageCount} />
      ) : null}
    </section>
  )
}
