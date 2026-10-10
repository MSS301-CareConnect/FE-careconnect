import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { BookingCaregiverSection } from './components/booking-caregiver-section'
import { BookingPatientSection } from './components/booking-patient-section'
import { BookingScheduleSection } from './components/booking-schedule-section'
import { BookingServicesSection } from './components/booking-services-section'
import { BookingStepper } from './components/booking-stepper'
import { BookingSummarySidebar } from './components/booking-summary-sidebar'
import { useBookingForm } from './hooks/use-booking-form'

const ICON_CHEVRON_RIGHT = 'chevron_right'

export function CustomerBookingPage() {
  const { t } = useTranslation()
  const {
    form,
    weekDays,
    setPatientId,
    setServicePlanId,
    toggleSmartMatch,
    setScheduleMode,
    setStartDate,
    setShiftType,
    setFrequency,
    setNotes,
    setPromoCode,
    applyPromoCode,
    setPaymentMethod,
    submitBooking,
    closeSuccessModal
  } = useBookingForm()

  useEffect(() => {
    document.title = t('customer.booking.documentTitle')
  }, [t])

  return (
    <div className='flex w-full flex-1 flex-col bg-surface'>
      {/* Top Hero Area */}
      <section className='w-full bg-surface-container-low pb-10 sm:pb-12'>
        <div className='mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8'>
          {/* Breadcrumb */}
          <nav
            aria-label={t('customer.booking.breadcrumb.current')}
            className='mb-4 flex items-center gap-2 text-xs text-on-surface-variant sm:text-sm'
          >
            <Link className='transition-colors hover:text-primary' to='/customer'>
              {t('customer.booking.breadcrumb.home')}
            </Link>
            <span className='material-symbols-outlined text-[16px] text-outline'>{ICON_CHEVRON_RIGHT}</span>
            <Link className='transition-colors hover:text-primary' to='/customer/caregivers'>
              {t('customer.booking.breadcrumb.caregivers')}
            </Link>
            <span className='material-symbols-outlined text-[16px] text-outline'>{ICON_CHEVRON_RIGHT}</span>
            <span className='font-semibold text-primary'>{t('customer.booking.breadcrumb.current')}</span>
          </nav>

          {/* Main Title Block */}
          <div className='mb-6'>
            <h1 className='text-2xl font-bold tracking-tight text-on-surface sm:text-3xl md:text-4xl'>
              {t('customer.booking.header.title')}
            </h1>
            <p className='mt-2 max-w-2xl text-xs leading-relaxed text-on-surface-variant sm:text-sm md:text-base'>
              {t('customer.booking.header.subtitle')}
            </p>
          </div>

          {/* Stepper Navigation */}
          <BookingStepper />
        </div>
      </section>

      {/* Main Content Wizard: Split-Screen Layout */}
      <div className='-mt-6 mb-16 w-full'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-1 items-start gap-8 lg:grid-cols-12'>
            {/* Left Column: Interactive Steps (8 Cols) */}
            <div className='flex flex-col gap-6 lg:col-span-8'>
              <BookingPatientSection selectedPatientId={form.patientId} onSelectPatient={setPatientId} />

              <BookingServicesSection selectedPlanId={form.servicePlanId} onSelectPlan={setServicePlanId} />

              <BookingCaregiverSection
                smartMatchEnabled={form.smartMatchEnabled}
                onToggleSmartMatch={toggleSmartMatch}
              />

              <BookingScheduleSection
                frequency={form.frequency}
                notes={form.notes}
                scheduleMode={form.scheduleMode}
                shiftType={form.shiftType}
                startDate={form.startDate}
                weekDays={weekDays}
                onFrequencyChange={setFrequency}
                onNotesChange={setNotes}
                onScheduleModeChange={setScheduleMode}
                onShiftTypeChange={setShiftType}
                onStartDateChange={setStartDate}
              />
            </div>

            {/* Right Column: Sticky Summary & Checkout (4 Cols) */}
            <div className='lg:col-span-4'>
              <BookingSummarySidebar
                form={form}
                onApplyPromoCode={applyPromoCode}
                onCloseModal={closeSuccessModal}
                onPaymentMethodChange={setPaymentMethod}
                onPromoCodeChange={setPromoCode}
                onSubmit={submitBooking}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
