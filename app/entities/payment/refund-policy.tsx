import { useQuery } from '@tanstack/react-query'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'

import { bookingKeys, fetchCenterBookingPolicy } from '~/entities/booking/booking-api'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'
import { Modal } from '~/shared/ui/modal'

// Rule codes of PaymentService refund quotes (spec §10.2); unknown codes read as the generic policy line.
const NAMED_RULES = [
  'NOT_PAID',
  'NOT_CANCELLABLE',
  'BEFORE_THRESHOLD',
  'AFTER_THRESHOLD',
  'LATE_NO_REFUND',
  'FULL_REFUND_CENTER',
  'FULL_REFUND_MISSED',
  'FULL_REFUND_SYSTEM',
  'PAYMENT_OVERDUE'
] as const
type NamedRule = (typeof NAMED_RULES)[number]

/** The customer-facing reading of a refund-quote rule code; codes stay out of the UI. */
export function refundRuleLabel(t: TFunction, rule: string | undefined) {
  if (rule && (NAMED_RULES as readonly string[]).includes(rule)) return t(`payment.refundRule.${rule as NamedRule}`)
  return t('payment.refundRule.other')
}

/** The booking policy in effect for a center (spec §8), shared by the booking form, deposit page and cancel dialog. */
export function useCenterBookingPolicy(centerId: string | undefined) {
  return useQuery({
    queryKey: bookingKeys.centerPolicy(centerId ?? ''),
    queryFn: () => fetchCenterBookingPolicy(centerId ?? ''),
    enabled: Boolean(centerId),
    retry: false,
    staleTime: 5 * 60_000
  })
}

/** Refunds per cancelled visit from the center booking policy PaymentService applies (spec §10.2). */
export function RefundPolicySummary({ centerId, bare = false }: { centerId: string | undefined; bare?: boolean }) {
  const { t, i18n } = useTranslation()
  const policy = useCenterBookingPolicy(centerId)
  const percent = new Intl.NumberFormat(i18n.language, { style: 'percent', maximumFractionDigits: 2 })
  const hours = new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 1 })
  const data = policy.data
  const threshold = data ? hours.format(data.refundThresholdMinutes / 60) : ''
  // Under this window nothing is refunded; 0 means the "under the cut-off" rate applies until the visit starts.
  const late = data && data.lateCancelNoRefundMinutes > 0 ? hours.format(data.lateCancelNoRefundMinutes / 60) : null

  return (
    <section aria-labelledby={bare ? undefined : 'refund-policy-title'} className='flex flex-col gap-3 text-sm'>
      {bare ? null : (
        <h3 className='flex items-center gap-2 text-base font-bold text-on-surface' id='refund-policy-title'>
          <Icon className='text-xl text-primary' name='currency_exchange' />
          {t('payment.refundPolicy.title')}
        </h3>
      )}
      <p className='leading-6 text-on-surface-variant'>{t('payment.refundPolicy.intro')}</p>
      {policy.isPending && centerId ? (
        <p className='text-on-surface-variant' role='status'>
          {t('payment.refundPolicy.loading')}
        </p>
      ) : null}
      {policy.isError ? <p className='text-on-surface-variant'>{t('payment.refundPolicy.unavailable')}</p> : null}
      {data ? (
        <>
          <table className='w-full border-collapse text-left'>
            <thead>
              <tr className='text-on-surface-variant'>
                <th className='border-b border-outline-variant py-2 pr-3 font-semibold' scope='col'>
                  {t('payment.refundPolicy.lead')}
                </th>
                <th className='border-b border-outline-variant py-2 font-semibold' scope='col'>
                  {t('payment.refundPolicy.refund')}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className='border-b border-outline-variant/50 py-2 pr-3'>
                  {t('payment.refundPolicy.from', { hours: threshold })}
                </td>
                <td className='border-b border-outline-variant/50 py-2 font-semibold tabular-nums'>
                  {percent.format(data.refundPercentBeforeThreshold / 100)}
                </td>
              </tr>
              <tr>
                <td className='border-b border-outline-variant/50 py-2 pr-3'>
                  {late
                    ? t('payment.refundPolicy.between', { from: late, to: threshold })
                    : t('payment.refundPolicy.under', { hours: threshold })}
                </td>
                <td className='border-b border-outline-variant/50 py-2 font-semibold tabular-nums'>
                  {percent.format(data.refundPercentAfterThreshold / 100)}
                </td>
              </tr>
              {late ? (
                <tr>
                  <td className='border-b border-outline-variant/50 py-2 pr-3'>
                    {t('payment.refundPolicy.under', { hours: late })}
                  </td>
                  <td className='border-b border-outline-variant/50 py-2 font-semibold'>
                    {t('payment.refundPolicy.none')}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
          <ul className='flex flex-col gap-1.5 leading-6 text-on-surface-variant'>
            <li>{t('payment.refundPolicy.paidBase')}</li>
            <li>{t('payment.refundPolicy.fullRefund')}</li>
            {data.overduePaymentForfeitPercent > 0 ? (
              <li>
                {t('payment.refundPolicy.overdue', {
                  percent: percent.format(data.overduePaymentForfeitPercent / 100)
                })}
              </li>
            ) : null}
          </ul>
        </>
      ) : null}
    </section>
  )
}

/** The full refund policy as a popup, so opening it does not stretch the page or dialog underneath. */
export function RefundPolicyDialog({
  centerId,
  open,
  onClose
}: {
  centerId: string | undefined
  open: boolean
  onClose: () => void
}) {
  const { t } = useTranslation()
  return (
    <Modal
      footer={<Button onClick={onClose}>{t('payment.refundPolicy.close')}</Button>}
      onClose={onClose}
      open={open}
      size='md'
      title={t('payment.refundPolicy.title')}
    >
      <RefundPolicySummary bare centerId={centerId} />
    </Modal>
  )
}
