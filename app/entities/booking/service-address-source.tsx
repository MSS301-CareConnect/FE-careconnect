import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { formatRecipientAddress } from '~/entities/care-recipient/care-recipient-api'
import type { RecipientAddressRecord } from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'
import { Skeleton } from '~/shared/ui/skeleton'

export type AddressSource = 'current' | 'new' | string

/**
 * Where the chosen visits move: the booking's current address, one of the person's saved addresses (customers only) or
 * another address typed below. One radio card per choice; the address book links to its tab on the person's profile.
 */
export function ServiceAddressSource({
  source,
  onPick,
  currentAddress,
  book
}: {
  source: AddressSource | null
  onPick: (source: AddressSource) => void
  currentAddress: string
  /** Absent for the center, which does not read the person's address book. */
  book?: {
    ownerName: string
    profileLink?: string
    addresses: RecipientAddressRecord[] | undefined
    loading: boolean
    failed: boolean
  }
}) {
  const { t } = useTranslation()

  return (
    <div className='flex flex-col gap-2' role='radiogroup' aria-label={t('booking.address.sourceTitle')}>
      <SourceCard
        active={source === 'current'}
        badge={t('booking.address.sourceCurrentBadge')}
        disabled={!currentAddress}
        icon='home'
        onPick={() => onPick('current')}
        text={currentAddress || t('booking.address.noCurrent')}
        title={t('booking.address.sourceCurrent')}
      />

      {book ? (
        <div className='mt-2 flex flex-col gap-2'>
          <div className='flex items-center justify-between gap-2'>
            <p className='flex items-center gap-1.5 text-xs font-semibold tracking-wide text-on-surface-variant uppercase'>
              <Icon className='text-sm' name='menu_book' />
              {t('booking.address.bookTitle', { name: book.ownerName })}
            </p>
            {book.profileLink ? (
              <Link
                className='inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-semibold text-primary hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-primary'
                to={book.profileLink}
              >
                {t('booking.address.bookManage')}
                <Icon className='text-sm' name='arrow_forward' />
              </Link>
            ) : null}
          </div>
          {book.loading ? (
            <div aria-label={t('booking.address.bookLoading')} className='flex flex-col gap-2' role='status'>
              <Skeleton className='h-16 w-full rounded-xl' />
              <Skeleton className='h-16 w-full rounded-xl' />
            </div>
          ) : null}
          {book.failed ? (
            <p className='rounded-xl bg-surface-container-low px-3 py-2.5 text-xs text-on-surface-variant' role='alert'>
              {t('booking.address.bookError')}
            </p>
          ) : null}
          {!book.loading && !book.failed && book.addresses?.length === 0 ? (
            <p className='rounded-xl border border-dashed border-outline-variant px-3 py-2.5 text-xs leading-5 text-on-surface-variant'>
              {t('booking.address.bookEmpty')}
            </p>
          ) : null}
          {(book.addresses ?? []).map((saved) => (
            <SourceCard
              active={source === saved.id}
              icon='bookmark'
              key={saved.id}
              note={saved.note}
              onPick={() => onPick(saved.id)}
              text={formatRecipientAddress(saved)}
              title={saved.label}
            />
          ))}
        </div>
      ) : null}

      <SourceCard
        active={source === 'new'}
        className='mt-2'
        dashed
        icon='add_location_alt'
        onPick={() => onPick('new')}
        text={t('booking.address.sourceNewHint')}
        title={t('booking.address.sourceNew')}
      />
    </div>
  )
}

function SourceCard({
  active,
  title,
  text,
  note,
  badge,
  icon,
  dashed = false,
  disabled = false,
  className = '',
  onPick
}: {
  active: boolean
  title: string
  text: string
  note?: string
  badge?: ReactNode
  icon: string
  dashed?: boolean
  disabled?: boolean
  className?: string
  onPick: () => void
}) {
  return (
    <button
      aria-checked={active}
      className={`group flex w-full items-start gap-3 rounded-xl border p-3 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60 ${
        active
          ? 'border-primary bg-brand-50 shadow-[inset_0_0_0_1px_var(--color-primary)]'
          : `${dashed ? 'border-dashed' : ''} border-outline-variant hover:border-brand-300 hover:bg-surface-container-low`
      } ${className}`}
      disabled={disabled}
      onClick={onPick}
      role='radio'
      type='button'
    >
      <span
        aria-hidden='true'
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${active ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'}`}
      >
        <Icon className='text-lg' name={icon} />
      </span>
      <span className='min-w-0 flex-1'>
        <span className='flex flex-wrap items-center gap-1.5 font-semibold text-on-surface'>
          {title}
          {badge ? (
            <span className='rounded-full bg-surface-container-high px-2 py-0.5 text-[0.6875rem] font-medium text-on-surface-variant'>
              {badge}
            </span>
          ) : null}
        </span>
        <span className='mt-0.5 block text-xs leading-5 text-on-surface-variant'>{text}</span>
        {note ? <span className='mt-0.5 block text-xs text-on-surface-variant italic'>{note}</span> : null}
      </span>
      <span
        aria-hidden='true'
        className={`mt-2 grid h-[1.125rem] w-[1.125rem] shrink-0 place-items-center rounded-full border-2 ${active ? 'border-primary' : 'border-outline'}`}
      >
        <span className={`h-2 w-2 rounded-full bg-primary transition-transform ${active ? 'scale-100' : 'scale-0'}`} />
      </span>
    </button>
  )
}
