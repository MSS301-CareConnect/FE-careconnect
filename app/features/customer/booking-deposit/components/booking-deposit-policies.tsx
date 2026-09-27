import { useTranslation } from 'react-i18next'

const ICON_VERIFIED = 'verified'
const ICON_CURRENCY = 'currency_exchange'
const ICON_HEALTH = 'health_and_safety'
const ICON_LOCK_CLOCK = 'lock_clock'
const ICON_SUPPORT = 'support_agent'

export const BookingDepositPolicies = () => {
  const { t } = useTranslation()

  return (
    <div className='bg-white rounded-xl p-6 shadow-sm flex flex-col gap-4 border border-slate-100'>
      <div className='flex items-center gap-3'>
        <span className='material-symbols-outlined text-emerald-700 text-[24px]'>{ICON_VERIFIED}</span>
        <h3 className='text-base font-bold text-slate-900'>{t('customer.bookingDeposit.policies.title')}</h3>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {/* Refund */}
        <div className='flex gap-3'>
          <span className='material-symbols-outlined text-teal-700 text-[20px] shrink-0 mt-0.5'>{ICON_CURRENCY}</span>
          <div>
            <span className='text-sm font-semibold text-slate-900 block'>
              {t('customer.bookingDeposit.policies.items.refundTitle')}
            </span>
            <p className='text-xs text-slate-600 mt-1 leading-relaxed'>
              {t('customer.bookingDeposit.policies.items.refundDesc')}
            </p>
          </div>
        </div>

        {/* Insurance */}
        <div className='flex gap-3'>
          <span className='material-symbols-outlined text-teal-700 text-[20px] shrink-0 mt-0.5'>{ICON_HEALTH}</span>
          <div>
            <span className='text-sm font-semibold text-slate-900 block'>
              {t('customer.bookingDeposit.policies.items.insuranceTitle')}
            </span>
            <p className='text-xs text-slate-600 mt-1 leading-relaxed'>
              {t('customer.bookingDeposit.policies.items.insuranceDesc')}
            </p>
          </div>
        </div>

        {/* Escrow */}
        <div className='flex gap-3'>
          <span className='material-symbols-outlined text-teal-700 text-[20px] shrink-0 mt-0.5'>{ICON_LOCK_CLOCK}</span>
          <div>
            <span className='text-sm font-semibold text-slate-900 block'>
              {t('customer.bookingDeposit.policies.items.escrowTitle')}
            </span>
            <p className='text-xs text-slate-600 mt-1 leading-relaxed'>
              {t('customer.bookingDeposit.policies.items.escrowDesc')}
            </p>
          </div>
        </div>

        {/* 24/7 Coordinator */}
        <div className='flex gap-3'>
          <span className='material-symbols-outlined text-teal-700 text-[20px] shrink-0 mt-0.5'>{ICON_SUPPORT}</span>
          <div>
            <span className='text-sm font-semibold text-slate-900 block'>
              {t('customer.bookingDeposit.policies.items.supportTitle')}
            </span>
            <p className='text-xs text-slate-600 mt-1 leading-relaxed'>
              {t('customer.bookingDeposit.policies.items.supportDesc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
