import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import type { WalletRecord } from '~/shared/api/generated/contracts'
import { useFormat } from '~/shared/lib/format'
import { useFormErrors } from '~/shared/lib/use-form-errors'
import { toastSuccess } from '~/shared/ui/app-toast'
import { Button } from '~/shared/ui/button'
import { FormAlert } from '~/shared/ui/form-alert'
import { FormField, Input } from '~/shared/ui/form-field'
import { Icon } from '~/shared/ui/icon'
import { ConfirmDialog, Modal } from '~/shared/ui/modal'

import { requestWithdrawal, walletKeys } from './wallet-api'

type Field = 'amount' | 'bankName' | 'bankAccountNumber' | 'accountHolderName'
type FieldError =
  | 'amountRequired'
  | 'amountInvalid'
  | 'amountTooHigh'
  | 'bankNameRequired'
  | 'accountRequired'
  | 'accountInvalid'
  | 'holderRequired'
  | 'tooLong'
type Business = 'wallet.errors.e6041' | 'wallet.errors.e6052' | 'wallet.errors.e6027'

// PaymentService returns only the first validation code; the client checks every field first.
const ERROR_MAP = {
  fields: {
    6041: { field: 'amount', key: 'amountTooHigh' },
    6044: { field: 'amount', key: 'amountRequired' },
    6045: { field: 'amount', key: 'amountInvalid' },
    6046: { field: 'bankName', key: 'bankNameRequired' },
    6047: { field: 'bankAccountNumber', key: 'accountRequired' },
    6048: { field: 'bankAccountNumber', key: 'accountInvalid' },
    6049: { field: 'accountHolderName', key: 'holderRequired' }
  },
  business: { 6052: 'wallet.errors.e6052', 6027: 'wallet.errors.e6027' }
} as const satisfies Parameters<typeof useFormErrors<Field, FieldError, Business>>[0]

const ACCOUNT_PATTERN = /^[0-9]{6,20}$/
const MAX_TEXT = 100

/** Digits only: "1.500.000" or "1,500,000" typed as money still reads as 1500000. */
function parseAmount(text: string) {
  const digits = text.replace(/[.,\s]/g, '')
  return /^\d+$/.test(digits) ? Number(digits) : Number.NaN
}

/**
 * Withdraw to a bank account (centred two-column popup: form, then what the balance becomes). The amount is held as
 * soon as PaymentService accepts the request; the admin transfers it by hand.
 */
