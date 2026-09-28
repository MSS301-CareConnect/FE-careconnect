import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import type { DepositPaymentMethod } from '../types'

const ICON_REDEEM = 'redeem'
const ICON_QR_SCANNER = 'qr_code_scanner'
const ICON_CREDIT_CARD = 'credit_card'
const ICON_WALLET = 'account_balance_wallet'
const ICON_SPINNER = 'progress_activity'
const ICON_CHECK_CIRCLE = 'check_circle'
const ICON_LOCK = 'lock'
const ICON_SECURITY = 'security'
const ICON_INFO = 'info'
const ICON_VERIFIED = 'verified'

interface BookingDepositPaymentWidgetProps {
  selectedPaymentMethod: DepositPaymentMethod
  onSelectPaymentMethod: (method: DepositPaymentMethod) => void
  isProcessing: boolean
  isSuccess: boolean
  isModalOpen: boolean
  onPayDeposit: () => void
  onCloseModal: () => void
}

export const BookingDepositPaymentWidget = ({
  selectedPaymentMethod,
  onSelectPaymentMethod,
  isProcessing,
  isSuccess,
  isModalOpen,
  onPayDeposit,
  onCloseModal
}: BookingDepositPaymentWidgetProps) => {
  const { t } = useTranslation()

  return (
    <aside className='lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 flex flex-col gap-4'>
      <div className='bg-white rounded-xl p-6 shadow-md flex flex-col gap-6 relative border border-slate-100'>
        {/* Payment Card Header */}
        <div className='flex flex-col'>
          <span className='text-xs uppercase tracking-wider text-emerald-700 font-bold'>
            {t('customer.bookingDeposit.payment.stepLabel')}
          </span>
          <h2 className='text-xl font-bold text-slate-900 mt-1'>{t('customer.bookingDeposit.payment.title')}</h2>
          <p className='text-xs text-slate-500 mt-1'>{t('customer.bookingDeposit.payment.subtitle')}</p>
        </div>

        {/* Price Breakdown Calculation */}
        <div className='bg-slate-50 rounded-xl p-4 flex flex-col gap-2.5 border border-slate-100'>
          <div className='flex justify-between items-center text-xs text-slate-600'>
            <span>{t('customer.bookingDeposit.payment.shiftsCostLabel')}</span>
            <span className='font-semibold text-slate-900'>{t('customer.bookingDeposit.payment.shiftsCostValue')}</span>
          </div>
          <div className='flex justify-between items-center text-xs text-slate-600'>
            <span>{t('customer.bookingDeposit.payment.suppliesCostLabel')}</span>
            <span className='font-semibold text-slate-900'>
              {t('customer.bookingDeposit.payment.suppliesCostValue')}
            </span>
          </div>
          <div className='flex justify-between items-center text-xs text-emerald-700'>
            <span className='flex items-center gap-1 font-medium'>
              <span className='material-symbols-outlined text-[16px]'>{ICON_REDEEM}</span>
              {t('customer.bookingDeposit.payment.promoLabel')}
            </span>
            <span className='font-semibold'>{t('customer.bookingDeposit.payment.promoValue')}</span>
          </div>

          <div className='h-px bg-slate-200 my-1' />

          <div className='flex justify-between items-baseline text-slate-900'>
            <span className='text-xs font-semibold'>{t('customer.bookingDeposit.payment.totalPackageLabel')}</span>
            <div className='text-right'>
              <span className='text-lg font-bold text-slate-900'>{t('customer.bookingDeposit.payment.totalUsd')}</span>
              <span className='block text-xs text-slate-500'>{t('customer.bookingDeposit.payment.totalVnd')}</span>
            </div>
          </div>

          {/* Deposit Highlight Box */}
          <div className='bg-emerald-50 rounded-lg p-3 mt-2 flex items-center justify-between text-emerald-800 border border-emerald-100'>
            <div>
              <span className='text-xs uppercase tracking-wider block font-bold'>
                {t('customer.bookingDeposit.payment.depositTitle')}
              </span>
              <span className='text-xs text-slate-600'>{t('customer.bookingDeposit.payment.depositRemaining')}</span>
            </div>
            <div className='text-right'>
              <span className='text-xl font-bold text-emerald-700'>
                {t('customer.bookingDeposit.payment.depositUsd')}
              </span>
              <span className='block text-xs font-semibold text-emerald-700'>
                {t('customer.bookingDeposit.payment.depositVnd')}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className='flex flex-col gap-2.5'>
          <span className='text-xs font-bold text-slate-900'>{t('customer.bookingDeposit.payment.methodTitle')}</span>

          {/* Option 1: VietQR */}
          <div
            className={`rounded-xl p-3.5 transition-all cursor-pointer border ${
              selectedPaymentMethod === 'vietqr'
                ? 'bg-slate-50 border-emerald-600 ring-1 ring-emerald-600/30'
                : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
            onClick={() => onSelectPaymentMethod('vietqr')}
          >
            <div className='flex items-center justify-between'>
              <label className='flex items-center gap-3 cursor-pointer'>
                <input
                  type='radio'
                  name='payment_method'
                  value='vietqr'
                  checked={selectedPaymentMethod === 'vietqr'}
                  onChange={() => onSelectPaymentMethod('vietqr')}
                  className='w-4 h-4 text-emerald-700 focus:ring-emerald-700 accent-emerald-700'
                />
                <div className='flex flex-col'>
                  <span className='text-sm font-semibold text-slate-900 flex items-center gap-1.5'>
                    {t('customer.bookingDeposit.payment.methods.vietqr.label')}
                    <span className='px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold'>
                      {t('customer.bookingDeposit.payment.methods.vietqr.freeBadge')}
                    </span>
                  </span>
                  <span className='text-xs text-slate-500'>
                    {t('customer.bookingDeposit.payment.methods.vietqr.desc')}
                  </span>
                </div>
              </label>
              <span className='material-symbols-outlined text-emerald-700'>{ICON_QR_SCANNER}</span>
            </div>

            {/* QR Mockup */}
            {selectedPaymentMethod === 'vietqr' && (
              <div className='mt-3 bg-white rounded-lg p-4 flex flex-col items-center text-center border border-slate-100 shadow-inner'>
                <div className='p-2 bg-white rounded-lg shadow-sm border border-slate-200'>
                  <svg className='w-36 h-36' fill='none' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
                    <rect fill='white' height='100' width='100' />
                    <rect fill='#006b2c' height='24' width='24' x='10' y='10' />
                    <rect fill='white' height='16' width='16' x='14' y='14' />
                    <rect fill='#006b2c' height='8' width='8' x='18' y='18' />
                    <rect fill='#006b2c' height='24' width='24' x='66' y='10' />
                    <rect fill='white' height='16' width='16' x='70' y='14' />
                    <rect fill='#006b2c' height='8' width='8' x='74' y='18' />
                    <rect fill='#006b2c' height='24' width='24' x='10' y='66' />
                    <rect fill='white' height='16' width='16' x='14' y='70' />
                    <rect fill='#006b2c' height='8' width='8' x='18' y='74' />
                    <rect fill='#121c2a' height='6' width='6' x='40' y='10' />
                    <rect fill='#121c2a' height='6' width='6' x='52' y='10' />
                    <rect fill='#121c2a' height='6' width='6' x='46' y='18' />
                    <rect fill='#121c2a' height='6' width='6' x='38' y='26' />
                    <rect fill='#121c2a' height='6' width='6' x='50' y='26' />
                    <rect fill='#121c2a' height='6' width='6' x='10' y='42' />
                    <rect fill='#121c2a' height='6' width='6' x='22' y='42' />
                    <rect fill='#121c2a' height='6' width='6' x='34' y='38' />
                    <rect fill='#006b2c' height='8' width='8' x='46' y='40' />
                    <rect fill='#121c2a' height='6' width='6' x='58' y='38' />
                    <rect fill='#121c2a' height='6' width='6' x='70' y='42' />
                    <rect fill='#121c2a' height='6' width='6' x='82' y='42' />
                    <rect fill='#121c2a' height='6' width='6' x='40' y='52' />
                    <rect fill='#121c2a' height='6' width='6' x='54' y='52' />
                    <rect fill='#121c2a' height='6' width='6' x='66' y='52' />
                    <rect fill='#121c2a' height='6' width='6' x='78' y='52' />
                    <rect fill='#121c2a' height='6' width='6' x='38' y='66' />
                    <rect fill='#121c2a' height='6' width='6' x='50' y='68' />
                    <rect fill='#121c2a' height='6' width='6' x='62' y='66' />
                    <rect fill='#121c2a' height='6' width='6' x='74' y='70' />
                    <rect fill='#121c2a' height='6' width='6' x='86' y='66' />
                    <rect fill='#121c2a' height='6' width='6' x='42' y='80' />
                    <rect fill='#121c2a' height='6' width='6' x='54' y='82' />
                    <rect fill='#121c2a' height='6' width='6' x='66' y='80' />
                    <rect fill='#121c2a' height='6' width='6' x='80' y='82' />
                  </svg>
                </div>
                <div className='mt-2 text-center text-xs text-slate-600'>
                  <span>
                    {t('customer.bookingDeposit.payment.methods.vietqr.bankAccountLabel')}
                    <strong className='text-slate-900'>
                      {t('customer.bookingDeposit.payment.methods.vietqr.bankAccountValue')}
                    </strong>
                  </span>
                  <span className='block mt-0.5'>
                    {t('customer.bookingDeposit.payment.methods.vietqr.transferNoteLabel')}
                    <strong className='text-emerald-700'>
                      {t('customer.bookingDeposit.payment.methods.vietqr.transferNoteValue')}
                    </strong>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Option 2: Card */}
          <div
            className={`rounded-xl p-3.5 transition-all cursor-pointer border ${
              selectedPaymentMethod === 'card'
                ? 'bg-slate-50 border-emerald-600 ring-1 ring-emerald-600/30'
                : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
            onClick={() => onSelectPaymentMethod('card')}
          >
            <label className='flex items-center justify-between cursor-pointer'>
              <div className='flex items-center gap-3'>
                <input
                  type='radio'
                  name='payment_method'
                  value='card'
                  checked={selectedPaymentMethod === 'card'}
                  onChange={() => onSelectPaymentMethod('card')}
                  className='w-4 h-4 text-emerald-700 focus:ring-emerald-700 accent-emerald-700'
                />
                <div className='flex flex-col'>
                  <span className='text-sm font-semibold text-slate-900'>
                    {t('customer.bookingDeposit.payment.methods.card.label')}
                  </span>
                  <span className='text-xs text-slate-500'>
                    {t('customer.bookingDeposit.payment.methods.card.desc')}
                  </span>
                </div>
              </div>
              <span className='material-symbols-outlined text-slate-400'>{ICON_CREDIT_CARD}</span>
            </label>
          </div>

          {/* Option 3: Wallet */}
          <div
            className={`rounded-xl p-3.5 transition-all cursor-pointer border ${
              selectedPaymentMethod === 'wallet'
                ? 'bg-slate-50 border-emerald-600 ring-1 ring-emerald-600/30'
                : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
            onClick={() => onSelectPaymentMethod('wallet')}
          >
            <label className='flex items-center justify-between cursor-pointer'>
              <div className='flex items-center gap-3'>
                <input
                  type='radio'
                  name='payment_method'
                  value='wallet'
                  checked={selectedPaymentMethod === 'wallet'}
                  onChange={() => onSelectPaymentMethod('wallet')}
                  className='w-4 h-4 text-emerald-700 focus:ring-emerald-700 accent-emerald-700'
                />
                <div className='flex flex-col'>
                  <span className='text-sm font-semibold text-slate-900'>
                    {t('customer.bookingDeposit.payment.methods.wallet.label')}
                  </span>
                  <span className='text-xs text-slate-500'>
                    {t('customer.bookingDeposit.payment.methods.wallet.desc')}
                  </span>
                </div>
              </div>
              <span className='material-symbols-outlined text-slate-400'>{ICON_WALLET}</span>
            </label>
          </div>
        </div>

        {/* Action Button */}
        <div className='flex flex-col gap-2 mt-1'>
          <button
            type='button'
            id='btn-pay-deposit'
            disabled={isProcessing}
            onClick={onPayDeposit}
            className={`w-full text-white font-semibold py-3.5 px-4 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isSuccess ? 'bg-emerald-600 text-white' : 'bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900'
            }`}
          >
            {isProcessing ? (
              <>
                <span className='material-symbols-outlined text-[20px] animate-spin'>{ICON_SPINNER}</span>
                <span>{t('customer.bookingDeposit.payment.processing')}</span>
              </>
            ) : isSuccess ? (
              <>
                <span className='material-symbols-outlined text-[20px]'>{ICON_CHECK_CIRCLE}</span>
                <span>{t('customer.bookingDeposit.payment.successText')}</span>
              </>
            ) : (
              <>
                <span className='material-symbols-outlined text-[20px]'>{ICON_LOCK}</span>
                <span>{t('customer.bookingDeposit.payment.payButton')}</span>
              </>
            )}
          </button>

          <p className='text-xs text-slate-500 text-center leading-relaxed'>
            {t('customer.bookingDeposit.payment.agreementPrefix')}
            <span className='text-emerald-700 font-medium hover:underline cursor-pointer'>
              {t('customer.bookingDeposit.payment.termsLink')}
            </span>
            {t('customer.bookingDeposit.payment.andText')}
            <span className='text-emerald-700 font-medium hover:underline cursor-pointer'>
              {t('customer.bookingDeposit.payment.refundLink')}
            </span>
            {t('customer.bookingDeposit.payment.agreementSuffix')}
          </p>
        </div>

        {/* Trust Badges */}
        <div className='border-t border-slate-100 pt-3 flex flex-col gap-2'>
          <div className='flex items-center gap-2 text-slate-600 text-xs font-medium'>
            <span className='material-symbols-outlined text-emerald-700 text-[18px]'>{ICON_SECURITY}</span>
            <span>{t('customer.bookingDeposit.payment.sslNotice')}</span>
          </div>
        </div>
      </div>

      {/* Emergency Notice Card */}
      <div className='bg-slate-100/80 rounded-xl p-4 flex items-center gap-3 border border-slate-200'>
        <span className='material-symbols-outlined text-teal-700 text-[24px] shrink-0'>{ICON_INFO}</span>
        <p className='text-xs text-slate-700 leading-relaxed'>{t('customer.bookingDeposit.payment.caregiverNotice')}</p>
      </div>

      {/* Success Modal */}
      {isModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs'>
          <div className='bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in duration-200'>
            <div className='w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4'>
              <span className='material-symbols-outlined text-[36px]'>{ICON_VERIFIED}</span>
            </div>
            <h3 className='text-xl font-bold text-slate-900 mb-2'>{t('customer.bookingDeposit.payment.modalTitle')}</h3>
            <p className='text-sm text-slate-600 mb-6 leading-relaxed'>
              {t('customer.bookingDeposit.payment.modalDesc')}
            </p>
            <div className='flex flex-col sm:flex-row gap-3 w-full'>
              <Link
                to='/customer/bookings'
                className='flex-1 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm transition-colors text-center'
              >
                {t('customer.bookingDeposit.payment.viewBookingsBtn')}
              </Link>
              <button
                type='button'
                onClick={onCloseModal}
                className='py-3 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors cursor-pointer'
              >
                {t('customer.bookingDeposit.payment.closeModalBtn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
