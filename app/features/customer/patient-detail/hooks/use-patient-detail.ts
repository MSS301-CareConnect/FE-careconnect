import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useSearchParams } from 'react-router'

import {
  careRecipientErrorStatus as errorStatus,
  careRecipientKeys,
  fetchCareRecipient,
  saveCareRecipient
} from '~/entities/care-recipient/care-recipient-api'
import { canEditCareRecipient } from '~/entities/care-recipient/care-recipient-format'
import type { CareRecipientUpdateRequest } from '~/shared/api/generated/contracts'

import {
  toProfileDraft,
  toUpdateRequest,
  validateProfileDraft,
  type ProfileDraft,
  type ProfileDraftError
} from '../profile-draft'

export function usePatientDetail(id: string) {
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const [isEditMode, setIsEditMode] = useState(() => searchParams.get('mode') === 'edit')
  const [draft, setDraft] = useState<ProfileDraft | null>(null)
  const [validationError, setValidationError] = useState<ProfileDraftError>()
  const [showToast, setShowToast] = useState(false)

  const detail = useQuery({
    queryKey: careRecipientKeys.detail(id),
    queryFn: () => fetchCareRecipient(id),
    retry: false
  })
  const profile = detail.data?.profile
  const canEdit = canEditCareRecipient(detail.data?.myAccessLevel) && profile?.status !== 'ARCHIVED'
  const editing = isEditMode && canEdit
  const currentDraft = draft ?? (profile ? toProfileDraft(profile) : null)

  const save = useMutation({
    mutationFn: (request: CareRecipientUpdateRequest) => saveCareRecipient(id, request),
    onSuccess: async () => {
      setDraft(null)
      setIsEditMode(false)
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3500)
      await queryClient.invalidateQueries({ queryKey: careRecipientKeys.all })
    }
  })

  function updateDraft(partial: Partial<ProfileDraft>) {
    if (!currentDraft) return
    setDraft({ ...currentDraft, ...partial })
  }

  function toggleEditMode() {
    setIsEditMode((previous) => !previous)
    setDraft(null)
    setValidationError(undefined)
    save.reset()
  }

  const saveFailure: 'conflict' | 'save' | undefined = save.isError
    ? errorStatus(save.error) === 409
      ? 'conflict'
      : 'save'
    : undefined

  function handleSave() {
    if (!profile || !currentDraft) return
    const error = validateProfileDraft(currentDraft)
    setValidationError(error)
    if (!error) save.mutate(toUpdateRequest(profile, currentDraft))
  }

  return {
    detail,
    draft: currentDraft,
    updateDraft,
    canEdit,
    isEditMode: editing,
    toggleEditMode,
    handleSave,
    isSaving: save.isPending,
    saveError: validationError ?? saveFailure,
    showToast
  }
}
