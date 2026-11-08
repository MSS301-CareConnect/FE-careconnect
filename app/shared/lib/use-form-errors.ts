import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'

import { classifyApiError, type ApiErrorMap, type ApiFailure } from '../api/api-error'

type FormFailure<F extends string, K extends string, B extends string> = Exclude<ApiFailure<F, K, B>, { kind: 'field' }>

/**
 * Field errors (keys, translated by the form), the form-level failure and focus handling for one form. After every
 * failed submit the first control marked `aria-invalid` inside `formRef` receives focus and scrolls into view. The
 * form owns its ref so the returned state stays plain render data.
 */
export function useFormErrors<F extends string, K extends string, B extends string = never>(
  map: ApiErrorMap<F, K, B> = {},
  formRef?: RefObject<HTMLElement | null>
) {
  // The map is a static constant at every call site; a ref keeps `fromApi` stable.
  const mapRef = useRef(map)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<F, K>>>({})
  const [failure, setFailure] = useState<FormFailure<F, K, B> | null>(null)
  const [focusRequest, setFocusRequest] = useState(0)

  useEffect(() => {
    if (focusRequest === 0) return
    const invalid = formRef?.current?.querySelector<HTMLElement>('[aria-invalid="true"]')
    invalid?.focus()
    invalid?.scrollIntoView?.({ block: 'center', behavior: 'smooth' })
  }, [focusRequest, formRef])

  /** Replaces the client-side errors; returns true when the form may be sent. */
  const validate = useCallback((errors: Partial<Record<F, K>>) => {
    setFieldErrors(errors)
    setFailure(null)
    if (Object.keys(errors).length === 0) return true
    setFocusRequest((count) => count + 1)
    return false
  }, [])

  const clearField = useCallback((field: F) => {
    setFieldErrors((previous) => {
      if (!(field in previous)) return previous
      const next = { ...previous }
      delete next[field]
      return next
    })
  }, [])

  const fromApi = useCallback((error: unknown) => {
    const classified = classifyApiError(error, mapRef.current)
    if (classified.kind === 'field') {
      setFieldErrors({ [classified.field]: classified.key } as Partial<Record<F, K>>)
      setFocusRequest((count) => count + 1)
    } else {
      setFailure(classified)
    }
  }, [])

  const reset = useCallback(() => {
    setFieldErrors({})
    setFailure(null)
  }, [])

  return { fieldErrors, failure, validate, clearField, fromApi, reset }
}
