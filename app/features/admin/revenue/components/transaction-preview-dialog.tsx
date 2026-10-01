import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '~/shared/ui/icon'
import type { RevenueTransaction } from '../revenue-preview'

const key = 'admin.revenuePage' as const

export function TransactionPreviewDialog({
  transaction,
  onClose
}: {
  transaction: RevenueTransaction
  onClose: () => void
}) {
  const { t, i18n } = useTranslation()
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    dialog.current?.showModal()
  }, [])
  const locale = i18n.resolvedLanguage ?? 'vi'
  const money = new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(transaction.amount)
  const date = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh'
  }).format(new Date(transaction.createdAt))
  const fields = [
    { label: t(`${key}.transactionId`), value: `#${transaction.id} · ${date}` },
    { label: t(`${key}.booking`), value: transaction.bookingId ? `#${transaction.bookingId}` : t(`${key}.noBooking`) },
    { label: t(`${key}.type`), value: t(`${key}.types.${transaction.type}`) },
    { label: t(`${key}.party`), value: transaction.party },
    { label: t(`${key}.method`), value: transaction.method },
    { label: t(`${key}.amount`), value: money },
    { label: t(`${key}.status`), value: t(`${key}.statuses.${transaction.status}`) }
  ]
  return (
    <dialog
      aria-labelledby='admin-transaction-title'
      className='m-auto max-h-[85vh] w-[calc(100%_-_2rem)] max-w-lg overflow-y-auto rounded-2xl bg-white p-6 text-on-surface shadow-xl backdrop:bg-on-surface/55'
      onClose={onClose}
      ref={dialog}
    >
      <div className='flex items-start justify-between gap-3'>
        <div>
          <h2 className='text-xl font-bold' id='admin-transaction-title'>
            {t(`${key}.detailTitle`, { id: transaction.id })}
          </h2>
          <p className='mt-2 text-xs text-outline'>{t(`${key}.detailHint`)}</p>
        </div>
        <button
          aria-label={t(`${key}.close`)}
          className='rounded-lg p-2 text-outline hover:bg-surface-container-low'
          onClick={() => dialog.current?.close()}
          type='button'
        >
          <Icon name='close' />
        </button>
      </div>
      <dl className='mt-6 grid gap-3 sm:grid-cols-2'>
        {fields.map((field) => (
          <div className='rounded-lg bg-surface-container-low p-3' key={field.label}>
            <dt className='text-xs text-outline'>{field.label}</dt>
            <dd className='mt-2 text-sm font-semibold'>{field.value}</dd>
          </div>
        ))}
      </dl>
      <button
        className='mt-6 w-full rounded-lg bg-primary p-3 text-sm font-semibold text-white'
        onClick={() => dialog.current?.close()}
        type='button'
      >
        {t(`${key}.close`)}
      </button>
    </dialog>
  )
}
