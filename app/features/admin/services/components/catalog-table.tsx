import { useTranslation } from 'react-i18next'

import { useServiceCategoryLabel } from '~/entities/care-catalog/use-service-category-label'
import type { CatalogItemRecord } from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'

import type { useCatalogList } from '../hooks/use-catalog-list'
import { CatalogStatusBadge } from './catalog-status-badge'
import { TablePagination } from './table-pagination'

const key = 'admin.servicesPage' as const

type CatalogTableProps = {
  list: ReturnType<typeof useCatalogList>
  onView?: (item: CatalogItemRecord) => void
  onEdit: (item: CatalogItemRecord) => void
  onDelete: (item: CatalogItemRecord) => void
}

type RowActionProps = {
  icon: string
  label: string
  /** Short visible caption shown under the icon on hover / focus. */
  caption: string
  tone: 'neutral' | 'primary' | 'danger'
  onClick: () => void
}

const actionTones: Record<RowActionProps['tone'], string> = {
  neutral: 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
  primary: 'text-primary hover:bg-secondary-container/70',
  danger: 'text-error hover:bg-error-container/50'
}

/** Icon button with an instant tooltip; the accessible name stays the full action + service name. */
function RowAction({ icon, label, caption, tone, onClick }: RowActionProps) {
  return (
    <button
      aria-label={label}
      className={`group/action relative grid h-9 w-9 place-items-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-primary ${actionTones[tone]}`}
      onClick={onClick}
      type='button'
    >
      <Icon className='text-xl' name={icon} />
      <span
        aria-hidden='true'
        className='pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-on-surface px-2 py-1 text-[11px] font-semibold text-surface opacity-0 shadow-sm transition-opacity duration-150 group-hover/action:opacity-100 group-focus-visible/action:opacity-100'
      >
        {caption}
      </span>
    </button>
  )
}

export function CatalogTable({ list, onView, onEdit, onDelete }: CatalogTableProps) {
  const { t } = useTranslation()
  const categoryLabel = useServiceCategoryLabel()
  const { query, items, filtered, rows, page, pageCount, pageSize } = list
  return (
    <section className='@container overflow-hidden rounded-2xl border border-outline-variant/60 bg-white shadow-xs'>
      <div className='flex items-center justify-between gap-3 border-b border-outline-variant/40 px-4 py-3.5 sm:px-5'>
        <div className='flex items-center gap-2.5'>
          <Icon className='text-xl text-primary' name='list_alt' />
          <h2 className='text-base font-bold text-on-surface'>{t(`${key}.tabs.master`)}</h2>
        </div>
        {query.isSuccess ? (
          <span className='whitespace-nowrap rounded-full bg-secondary-container/70 px-2.5 py-0.5 text-xs font-semibold text-primary'>
            {t(`${key}.results`, { count: filtered.length })}
          </span>
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
          <table className='w-full table-fixed text-left text-sm @max-xl:block'>
            <thead className='@max-xl:hidden border-b border-outline-variant/40 bg-surface-container-low/70 text-xs font-bold uppercase tracking-wider text-on-surface-variant'>
              <tr>
                <th className='px-4 py-3 sm:pl-5' scope='col'>
                  {t(`${key}.columns.service`)}
                </th>
                <th className='hidden w-48 px-4 py-3 @3xl:table-cell' scope='col'>
                  {t(`${key}.columns.category`)}
                </th>
                <th className='w-38 px-4 py-3' scope='col'>
                  {t(`${key}.columns.status`)}
                </th>
                <th className={`${onView ? 'w-36' : 'w-28'} px-4 py-3 text-right sm:pr-5`} scope='col'>
                  {t(`${key}.columns.actions`)}
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-outline-variant/25 @max-xl:block'>
              {rows.map((item) => (
                <tr
                  className='transition-colors hover:bg-surface-container-low/40 @max-xl:flex @max-xl:flex-wrap @max-xl:items-center @max-xl:justify-between @max-xl:pb-2'
                  key={item.id}
                >
                  <td className='px-4 py-3 sm:pl-5 @max-xl:w-full @max-xl:pb-2'>
                    <div className='flex min-w-0 items-center gap-3'>
                      {item.imageUrl ? (
                        <img
                          alt={item.name}
                          className='h-11 w-11 shrink-0 rounded-xl object-cover ring-1 ring-outline-variant/60'
                          src={item.imageUrl}
                        />
                      ) : (
                        <div className='grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-secondary-container/50 text-primary'>
                          <Icon className='text-xl' name='medical_services' />
                        </div>
                      )}
                      <div className='min-w-0'>
                        <strong
                          className='block truncate text-sm font-bold leading-5 text-on-surface'
                          title={item.name}
                        >
                          {item.name}
                        </strong>
                        <p
                          className={`mt-0.5 truncate text-[13px] leading-5 ${item.description ? 'text-on-surface-variant' : 'italic text-outline'}`}
                          title={item.description || undefined}
                        >
                          {item.description || t(`${key}.noDescription`)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className='hidden px-4 py-3 @3xl:table-cell'>
                    <span className='inline-block max-w-full truncate whitespace-nowrap rounded-lg bg-surface-container-low px-2.5 py-1 align-middle text-xs font-semibold text-on-surface'>
                      {categoryLabel(item.category)}
                    </span>
                  </td>
                  <td className='px-4 py-3 @max-xl:py-0 @max-xl:pl-18 sm:@max-xl:pl-19'>
                    <CatalogStatusBadge status={item.status} />
                  </td>
                  <td className='px-4 py-3 sm:pr-5 @max-xl:py-0'>
                    <div className='flex items-center justify-end gap-0.5'>
                      {onView ? (
                        <RowAction
                          caption={t(`${key}.actionLabels.view`)}
                          icon='visibility'
                          label={`${t(`${key}.view`)}: ${item.name}`}
                          onClick={() => onView(item)}
                          tone='neutral'
                        />
                      ) : null}
                      <RowAction
                        caption={t(`${key}.actionLabels.edit`)}
                        icon='edit'
                        label={`${t(`${key}.edit`)}: ${item.name}`}
                        onClick={() => onEdit(item)}
                        tone='primary'
                      />
                      <RowAction
                        caption={t(`${key}.actionLabels.delete`)}
                        icon='delete'
                        label={`${t(`${key}.delete`)}: ${item.name}`}
                        onClick={() => onDelete(item)}
                        tone='danger'
                      />
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
        <TablePagination
          onPageChange={(next) => list.update('page', String(next))}
          onPageSizeChange={(nextSize) => list.update('size', String(nextSize))}
          page={page}
          pageCount={pageCount}
          pageSize={pageSize}
          totalCount={filtered.length}
        />
      ) : null}
    </section>
  )
}
