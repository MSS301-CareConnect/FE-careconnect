import { useEffect } from 'react'

import { useServiceCenters } from '~/entities/care-center/care-center-api'
import { closeCenterPicker, selectCenter, useCurrentCenter } from '~/entities/care-center/selected-center'
import { Icon } from '~/shared/ui/icon'

import { CenterSelector } from './center-selector'

/**
 * The center context in the header. With several active centers it is the dropdown; with exactly one it is a small
 * static label, and that center is chosen for the customer so no picker ever asks about a single option.
 */
export function CenterChip() {
  const centers = useServiceCenters()
  const current = useCurrentCenter()
  const list = centers.data ?? []
  const only = list.length === 1 ? list[0] : null

  useEffect(() => {
    if (only && current?.id !== only.id) {
      selectCenter({ id: only.id, name: only.name })
      closeCenterPicker()
    }
  }, [only, current?.id])

  // A failed list keeps the dropdown so the customer can retry from it.
  if (list.length > 1 || centers.isError) return <CenterSelector />
  if (!only) return null
  return (
    <span className='hidden max-w-44 items-center gap-1.5 rounded-full border border-outline-variant px-3 py-1.5 text-xs font-medium text-on-surface-variant xl:inline-flex'>
      <Icon className='text-base text-primary' name='home_health' />
      <span className='truncate'>{only.name}</span>
    </span>
  )
}
