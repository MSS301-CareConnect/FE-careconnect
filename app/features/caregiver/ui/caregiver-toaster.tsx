import { useTranslation } from 'react-i18next'

import { Toaster } from '~/shared/ui/toaster'

/**
 * Sonner toasts for the caregiver portal: bottom centre, lifted above the phone tab bar so a toast never covers the
 * navigation or the sticky action bar's buttons.
 */
export function CaregiverToaster() {
  const { t } = useTranslation()
  return (
    <Toaster
      closeLabel={t('caregiver.ui.actions.close')}
      mobileOffset={{ bottom: 'calc(80px + env(safe-area-inset-bottom))' }}
      offset={{ bottom: 24 }}
      position='bottom-center'
      regionLabel={t('caregiver.ui.toast.region')}
    />
  )
}
