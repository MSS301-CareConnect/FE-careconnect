import { useTranslation } from 'react-i18next'
import { Toaster as SonnerToaster } from 'sonner'

import { Icon } from '~/shared/ui/icon'

/**
 * Sonner toasts for the caregiver portal: bottom centre, lifted above the phone tab bar so a toast never covers the
 * navigation or the sticky action bar's buttons.
 */
export function CaregiverToaster() {
  const { t } = useTranslation()
  return (
    <SonnerToaster
      containerAriaLabel={t('caregiver.ui.toast.region')}
      gap={10}
      icons={{
        success: <Icon className='text-xl' name='check_circle' />,
        error: <Icon className='text-xl' name='error' />,
        warning: <Icon className='text-xl' name='warning' />,
        info: <Icon className='text-xl' name='info' />
      }}
      mobileOffset={{ bottom: 'calc(80px + env(safe-area-inset-bottom))' }}
      offset={{ bottom: 24 }}
      position='bottom-center'
      toastOptions={{
        unstyled: true,
        closeButton: true,
        closeButtonAriaLabel: t('caregiver.ui.actions.close'),
        classNames: {
          toast:
            'group relative flex w-full items-start gap-3 rounded-xl border py-3 pr-10 pl-4 font-sans text-sm leading-5 shadow-[0_10px_28px_-12px_rgb(15_35_25/0.35)] sm:w-[23rem]',
          success: 'border-outline-variant bg-success-container text-on-success-container',
          error: 'border-error/30 bg-error-container text-on-error-container',
          warning: 'border-warning/30 bg-warning-container text-on-warning-container',
          info: 'border-info/30 bg-info-container text-on-info-container',
          icon: 'mt-px shrink-0',
          content: 'min-w-0 flex-1',
          title: 'font-semibold',
          description: 'mt-0.5 opacity-90',
          closeButton:
            'absolute top-2.5 right-2.5 grid h-6 w-6 place-items-center rounded-md opacity-70 hover:bg-black/5 hover:opacity-100 [&_svg]:h-3.5 [&_svg]:w-3.5'
        }
      }}
    />
  )
}
