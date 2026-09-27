import { useTranslation } from 'react-i18next'

const ICON_CHECK = 'check'
const STEP_5_NUM = '5'

export function BookingStepper() {
  const { t } = useTranslation()

  return (
    <div className='rounded-xl bg-surface-container-lowest p-4 shadow-sm md:p-5'>
      <ol className='relative grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-5'>
        {/* Step 1 */}
        <li className='flex items-center gap-3'>
          <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-sm text-on-primary shadow-xs'>
            <span className='material-symbols-outlined text-[20px]'>{ICON_CHECK}</span>
          </div>
          <div className='min-w-0'>
            <p className='font-semibold text-xs text-primary uppercase tracking-wider'>
              {t('customer.booking.stepper.step1Label')}
            </p>
            <p className='truncate font-semibold text-sm text-on-surface'>{t('customer.booking.stepper.step1Title')}</p>
          </div>
        </li>

        {/* Step 2 */}
        <li className='flex items-center gap-3'>
          <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-sm text-on-primary shadow-xs'>
            <span className='material-symbols-outlined text-[20px]'>{ICON_CHECK}</span>
          </div>
          <div className='min-w-0'>
            <p className='font-semibold text-xs text-primary uppercase tracking-wider'>
              {t('customer.booking.stepper.step2Label')}
            </p>
            <p className='truncate font-semibold text-sm text-on-surface'>{t('customer.booking.stepper.step2Title')}</p>
          </div>
        </li>

        {/* Step 3 */}
        <li className='flex items-center gap-3'>
          <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-sm text-on-primary shadow-xs'>
            <span className='material-symbols-outlined text-[20px]'>{ICON_CHECK}</span>
          </div>
          <div className='min-w-0'>
            <p className='font-semibold text-xs text-primary uppercase tracking-wider'>
              {t('customer.booking.stepper.step3Label')}
            </p>
            <p className='truncate font-semibold text-sm text-on-surface'>{t('customer.booking.stepper.step3Title')}</p>
          </div>
        </li>

        {/* Step 4 */}
        <li className='flex items-center gap-3'>
          <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-sm text-on-primary shadow-xs'>
            <span className='material-symbols-outlined text-[20px]'>{ICON_CHECK}</span>
          </div>
          <div className='min-w-0'>
            <p className='font-semibold text-xs text-primary uppercase tracking-wider'>
              {t('customer.booking.stepper.step4Label')}
            </p>
            <p className='truncate font-semibold text-sm text-on-surface'>{t('customer.booking.stepper.step4Title')}</p>
          </div>
        </li>

        {/* Step 5 */}
        <li className='col-span-2 flex items-center gap-3 rounded-lg bg-surface-container-low/70 p-2 md:col-span-1'>
          <div className='flex h-9 w-9 shrink-0 animate-pulse items-center justify-center rounded-full bg-secondary font-bold text-sm text-on-secondary shadow-xs'>
            {STEP_5_NUM}
          </div>
          <div className='min-w-0'>
            <p className='font-bold text-xs text-secondary uppercase tracking-wider'>
              {t('customer.booking.stepper.step5Label')}
            </p>
            <p className='truncate font-bold text-sm text-secondary'>{t('customer.booking.stepper.step5Title')}</p>
          </div>
        </li>
      </ol>
    </div>
  )
}
