import { useTranslation } from 'react-i18next'

const ICON_CHEVRON_LEFT = 'chevron_left'
const ICON_CHEVRON_RIGHT = 'chevron_right'
const ELLIPSIS = '...'

const PAGES = [1, 2, 3]
const LAST_PAGE = 6

interface CaregiversPaginationProps {
  currentPage: number
  onPageChange: (page: number) => void
  totalPages?: number
  totalElements?: number
}

export function CaregiversPagination({
  currentPage,
  onPageChange,
  totalPages,
  totalElements
}: CaregiversPaginationProps) {
  const { t } = useTranslation()
  const lastPage = totalPages ?? LAST_PAGE
  const pages = totalPages ? Array.from({ length: Math.min(totalPages, 5) }, (_, index) => index + 1) : PAGES

  return (
    <div className='flex flex-col items-center justify-between gap-4 rounded-2xl bg-surface-container-lowest p-4 shadow-sm sm:flex-row'>
      <span className='text-xs text-on-surface-variant sm:text-sm'>
        {totalElements === undefined
          ? t('customer.caregivers.results.paginationText')
          : t('customer.provider.pageSummary', {
              page: currentPage,
              pages: Math.max(1, lastPage),
              total: totalElements
            })}
      </span>

      <div className='flex items-center gap-1.5'>
        <button
          aria-label={t('customer.caregivers.results.prevPage')}
          className='flex h-9 w-9 items-center justify-center rounded-xl bg-surface-container-low text-outline opacity-50 transition-colors disabled:cursor-not-allowed'
          disabled={currentPage === 1}
          type='button'
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        >
          <span className='material-symbols-outlined text-[20px]'>{ICON_CHEVRON_LEFT}</span>
        </button>

        {pages.map((p) => {
          const isActive = currentPage === p
          return (
            <button
              key={p}
              className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-semibold transition-colors sm:text-sm ${
                isActive
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
              }`}
              type='button'
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          )
        })}

        {lastPage > pages.length ? <span className='px-1.5 text-xs text-outline'>{ELLIPSIS}</span> : null}

        {lastPage > pages.length ? (
          <button
            className='flex h-9 w-9 items-center justify-center rounded-xl bg-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container-high sm:text-sm'
            type='button'
            onClick={() => onPageChange(lastPage)}
          >
            {lastPage}
          </button>
        ) : null}

        <button
          aria-label={t('customer.caregivers.results.nextPage')}
          className='flex h-9 w-9 items-center justify-center rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high disabled:opacity-40'
          disabled={currentPage >= lastPage}
          type='button'
          onClick={() => onPageChange(Math.min(lastPage, currentPage + 1))}
        >
          <span className='material-symbols-outlined text-[20px]'>{ICON_CHEVRON_RIGHT}</span>
        </button>
      </div>
    </div>
  )
}
