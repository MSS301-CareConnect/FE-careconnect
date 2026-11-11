import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { reportVisitByCustomer } from '~/entities/booking/booking-api'
import type { BookingDetailRecord, BookingOccurrenceRecord } from '~/shared/api/generated/contracts'
import { i18n, setAppLanguage } from '~/shared/i18n/i18n'

import { BookingOccurrenceDetailDialog } from '../components/booking-occurrence-detail-dialog'

vi.mock('~/entities/booking/booking-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/booking/booking-api')>()),
  reportVisitByCustomer: vi.fn()
}))

const hour = 60 * 60 * 1000
const copy = (path: string) =>
  i18n.t(`customer.bookingDetail.occurrenceDetail.customerReport.${path}` as never) as string
const booking = { id: 'bk-1', occurrences: [] } as unknown as BookingDetailRecord

function renderDialog(occurrence: BookingOccurrenceRecord) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <BookingOccurrenceDetailDialog booking={booking} occurrence={occurrence} onClose={() => {}} />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  vi.clearAllMocks()
  vi.mocked(reportVisitByCustomer).mockResolvedValue({} as never)
  await setAppLanguage('vi', false)
})

describe('BookingOccurrenceDetailDialog customer report', () => {
  it('reports a started visit nobody came to, without a note', async () => {
    renderDialog({
      id: 'occ-1',
      occurrenceNo: 1,
      status: 'SCHEDULED',
      startAt: new Date(Date.now() - hour).toISOString(),
      endAt: new Date(Date.now() + hour).toISOString()
    })
    fireEvent.click(screen.getByRole('button', { name: copy('notArrived.action') }))
    fireEvent.click(screen.getByRole('button', { name: copy('confirm') }))
    await waitFor(() => expect(reportVisitByCustomer).toHaveBeenCalledWith('occ-1', undefined))
  })

  it('offers a finished-visit report within 24 hours', () => {
    const ended = (ago: number): BookingOccurrenceRecord => ({
      id: 'occ-2',
      occurrenceNo: 2,
      status: 'COMPLETED',
      startAt: new Date(Date.now() - ago - 2 * hour).toISOString(),
      endAt: new Date(Date.now() - ago).toISOString(),
      actualEndAt: new Date(Date.now() - ago).toISOString()
    })
    renderDialog(ended(2 * hour))
    expect(screen.getByRole('button', { name: copy('notDelivered.action') })).toBeInTheDocument()
  })

  it('hides the finished-visit report after 24 hours', () => {
    renderDialog({
      id: 'occ-3',
      occurrenceNo: 3,
      status: 'COMPLETED',
      startAt: new Date(Date.now() - 30 * hour).toISOString(),
      endAt: new Date(Date.now() - 26 * hour).toISOString(),
      actualEndAt: new Date(Date.now() - 26 * hour).toISOString()
    })
    expect(screen.queryByRole('button', { name: copy('notDelivered.action') })).not.toBeInTheDocument()
  })
})
