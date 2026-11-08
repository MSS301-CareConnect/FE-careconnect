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
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  ariaLabel,
  previousLabel,
  nextLabel,
  pageOfLabel,
  className = ''
}: PaginationProps) {
  const { t } = useTranslation()

  if (totalPages <= 1) return null

  return (
    <nav
      aria-label={ariaLabel ?? t('common.ui.pagination.label')}
      className={`flex items-center justify-between gap-3 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest px-4 py-3 text-sm shadow-xs ${className}`}
    >
      <Button disabled={page <= 0} onClick={() => onPageChange(page - 1)} size='sm' variant='outline'>
        {previousLabel ?? t('common.ui.pagination.previous')}
      </Button>
      <span className='font-medium tabular-nums text-on-surface-variant'>
        {pageOfLabel ?? t('common.ui.pagination.pageOf', { page: page + 1, total: totalPages })}
      </span>
      <Button disabled={page + 1 >= totalPages} onClick={() => onPageChange(page + 1)} size='sm' variant='outline'>
        {nextLabel ?? t('common.ui.pagination.next')}
      </Button>
    </nav>
  )
}
