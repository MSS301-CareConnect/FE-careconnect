import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { FeedbackRecord } from '~/shared/api/generated/contracts'
import { setAppLanguage } from '~/shared/i18n/i18n'
import { fetchCaregiverWork } from '~/entities/statistics/statistics-api'
import { CaregiverWorkCard } from '~/entities/statistics/caregiver-work-card'

import { fetchFeedbacks, sendFeedbackReply } from './aftercare-api'
import { FeedbackList } from './feedback-list'

vi.mock('./aftercare-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./aftercare-api')>()),
  fetchFeedbacks: vi.fn(),
  sendFeedbackReply: vi.fn()
}))
vi.mock('~/entities/statistics/statistics-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/statistics/statistics-api')>()),
  fetchCaregiverWork: vi.fn()
}))

function renderUi(ui: React.ReactNode) {
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  )
}

const page = (items: FeedbackRecord[]) => ({
  items,
  page: 0,
  size: 5,
  totalElements: items.length,
  totalPages: 1
})

beforeEach(async () => {
  vi.clearAllMocks()
  await setAppLanguage('vi', false)
})

describe('Customer reviews for the center', () => {
  it("lists a caregiver's reviews, filters by star and answers one review", async () => {
    vi.mocked(fetchFeedbacks).mockResolvedValue(
      page([
        { id: 'f-1', rating: 4, comment: 'Chu đáo', customerDisplayName: 'Chị Lan', createdAt: '2026-11-10T03:00:00Z' },
        { id: 'f-2', rating: 5, reply: 'Cảm ơn chị', customerDisplayName: 'Anh Minh' }
      ])
    )
    vi.mocked(sendFeedbackReply).mockResolvedValue({ id: 'f-1', rating: 4 })
    renderUi(<FeedbackList canReply caregiverId='cg-1' />)

    expect(await screen.findByText('Chu đáo')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '4 trên 5 sao' })).toBeInTheDocument()
    expect(screen.getByText('Cảm ơn chị')).toBeInTheDocument()
    expect(fetchFeedbacks).toHaveBeenCalledWith({
      caregiverId: 'cg-1',
      centerId: undefined,
      rating: undefined,
      page: 0,
      size: 5
    })

    fireEvent.click(screen.getByRole('button', { name: /5 sao/ }))
    await waitFor(() => expect(fetchFeedbacks).toHaveBeenLastCalledWith(expect.objectContaining({ rating: 5 })))

    // Only the review without a reply offers "Phản hồi".
    fireEvent.click(screen.getByRole('button', { name: 'Phản hồi' }))
    fireEvent.change(screen.getByLabelText('Phản hồi của trung tâm'), { target: { value: ' Cảm ơn chị Lan ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Gửi phản hồi' }))
    await waitFor(() => expect(sendFeedbackReply).toHaveBeenCalledWith('f-1', 'Cảm ơn chị Lan'))
  })

  it('shows the track record with hours and completed visits per service', async () => {
    vi.mocked(fetchCaregiverWork).mockResolvedValue([
      {
        caregiverId: 'cg-1',
        completedVisits: 12,
        upcomingVisits: 3,
        missedVisits: 1,
        cancelledVisits: 2,
        customerNoShowVisits: 0,
        completedMinutes: 1530,
        lastCompletedAt: '2026-11-12T01:00:00Z',
        ratingAverage: 4.6,
        ratingCount: 5,
        services: [
          { careServiceId: 's-1', serviceName: 'Chăm sóc người già', completedVisits: 9 },
          { careServiceId: 's-2', serviceName: null, completedVisits: 3 }
        ]
      }
    ])
    renderUi(<CaregiverWorkCard caregiverId='cg-1' />)

    expect(await screen.findByText('25,5 giờ')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('Chăm sóc người già')).toBeInTheDocument()
    expect(screen.getByText('9 buổi')).toBeInTheDocument()
    expect(screen.getByText('Dịch vụ không rõ tên')).toBeInTheDocument()
    expect(screen.getByText('4,6 ★ · 5 đánh giá')).toBeInTheDocument()
    expect(fetchCaregiverWork).toHaveBeenCalledWith({ caregiverId: 'cg-1', centerId: undefined })
  })
})
