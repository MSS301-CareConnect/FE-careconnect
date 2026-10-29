import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { BookingAftercare } from '~/features/customer/bookings/components/booking-aftercare'
import type { CareReportRecord, ComplaintRecord } from '~/shared/api/generated/contracts'
import { setAppLanguage } from '~/shared/i18n/i18n'

import {
  accept,
  addSessionNote,
  adminResolve,
  escalate,
  fetchComplaints,
  fetchEligibleCaregivers,
  fetchReports,
  fetchSessionNotes,
  openComplaint,
  resolve,
  saveReport,
  sendFeedback,
  submitReport,
  withdraw
} from './aftercare-api'
import { CareReportForm } from './care-report-form'
import { ComplaintQueue } from './complaint-queue'
import { SessionNotesCard } from './session-notes-card'

vi.mock('./aftercare-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./aftercare-api')>()),
  fetchReports: vi.fn(),
  saveReport: vi.fn(),
  submitReport: vi.fn(),
  fetchSessionNotes: vi.fn(),
  addSessionNote: vi.fn(),
  fetchEligibleCaregivers: vi.fn(),
  sendFeedback: vi.fn(),
  fetchComplaints: vi.fn(),
  openComplaint: vi.fn(),
  escalate: vi.fn(),
  accept: vi.fn(),
  resolve: vi.fn(),
  adminResolve: vi.fn(),
  withdraw: vi.fn()
}))

const draft: CareReportRecord = { id: 'rep-1', sessionId: 'ses-1', status: 'DRAFT', version: 0, summary: '' }
const complaint: ComplaintRecord = {
  id: 'c-1',
  bookingId: 'bk-1',
  status: 'OPEN',
  title: 'Đến muộn',
  category: 'LATE',
  level: 'CENTER'
}

function renderUi(ui: ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  vi.clearAllMocks()
  await setAppLanguage('vi', false)
})

