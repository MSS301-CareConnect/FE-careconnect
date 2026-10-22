import { useTranslation } from 'react-i18next'

const key = 'admin.servicesPage' as const

type TablePaginationProps = {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
}

/** Zero-based page controls shared by the catalog and center price tables. */
export function TablePagination({ page, pageCount, onPageChange }: TablePaginationProps) {
  const { t } = useTranslation()
  return (
    <nav
      aria-label={t(`${key}.pagination`)}
      className='flex items-center justify-between border-t border-outline-variant/25 px-5 py-3 text-sm'
    >
      <button
        className='text-primary disabled:opacity-40'
        disabled={page === 0}
        onClick={() => onPageChange(page - 1)}
        type='button'
      >
        {t(`${key}.previous`)}
      </button>
      <span>{t(`${key}.page`, { page: page + 1, pages: Math.max(1, pageCount) })}</span>
      <button
        className='text-primary disabled:opacity-40'
        disabled={page + 1 >= pageCount}
        onClick={() => onPageChange(page + 1)}
        type='button'
      >
        {t(`${key}.next`)}
      </button>
    </nav>
  )
}
