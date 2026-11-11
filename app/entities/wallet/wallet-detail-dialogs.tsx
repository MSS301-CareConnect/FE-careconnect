import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { useCenterNames } from '~/entities/provider/use-provider-names'
import type { WalletTransactionRecord, WalletWithdrawalRecord } from '~/shared/api/generated/contracts'
import { useFormat } from '~/shared/lib/format'
import { Button } from '~/shared/ui/button'
import { CopyButton } from '~/shared/ui/copy-button'
import { Icon } from '~/shared/ui/icon'
import { Modal } from '~/shared/ui/modal'

import { transactionSign, WithdrawalStatusBadge } from './wallet-labels'

const key = 'wallet.detail' as const

type WithdrawalStep = 'sent' | 'waiting' | 'transferred' | 'rejected'

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className='flex items-start justify-between gap-4 py-2.5'>
      <dt className='shrink-0 text-on-surface-variant'>{label}</dt>
      <dd className='min-w-0 text-right font-semibold break-words text-on-surface'>{children}</dd>
    </div>
  )
}

function CloseFooter({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  return (
    <Button onClick={onClose} variant='outline'>
      {t(`${key}.close`)}
    </Button>
  )
}

/**
 * One ledger movement (2026-11-11): signed amount, type, time, balance and held amount before → after, the center that
 * produced the money and a link to its booking. Machine notes are never shown; a payout shows its transfer reference.
 */
export function WalletTransactionDetailDialog({
  transaction,
  bookingHref,
  onClose
}: {
  transaction: WalletTransactionRecord
  bookingHref?: (bookingId: string) => string
  onClose: () => void
}) {
  const { t } = useTranslation()
  const { money, dateTime } = useFormat()
  const centerName = useCenterNames([transaction.centerId ?? undefined])
  const sign = transactionSign(transaction.type)
  const heldMoved = transaction.heldBefore !== transaction.heldAfter
  const transferReference = transaction.type === 'WITHDRAWAL_PAID' ? transaction.note : null

  return (
    <Modal
      footer={<CloseFooter onClose={onClose} />}
      onClose={onClose}
      open
      size='md'
      title={t(`${key}.transactionTitle`)}
    >
      <div className='space-y-4 text-sm'>
        <div className='flex flex-col items-center gap-2 rounded-3xl bg-surface-container-low px-4 py-5 text-center'>
          <span
            aria-hidden='true'
            className={`grid h-12 w-12 place-items-center rounded-full ${sign > 0 ? 'bg-mint-100 text-forest-700' : 'bg-peach-100 text-peach-700'}`}
          >
            <Icon className='text-2xl' name={sign > 0 ? 'south_west' : 'north_east'} />
          </span>
          <p className='font-semibold text-on-surface'>{t(`wallet.types.${transaction.type}`)}</p>
          <p
            className={`text-3xl font-extrabold tracking-tight tabular-nums ${sign > 0 ? 'text-mint-500' : 'text-forest-950'}`}
          >
            {sign > 0 ? '+' : '−'}
            {money(transaction.amount)}
          </p>
          <p className='text-xs text-on-surface-variant'>
            {t(sign > 0 ? 'wallet.transactions.moneyIn' : 'wallet.transactions.moneyOut')}
          </p>
        </div>
        <dl className='divide-y divide-outline-variant/60'>
          <Row label={t(`${key}.time`)}>
            <time dateTime={transaction.createdAt}>{dateTime(transaction.createdAt)}</time>
          </Row>
          <Row label={t(`${key}.available`)}>
            <span className='tabular-nums'>
              {t(`${key}.change`, {
                before: money(transaction.availableBefore),
                after: money(transaction.availableAfter)
              })}
            </span>
          </Row>
          {heldMoved ? (
            <Row label={t(`${key}.held`)}>
              <span className='tabular-nums'>
                {t(`${key}.change`, { before: money(transaction.heldBefore), after: money(transaction.heldAfter) })}
              </span>
            </Row>
          ) : null}
          {transaction.centerId ? <Row label={t(`${key}.center`)}>{centerName(transaction.centerId)}</Row> : null}
          {transferReference ? (
            <Row label={t(`${key}.transferReference`)}>
              <span className='inline-flex items-center gap-1 tabular-nums'>
                {transferReference}
                <CopyButton compact value={transferReference} />
              </span>
            </Row>
          ) : null}
          {transaction.bookingId && bookingHref ? (
            <Row label={t(`${key}.booking`)}>
              <Link className='text-primary hover:underline' to={bookingHref(transaction.bookingId)}>
                {t('wallet.transactions.viewBooking')}
              </Link>
            </Row>
          ) : null}
          <Row label={t(`${key}.transactionId`)}>
            <span className='inline-flex items-center gap-1 font-mono text-xs'>
              {transaction.id.slice(0, 8).toUpperCase()}
              <CopyButton compact value={transaction.id} />
            </span>
          </Row>
        </dl>
      </div>
    </Modal>
  )
}

/**
 * The owner's own withdrawal request (2026-11-11): amount and state, a timeline (sent → transferred / rejected), the
 * bank account, who handles it, the transfer reference or the rejection reason.
 */
export function WalletWithdrawalDetailDialog({
  withdrawal,
  onClose
}: {
  withdrawal: WalletWithdrawalRecord
  onClose: () => void
}) {
  const { t } = useTranslation()
  const { money, dateTime } = useFormat()
  const centerName = useCenterNames([withdrawal.centerId ?? undefined])
  const handler = withdrawal.centerId
    ? t('wallet.review.handledByCenter', { name: centerName(withdrawal.centerId) })
    : t('wallet.review.handledByAdmin')
  const open = withdrawal.status === 'PENDING' || withdrawal.status === 'APPROVED'
  const steps: { id: WithdrawalStep; icon: string; time?: string; done: boolean }[] = [
    { id: 'sent', icon: 'outbox', time: withdrawal.createdAt, done: true },
    open
      ? { id: 'waiting', icon: 'hourglass_top', time: undefined, done: false }
      : withdrawal.status === 'REJECTED'
        ? { id: 'rejected', icon: 'block', time: withdrawal.reviewedAt ?? undefined, done: true }
        : { id: 'transferred', icon: 'task_alt', time: withdrawal.completedAt ?? undefined, done: true }
  ]

  return (
    <Modal
      footer={<CloseFooter onClose={onClose} />}
      onClose={onClose}
      open
      size='md'
      title={t(`${key}.withdrawalTitle`)}
    >
      <div className='space-y-4 text-sm'>
        <div className='flex flex-col items-center gap-2 rounded-3xl bg-surface-container-low px-4 py-5 text-center'>
          <p className='text-3xl font-extrabold tracking-tight text-forest-950 tabular-nums'>
            {money(withdrawal.amount)}
          </p>
          <WithdrawalStatusBadge status={withdrawal.status} />
          {open ? <p className='text-xs text-on-surface-variant'>{t(`${key}.heldNote`)}</p> : null}
        </div>

        <ol className='space-y-3'>
          {steps.map((step) => (
            <li className='flex items-start gap-3' key={step.id}>
              <span
                aria-hidden='true'
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                  step.id === 'rejected'
                    ? 'bg-error-container text-error'
                    : step.done
                      ? 'bg-forest-900 text-mint-300'
                      : 'bg-peach-100 text-peach-700'
                }`}
              >
                <Icon className='text-base' name={step.icon} />
              </span>
              <div>
                <p className='font-semibold text-on-surface'>{t(`${key}.steps.${step.id}`)}</p>
                {step.time ? <p className='text-xs text-on-surface-variant'>{dateTime(step.time)}</p> : null}
                {step.id === 'waiting' ? (
                  <p className='text-xs text-on-surface-variant'>{t(`${key}.waitingHint`, { handler })}</p>
                ) : null}
                {step.id === 'rejected' && withdrawal.rejectReason ? (
                  <p className='text-xs text-error'>
                    {t('wallet.withdrawals.rejectReason', { reason: withdrawal.rejectReason })}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>

        <dl className='divide-y divide-outline-variant/60'>
          <Row label={t('wallet.withdrawals.bank')}>{withdrawal.bankName}</Row>
          <Row label={t('wallet.withdrawals.account')}>
            <span className='tabular-nums'>{withdrawal.bankAccountNumber}</span>
          </Row>
          <Row label={t('wallet.form.accountHolderName')}>{withdrawal.accountHolderName}</Row>
          <Row label={t('wallet.review.handledBy')}>{handler}</Row>
          {withdrawal.transferReference ? (
            <Row label={t(`${key}.transferReference`)}>
              <span className='inline-flex items-center gap-1 tabular-nums'>
                {withdrawal.transferReference}
                <CopyButton compact value={withdrawal.transferReference} />
              </span>
            </Row>
          ) : null}
        </dl>
      </div>
    </Modal>
  )
}
