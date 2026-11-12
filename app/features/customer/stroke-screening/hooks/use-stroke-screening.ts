import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import {
  careRecipientKeys,
  fetchCareRecipient,
  fetchCareRecipients
} from '~/entities/care-recipient/care-recipient-api'
import type { ListCareRecipientsParams, StrokeScreeningRequest } from '~/shared/api/generated/contracts'

import { screenStroke } from '../stroke-screening-api'
import {
  EMPTY_DRAFT,
  TOTAL_ANSWERS,
  answeredCount,
  draftFromProfile,
  sameRequest,
  toRequest,
  validateDraft,
  type DraftField,
  type FieldErrorKey,
  type PrefilledField,
  type ScreeningDraft
} from '../stroke-screening-form'

/** Same list request as the booking form, so both screens share one cache entry. */
const RECIPIENTS_REQUEST: ListCareRecipientsParams = { status: 'ACTIVE', page: 0, size: 50 }

export interface RecipientPrefill {
  id: string
  name: string
  prefilled: PrefilledField[]
  chronicConditions?: string
}

/**
 * State of the screening page: the draft (local form state), which number fields were left so their errors show, the
 * chosen family profile and the screening mutation. The request that produced the shown result is kept so the panel
 * can say when the form changed afterwards.
 */
export function useStrokeScreening() {
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState<ScreeningDraft>(EMPTY_DRAFT)
  const [touched, setTouched] = useState<Partial<Record<DraftField, boolean>>>({})
  const [recipientId, setRecipientId] = useState('')
  const [prefill, setPrefill] = useState<RecipientPrefill | null>(null)
  const [submitted, setSubmitted] = useState<StrokeScreeningRequest | null>(null)

  const recipients = useQuery({
    queryKey: careRecipientKeys.list(RECIPIENTS_REQUEST),
    queryFn: () => fetchCareRecipients(RECIPIENTS_REQUEST),
    retry: false
  })
  const profile = useMutation({
    mutationFn: (id: string) =>
      queryClient.fetchQuery({ queryKey: careRecipientKeys.detail(id), queryFn: () => fetchCareRecipient(id) })
  })
  const screening = useMutation({ mutationFn: screenStroke })

  const answered = answeredCount(draft)
  const complete = answered === TOTAL_ANSWERS
  // A number shows its error once the customer left it; with every item answered all remaining errors show, so a
  // disabled submit always has a visible reason.
  const allErrors = validateDraft(draft)
  const errors: Partial<Record<DraftField, FieldErrorKey>> = {}
  for (const field of Object.keys(allErrors) as DraftField[]) {
    if (touched[field] || complete) errors[field] = allErrors[field]
  }
  const request = toRequest(draft)
  const result = screening.data
  const stale = Boolean(result && submitted && (!request || !sameRequest(request, submitted)))

  function update<F extends keyof ScreeningDraft>(field: F, value: ScreeningDraft[F]) {
    setDraft((current) => ({ ...current, [field]: value }))
  }

  function touch(field: DraftField) {
    setTouched((current) => (current[field] ? current : { ...current, [field]: true }))
  }

  function startOver(next: ScreeningDraft) {
    setDraft(next)
    setTouched({})
    setSubmitted(null)
    screening.reset()
  }

  /** Choosing a person starts a new screening for that person, prefilled from the profile where possible. */
  function chooseRecipient(id: string) {
    setRecipientId(id)
    setPrefill(null)
    profile.reset()
    startOver(EMPTY_DRAFT)
    if (!id) return
    profile.mutate(id, {
      onSuccess: (detail) => {
        const fresh = draftFromProfile(detail.profile, new Date())
        startOver(fresh.draft)
        setPrefill({
          id,
          name: detail.profile.fullName,
          prefilled: fresh.prefilled,
          chronicConditions: detail.profile.chronicConditions?.trim() || undefined
        })
      }
    })
  }

  function submit(onDone?: () => void) {
    if (!request) {
      setTouched({ sex: true, age: true, bmi: true })
      return
    }
    screening.mutate(request, {
      onSuccess: () => {
        setSubmitted(request)
        onDone?.()
      }
    })
  }

  function reset() {
    setRecipientId('')
    setPrefill(null)
    profile.reset()
    startOver(EMPTY_DRAFT)
  }

  return {
    draft,
    answered,
    complete,
    errors,
    update,
    touch,
    recipients,
    recipientId,
    prefill,
    profile,
    chooseRecipient,
    request,
    screening,
    result,
    submitted,
    stale,
    submit,
    reset
  }
}

export type StrokeScreeningState = ReturnType<typeof useStrokeScreening>
