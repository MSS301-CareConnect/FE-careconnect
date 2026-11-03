import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchMyOccurrences } from '~/entities/booking/booking-api'
import {
  cancelMyShiftRegistration,
  createTimeOff,
  fetchMyCaregiverProfile,
  fetchMySchedules,
  fetchMyShiftRegistrations,
  fetchTimeOffs,
  fetchWorkShift,
  fetchWorkShifts,
  registerForShift,
  updateCaregiverSchedule
} from '~/entities/provider/provider-api'
import type { ProviderWorkShiftRecord } from '~/shared/api/generated/contracts'
import { calendarDayOf } from '~/shared/lib/format'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { buildCalendarItems } from '../calendar/calendar-model'
import { CaregiverWorkPage } from '../caregiver-work-page'

vi.mock('~/entities/provider/provider-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/provider/provider-api')>()),
  cancelMyShiftRegistration: vi.fn(),
  createTimeOff: vi.fn(),
  fetchMyCaregiverProfile: vi.fn(),
  fetchMySchedules: vi.fn(),
  fetchMyShiftRegistrations: vi.fn(),
  fetchTimeOffs: vi.fn(),
  fetchWorkShift: vi.fn(),
  fetchWorkShifts: vi.fn(),
  registerForShift: vi.fn(),
  updateCaregiverSchedule: vi.fn()
}))
vi.mock('~/entities/booking/booking-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/booking/booking-api')>()),
  fetchMyOccurrences: vi.fn()
}))

