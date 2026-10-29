import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

export const sectionPanel = 'rounded-2xl border border-[#dbe4db] bg-white p-5 sm:p-7'
export const tableClass = 'w-full min-w-[640px] text-left text-sm'
export const headCell = 'border-b border-[#e3eae2] px-3 py-2 font-semibold text-[#5e7063]'
export const bodyCell = 'border-b border-[#eef2ed] px-3 py-3 align-top'

/** Section frame with explicit loading / error / empty states for one payment list. */
export function PaymentListSection({
  id,
  title,
  isPending,
  error,
  isEmpty,
  emptyText,
  page,
  totalPages,
  onPageChange,
  children
}: {
  id: string
  title: string
  isPending: boolean
  error: string | null
  isEmpty: boolean
  emptyText: string
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  children: ReactNode
}) {
  const { t } = useTranslation()
  return (
    <section aria-labelledby={id} className={sectionPanel}>
      <h2 className='text-lg font-bold' id={id}>
        {title}
      </h2>
      {isPending ? (
        <p className='mt-4 text-sm text-[#637469]' role='status'>
          {t('customer.payments.loading')}
        </p>
      ) : null}
      {error ? (
        <p className='mt-4 rounded-xl bg-[#fdecea] p-3 text-sm text-[#93000a]' role='alert'>
          {error}
        </p>
      ) : null}
      {!isPending && !error && isEmpty ? <p className='mt-4 text-sm text-[#637469]'>{emptyText}</p> : null}
      {!isPending && !error && !isEmpty ? <div className='mt-4 overflow-x-auto'>{children}</div> : null}
      {totalPages > 1 ? (
        <div className='mt-4 flex items-center justify-end gap-3 text-sm'>
          <button
            className='rounded-lg border border-[#b9c9bb] px-3 py-1.5 font-semibold disabled:opacity-50'
            disabled={page === 0}
            onClick={() => onPageChange(page - 1)}
            type='button'
          >
            {t('customer.payments.previous')}
          </button>
          <span className='tabular-nums'>{t('customer.payments.page', { page: page + 1, total: totalPages })}</span>
          <button
            className='rounded-lg border border-[#b9c9bb] px-3 py-1.5 font-semibold disabled:opacity-50'
            disabled={page + 1 >= totalPages}
            onClick={() => onPageChange(page + 1)}
            type='button'
          >
            {t('customer.payments.next')}
          </button>
        </div>
      ) : null}
    </section>
  )
}
