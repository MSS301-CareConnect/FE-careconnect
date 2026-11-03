import { useSearchParams } from 'react-router'

import type { ServiceCenter } from '~/entities/care-center/care-center-api'
import { useChooseCenter } from '~/entities/care-center/use-choose-center'

/** A new center changes every list, so a page number from the previous one no longer applies. */
export function usePickCenter() {
  const [params, setParams] = useSearchParams()
  const chooseCenter = useChooseCenter()
  return (center: ServiceCenter | null) => {
    chooseCenter(center)
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