const today = calendarDayOf(new Date())
const inDays = (days: number) => {
  const date = new Date(`${today}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

const shift: ProviderWorkShiftRecord = {
  id: 'shift-1',
  centerId: 'center-1',
  centerName: 'TT An Tâm',
  workDate: inDays(5),
  startTime: '08:00:00',
  endTime: '20:00:00',
  shiftType: 'DAILY',
  shiftStatus: 'OPEN',
  capacity: 10,
  approvedCount: 4,
  registrationDeadline: new Date(Date.now() + 3 * 24 * 3_600_000).toISOString(),
  version: 1
}

function renderWork(tab: 'calendar' | 'shifts' | 'timeOff') {
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter>
        <CaregiverWorkPage tab={tab} />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  vi.clearAllMocks()
  vi.mocked(fetchMyCaregiverProfile).mockResolvedValue({
    id: 'caregiver-1',
    centerId: 'center-1',
    centerName: 'TT An Tâm',
    fullName: 'Hoa',
    caregiverStatus: 'ACTIVE',
    verificationStatus: 'VERIFIED',
    version: 1
  })
  vi.mocked(fetchMySchedules).mockResolvedValue({ items: [], page: 0, size: 100, totalElements: 0, totalPages: 1 })
  vi.mocked(fetchMyOccurrences).mockResolvedValue({ items: [], page: 0, size: 100, totalElements: 0, totalPages: 1 })
  vi.mocked(fetchTimeOffs).mockResolvedValue([])
  vi.mocked(fetchWorkShifts).mockResolvedValue({ items: [shift], page: 0, size: 100, totalElements: 1, totalPages: 1 })
  vi.mocked(fetchMyShiftRegistrations).mockResolvedValue({
    items: [],
    page: 0,
    size: 100,
    totalElements: 0,
    totalPages: 1
  })
  await setAppLanguage('vi', false)
})

describe('Work schedule — shift sign-up', () => {
  it('shows each open shift with capacity and registers with the optional note', async () => {
    vi.mocked(registerForShift).mockResolvedValue({
      id: 'reg-1',
      workShiftId: 'shift-1',
      caregiverId: 'caregiver-1',
      registrationStatus: 'PENDING',
      version: 0
    })
    renderWork('shifts')

    expect(await screen.findByText('4/10 người')).toBeInTheDocument()
    expect(screen.getByText('Chưa đăng ký')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Đăng ký' }))
    const sheet = screen.getByRole('dialog', { name: 'Đăng ký ca này?' })
    fireEvent.change(within(sheet).getByLabelText('Ghi chú cho trung tâm (không bắt buộc)'), {
      target: { value: 'Em tới sớm' }
    })
    fireEvent.click(within(sheet).getByRole('button', { name: 'Đăng ký' }))
    await waitFor(() => expect(registerForShift).toHaveBeenCalledWith('shift-1', { caregiverNote: 'Em tới sớm' }))
  })

  it('marks a shift already signed up and withdraws a pending sign-up with its version', async () => {
    vi.mocked(fetchMyShiftRegistrations).mockResolvedValue({
      items: [
        { id: 'reg-1', workShiftId: 'shift-1', caregiverId: 'caregiver-1', registrationStatus: 'PENDING', version: 2 }
      ],
      page: 0,
      size: 100,
      totalElements: 1,
      totalPages: 1
    })
    vi.mocked(fetchWorkShift).mockResolvedValue(shift)
    vi.mocked(cancelMyShiftRegistration).mockResolvedValue(undefined)
    renderWork('shifts')

    expect(await screen.findByText('Đã đăng ký · chờ duyệt')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Đăng ký' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Hủy đăng ký' }))
    const dialog = screen.getByRole('dialog', { name: 'Hủy đăng ký ca này?' })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Hủy đăng ký' }))
    await waitFor(() => expect(cancelMyShiftRegistration).toHaveBeenCalledWith('reg-1', 2))
  })
})

describe('Work schedule — my calendar', () => {
  it('cancels an open availability slot with a reason and its version', async () => {
    vi.mocked(fetchMySchedules).mockResolvedValue({
      items: [
        {
          id: 'slot-1',
          caregiverId: 'caregiver-1',
          workShiftId: 'shift-1',
          centerId: 'center-1',
          workDate: today,
          startTime: '23:00:00',
          endTime: '23:59:00',
          scheduleStatus: 'SCHEDULED',
          version: 4
        }
      ],
      page: 0,
      size: 100,
      totalElements: 1,
      totalPages: 1
    })
    vi.mocked(updateCaregiverSchedule).mockResolvedValue({} as never)
    renderWork('calendar')

    expect(await screen.findByText('1 khung rảnh tuần này')).toBeInTheDocument()
    fireEvent.click(screen.getAllByRole('button', { name: /23:00–23:59/ })[0])
    const drawer = screen.getByRole('dialog', { name: 'Khung rảnh' })
    fireEvent.click(within(drawer).getByRole('button', { name: 'Hủy khung rảnh' }))
    const confirm = screen.getByRole('dialog', { name: 'Hủy khung rảnh này?' })
    fireEvent.click(within(confirm).getByRole('button', { name: 'Hủy khung rảnh' }))
    expect(await within(confirm).findByText('Nhập lý do hủy.')).toBeInTheDocument()
    fireEvent.change(within(confirm).getByLabelText('Lý do'), { target: { value: 'Bận việc nhà' } })
    fireEvent.click(within(confirm).getByRole('button', { name: 'Hủy khung rảnh' }))
    await waitFor(() =>
      expect(updateCaregiverSchedule).toHaveBeenCalledWith('slot-1', {
        status: 'CANCELLED',
        version: 4,
        reason: 'Bận việc nhà'
      })
    )
  })

  it('splits a time off over several days and keeps visits and slots on their own day', () => {
    const items = buildCalendarItems({
      from: '2026-11-02',
      to: '2026-11-08',
      now: Date.parse('2026-11-01T00:00:00Z'),
      slots: [
        {
          id: 's',
          caregiverId: 'c',
          workShiftId: 'w',
          centerId: 'x',
          workDate: '2026-11-03',
          startTime: '08:00:00',
          endTime: '20:00:00',
          scheduleStatus: 'SCHEDULED',
          version: 1
        }
      ],
      visits: [
        {
          id: 'v',
          occurrenceNo: 1,
          bookingId: 'b',
          status: 'ACKNOWLEDGED',
          startAt: '2026-11-03T02:00:00Z',
          endAt: '2026-11-03T04:00:00Z'
        }
      ],
      timeOffs: [{ id: 't', caregiverId: 'c', startAt: '2026-11-05T17:00:00Z', endAt: '2026-11-07T17:00:00Z' }]
    })
    expect(items.map((item) => [item.kind, item.day, item.start, item.end])).toEqual([
      ['availability', '2026-11-03', 480, 1200],
      ['visit', '2026-11-03', 540, 660],
      ['timeOff', '2026-11-06', 0, 1440],
      ['timeOff', '2026-11-07', 0, 1440]
    ])
  })
})

describe('Work schedule — time off', () => {
  it('adds whole days of time off in Vietnam time', async () => {
    vi.mocked(createTimeOff).mockResolvedValue({ id: 't-1', caregiverId: 'caregiver-1', startAt: '', endAt: '' })
    renderWork('timeOff')

    expect(await screen.findByText('Chưa có ngày nghỉ nào sắp tới')).toBeInTheDocument()
    fireEvent.click(screen.getAllByRole('button', { name: 'Thêm ngày nghỉ' })[0])
    const drawer = screen.getByRole('dialog', { name: 'Thêm ngày nghỉ' })
    const start = inDays(2)
    const [year, month, day] = start.split('-')
    fireEvent.change(within(drawer).getByLabelText('Từ ngày'), { target: { value: `${day}/${month}/${year}` } })
    fireEvent.change(within(drawer).getByLabelText('Đến ngày'), { target: { value: `${day}/${month}/${year}` } })
    fireEvent.change(within(drawer).getByLabelText('Lý do (không bắt buộc)'), { target: { value: 'Việc gia đình' } })
    fireEvent.click(within(drawer).getByRole('button', { name: 'Lưu ngày nghỉ' }))

    await waitFor(() =>
      expect(createTimeOff).toHaveBeenCalledWith('caregiver-1', {
        startAt: new Date(`${start}T00:00:00+07:00`).toISOString(),
        endAt: new Date(`${inDays(3)}T00:00:00+07:00`).toISOString(),
        reason: 'Việc gia đình'
      })
    )
  })
})
