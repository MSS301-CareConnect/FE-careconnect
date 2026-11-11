import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QRCodeSVG } from 'qrcode.react'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import type { WalletWithdrawalRecord } from '~/shared/api/generated/contracts'
import { useFormat } from '~/shared/lib/format'
import { Button } from '~/shared/ui/button'
import { CopyButton } from '~/shared/ui/copy-button'
import { FormAlert } from '~/shared/ui/form-alert'
import { FormField, Input, Select } from '~/shared/ui/form-field'
import { Icon } from '~/shared/ui/icon'
import { OtpInput } from '~/shared/ui/otp-input'
import { Skeleton } from '~/shared/ui/skeleton'

import { VIET_QR_BANKS, findVietQrBank, vietQrPayload } from './viet-qr'
import { WithdrawalStatusBadge } from './wallet-labels'
import { fetchWithdrawal, transferWithdrawal, walletErrorKey, walletKeys } from './wallet-api'

// shortcut: sandbox source account and OTP are fixed and checked in the browser; PaymentService only records the
// simulated transfer. Replace with a real payout provider before handling real money.
const SANDBOX = { bank: 'NCB', account: '9704198526191432198', holder: 'NGUYEN VAN A', otp: '123456' } as const
const OPEN_STATUSES = new Set(['PENDING', 'APPROVED'])
const key = 'wallet.sandbox' as const

type Step = 'source' | 'otp' | 'done'

/**
 * Simulated bank gateway for one withdrawal (2026-11-11), opened from the review dialog of `/center-manager/withdrawals`
 * or `/admin/withdrawals`: the handler picks a source account (the sandbox test account), confirms with the sandbox OTP,
 * then PaymentService completes the request (`POST /wallet-withdrawals/{id}/transfers`). The right column shows the
 * payee and a VietQR code of the payee account built in the browser, readable by any Vietnamese banking app.
 */
