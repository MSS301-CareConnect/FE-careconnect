import { useTranslation } from 'react-i18next'

import type { ServiceCenter } from '~/entities/care-center/care-center-api'
import { useSelectedCenter } from '~/entities/care-center/selected-center'
import { useChooseCenter } from '~/entities/care-center/use-choose-center'
import { Icon } from '~/shared/ui/icon'

const key = 'customer.centers' as const

/**
 * "Choose this center", or "Selected" once it is the header's center. Choosing is the only action on these pages that
 * changes the header selection; viewing a center, its services or caregivers never does.
 */
export function ChooseCenterButton({ center, size = 'md' }: { center: ServiceCenter; size?: 'sm' | 'md' }) {
  const { t } = useTranslation()
  const { center: selected } = useSelectedCenter()
  const chooseCenter = useChooseCenter()
  const height = size === 'sm' ? 'min-h-10 px-3.5' : 'min-h-11 px-4'

  if (selected?.id === center.id)
    return (
      <span
        className={`inline-flex ${height} items-center gap-1.5 rounded-lg bg-brand-50 text-sm font-semibold text-primary`}
      >
        <Icon aria-hidden='true' className='text-lg' name='check_circle' />
        {t(`${key}.selected`)}
      </span>
    )

  return (
    <button
      aria-label={t(`${key}.chooseNamed`, { name: center.name })}
      className={`relative z-10 inline-flex ${height} items-center gap-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm font-semibold text-primary transition-colors hover:border-primary hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`}
      onClick={() => chooseCenter({ id: center.id, name: center.name })}
      type='button'
    >
      <Icon aria-hidden='true' className='text-lg' name='home_health' />
      {t(`${key}.choose`)}
    </button>
  )
}
