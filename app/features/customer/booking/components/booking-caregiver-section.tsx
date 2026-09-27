import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

const STEP_3_NUM = '3'
const ICON_VERIFIED = 'verified'
const ICON_STAR = 'star'
const ICON_DISTANCE = 'distance'
const ICON_SMART_TOY = 'smart_toy'
const BULLET = '•'

const CAREGIVER_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCrANvunmMmi0_5RbFkxoBiphDLL0up84bpuDfI0PFrudTLjtzoytc_08d5uGJou5eLlovYTWxHfuneyVeDtI5DsGlCBxXBI2DqEZ-Fg0VgiEE3wic0wGVM2xzV9sO3lHV9ttRhf3TJhJjvfoEYEN1GWrWkaopBIKy5Emkj15SAkwp2X335uqVhSudqPBnKF09WY1Pq_NZ9qIqNRh062dqjNUbCrRyy_rxl_exoUWvdvNBhJIEBO5VIyA'

interface BookingCaregiverSectionProps {
  smartMatchEnabled: boolean
  onToggleSmartMatch: () => void
}

export function BookingCaregiverSection({ smartMatchEnabled, onToggleSmartMatch }: BookingCaregiverSectionProps) {
  const { t } = useTranslation()

  return (
    <section className='rounded-xl bg-surface-container-lowest p-5 shadow-sm transition-shadow hover:shadow-md md:p-6'>
      {/* Header */}
      <div className='mb-4 flex items-center justify-between border-b border-outline-variant/20 pb-4'>
        <div className='flex items-center gap-3'>
          <span className='flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-low font-bold text-sm text-primary'>
            {STEP_3_NUM}
          </span>
          <div>
            <h2 className='text-lg font-bold text-on-surface sm:text-xl'>
              {t('customer.booking.caregiverSection.title')}
            </h2>
            <p className='text-xs text-on-surface-variant sm:text-sm'>
              {t('customer.booking.caregiverSection.subtitle')}
            </p>
          </div>
        </div>
        <Link
          className='rounded-lg px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-surface-container-low sm:text-sm'
          to='/customer/caregivers'
        >
          {t('customer.booking.caregiverSection.changeCaregiverBtn')}
        </Link>
      </div>

      {/* Caregiver Highlight Card */}
      <div className='flex flex-col items-start justify-between gap-5 rounded-xl bg-surface-container-low/70 p-4 sm:p-5 md:flex-row md:items-center'>
        <div className='flex items-start gap-4 sm:items-center'>
          <div className='relative shrink-0'>
            <img
              alt={t('customer.booking.caregiverSection.nurseName')}
              className='h-20 w-20 rounded-full object-cover shadow-xs ring-2 ring-primary/30'
              src={CAREGIVER_AVATAR}
            />
            <span
              className='absolute right-1 bottom-1 h-4 w-4 rounded-full bg-secondary ring-2 ring-surface-container-lowest'
              title={t('customer.booking.caregiverSection.onlineStatus')}
            />
          </div>

          <div>
            <div className='flex flex-wrap items-center gap-2'>
              <h3 className='text-base font-bold text-on-surface sm:text-lg'>
                {t('customer.booking.caregiverSection.nurseName')}
              </h3>
              <span className='inline-flex items-center gap-1 rounded-full bg-secondary-container px-2.5 py-0.5 text-xs font-semibold text-on-secondary-container'>
                <span className='material-symbols-outlined text-[14px]'>{ICON_VERIFIED}</span>
                <span>{t('customer.booking.caregiverSection.verifiedBadge')}</span>
              </span>
            </div>

            <p className='mt-1 text-xs text-on-surface-variant sm:text-sm'>
              {t('customer.booking.caregiverSection.nurseBio')}
            </p>

            <div className='mt-1.5 flex items-center gap-3 text-xs sm:text-sm'>
              <span className='flex items-center gap-1 font-semibold text-amber-600'>
                <span
                  className='material-symbols-outlined text-[18px] text-amber-500'
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {ICON_STAR}
                </span>
                <span>{t('customer.booking.caregiverSection.reviewsCount')}</span>
              </span>
              <span className='text-outline-variant'>{BULLET}</span>
              <span className='flex items-center gap-1 text-on-surface-variant'>
                <span className='material-symbols-outlined text-[16px] text-secondary'>{ICON_DISTANCE}</span>
                <span>{t('customer.booking.caregiverSection.distance')}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Rate box */}
        <div className='flex w-full flex-col justify-center sm:items-end md:w-auto'>
          <span className='text-xs text-on-surface-variant'>{t('customer.booking.caregiverSection.priceLabel')}</span>
          <span className='text-lg font-bold text-primary sm:text-xl'>
            {t('customer.booking.caregiverSection.priceRate')}{' '}
            <span className='text-xs font-normal text-on-surface-variant sm:text-sm'>
              {t('customer.booking.caregiverSection.perShiftSuffix')}
            </span>
          </span>
          <span className='mt-1 text-[12px] font-medium text-secondary'>
            {t('customer.booking.caregiverSection.includedSupplies')}
          </span>
        </div>
      </div>

      {/* Alternative SmartMatch Mode */}
      <div className='mt-4 flex items-center justify-between rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-4'>
        <div className='flex items-center gap-3 pr-4'>
          <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-container text-primary'>
            <span className='material-symbols-outlined text-[20px]'>{ICON_SMART_TOY}</span>
          </div>
          <div>
            <h4 className='text-sm font-semibold text-on-surface'>
              {t('customer.booking.caregiverSection.smartMatchTitle')}
            </h4>
            <p className='text-xs text-on-surface-variant sm:text-sm'>
              {t('customer.booking.caregiverSection.smartMatchDesc')}
            </p>
          </div>
        </div>

        <label className='relative inline-flex shrink-0 cursor-pointer items-center'>
          <input checked={smartMatchEnabled} className='peer sr-only' type='checkbox' onChange={onToggleSmartMatch} />
          <div className="h-6 w-11 rounded-full bg-surface-variant transition-all after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full" />
        </label>
      </div>
    </section>
  )
}
