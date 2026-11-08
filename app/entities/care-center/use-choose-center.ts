import { useTranslation } from 'react-i18next'

import { toastInfo } from '~/shared/ui/app-toast'

import type { ServiceCenter } from './care-center-api'
import { getSelectedCenter, selectCenter } from './selected-center'

/**
 * An explicit choice of the customer (header chip, picker dialog, center pages): the lists rescope where they are and
 * a short toast names the center now shown. Nothing else may change the header selection on the customer's behalf.
 */
export function useChooseCenter() {
  const { t } = useTranslation()
  return (center: ServiceCenter | null) => {
    const changed = (getSelectedCenter()?.id ?? null) !== (center?.id ?? null)
    selectCenter(center)
    if (!changed) return
    toastInfo(
      center ? t('customer.centerPicker.toast.center', { name: center.name }) : t('customer.centerPicker.toast.all')
    )
  }
}
