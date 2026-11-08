import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  careRecipientErrorStatus,
  careRecipientKeys,
  saveCareRecipient
} from '~/entities/care-recipient/care-recipient-api'
import type { CareRecipientRecord, CareRecipientUpdateRequest } from '~/shared/api/generated/contracts'

import {
  toProfileDraft,
  toUpdateRequest,
  validateProfileDraft,
  type ProfileDraft,
  type ProfileDraftError
} from '../profile-draft'

/** The parts of the profile that open in their own dialog; each saves the whole profile with its `version`. */
export type EditSection = 'basic' | 'address' | 'medical' | 'daily'

/**
 * One dialog at a time edits one section. The draft starts from the profile when the dialog opens, and the PUT still
 * sends every field because the backend replaces the whole profile; a 409 asks the customer to reload.
 */
export function useProfileEditor(recipientId: string, onSaved: () => void) {
  const queryClient = useQueryClient()
  const [section, setSection] = useState<EditSection | null>(null)
  const [draft, setDraft] = useState<ProfileDraft | null>(null)
  const [validationError, setValidationError] = useState<ProfileDraftError>()

  const save = useMutation({
    mutationFn: (request: CareRecipientUpdateRequest) => saveCareRecipient(recipientId, request),
    onSuccess: async () => {
      setSection(null)
      setDraft(null)
      onSaved()
      await queryClient.invalidateQueries({ queryKey: careRecipientKeys.all })
    }
  })

  function open(next: EditSection, profile: CareRecipientRecord) {
    if (!save.isIdle) save.reset()
    setValidationError(undefined)
    setDraft(toProfileDraft(profile))
    setSection(next)
  }

  function close() {
    if (save.isPending) return
    setSection(null)
    setDraft(null)
  }

  /** `patch` holds last-moment corrections of the dialog, such as the address in its official spelling. */
  function submit(profile: CareRecipientRecord, patch?: Partial<ProfileDraft>) {
    if (!draft) return
    const next = patch ? { ...draft, ...patch } : draft
    if (patch) setDraft(next)
    const error = validateProfileDraft(next)
    setValidationError(error)
    if (!error) save.mutate(toUpdateRequest(profile, next))
  }

  const saveFailure: 'conflict' | 'save' | undefined = save.isError
    ? careRecipientErrorStatus(save.error) === 409
      ? 'conflict'
      : 'save'
    : undefined

  return {
    section,
    draft,
    update: (partial: Partial<ProfileDraft>) => setDraft((current) => (current ? { ...current, ...partial } : current)),
    open,
    close,
    submit,
    saving: save.isPending,
    error: validationError ?? saveFailure
  }
}
