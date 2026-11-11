import { useTranslation } from 'react-i18next'

import { Button } from './button'

export interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (nextPage: number) => void
  ariaLabel?: string
  previousLabel?: string
  nextLabel?: string
  pageOfLabel?: string
  className?: string
  /** With a page size the bar always shows (also for one page): rows per page on the left, total beside it. */
  pageSize?: number
  pageSizeOptions?: readonly number[]
  onPageSizeChange?: (size: number) => void
  totalElements?: number
}

export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const

/** Reads `?size=` style values: only one of the offered sizes is accepted. */
export function pageSizeOf(value: string | null, fallback: number, options: readonly number[] = PAGE_SIZE_OPTIONS) {
  const size = Number(value)
  return options.includes(size) ? size : fallback
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  ariaLabel,
  previousLabel,
  nextLabel,
  pageOfLabel,
  className = '',
  pageSize,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  onPageSizeChange,
  totalElements
}: PaginationProps) {
  const { t } = useTranslation()
  const sized = pageSize !== undefined && onPageSizeChange !== undefined

  if (totalPages <= 1 && !(sized && (totalElements ?? 0) > 0)) return null

  return (
    <nav
      aria-label={ariaLabel ?? t('common.ui.pagination.label')}
      className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest px-4 py-3 text-sm shadow-xs ${className}`}
    >
      {sized ? (
        <div className='flex flex-wrap items-center gap-3 text-on-surface-variant'>
          <label className='flex items-center gap-2'>
            {t('common.ui.pagination.pageSize')}
            <select
              className='rounded-lg border border-outline-variant bg-surface-container-lowest px-2 py-1.5 text-sm text-on-surface'
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              value={pageSize}
            >
              {pageSizeOptions.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          {totalElements !== undefined ? (
            <span className='tabular-nums'>{t('common.ui.pagination.total', { count: totalElements })}</span>
          ) : null}
        </div>
      ) : null}
      <div className={`flex items-center gap-3 ${sized ? '' : 'w-full justify-between'}`}>
        <Button disabled={page <= 0} onClick={() => onPageChange(page - 1)} size='sm' variant='outline'>
          {previousLabel ?? t('common.ui.pagination.previous')}
        </Button>
        <span className='font-medium tabular-nums text-on-surface-variant'>
          {pageOfLabel ?? t('common.ui.pagination.pageOf', { page: page + 1, total: Math.max(1, totalPages) })}
        </span>
        <Button disabled={page + 1 >= totalPages} onClick={() => onPageChange(page + 1)} size='sm' variant='outline'>
          {nextLabel ?? t('common.ui.pagination.next')}
        </Button>
      </div>
    </nav>
  )
}
