import { useTranslation } from 'react-i18next'
import type { ServicePlanId } from '../types'

const STEP_2_NUM = '2'
const ICON_CHECK = 'check'
const ICON_CHECK_CIRCLE = 'check_circle'

const SERVICE_PLAN_ICONS: Record<ServicePlanId, string> = {
  stroke: 'accessible_forward',
  surgery: 'medication_liquid',
  dementia: 'psychology',
  palliative: 'vital_signs'
}

interface BookingServicesSectionProps {
  selectedPlanId: ServicePlanId
  onSelectPlan: (id: ServicePlanId) => void
}

export function BookingServicesSection({ selectedPlanId, onSelectPlan }: BookingServicesSectionProps) {
  const { t } = useTranslation()

  return (
    <section className='rounded-xl bg-surface-container-lowest p-5 shadow-sm transition-shadow hover:shadow-md md:p-6'>
      {/* Header */}
      <div className='mb-4 flex items-center justify-between border-b border-outline-variant/20 pb-4'>
        <div className='flex items-center gap-3'>
          <span className='flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-low font-bold text-sm text-primary'>
            {STEP_2_NUM}
          </span>
          <div>
            <h2 className='text-lg font-bold text-on-surface sm:text-xl'>
              {t('customer.booking.servicesSection.title')}
            </h2>
            <p className='text-xs text-on-surface-variant sm:text-sm'>
              {t('customer.booking.servicesSection.subtitle')}
            </p>
          </div>
        </div>
        <span className='rounded-full bg-secondary-container px-3 py-1 font-semibold text-xs text-on-secondary-container sm:text-sm'>
          {t('customer.booking.servicesSection.activeBadge')}
        </span>
      </div>

      {/* Grid of 4 plans */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {/* Plan 1: Stroke */}
        <div
          className={`cursor-pointer rounded-xl p-4 transition-all ${
            selectedPlanId === 'stroke'
              ? 'border-2 border-primary bg-surface-container-low shadow-xs'
              : 'border border-outline-variant/30 bg-surface-container-lowest hover:bg-surface-container-low/40'
          }`}
          onClick={() => onSelectPlan('stroke')}
        >
          <div className='mb-3 flex items-start justify-between'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-on-primary shadow-xs'>
              <span className='material-symbols-outlined'>{SERVICE_PLAN_ICONS.stroke}</span>
            </div>
            {selectedPlanId === 'stroke' ? (
              <span className='material-symbols-outlined text-[24px] text-primary'>{ICON_CHECK_CIRCLE}</span>
            ) : (
              <div className='h-5 w-5 rounded-full border-2 border-outline-variant/50' />
            )}
          </div>
          <h3 className='text-base font-bold text-on-surface'>
            {t('customer.booking.servicesSection.plans.stroke.title')}
          </h3>
          <p className='mt-1 mb-3 text-xs leading-relaxed text-on-surface-variant'>
            {t('customer.booking.servicesSection.plans.stroke.desc')}
          </p>
          <div className='space-y-1.5 pt-1 text-xs text-on-surface'>
            <div className='flex items-center gap-2'>
              <span className='material-symbols-outlined text-[16px] text-secondary'>{ICON_CHECK}</span>
              <span>{t('customer.booking.servicesSection.plans.stroke.f1')}</span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='material-symbols-outlined text-[16px] text-secondary'>{ICON_CHECK}</span>
              <span>{t('customer.booking.servicesSection.plans.stroke.f2')}</span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='material-symbols-outlined text-[16px] text-secondary'>{ICON_CHECK}</span>
              <span>{t('customer.booking.servicesSection.plans.stroke.f3')}</span>
            </div>
          </div>
        </div>

        {/* Plan 2: Surgery */}
        <div
          className={`cursor-pointer rounded-xl p-4 transition-all ${
            selectedPlanId === 'surgery'
              ? 'border-2 border-primary bg-surface-container-low shadow-xs'
              : 'border border-outline-variant/30 bg-surface-container-lowest hover:bg-surface-container-low/40'
          }`}
          onClick={() => onSelectPlan('surgery')}
        >
          <div className='mb-3 flex items-start justify-between'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container text-on-surface-variant'>
              <span className='material-symbols-outlined'>{SERVICE_PLAN_ICONS.surgery}</span>
            </div>
            {selectedPlanId === 'surgery' ? (
              <span className='material-symbols-outlined text-[24px] text-primary'>{ICON_CHECK_CIRCLE}</span>
            ) : (
              <div className='h-5 w-5 rounded-full border-2 border-outline-variant/50' />
            )}
          </div>
          <h3 className='text-base font-bold text-on-surface'>
            {t('customer.booking.servicesSection.plans.surgery.title')}
          </h3>
          <p className='mt-1 mb-3 text-xs leading-relaxed text-on-surface-variant'>
            {t('customer.booking.servicesSection.plans.surgery.desc')}
          </p>
          <div className='space-y-1.5 pt-1 text-xs text-on-surface'>
            <div className='flex items-center gap-2'>
              <span className='material-symbols-outlined text-[16px] text-secondary'>{ICON_CHECK}</span>
              <span>{t('customer.booking.servicesSection.plans.surgery.f1')}</span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='material-symbols-outlined text-[16px] text-secondary'>{ICON_CHECK}</span>
              <span>{t('customer.booking.servicesSection.plans.surgery.f2')}</span>
            </div>
          </div>
        </div>

        {/* Plan 3: Dementia */}
        <div
          className={`cursor-pointer rounded-xl p-4 transition-all ${
            selectedPlanId === 'dementia'
              ? 'border-2 border-primary bg-surface-container-low shadow-xs'
              : 'border border-outline-variant/30 bg-surface-container-lowest hover:bg-surface-container-low/40'
          }`}
          onClick={() => onSelectPlan('dementia')}
        >
          <div className='mb-3 flex items-start justify-between'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container text-on-surface-variant'>
              <span className='material-symbols-outlined'>{SERVICE_PLAN_ICONS.dementia}</span>
            </div>
            {selectedPlanId === 'dementia' ? (
              <span className='material-symbols-outlined text-[24px] text-primary'>{ICON_CHECK_CIRCLE}</span>
            ) : (
              <div className='h-5 w-5 rounded-full border-2 border-outline-variant/50' />
            )}
          </div>
          <h3 className='text-base font-bold text-on-surface'>
            {t('customer.booking.servicesSection.plans.dementia.title')}
          </h3>
          <p className='mt-1 text-xs leading-relaxed text-on-surface-variant'>
            {t('customer.booking.servicesSection.plans.dementia.desc')}
          </p>
        </div>

        {/* Plan 4: Palliative */}
        <div
          className={`cursor-pointer rounded-xl p-4 transition-all ${
            selectedPlanId === 'palliative'
              ? 'border-2 border-primary bg-surface-container-low shadow-xs'
              : 'border border-outline-variant/30 bg-surface-container-lowest hover:bg-surface-container-low/40'
          }`}
          onClick={() => onSelectPlan('palliative')}
        >
          <div className='mb-3 flex items-start justify-between'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container text-on-surface-variant'>
              <span className='material-symbols-outlined'>{SERVICE_PLAN_ICONS.palliative}</span>
            </div>
            {selectedPlanId === 'palliative' ? (
              <span className='material-symbols-outlined text-[24px] text-primary'>{ICON_CHECK_CIRCLE}</span>
            ) : (
              <div className='h-5 w-5 rounded-full border-2 border-outline-variant/50' />
            )}
          </div>
          <h3 className='text-base font-bold text-on-surface'>
            {t('customer.booking.servicesSection.plans.palliative.title')}
          </h3>
          <p className='mt-1 text-xs leading-relaxed text-on-surface-variant'>
            {t('customer.booking.servicesSection.plans.palliative.desc')}
          </p>
        </div>
      </div>
    </section>
  )
}