export function SimulatedTransferPage({ withdrawalId, queueHref }: { withdrawalId: string; queueHref: string }) {
  const { t } = useTranslation()
  const { money, dateTime } = useFormat()
  const queryClient = useQueryClient()
  const [step, setStep] = useState<Step>('source')
  const [source, setSource] = useState({ bank: '', account: '', holder: '' })
  const [otp, setOtp] = useState('')
  const [errors, setErrors] = useState<Partial<Record<'bank' | 'account' | 'holder' | 'otp', string>>>({})
  const withdrawal = useQuery({
    queryKey: walletKeys.withdrawal(withdrawalId),
    queryFn: () => fetchWithdrawal(withdrawalId),
    retry: false
  })
  const transfer = useMutation({
    mutationFn: () => transferWithdrawal(withdrawalId),
    onSuccess: async (result) => {
      queryClient.setQueryData(walletKeys.withdrawal(withdrawalId), (previous?: WalletWithdrawalRecord) => ({
        ...previous,
        ...result
      }))
      setStep('done')
      await queryClient.invalidateQueries({ queryKey: walletKeys.all })
    }
  })
  const backHref = `${queueHref}?withdrawal=${withdrawalId}`

  if (withdrawal.isPending) {
    return <Skeleton className='mx-auto h-96 w-full max-w-5xl rounded-3xl' />
  }
  if (withdrawal.isError) {
    return (
      <div className='mx-auto max-w-xl space-y-3'>
        <FormAlert tone='warning'>{t(walletErrorKey(withdrawal.error))}</FormAlert>
        <Link className='text-sm font-semibold text-primary underline' to={queueHref}>
          {t(`${key}.backToQueue`)}
        </Link>
      </div>
    )
  }
  const data = withdrawal.data
  const bank = findVietQrBank(data.bankName)
  const purpose = t(`${key}.purpose`, { code: data.id.slice(0, 8).toUpperCase() })
  const open = OPEN_STATUSES.has(data.status)

  function submitSource(event: FormEvent) {
    event.preventDefault()
    const next: typeof errors = {}
    if (!source.bank) next.bank = t(`${key}.errors.bankRequired`)
    if (!source.account.trim()) next.account = t(`${key}.errors.accountRequired`)
    else if (source.account.replace(/\s/g, '') !== SANDBOX.account) next.account = t(`${key}.errors.accountInvalid`)
    if (!source.holder.trim()) next.holder = t(`${key}.errors.holderRequired`)
    else if (source.holder.trim().toUpperCase() !== SANDBOX.holder) next.holder = t(`${key}.errors.holderInvalid`)
    setErrors(next)
    if (Object.keys(next).length === 0) setStep('otp')
  }

  function submitOtp(event: FormEvent) {
    event.preventDefault()
    if (otp !== SANDBOX.otp) {
      setErrors({ otp: t(otp.length === 6 ? `${key}.errors.otpInvalid` : `${key}.errors.otpRequired`) })
      return
    }
    setErrors({})
    transfer.mutate()
  }

  const steps: Step[] = ['source', 'otp', 'done']

  return (
    <div className='mx-auto max-w-5xl space-y-4'>
      <header className='flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-forest-900 px-5 py-4 text-white'>
        <div className='flex items-center gap-3'>
          <span
            aria-hidden='true'
            className='grid h-10 w-10 place-items-center rounded-full bg-mint-300 text-forest-950'
          >
            <Icon name='account_balance' />
          </span>
          <div>
            <p className='text-base font-bold'>{t(`${key}.gateway`)}</p>
            <p className='text-xs text-white/70'>{t(`${key}.gatewayHint`)}</p>
          </div>
          <span className='rounded-full bg-peach-200 px-2.5 py-0.5 text-xs font-bold text-forest-950 uppercase'>
            {t(`${key}.badge`)}
          </span>
        </div>
        <span className='inline-flex items-center gap-1.5 text-xs text-white/80'>
          <Icon className='text-base' name='lock' />
          {t(`${key}.secure`)}
        </span>
      </header>

      <div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]'>
        <section className='rounded-3xl border border-outline-variant/60 bg-surface-container-lowest p-5 sm:p-6'>
          <ol className='mb-5 flex flex-wrap gap-2 text-xs font-semibold'>
            {steps.map((item, index) => (
              <li
                aria-current={item === step ? 'step' : undefined}
                className={`rounded-full px-3 py-1 ${item === step ? 'bg-forest-900 text-white' : 'bg-surface-container-low text-on-surface-variant'}`}
                key={item}
              >
                {index + 1}. {t(`${key}.steps.${item}`)}
              </li>
            ))}
          </ol>

          {!open && step !== 'done' ? (
            <div className='space-y-3 text-sm'>
              <div className='flex items-center gap-2'>
                <WithdrawalStatusBadge status={data.status} />
                <p className='font-semibold text-on-surface'>{t(`${key}.closed`)}</p>
              </div>
              <Link className='font-semibold text-primary underline' to={backHref}>
                {t(`${key}.backToQueue`)}
              </Link>
            </div>
          ) : null}

          {open && step === 'source' ? (
            <form className='space-y-4' noValidate onSubmit={submitSource}>
              <div className='rounded-2xl border border-dashed border-peach-300 bg-peach-50 p-4 text-sm'>
                <p className='font-semibold text-forest-950'>{t(`${key}.testAccount`)}</p>
                <p className='mt-1 text-on-surface-variant tabular-nums'>
                  {SANDBOX.bank} · {SANDBOX.account} · {SANDBOX.holder} · {t(`${key}.otpLabel`)} {SANDBOX.otp}
                </p>
                <Button
                  className='mt-2'
                  onClick={() => {
                    setSource({ bank: SANDBOX.bank, account: SANDBOX.account, holder: SANDBOX.holder })
                    setErrors({})
                  }}
                  size='sm'
                  variant='outline'
                >
                  {t(`${key}.useTestAccount`)}
                </Button>
              </div>
              <FormField error={errors.bank} label={t(`${key}.sourceBank`)}>
                {(control) => (
                  <Select
                    {...control}
                    onChange={(event) => setSource({ ...source, bank: event.target.value })}
                    value={source.bank}
                  >
                    <option value=''>{t(`${key}.chooseBank`)}</option>
                    {VIET_QR_BANKS.map((item) => (
                      <option key={item.bin} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </Select>
                )}
              </FormField>
              <div className='grid gap-4 sm:grid-cols-2'>
                <FormField error={errors.account} label={t(`${key}.sourceAccount`)}>
                  {(control) => (
                    <Input
                      {...control}
                      autoComplete='off'
                      inputMode='numeric'
                      onChange={(event) => setSource({ ...source, account: event.target.value })}
                      value={source.account}
                    />
                  )}
                </FormField>
                <FormField error={errors.holder} label={t(`${key}.sourceHolder`)}>
                  {(control) => (
                    <Input
                      {...control}
                      autoComplete='off'
                      onChange={(event) => setSource({ ...source, holder: event.target.value })}
                      value={source.holder}
                    />
                  )}
                </FormField>
              </div>
              <div className='flex flex-wrap justify-end gap-2'>
                <Link
                  className='inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low'
                  to={backHref}
                >
                  {t(`${key}.cancel`)}
                </Link>
                <Button type='submit' variant='accent'>
                  {t(`${key}.continue`)}
                </Button>
              </div>
            </form>
          ) : null}

          {open && step === 'otp' ? (
            <form className='space-y-5' noValidate onSubmit={submitOtp}>
              <div className='flex flex-col items-center gap-4 rounded-3xl bg-surface-container-low px-4 py-6 text-center'>
                <span
                  aria-hidden='true'
                  className='grid h-12 w-12 place-items-center rounded-full bg-forest-900 text-mint-300'
                >
                  <Icon className='text-2xl' name='sms' />
                </span>
                <div className='space-y-1'>
                  <p className='text-base font-bold text-on-surface'>{t(`${key}.otpTitle`)}</p>
                  <p className='mx-auto max-w-sm text-sm text-on-surface-variant'>
                    {t(`${key}.otpHint`, { account: `••••${SANDBOX.account.slice(-4)}` })}
                  </p>
                </div>
                <FormField
                  className='flex flex-col items-center [&>label]:sr-only'
                  error={errors.otp}
                  label={t(`${key}.otpLabel`)}
                >
                  {(control) => (
                    <OtpInput
                      {...control}
                      autoFocus
                      onChange={(next) => {
                        setOtp(next)
                        setErrors({})
                      }}
                      value={otp}
                    />
                  )}
                </FormField>
                <p className='rounded-full bg-peach-100 px-3 py-1 text-xs font-semibold text-forest-950'>
                  {t(`${key}.otpSandbox`, { otp: SANDBOX.otp })}
                </p>
              </div>
              {transfer.isError ? <FormAlert tone='warning'>{t(walletErrorKey(transfer.error))}</FormAlert> : null}
              <div className='flex flex-wrap justify-end gap-2'>
                <Button disabled={transfer.isPending} onClick={() => setStep('source')} variant='outline'>
                  {t(`${key}.back`)}
                </Button>
                <Button
                  leftIcon={<Icon name='send_money' />}
                  loading={transfer.isPending}
                  type='submit'
                  variant='accent'
                >
                  {transfer.isPending
                    ? t('wallet.review.transferring')
                    : t('wallet.review.transferConfirm', { amount: money(data.amount) })}
                </Button>
              </div>
            </form>
          ) : null}

          {step === 'done' ? (
            <div className='space-y-4 text-center'>
              <span
                aria-hidden='true'
                className='mx-auto grid h-16 w-16 place-items-center rounded-full bg-success-container text-success'
              >
                <Icon className='text-4xl' name='check_circle' />
              </span>
              <div>
                <p className='text-lg font-bold text-on-surface'>{t(`${key}.success`)}</p>
                <p className='mt-1 text-3xl font-extrabold tracking-tight text-forest-950 tabular-nums'>
                  {money(data.amount)}
                </p>
              </div>
              <dl className='mx-auto max-w-sm space-y-1.5 rounded-2xl bg-surface-container-low p-4 text-left text-sm'>
                {data.transferReference ? (
                  <div className='flex items-center justify-between gap-3'>
                    <dt className='text-on-surface-variant'>{t(`${key}.reference`)}</dt>
                    <dd className='flex items-center gap-1 font-semibold tabular-nums'>
                      {data.transferReference}
                      <CopyButton compact value={data.transferReference} />
                    </dd>
                  </div>
                ) : null}
                {data.completedAt ? (
                  <div className='flex justify-between gap-3'>
                    <dt className='text-on-surface-variant'>{t(`${key}.time`)}</dt>
                    <dd className='font-semibold tabular-nums'>{dateTime(data.completedAt)}</dd>
                  </div>
                ) : null}
              </dl>
              <p className='text-xs text-on-surface-variant'>{t(`${key}.notified`)}</p>
              <Link
                className='inline-flex min-h-11 items-center rounded-full bg-forest-900 px-5 text-sm font-semibold text-white hover:bg-forest-800'
                to={queueHref}
              >
                {t(`${key}.backToQueue`)}
              </Link>
            </div>
          ) : null}
        </section>

        <aside className='space-y-4 rounded-3xl border border-outline-variant/60 bg-surface-container-lowest p-5'>
          <h2 className='text-sm font-bold text-on-surface'>{t(`${key}.payee`)}</h2>
          {bank ? (
            <figure className='flex flex-col items-center gap-2'>
              <div className='rounded-2xl bg-white p-3 shadow-[var(--shadow-card)]'>
                <QRCodeSVG
                  aria-label={t(`${key}.qrLabel`, { bank: bank.name, account: data.bankAccountNumber })}
                  level='M'
                  role='img'
                  size={184}
                  value={vietQrPayload({
                    bin: bank.bin,
                    accountNumber: data.bankAccountNumber,
                    amount: data.amount,
                    purpose
                  })}
                />
              </div>
              <figcaption className='text-center text-xs text-on-surface-variant'>{t(`${key}.qrHint`)}</figcaption>
            </figure>
          ) : (
            <p className='rounded-2xl bg-surface-container-low p-3 text-xs text-on-surface-variant'>
              {t(`${key}.qrUnknownBank`, { bank: data.bankName })}
            </p>
          )}
          <dl className='space-y-2 text-sm'>
            <Row label={t(`${key}.requester`)} value={data.requesterName || t('common.ui.unknownName')} />
            <Row label={t('wallet.withdrawals.bank')} value={bank?.name ?? data.bankName} />
            <div className='flex items-center justify-between gap-3'>
              <dt className='text-on-surface-variant'>{t('wallet.withdrawals.account')}</dt>
              <dd className='flex items-center gap-1 font-semibold tabular-nums text-on-surface'>
                {data.bankAccountNumber}
                <CopyButton compact value={data.bankAccountNumber} />
              </dd>
            </div>
            <Row label={t('wallet.form.accountHolderName')} value={data.accountHolderName} />
            <Row label={t(`${key}.content`)} value={purpose} />
            <div className='flex items-baseline justify-between gap-3 border-t border-outline-variant/60 pt-2'>
              <dt className='text-on-surface-variant'>{t(`${key}.amount`)}</dt>
              <dd className='text-xl font-extrabold text-forest-950 tabular-nums'>{money(data.amount)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex justify-between gap-3'>
      <dt className='text-on-surface-variant'>{label}</dt>
      <dd className='min-w-0 text-right font-semibold break-words text-on-surface'>{value}</dd>
    </div>
  )
}
