import { useTranslation } from 'react-i18next'

import { useCenterBookingPolicy } from '~/entities/payment/refund-policy'
import { apiErrorStatus } from '~/shared/api/error-details'
import { Icon } from '~/shared/ui/icon'
import { Skeleton } from '~/shared/ui/skeleton'

import { SignInHint } from './sign-in-hint'

const key = 'customer.centers.detail.policy' as const

/**
 * Deposit and refund rules of the center booking policy (`GET /center-booking-policies/{centerId}`) in three lines.
 * The endpoint needs a session, so a visitor gets a sign-in hint; any other failure only says the rules are missing.
 */
export function CenterPolicySection({ centerId }: { centerId: string }) {
  const { t, i18n } = useTranslation()
  const policy = useCenterBookingPolicy(centerId)
  const percent = new Intl.NumberFormat(i18n.language, { style: 'percent', maximumFractionDigits: 2 })
  const hours = new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 1 })
  const data = policy.data
  const threshold = data ? hours.format(data.refundThresholdMinutes / 60) : ''

  return (
    <section
      aria-labelledby='center-policy-title'
      className='flex flex-col gap-3 rounded-2xl border border-outline-variant bg-surface-container-lowest p-5'
    >
      <h2 className='flex items-center gap-2 text-lg font-bold tracking-tight text-forest-950' id='center-policy-title'>
        <Icon aria-hidden='true' className='text-xl text-primary' name='currency_exchange' />
        {t(`${key}.title`)}
      </h2>
      {policy.isPending ? <Skeleton className='h-16 rounded-lg' /> : null}
      {policy.isError && apiErrorStatus(policy.error) === 401 ? <SignInHint text={t(`${key}.signIn`)} /> : null}
      {policy.isError && apiErrorStatus(policy.error) !== 401 ? (
        <p className='text-sm text-on-surface-variant'>{t(`${key}.error`)}</p>
      ) : null}
      {data ? (
        <ul className='flex flex-col gap-2 text-sm leading-6 text-on-surface-variant'>
          <li>{t(`${key}.deposit`, { percent: percent.format(data.depositPercent / 100) })}</li>
          <li>
            {t(`${key}.before`, {
              hours: threshold,
              percent: percent.format(data.refundPercentBeforeThreshold / 100)
            })}
          </li>
          <li>
            {t(`${key}.after`, {
              hours: threshold,
              percent: percent.format(data.refundPercentAfterThreshold / 100)
            })}
          </li>
          {data.lateCancelNoRefundMinutes > 0 ? (
            <li>{t(`${key}.late`, { hours: hours.format(data.lateCancelNoRefundMinutes / 60) })}</li>
          ) : null}
          <li>{t(`${key}.centerCancel`)}</li>
        </ul>
      ) : null}
    </section>
  )
}
