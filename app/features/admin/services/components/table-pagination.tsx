import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'
import { PAGE_SIZE_OPTIONS } from '../hooks/use-catalog-list'

const key = 'admin.servicesPage' as const

type TablePaginationProps = {
  page: number
  pageCount: number
  pageSize?: number
  totalCount?: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
}

/** Rich zero-based pagination bar with item counter, page size selector and page numbers. */
export function TablePagination({
  page,
  pageCount,
  pageSize = 10,
  totalCount,
  onPageChange,
  onPageSizeChange
}: TablePaginationProps) {
  const { t } = useTranslation()
  const total = totalCount ?? 0
  const from = total === 0 ? 0 : page * pageSize + 1
  const to = Math.min((page + 1) * pageSize, total)

  // Generate page numbers to display
  const pages: number[] = []
  const maxButtons = 5
  let startPage = Math.max(0, page - Math.floor(maxButtons / 2))
  const endPage = Math.min(pageCount - 1, startPage + maxButtons - 1)
  if (endPage - startPage + 1 < maxButtons) {
    startPage = Math.max(0, endPage - maxButtons + 1)
  }
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  return (
    <nav
      aria-label={t(`${key}.pagination`)}
      className='flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/30 bg-surface-container-lowest px-4 py-3 text-xs text-on-surface sm:px-5'
    >
      {/* Left: Results range summary */}
      <div className='flex flex-wrap items-center gap-3'>
        {totalCount !== undefined ? (
          <span className='font-medium text-on-surface-variant'>{t(`${key}.showing`, { from, to, total })}</span>
        ) : (
          <span className='font-semibold text-on-surface'>
            {t(`${key}.page`, { page: page + 1, pages: Math.max(1, pageCount) })}
          </span>
        )}

        {/* Page size dropdown */}
        {onPageSizeChange ? (
          <div className='flex items-center gap-1.5'>
            <select
              aria-label={t(`${key}.pageSizeLabel`)}
              className='h-8 whitespace-nowrap rounded-lg border border-outline-variant/60 bg-white pl-2.5 pr-2 text-xs font-semibold text-on-surface shadow-xs outline-none transition-colors hover:border-primary focus:border-primary'
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              value={pageSize}
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {t(`${key}.pageSize`, { size })}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>

      {/* Right: Controls & Page Pills */}
      <div className='flex items-center gap-1.5'>
        {/* Hidden/Subtle exact page string for screen readers and tests */}
        <span className='sr-only'>{t(`${key}.page`, { page: page + 1, pages: Math.max(1, pageCount) })}</span>

        {/* Previous page button */}
        <button
          className='inline-flex h-8 items-center gap-1 rounded-lg border border-outline-variant/50 bg-white px-2.5 text-xs font-semibold text-on-surface shadow-xs transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-40'
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
          type='button'
        >
          <Icon className='text-base' name='navigate_before' />
          <span>{t(`${key}.previous`)}</span>
        </button>

        {/* Numbered Page Buttons */}
        <div className='hidden items-center gap-1 sm:flex'>
          {pages.map((p) => {
            const isCurrent = p === page
            return (
              <button
                aria-current={isCurrent ? 'page' : undefined}
                className={`grid h-8 min-w-8 place-items-center rounded-lg text-xs font-bold transition-all ${
                  isCurrent
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
                key={p}
                onClick={() => onPageChange(p)}
                type='button'
              >
                {p + 1}
              </button>
            )
          })}
        </div>

        {/* Explicit text badge when single button */}
        <span className='px-1.5 font-bold tabular-nums text-on-surface sm:hidden'>
          {page + 1} / {Math.max(1, pageCount)}
        </span>

        {/* Next page button */}
        <button
          className='inline-flex h-8 items-center gap-1 rounded-lg border border-outline-variant/50 bg-white px-2.5 text-xs font-semibold text-on-surface shadow-xs transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-40'
          disabled={page + 1 >= pageCount}
          onClick={() => onPageChange(page + 1)}
          type='button'
        >
          <span>{t(`${key}.next`)}</span>
          <Icon className='text-base' name='navigate_next' />
        </button>
      </div>
    </nav>
  )
}
