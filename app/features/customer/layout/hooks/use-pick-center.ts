import { useSearchParams } from 'react-router'

import type { ServiceCenter } from '~/entities/care-center/care-center-api'
import { selectCenter } from '~/entities/care-center/selected-center'

/** A new center changes every list, so a page number from the previous one no longer applies. */
export function usePickCenter() {
  const [params, setParams] = useSearchParams()
  return (center: ServiceCenter | null) => {
    selectCenter(center)
    if (params.has('page'))
      setParams(
        (previous) => {
          const next = new URLSearchParams(previous)
          next.delete('page')
          return next
        },
        { replace: true }
      )
  }
}
