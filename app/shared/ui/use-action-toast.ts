import { useTranslation } from 'react-i18next'

import { toastSuccess, toastSystemError } from './app-toast'

/**
 * Toasts for one write: `success` takes the finished sentence; `systemError` names the action that did not happen
 * ("tạo dịch vụ") and offers a retry. Validation and business failures return false and stay in their form.
 */
export function useActionToast() {
  const { t } = useTranslation()
  return {
    success: toastSuccess,
    systemError: (error: unknown, action: string, retry?: () => void) =>
      toastSystemError(error, {
        message: t('common.toast.systemError', { action }),
        retryLabel: t('common.toast.retry'),
        retry
      })
  }
}