export function WithdrawalDialog({
  open,
  wallet,
  onClose
}: {
  open: boolean
  wallet: WalletRecord
  onClose: () => void
}) {
  const { t } = useTranslation()
  const { money } = useFormat()
  const queryClient = useQueryClient()
  const formRef = useRef<HTMLFormElement>(null)
  const [amount, setAmount] = useState('')
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [holder, setHolder] = useState('')
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const { fieldErrors, failure, validate, fromApi, clearField, reset } = useFormErrors<Field, FieldError, Business>(
    ERROR_MAP,
    formRef
  )
  const dirty = Boolean(amount || bankName || accountNumber || holder)
  const parsed = parseAmount(amount)
  const after = Number.isFinite(parsed) ? wallet.availableBalance - parsed : wallet.availableBalance

  const send = useMutation({
    mutationFn: () =>
      requestWithdrawal({
        amount: parsed,
        bankName: bankName.trim(),
        bankAccountNumber: accountNumber.trim(),
        accountHolderName: holder.trim()
      }),
    onSuccess: async (withdrawal) => {
      await queryClient.invalidateQueries({ queryKey: walletKeys.all })
      toastSuccess(t('wallet.form.success', { amount: money(withdrawal.amount) }))
      close()
    },
    onError: fromApi
  })

  function close() {
    setAmount('')
    setBankName('')
    setAccountNumber('')
    setHolder('')
    reset()
    onClose()
  }

  function requestClose() {
    if (send.isPending) return false
    if (dirty) {
      setConfirmDiscard(true)
      return false
    }
    return true
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    const errors: Partial<Record<Field, FieldError>> = {}
    if (!amount.trim()) errors.amount = 'amountRequired'
    else if (!Number.isInteger(parsed) || parsed <= 0) errors.amount = 'amountInvalid'
    else if (parsed > wallet.availableBalance) errors.amount = 'amountTooHigh'
    if (!bankName.trim()) errors.bankName = 'bankNameRequired'
    else if (bankName.trim().length > MAX_TEXT) errors.bankName = 'tooLong'
    if (!accountNumber.trim()) errors.bankAccountNumber = 'accountRequired'
    else if (!ACCOUNT_PATTERN.test(accountNumber.trim())) errors.bankAccountNumber = 'accountInvalid'
    if (!holder.trim()) errors.accountHolderName = 'holderRequired'
    else if (holder.trim().length > MAX_TEXT) errors.accountHolderName = 'tooLong'
    if (validate(errors)) send.mutate()
  }

  const show = (error: FieldError | undefined) => (error ? t(`wallet.form.errors.${error}`) : undefined)

  return (
    <>
      <Modal
        beforeClose={requestClose}
        description={t('wallet.form.description')}
        dismissOnBackdrop={false}
        footer={
          <>
            <Button
              disabled={send.isPending}
              onClick={() => {
                if (requestClose()) close()
              }}
              variant='outline'
            >
              {t('wallet.form.cancel')}
            </Button>
            <Button
              form='wallet-withdrawal-form'
              leftIcon={<Icon name='send' />}
              loading={send.isPending}
              type='submit'
            >
              {t('wallet.form.submit')}
            </Button>
          </>
        }
        onClose={close}
        open={open}
        size='xl'
        title={t('wallet.form.title')}
      >
        <div className='grid gap-6 md:grid-cols-[minmax(0,1fr)_16rem]'>
          <form
            className='grid gap-4 sm:grid-cols-2'
            id='wallet-withdrawal-form'
            noValidate
            onSubmit={submit}
            ref={formRef}
          >
            <FormField
              className='sm:col-span-2'
              error={show(fieldErrors.amount)}
              hint={t('wallet.form.amountHint', { amount: money(wallet.availableBalance) })}
              label={t('wallet.form.amount')}
            >
              {(control) => (
                <div className='flex gap-2'>
                  <Input
                    {...control}
                    autoComplete='off'
                    className='min-w-0 flex-1 tabular-nums'
                    inputMode='numeric'
                    onChange={(event) => {
                      setAmount(event.target.value)
                      clearField('amount')
                    }}
                    value={amount}
                  />
                  <Button
                    onClick={() => {
                      setAmount(String(Math.max(0, wallet.availableBalance)))
                      clearField('amount')
                    }}
                    type='button'
                    variant='outline'
                  >
                    {t('wallet.form.withdrawAll')}
                  </Button>
                </div>
              )}
            </FormField>
            <FormField error={show(fieldErrors.bankName)} label={t('wallet.form.bankName')}>
              {(control) => (
                <Input
                  {...control}
                  maxLength={MAX_TEXT}
                  onChange={(event) => {
                    setBankName(event.target.value)
                    clearField('bankName')
                  }}
                  placeholder={t('wallet.form.bankNamePlaceholder')}
                  value={bankName}
                />
              )}
            </FormField>
            <FormField error={show(fieldErrors.bankAccountNumber)} label={t('wallet.form.bankAccountNumber')}>
              {(control) => (
                <Input
                  {...control}
                  autoComplete='off'
                  inputMode='numeric'
                  maxLength={20}
                  onChange={(event) => {
                    setAccountNumber(event.target.value)
                    clearField('bankAccountNumber')
                  }}
                  value={accountNumber}
                />
              )}
            </FormField>
            <FormField
              className='sm:col-span-2'
              error={show(fieldErrors.accountHolderName)}
              hint={t('wallet.form.accountHolderHint')}
              label={t('wallet.form.accountHolderName')}
            >
              {(control) => (
                <Input
                  {...control}
                  maxLength={MAX_TEXT}
                  onChange={(event) => {
                    setHolder(event.target.value)
                    clearField('accountHolderName')
                  }}
                  value={holder}
                />
              )}
            </FormField>
            {failure ? (
              <FormAlert
                actionLabel={failure.kind === 'system' ? t('common.ui.retry') : undefined}
                className='sm:col-span-2'
                onAction={failure.kind === 'system' ? () => send.mutate() : undefined}
                tone={failure.kind === 'system' ? 'error' : 'warning'}
              >
                {t(failure.key)}
              </FormAlert>
            ) : null}
          </form>
          <aside className='h-fit rounded-2xl bg-surface-container-low p-4 text-sm'>
            <p className='font-semibold text-on-surface'>{t('wallet.form.summary')}</p>
            <dl className='mt-3 space-y-2'>
              <div className='flex justify-between gap-3'>
                <dt className='text-on-surface-variant'>{t('wallet.form.summaryAvailable')}</dt>
                <dd className={`font-bold tabular-nums ${after < 0 ? 'text-error' : 'text-on-surface'}`}>
                  {money(after)}
                </dd>
              </div>
              <div className='flex justify-between gap-3'>
                <dt className='text-on-surface-variant'>{t('wallet.form.summaryHeld')}</dt>
                <dd className='font-bold tabular-nums text-on-surface'>
                  {money(wallet.heldBalance + (Number.isFinite(parsed) && parsed > 0 ? parsed : 0))}
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </Modal>
      <ConfirmDialog
        cancelLabel={t('common.ui.keepEditing')}
        confirmLabel={t('common.ui.discard')}
        description={t('common.ui.unsavedDescription')}
        onClose={() => setConfirmDiscard(false)}
        onConfirm={() => {
          setConfirmDiscard(false)
          close()
        }}
        open={confirmDiscard}
        title={t('common.ui.unsavedTitle')}
        tone='danger'
      />
    </>
  )
}
