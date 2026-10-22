import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router'

import {
  archiveCareRecipient,
  careRecipientKeys,
  fetchCareRecipients
} from '~/entities/care-recipient/care-recipient-api'
import type { ListCareRecipientsParams } from '~/shared/api/generated/contracts'

import { STATUS_OPTIONS, type StatusFilter } from '../types'

const PAGE_SIZE = 10
const overviewRequest: ListCareRecipientsParams = { page: 0, size: PAGE_SIZE }

function parseStatus(value: string | null): StatusFilter {
  return STATUS_OPTIONS.find((status) => status === value) ?? 'ALL'
}

export function usePatientProfiles() {
  const queryClient = useQueryClient()
  const [params, setParams] = useSearchParams()
  const keyword = params.get('q') ?? ''
  const status = parseStatus(params.get('status'))
  const page = Math.max(0, Number(params.get('page')) || 0)
  const request: ListCareRecipientsParams = {
    keyword: keyword.trim() || undefined,
    status: status === 'ALL' ? undefined : status,
    page,
    size: PAGE_SIZE
  }

  const profiles = useQuery({
    queryKey: careRecipientKeys.list(request),
    queryFn: () => fetchCareRecipients(request),
    retry: false
  })
  // The unfiltered first page shares its cache entry with the default list view.
  const overview = useQuery({
    queryKey: careRecipientKeys.list(overviewRequest),
    queryFn: () => fetchCareRecipients(overviewRequest),
    retry: false
  })
  const remove = useMutation({
    mutationFn: archiveCareRecipient,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: careRecipientKeys.all })
  })

  function update(name: 'q' | 'status' | 'page', value: string) {
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      if (value) next.set(name, value)
      else next.delete(name)
      if (name !== 'page') next.delete('page')
      return next
    })
  }

  return {
    profiles,
    familyCount: overview.data?.totalElements,
    keyword,
    status,
    page,
    hasFilters: Boolean(request.keyword || request.status),
    setKeyword: (value: string) => update('q', value.trim()),
    setStatus: (value: StatusFilter) => update('status', value === 'ALL' ? '' : value),
    setPage: (value: number) => update('page', value > 0 ? String(value) : ''),
    remove
  }
}
