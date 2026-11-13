import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { searchCaregiversByService } from '~/entities/provider/provider-api'

import { useFreeCaregiverCheck, useVisitAvailability } from '../hooks/use-free-caregiver-check'

vi.mock('~/entities/provider/provider-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/provider/provider-api')>()),
  searchCaregiversByService: vi.fn()
}))

const page = (ids: string[]) =>
  ({ items: ids.map((caregiverId) => ({ caregiverId })), totalElements: ids.length, totalPages: 1 }) as never
const visits = Array.from({ length: 70 }, (_, index) => ({
  startAt: new Date(Date.UTC(2026, 11, 1 + index, 1)).toISOString(),
  endAt: new Date(Date.UTC(2026, 11, 1 + index, 3)).toISOString()
}))

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

beforeEach(() => vi.clearAllMocks())

describe('useFreeCaregiverCheck', () => {
  it('asks in chunks of 60 visits and warns when no caregiver is free for every chunk', async () => {
    vi.mocked(searchCaregiversByService)
      .mockResolvedValueOnce(page(['a', 'b']))
      .mockResolvedValueOnce(page(['c']))
    const { result } = renderHook(() => useFreeCaregiverCheck('center-1', ['svc'], visits, true), { wrapper })
    await waitFor(() => expect(result.current.noneFree).toBe(true))
    expect(searchCaregiversByService).toHaveBeenCalledTimes(2)
    expect(vi.mocked(searchCaregiversByService).mock.calls[0][0].slots).toHaveLength(60)
    expect(vi.mocked(searchCaregiversByService).mock.calls[1][0].slots).toHaveLength(10)
  })

  it('does not warn when one caregiver is free in every chunk, and never runs for a chosen caregiver', async () => {
    vi.mocked(searchCaregiversByService)
      .mockResolvedValueOnce(page(['a', 'b']))
      .mockResolvedValueOnce(page(['b']))
    const { result } = renderHook(() => useFreeCaregiverCheck('center-1', ['svc'], visits, true), { wrapper })
    await waitFor(() => expect(searchCaregiversByService).toHaveBeenCalledTimes(2))
    expect(result.current.noneFree).toBe(false)

    vi.clearAllMocks()
    renderHook(() => useFreeCaregiverCheck('center-1', ['svc'], visits, false), { wrapper })
    expect(searchCaregiversByService).not.toHaveBeenCalled()
  })

  it('asks each visit only when the whole list fails, and flags the chosen caregiver or the empty visit', async () => {
    const slots = [
      { date: '2026-12-07', startTime: '08:00', endTime: '10:00' },
      { date: '2026-12-08', startTime: '08:00', endTime: '10:00' }
    ]
    vi.mocked(searchCaregiversByService).mockImplementation(async (params) => {
      const ranges = params.slots ?? []
      if (ranges.length > 1) return page([])
      return page(ranges[0]?.startsWith('2026-12-07') ? [] : ['hoa'])
    })
    const chosen = renderHook(() => useVisitAvailability('center-1', ['svc'], 'hoa', slots, () => true), { wrapper })
    await waitFor(() => expect(chosen.result.current.availabilityOf(slots[0])).toBe('unavailable'))
    expect(chosen.result.current.availabilityOf(slots[1])).toBeNull()

    const center = renderHook(() => useVisitAvailability('center-1', ['svc'], undefined, slots, () => true), {
      wrapper
    })
    await waitFor(() => expect(center.result.current.availabilityOf(slots[0])).toBe('noneFree'))
    expect(center.result.current.availabilityOf(slots[1])).toBeNull()
  })
})
