import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  fetchMyCaregiverProfile,
  fetchMyShiftRegistrations,
  fetchWorkShift,
  fetchWorkShifts,
  registerForShift
} from '~/entities/provider/provider-api'
import type { ProviderWorkShiftRecord } from '~/shared/api/generated/contracts'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { CaregiverWorkShiftsPage } from './caregiver-work-shifts-page'

vi.mock('~/entities/provider/provider-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/provider/provider-api')>()),
  fetchMyCaregiverProfile: vi.fn(),
  fetchWorkShifts: vi.fn(),
  fetchWorkShift: vi.fn(),
  fetchMyShiftRegistrations: vi.fn(),
  registerForShift: vi.fn(),
  cancelMyShiftRegistration: vi.fn()
}))

const day = 24 * 60 * 60 * 1000
const isoDate = (offsetDays: number) => {
  const date = new Date(Date.now() + offsetDays * day)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
const shift = (
  id: string,
  offsetDays: number,
  extra: Partial<ProviderWorkShiftRecord> = {}
): ProviderWorkShiftRecord => ({
  id,
  centerId: 'center-1',
  workDate: isoDate(offsetDays),
  startTime: '08:00:00',
  endTime: '12:00:00',
  shiftType: 'Ca sáng',
  shiftStatus: 'OPEN',
  capacity: 2,
  version: 1,
  ...extra
})
const open = shift('shift-open', 3)
const registered = shift('shift-registered', 4)
const closed = shift('shift-closed', 5, { registrationDeadline: new Date(Date.now() - day).toISOString() })
const started = shift('shift-started', -2)

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <CaregiverWorkShiftsPage />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  vi.clearAllMocks()
  vi.mocked(fetchMyCaregiverProfile).mockResolvedValue({
    id: 'cg-1',
    centerId: 'center-1',
    centerName: 'Care One',
    fullName: 'Lan',
    caregiverStatus: 'ACTIVE',
    verificationStatus: 'VERIFIED',
    version: 1
  })
  vi.mocked(fetchWorkShifts).mockResolvedValue({
    items: [open, registered, closed, started],
    page: 0,
    size: 20,
    totalElements: 4,
    totalPages: 1
  })
  vi.mocked(fetchMyShiftRegistrations).mockResolvedValue({
    items: [
      {
        id: 'reg-1',
        workShiftId: 'shift-registered',
        caregiverId: 'cg-1',
        registrationStatus: 'PENDING',
        caregiverNote: 'Có thể đến sớm',
        version: 2
      }
    ],
    page: 0,
    size: 20,
    totalElements: 1,
    totalPages: 1
  })
  vi.mocked(fetchWorkShift).mockResolvedValue(registered)
  await setAppLanguage('vi', false)
})

describe('Caregiver work shifts', () => {
  it('hides started shifts and only offers registering where it can still succeed', async () => {
    renderPage()

    const list = await screen.findByRole('region', { name: 'Ca làm việc đang mở' })
    await waitFor(() => expect(within(list).getAllByRole('listitem')).toHaveLength(3))
    expect(within(list).getAllByRole('button', { name: 'Đăng ký ca' })).toHaveLength(1)
    expect(within(list).getByText('Đã đăng ký')).toBeInTheDocument()
    expect(within(list).getByText('Đã hết hạn đăng ký')).toBeInTheDocument()
    expect(screen.getByText('3 ca đang mở')).toBeInTheDocument()
  })

  it('shows the shift date instead of its ID for each registration', async () => {
    renderPage()

    const mine = await screen.findByRole('region', { name: 'Đăng ký của tôi' })
    expect(await within(mine).findByText(/08:00/)).toBeInTheDocument()
    expect(within(mine).queryByText('shift-registered')).not.toBeInTheDocument()
    expect(within(mine).getByText('Ghi chú của bạn: Có thể đến sớm')).toBeInTheDocument()
    expect(fetchWorkShift).toHaveBeenCalledWith('shift-registered')
  })

  it('registers with an optional note written for that shift', async () => {
    vi.mocked(registerForShift).mockResolvedValue({
      id: 'reg-2',
      workShiftId: 'shift-open',
      caregiverId: 'cg-1',
      registrationStatus: 'PENDING',
      version: 0
    })
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: 'Đăng ký ca' }))
    const dialog = await screen.findByRole('dialog')
    fireEvent.change(within(dialog).getByRole('textbox', { name: 'Ghi chú cho trung tâm (không bắt buộc)' }), {
      target: { value: 'Rảnh cả ngày' }
    })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Đăng ký ca' }))
    await waitFor(() => expect(registerForShift).toHaveBeenCalledWith('shift-open', { caregiverNote: 'Rảnh cả ngày' }))
  })
})
