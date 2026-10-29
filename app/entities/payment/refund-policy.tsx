import { useQuery } from '@tanstack/react-query'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'

import type { RefundTier } from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'

import { fetchEffectivePolicy, paymentKeys } from './payment-api'

const NAMED_RULES = [
  'NOT_PAID',
  'NOT_CANCELLABLE',
  'COOLING_OFF',
  'FULL_REFUND_CENTER',
  'FULL_REFUND_MISSED',
  'FULL_REFUND_SYSTEM'
] as const
type NamedRule = (typeof NAMED_RULES)[number]
// PaymentService names a tier rule TIER_<min>_<max>, with INF for an open upper bound.
const TIER_RULE = /^TIER_(\d+)_(\d+|INF)$/

/** The customer-facing reading of a refund-quote rule code; codes stay out of the UI. */
export function refundRuleLabel(t: TFunction, rule: string | undefined) {
  if (!rule) return t('payment.refundRule.other')
  if ((NAMED_RULES as readonly string[]).includes(rule)) return t(`payment.refundRule.${rule as NamedRule}`)
  const tier = TIER_RULE.exec(rule)
  if (!tier) return t('payment.refundRule.other')
  const [, min, max] = tier
  return tierLabel(t, Number(min), max === 'INF' ? null : Number(max))
}

function tierLabel(t: TFunction, min: number, max: number | null | undefined) {
  if (max === null || max === undefined) return t('payment.refundRule.tierFrom', { min })
  if (min === 0) return t('payment.refundRule.tierUnder', { max })
  return t('payment.refundRule.tierRange', { min, max })
}

/** The policy in effect for a center, read once and shared by the deposit page and the cancel dialog. */
export function useEffectivePolicy(centerId: string | undefined) {
  return useQuery({
    queryKey: paymentKeys.policy(centerId ?? ''),
    queryFn: () => fetchEffectivePolicy(centerId ?? ''),
    enabled: Boolean(centerId),
    retry: false,
    staleTime: 5 * 60_000
  })
}

/** Cancellation fees per visit, read from the policy PaymentService applies, nearest visit first. */
export function RefundPolicySummary({ centerId }: { centerId: string | undefined }) {
  const { t, i18n } = useTranslation()
  const policy = useEffectivePolicy(centerId)
  const percent = new Intl.NumberFormat(i18n.language, { style: 'percent', maximumFractionDigits: 2 })
  const tiers = [...(policy.data?.refundTiers ?? [])].sort((a, b) => a.minLeadHours - b.minLeadHours)

  return (
    <section aria-labelledby='refund-policy-title' className='flex flex-col gap-3 text-sm'>
      <h3 className='flex items-center gap-2 text-base font-bold text-on-surface' id='refund-policy-title'>
        <Icon className='text-xl text-primary' name='currency_exchange' />
        {t('payment.refundPolicy.title')}
      </h3>
      <p className='leading-6 text-on-surface-variant'>{t('payment.refundPolicy.intro')}</p>
      {policy.isPending && centerId ? (
        <p className='text-on-surface-variant' role='status'>
          {t('payment.refundPolicy.loading')}
        </p>
      ) : null}
      {policy.isError || (policy.isSuccess && tiers.length === 0) ? (
        <p className='text-on-surface-variant'>{t('payment.refundPolicy.unavailable')}</p>
      ) : null}
      {tiers.length > 0 ? (
        <table className='w-full border-collapse text-left'>
          <thead>
            <tr className='text-on-surface-variant'>
              <th className='border-b border-outline-variant py-2 pr-3 font-semibold' scope='col'>
                {t('payment.refundPolicy.lead')}
              </th>
              <th className='border-b border-outline-variant py-2 font-semibold' scope='col'>
                {t('payment.refundPolicy.keep')}
              </th>
            </tr>
          </thead>
          <tbody>
            {tiers.map((tier: RefundTier) => (
              <tr key={tier.minLeadHours}>
                <td className='border-b border-outline-variant/50 py-2 pr-3'>
                  {tierLabel(t, tier.minLeadHours, tier.maxLeadHours)}
                </td>
                <td className='border-b border-outline-variant/50 py-2 font-semibold tabular-nums'>
                  {tier.feePercent > 0
                    ? t('payment.refundPolicy.fee', { percent: percent.format(tier.feePercent / 100) })
                    : t('payment.refundPolicy.noFee')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
      {tiers.length > 0 ? (
        <ul className='flex flex-col gap-1.5 leading-6 text-on-surface-variant'>
          <li>{t('payment.refundPolicy.feeCap')}</li>
          {policy.data?.coolingOffMinutes ? (
            <li>
              {t('payment.refundPolicy.coolingOff', {
                minutes: policy.data.coolingOffMinutes,
                hours: policy.data.coolingOffMinLeadHours ?? 0
              })}
            </li>
          ) : null}
          <li>{t('payment.refundPolicy.fullRefund')}</li>
        </ul>
      ) : null}
    </section>
  )
}
