import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import type { BookingFormState, PaymentMethodId } from '../types'

const ICON_PERSON = 'person'
const ICON_HEALTH = 'health_and_safety'
const ICON_EVENT = 'event'
const ICON_PERCENT = 'percent'
const ICON_REDEEM = 'redeem'
const ICON_CHECK_CIRCLE = 'check_circle'
const ICON_CALENDAR_ADD = 'calendar_add_on'
const ICON_LOCK = 'lock'
const ICON_REFRESH = 'published_with_changes'
const ICON_VERIFIED = 'verified'

const PAYMENT_METHODS: PaymentMethodId[] = ['napas', 'card', 'wallet', 'deposit30']

const PAYMENT_ICONS: Record<PaymentMethodId, string> = {
  napas: 'qr_code_2',
  card: 'credit_card',
  wallet: 'account_balance_wallet',
  deposit30: 'pie_chart'
}

interface BookingSummarySidebarProps {
  form: BookingFormState
  onPromoCodeChange: (code: string) => void
  onApplyPromoCode: () => void
  onPaymentMethodChange: (method: PaymentMethodId) => void
  onSubmit: () => void
  onCloseModal: () => void
}

export function BookingSummarySidebar({
  form,
  onPromoCodeChange,
  onApplyPromoCode,
  onPaymentMethodChange,
  onSubmit,
  onCloseModal
}: BookingSummarySidebarProps) {
  const { t } = useTranslation()

  return (
    <aside className='flex flex-col gap-4 lg:sticky lg:top-24'>
      <div className='relative overflow-hidden rounded-xl bg-surface-container-lowest p-5 shadow-sm md:p-6'>
        {/* Top Tag & Title */}
        <div className='mb-2 border-b border-outline-variant/20 pb-3'>
          <span className='font-bold text-xs text-secondary uppercase tracking-wider'>
            {t('customer.booking.summary.tag')}
          </span>
          <h3 className='mt-1 text-base font-bold text-on-surface sm:text-lg'>{t('customer.booking.summary.title')}</h3>
        </div>

        {/* Core snapshot */}
        <div className='mb-4 space-y-3 rounded-xl bg-surface-container-low/80 p-4'>
          <div className='flex items-start gap-2.5'>
            <span className='material-symbols-outlined mt-0.5 shrink-0 text-[20px] text-primary'>{ICON_PERSON}</span>
            <div className='min-w-0'>
              <p className='text-xs text-on-surface-variant'>{t('customer.booking.summary.patientLabel')}</p>
              <p className='truncate font-semibold text-xs text-on-surface sm:text-sm'>
                {t('customer.booking.summary.patientValue')}
              </p>
            </div>
          </div>

          <div className='flex items-start gap-2.5'>
            <span className='material-symbols-outlined mt-0.5 shrink-0 text-[20px] text-primary'>{ICON_HEALTH}</span>
            <div className='min-w-0'>
              <p className='text-xs text-on-surface-variant'>{t('customer.booking.summary.caregiverLabel')}</p>
              <p className='truncate font-semibold text-xs text-on-surface sm:text-sm'>
                {t('customer.booking.summary.caregiverValue')}
              </p>
            </div>
          </div>

          <div className='flex items-start gap-2.5'>
            <span className='material-symbols-outlined mt-0.5 shrink-0 text-[20px] text-primary'>{ICON_EVENT}</span>
            <div className='min-w-0'>
              <p className='text-xs text-on-surface-variant'>{t('customer.booking.summary.timeLabel')}</p>
              <p className='font-medium text-xs text-on-surface sm:text-sm'>
                {t('customer.booking.summary.timeValue')}
              </p>
            </div>
          </div>
        </div>

        {/* Pricing breakdown */}
        <div className='space-y-2 border-b border-outline-variant/20 py-3 text-xs sm:text-sm'>
          <div className='flex items-center justify-between text-on-surface'>
            <span>{t('customer.booking.summary.rateLabel')}</span>
            <span className='font-medium'>{t('customer.booking.summary.rateValue')}</span>
          </div>

          <div className='flex items-center justify-between text-on-surface'>
            <span>{t('customer.booking.summary.shiftsCountLabel')}</span>
            <span className='font-medium'>{t('customer.booking.summary.shiftsCountValue')}</span>
          </div>

          <div className='flex items-center justify-between text-secondary'>
            <span className='flex items-center gap-1.5'>
              <span className='material-symbols-outlined text-[16px]'>{ICON_PERCENT}</span>
              <span>{t('customer.booking.summary.discountLabel')}</span>
            </span>
            <span className='font-semibold'>{t('customer.booking.summary.discountValue')}</span>
          </div>

          {form.promoApplied ? (
            <div className='flex items-center justify-between text-secondary'>
              <span className='flex items-center gap-1.5'>
                <span className='material-symbols-outlined text-[16px]'>{ICON_REDEEM}</span>
                <span>{t('customer.booking.summary.voucherLabel')}</span>
              </span>
              <span className='font-semibold'>{t('customer.booking.summary.voucherValue')}</span>
            </div>
          ) : null}

          <div className='flex items-center justify-between text-on-surface-variant'>
            <span>{t('customer.booking.summary.insuranceLabel')}</span>
            <span className='font-semibold text-secondary'>{t('customer.booking.summary.freeValue')}</span>
          </div>
        </div>

        {/* Promo Code Input */}
        <div className='my-4 flex gap-2'>
          <div className='relative flex-1'>
            <input
              className='h-10 w-full rounded-lg bg-surface-container px-3 pr-8 font-mono text-xs text-on-surface uppercase shadow-inner focus:outline-none focus:ring-2 focus:ring-primary'
              placeholder={t('customer.booking.summary.promoPlaceholder')}
              type='text'
              value={form.promoCode}
              onChange={(e) => onPromoCodeChange(e.target.value)}
            />
            {form.promoApplied ? (
              <span className='absolute top-2.5 right-2 material-symbols-outlined text-[18px] text-secondary'>
                {ICON_CHECK_CIRCLE}
              </span>
            ) : null}
          </div>
          <button
            className='h-10 rounded-lg bg-surface-container px-4 text-xs font-semibold text-on-surface transition-colors hover:bg-surface-container-high'
            type='button'
            onClick={onApplyPromoCode}
          >
            {t('customer.booking.summary.applyBtn')}
          </button>
        </div>

        {/* Total Price Highlight Box */}
        <div className='mb-4 rounded-xl bg-surface-container-low p-4'>
          <div className='flex items-end justify-between'>
            <div>
              <p className='font-semibold text-xs text-on-surface-variant uppercase'>
                {t('customer.booking.summary.totalEstimatedLabel')}
              </p>
              <p className='text-[11px] text-on-surface-variant sm:text-xs'>
                {t('customer.booking.summary.totalNote')}
              </p>
            </div>
            <div className='text-right'>
              <span className='text-2xl font-bold text-primary sm:text-3xl'>
                {t('customer.booking.summary.totalAmount')}{' '}
                <span className='text-sm font-semibold'>{t('customer.booking.summary.currency')}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Payment Method Radio List */}
        <div className='mb-6 space-y-2'>
          <label className='mb-1 block font-bold text-xs text-on-surface sm:text-sm'>
            {t('customer.booking.summary.paymentMethodTitle')}
          </label>

          {PAYMENT_METHODS.map((method) => {
            const isSelected = form.paymentMethod === method
            return (
              <label
                key={method}
                className={`flex cursor-pointer items-center justify-between rounded-lg p-2.5 transition-colors ${
                  isSelected ? 'bg-surface-container-low' : 'bg-surface-container-lowest hover:bg-surface-container-low'
                }`}
              >
                <div className='flex items-center gap-2.5'>
                  <input
                    checked={isSelected}
                    className='h-4 w-4 accent-primary text-primary'
                    name='payment_method'
                    type='radio'
                    onChange={() => onPaymentMethodChange(method)}
                  />
                  <span
                    className={`material-symbols-outlined text-[20px] ${
                      isSelected ? 'text-primary' : 'text-on-surface-variant'
                    }`}
                  >
                    {PAYMENT_ICONS[method]}
                  </span>
                  <span
                    className={`text-xs sm:text-sm ${isSelected ? 'font-medium text-on-surface' : 'text-on-surface'}`}
                  >
                    {t(`customer.booking.summary.paymentMethods.${method}`)}
                  </span>
                </div>

                {method === 'napas' ? (
                  <span className='rounded bg-secondary-container px-2 py-0.5 font-bold text-[11px] text-on-secondary-container'>
                    {t('customer.booking.summary.recommendedBadge')}
                  </span>
                ) : null}

                {method === 'deposit30' ? (
                  <span className='text-[11px] text-on-surface-variant'>
                    {t('customer.booking.summary.flexibleBadge')}
                  </span>
                ) : null}
              </label>
            )
          })}
        </div>

        {/* Submit CTA Button */}
        <button
          className='flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-bold text-sm text-on-primary shadow-md transition-all hover:bg-primary-container active:scale-[0.99] sm:text-base'
          type='button'
          onClick={onSubmit}
        >
          <span className='material-symbols-outlined text-[22px]'>{ICON_CALENDAR_ADD}</span>
          <span>{t('customer.booking.summary.submitBtn')}</span>
        </button>

        {/* Trust Badges */}
        <div className='mt-4 space-y-2 border-t border-outline-variant/20 pt-4 text-[11px] text-on-surface-variant sm:text-xs'>
          <div className='flex items-center gap-2'>
            <span className='material-symbols-outlined text-[16px] text-secondary'>{ICON_VERIFIED}</span>
            <span>{t('customer.booking.summary.trustGuarantees.g1')}</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='material-symbols-outlined text-[16px] text-secondary'>{ICON_REFRESH}</span>
            <span>{t('customer.booking.summary.trustGuarantees.g2')}</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='material-symbols-outlined text-[16px] text-secondary'>{ICON_LOCK}</span>
            <span>{t('customer.booking.summary.trustGuarantees.g3')}</span>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {form.isSuccessModalOpen ? (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs'>
          <div className='w-full max-w-md rounded-2xl bg-surface-container-lowest p-6 text-center shadow-xl'>
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary-container text-secondary'>
              <span className='material-symbols-outlined text-[36px]'>{ICON_CHECK_CIRCLE}</span>
            </div>
            <h3 className='mb-2 text-xl font-bold text-on-surface'>{t('customer.booking.summary.successTitle')}</h3>
            <p className='mb-6 text-sm text-on-surface-variant'>
              {t('customer.booking.summary.successDesc', {
                patient: t('customer.booking.summary.patientValue'),
                nurse: t('customer.booking.summary.caregiverValue')
              })}
            </p>
            <div className='flex flex-col gap-3'>
              <Link
                className='w-full rounded-xl bg-primary py-3 text-center font-bold text-sm text-on-primary shadow-xs transition-colors hover:bg-primary-container'
                to='/customer/bookings'
                onClick={onCloseModal}
              >
                {t('customer.booking.summary.viewMyBookings')}
              </Link>
              <Link
                className='w-full rounded-xl bg-surface-container py-3 text-center font-semibold text-sm text-on-surface transition-colors hover:bg-surface-container-high'
                to='/customer/caregivers'
                onClick={onCloseModal}
              >
                {t('customer.booking.summary.backToCaregivers')}
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  )
}