describe('Aftercare on the web (Đợt 3)', () => {
  it('lets the caregiver save a report draft and submit it (H-04)', async () => {
    vi.mocked(fetchReports).mockResolvedValueOnce([]).mockResolvedValue([draft])
    vi.mocked(saveReport).mockResolvedValue(draft)
    vi.mocked(submitReport).mockResolvedValue({ ...draft, status: 'SUBMITTED' })
    renderUi(<CareReportForm bookingId='bk-1' sessionId='ses-1' />)

    fireEvent.change(await screen.findByLabelText('Tóm tắt buổi chăm sóc'), { target: { value: ' Ăn ngủ tốt ' } })
    fireEvent.change(screen.getByLabelText('Tình trạng chung'), { target: { value: 'IMPROVED' } })
    fireEvent.click(screen.getByRole('button', { name: 'Nộp báo cáo' }))

    await waitFor(() =>
      expect(saveReport).toHaveBeenCalledWith(undefined, {
        sessionId: 'ses-1',
        overallCondition: 'IMPROVED',
        summary: 'Ăn ngủ tốt',
        recommendations: undefined,
        version: undefined
      })
    )
    await waitFor(() => expect(submitReport).toHaveBeenCalledWith('rep-1'))
  })

  it('locks a submitted report', async () => {
    vi.mocked(fetchReports).mockResolvedValue([{ ...draft, status: 'SUBMITTED', summary: 'Xong' }])
    renderUi(<CareReportForm bookingId='bk-1' sessionId='ses-1' />)

    expect(await screen.findByText('Báo cáo đã nộp.')).toBeInTheDocument()
    expect(screen.getByLabelText('Tóm tắt buổi chăm sóc')).toBeDisabled()
    expect(screen.queryByRole('button', { name: 'Nộp báo cáo' })).not.toBeInTheDocument()
  })

  it('lists and adds session notes (M-17)', async () => {
    vi.mocked(fetchSessionNotes).mockResolvedValue([{ id: 'n-1', content: 'Đã uống thuốc lúc 8h' }])
    vi.mocked(addSessionNote).mockResolvedValue({ id: 'n-2', content: 'Ngủ trưa' })
    renderUi(<SessionNotesCard canWrite sessionId='ses-1' />)

    expect(await screen.findByText('Đã uống thuốc lúc 8h')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Ghi chú mới'), { target: { value: 'Ngủ trưa' } })
    fireEvent.click(screen.getByRole('button', { name: 'Thêm ghi chú' }))
    await waitFor(() => expect(addSessionNote).toHaveBeenCalledWith('ses-1', 'Ngủ trưa'))
  })

  it('lets the manager take and resolve a complaint, and the admin decide with a refund (H-05)', async () => {
    vi.mocked(fetchComplaints).mockResolvedValue([complaint])
    vi.mocked(accept).mockResolvedValue({ ...complaint, status: 'IN_PROGRESS' })
    renderUi(<ComplaintQueue role='CENTER_MANAGER' />)
    fireEvent.click(await screen.findByRole('button', { name: 'Nhận xử lý' }))
    await waitFor(() => expect(accept).toHaveBeenCalledWith('c-1'))

    cleanup()
    vi.mocked(fetchComplaints).mockResolvedValue([{ ...complaint, status: 'IN_PROGRESS' }])
    vi.mocked(resolve).mockResolvedValue({ ...complaint, status: 'RESOLVED' })
    renderUi(<ComplaintQueue role='CENTER_MANAGER' />)
    fireEvent.click(await screen.findByRole('button', { name: 'Đang xử lý', pressed: false }))
    fireEvent.change(await screen.findByLabelText('Hướng giải quyết'), { target: { value: 'Đổi người chăm sóc' } })
    fireEvent.click(screen.getByRole('button', { name: 'Giải quyết' }))
    await waitFor(() => expect(resolve).toHaveBeenCalledWith('c-1', 'Đổi người chăm sóc'))
  })

  it('lets the admin resolve an escalated complaint with a refund', async () => {
    vi.mocked(fetchComplaints).mockResolvedValue([
      { ...complaint, status: 'ESCALATED', escalateReason: 'Chưa thỏa đáng' }
    ])
    vi.mocked(adminResolve).mockResolvedValue({ ...complaint, status: 'RESOLVED_BY_ADMIN' })
    renderUi(<ComplaintQueue role='ADMIN' />)

    expect(await screen.findByText('Chưa thỏa đáng')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Hướng giải quyết'), { target: { value: 'Hoàn một phần' } })
    fireEvent.change(screen.getByLabelText(/Số tiền hoàn/), { target: { value: '200000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Giải quyết' }))
    await waitFor(() =>
      expect(adminResolve).toHaveBeenCalledWith('c-1', { resolution: 'Hoàn một phần', refundAmount: 200000 })
    )
  })

  it('lets the customer review, complain and escalate on a completed booking', async () => {
    vi.mocked(fetchReports).mockResolvedValue([{ ...draft, status: 'SUBMITTED', summary: 'Buổi sáng ổn định' }])
    vi.mocked(fetchEligibleCaregivers).mockResolvedValue([{ caregiverId: 'cg-1' }])
    vi.mocked(sendFeedback).mockResolvedValue({ id: 'f-1' } as never)
    vi.mocked(fetchComplaints).mockResolvedValue([complaint, { ...complaint, id: 'other', bookingId: 'bk-2' }])
    vi.mocked(openComplaint).mockResolvedValue(complaint)
    vi.mocked(escalate).mockResolvedValue({ ...complaint, status: 'ESCALATED' })
    renderUi(<BookingAftercare bookingId='bk-1' completed />)

    expect(await screen.findByText('Buổi sáng ổn định')).toBeInTheDocument()
    fireEvent.click(await screen.findByLabelText('4 sao'))
    fireEvent.click(screen.getByRole('button', { name: 'Gửi đánh giá' }))
    await waitFor(() =>
      expect(sendFeedback).toHaveBeenCalledWith({
        bookingId: 'bk-1',
        caregiverId: 'cg-1',
        rating: 4,
        comment: undefined
      })
    )

    expect(await screen.findAllByText('Đến muộn')).toHaveLength(1)
    fireEvent.click(screen.getByRole('button', { name: 'Gửi khiếu nại' }))
    fireEvent.change(screen.getByLabelText('Tiêu đề'), { target: { value: 'Thái độ' } })
    fireEvent.change(screen.getByLabelText('Nội dung'), { target: { value: 'Nói chuyện khó nghe' } })
    fireEvent.click(screen.getByRole('button', { name: 'Gửi' }))
    await waitFor(() =>
      expect(openComplaint).toHaveBeenCalledWith({
        bookingId: 'bk-1',
        targetType: 'CAREGIVER_SERVICE',
        category: 'QUALITY',
        title: 'Thái độ',
        content: 'Nói chuyện khó nghe'
      })
    )
    fireEvent.change(screen.getByLabelText('Lý do chuyển cấp cao'), { target: { value: 'Quá 48h chưa xử lý' } })
    fireEvent.click(screen.getByRole('button', { name: 'Chuyển admin xử lý' }))
    await waitFor(() => expect(escalate).toHaveBeenCalledWith('c-1', 'Quá 48h chưa xử lý'))

    // D20: an unresolved complaint can be withdrawn by the customer.
    vi.mocked(withdraw).mockResolvedValue({ ...complaint, status: 'WITHDRAWN' })
    fireEvent.click(screen.getByRole('button', { name: 'Rút khiếu nại' }))
    await waitFor(() => expect(withdraw).toHaveBeenCalledWith('c-1'))
  })
})
