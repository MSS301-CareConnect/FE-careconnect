import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { useBookingDeposit } from './hooks/use-booking-deposit'
import { BookingDepositHero } from './components/booking-deposit-hero'
import { BookingDepositOverview } from './components/booking-deposit-overview'
import { BookingDepositPolicies } from './components/booking-deposit-policies'
import { BookingDepositPaymentWidget } from './components/booking-deposit-payment-widget'

export const BookingDepositPage = () => {
  const { t } = useTranslation()
  useDocumentTitle(t('customer.bookingDeposit.documentTitle'))

  const {
    formattedTime,
    isExpired,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    isProcessing,
    isSuccess,
    isModalOpen,
    handlePayDeposit,
    closeModal
  } = useBookingDeposit()

  return (
    <div className='w-full flex-1 flex flex-col bg-slate-50/30'>
      <BookingDepositHero formattedTime={formattedTime} isExpired={isExpired} />

      <main className='w-full pb-16'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6'>
          <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 items-start'>
            {/* Left Column (8 cols) */}
            <div className='lg:col-span-7 xl:col-span-8 flex flex-col gap-6'>
              <BookingDepositOverview />
              <BookingDepositPolicies />
            </div>

            {/* Right Column (4 cols) */}
            <BookingDepositPaymentWidget
              selectedPaymentMethod={selectedPaymentMethod}
              onSelectPaymentMethod={setSelectedPaymentMethod}
              isProcessing={isProcessing}
              isSuccess={isSuccess}
              isModalOpen={isModalOpen}
              onPayDeposit={handlePayDeposit}
              onCloseModal={closeModal}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
