import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useBlocker } from 'react-router'

import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { ConfirmDialog } from '~/shared/ui/modal'
import { Icon } from '~/shared/ui/icon'
import { pageContainer } from '~/shared/ui/page-header'
import { CustomerPageHeader } from '~/features/customer/ui/customer-page-header'
import { Stepper, type StepState } from '~/shared/ui/stepper'

import { BookingSuccess } from './components/booking-success'
import { BookingSummaryAside, BookingSummaryBar } from './components/booking-summary'
import { StepCare } from './components/step-care'
import { StepRecipient } from './components/step-recipient'
import { StepReview } from './components/step-review'
import { StepSchedule } from './components/step-schedule'
import { StepFooter } from './components/wizard-parts'
import { useBookingForm, type WizardStep } from './hooks/use-booking-form'

const STEP_IDS = ['recipient', 'care', 'schedule', 'review'] as const

/**
 * Booking wizard (2026-11 redesign): one step at a time in data-dependency order, a sticky summary with the live
 * quote, a review step and a success screen. The request body is unchanged from the single-page form.
 */
export function CustomerBookingPage() {
  const { t } = useTranslation()
  const form = useBookingForm()
  const contentRef = useRef<HTMLDivElement>(null)
  const firstRender = useRef(true)
  useDocumentTitle(t('customer.booking.documentTitle'))
  const sent = form.create.isSuccess
  const guard = form.dirty && !sent

  // Leaving with an unsent request asks first: in-app links through the router, reload / close through the browser.
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => guard && currentLocation.pathname !== nextLocation.pathname
  )
  useEffect(() => {
    if (!guard) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [guard])

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    const top = contentRef.current?.getBoundingClientRect().top ?? 0
    if (top < 80) window.scrollBy({ top: top - 96, behavior: 'smooth' })
    contentRef.current?.focus({ preventScroll: true })
  }, [form.step])

  if (sent) {
    return (
      <div className={pageContainer}>
        <BookingSuccess form={form} />
      </div>
    )
  }

  const steps = STEP_IDS.map((id, index) => {
    const number = (index + 1) as WizardStep
    const state: StepState =
      number === form.step ? 'current' : number < form.furthest && number <= form.reached ? 'done' : 'todo'
    return { id, label: t(`customer.booking.steps.${id}`), state }
  })
  const last = form.step === 4
  const action = last ? form.submit : form.next
  const actionLabel = last ? t('customer.booking.nav.submit') : t('customer.booking.nav.next')

  return (
    <div className={`${pageContainer} pb-36 lg:pb-16`}>
      <CustomerPageHeader
        breadcrumb={[
          { label: t('customer.booking.breadcrumb.home'), to: '/customer' },
          { label: t('customer.booking.breadcrumb.current') }
        ]}
        breadcrumbLabel={t('customer.booking.breadcrumb.label')}
        description={t('customer.booking.header.subtitle')}
        title={t('customer.booking.header.title')}
      />

      {form.hasDebt ? (
        <div
          className='mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-error/30 bg-error-container p-4 text-sm text-on-error-container'
          role='alert'
        >
          <p className='flex items-start gap-2 font-medium'>
            <Icon className='text-lg' name='error' />
            {t('customer.booking.debt.message')}
          </p>
          <Link
            className='inline-flex min-h-10 items-center rounded-lg bg-error px-4 font-semibold text-on-error hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error'
            to='/customer/payments'
          >
            {t('customer.booking.debt.pay')}
          </Link>
        </div>
      ) : null}

      <div className='cc-glass mb-8 rounded-3xl px-4 py-4 shadow-[var(--shadow-card)] sm:px-6 sm:py-5'>
        <Stepper
          label={t('customer.booking.steps.label')}
          onSelect={(id) => form.goTo((STEP_IDS.indexOf(id as (typeof STEP_IDS)[number]) + 1) as WizardStep)}
          steps={steps}
        />
      </div>

      <div className='grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]'>
        <div
          className='min-w-0 scroll-mt-24 rounded-3xl border border-forest-900/[0.06] bg-white p-5 shadow-[var(--shadow-card)] outline-none sm:p-7'
          ref={contentRef}
          tabIndex={-1}
        >
          <div className={form.direction === 'back' ? 'cc-step-back' : 'cc-step-forward'} key={form.step}>
            {form.step === 1 ? <StepRecipient form={form} /> : null}
            {form.step === 2 ? <StepCare form={form} /> : null}
            {form.step === 3 ? <StepSchedule form={form} /> : null}
            {form.step === 4 ? <StepReview form={form} /> : null}
          </div>
          <div className='mt-8'>
            <StepFooter
              loading={form.create.isPending}
              nextLabel={actionLabel}
              onBack={form.back}
              onNext={action}
              reason={form.stepIssue}
              showBack={form.step > 1}
            />
          </div>
        </div>
        <BookingSummaryAside form={form} />
      </div>

      <BookingSummaryBar actionLabel={actionLabel} form={form} loading={form.create.isPending} onAction={action} />

      <ConfirmDialog
        cancelLabel={t('customer.booking.leave.stay')}
        confirmLabel={t('customer.booking.leave.leave')}
        description={t('customer.booking.leave.description')}
        onClose={() => blocker.reset?.()}
        onConfirm={() => blocker.proceed?.()}
        open={blocker.state === 'blocked'}
        title={t('customer.booking.leave.title')}
      />
    </div>
  )
}
