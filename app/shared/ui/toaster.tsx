import { useTranslation } from 'react-i18next'
import { Toaster as SonnerToaster } from 'sonner'

import { Icon } from './icon'

/**
 * Sonner styled with the project tokens instead of its defaults. Bottom right: the admin topbar (notifications, account
 * menu) and each page's primary buttons live at the top right, so toasts there would cover them.
 */
export function Toaster() {
  const { t } = useTranslation()
  return (
    <SonnerToaster
      containerAriaLabel={t('common.toast.region')}
      gap={10}
      icons={{
        success: <Icon className='text-xl' name='check_circle' />,
        error: <Icon className='text-xl' name='error' />,
        warning: <Icon className='text-xl' name='warning' />,
        info: <Icon className='text-xl' name='info' />
      }}
      position='bottom-right'
      toastOptions={{
        unstyled: true,
        closeButton: true,
        closeButtonAriaLabel: t('common.toast.close'),
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
          actionButton:
            'ml-auto shrink-0 self-center rounded-lg border border-current/25 px-2.5 py-1 text-xs font-semibold hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-current',
          closeButton:
            'absolute top-2.5 right-2.5 grid h-6 w-6 place-items-center rounded-md opacity-70 hover:bg-black/5 hover:opacity-100 [&_svg]:h-3.5 [&_svg]:w-3.5'
        }
      }}
    />
  )
}
