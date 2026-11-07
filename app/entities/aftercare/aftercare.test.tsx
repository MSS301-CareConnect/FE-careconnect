import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
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
  uploadReportPhotos,
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
  uploadReportPhotos: vi.fn(),
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
const reportPhoto = { mediaFileId: 'photo-1', displayOrder: 0, downloadUrl: 'https://example.test/report.jpg' }
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
    // The condition has no default, so the report cannot be sent until the caregiver states it.
    expect(screen.getByRole('button', { name: 'Nộp báo cáo' })).toBeDisabled()
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
    vi.mocked(fetchReports).mockResolvedValue([
      { ...draft, status: 'SUBMITTED', summary: 'Xong', photos: [reportPhoto] }
    ])
    renderUi(<CareReportForm bookingId='bk-1' sessionId='ses-1' />)

    expect(await screen.findByText('Báo cáo đã nộp.')).toBeInTheDocument()
    expect(screen.getByLabelText('Tóm tắt buổi chăm sóc')).toBeDisabled()
    expect(screen.queryByRole('button', { name: 'Nộp báo cáo' })).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Đính kèm ảnh')).not.toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Ảnh báo cáo 1' })).toHaveAttribute('src', reportPhoto.downloadUrl)
    fireEvent.click(screen.getByRole('button', { name: 'Xem ảnh Ảnh báo cáo 1' }))
    expect(within(screen.getByRole('dialog')).getByRole('img')).toHaveAttribute('src', reportPhoto.downloadUrl)
  })

  it('uploads selected photos to the saved draft before submitting', async () => {
    vi.mocked(fetchReports).mockResolvedValue([])
    vi.mocked(saveReport).mockResolvedValue(draft)
    vi.mocked(uploadReportPhotos).mockResolvedValue({ ...draft, photos: [reportPhoto] })
    vi.mocked(submitReport).mockResolvedValue({ ...draft, status: 'SUBMITTED', photos: [reportPhoto] })
    renderUi(<CareReportForm bookingId='bk-1' sessionId='ses-1' />)

    const input = await screen.findByLabelText('Đính kèm ảnh')
    fireEvent.change(input, { target: { files: [new File(['data'], 'wrong.pdf', { type: 'application/pdf' })] } })
    expect(screen.getByRole('alert')).toHaveTextContent('JPEG, PNG hoặc WebP')
    const file = new File(['image'], 'report.png', { type: 'image/png' })
    fireEvent.change(input, { target: { files: [file] } })
    expect(screen.getByText('1/5 ảnh')).toBeInTheDocument()
    expect(uploadReportPhotos).not.toHaveBeenCalled()

    fireEvent.change(screen.getByLabelText('Tóm tắt buổi chăm sóc'), { target: { value: 'Ăn ngủ tốt' } })
    fireEvent.change(screen.getByLabelText('Tình trạng chung'), { target: { value: 'IMPROVED' } })
    fireEvent.click(screen.getByRole('button', { name: 'Nộp báo cáo' }))

    expect(await screen.findByText('Báo cáo đã nộp.')).toBeInTheDocument()
    expect(uploadReportPhotos).toHaveBeenCalledWith('rep-1', [file])
    expect(submitReport).toHaveBeenCalledWith('rep-1')
    expect(vi.mocked(saveReport).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(uploadReportPhotos).mock.invocationCallOrder[0]
    )
    expect(vi.mocked(uploadReportPhotos).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(submitReport).mock.invocationCallOrder[0]
    )
  })

  it('retains the created draft and blocks upload replay after an uncertain result', async () => {
    vi.mocked(fetchReports)
      .mockResolvedValueOnce([])
      .mockResolvedValue([{ ...draft, photos: [reportPhoto] }])
    vi.mocked(saveReport).mockResolvedValue(draft)
    vi.mocked(uploadReportPhotos).mockRejectedValueOnce(new TypeError('Network failure'))
    renderUi(<CareReportForm bookingId='bk-1' sessionId='ses-1' />)

    const input = await screen.findByLabelText('Đính kèm ảnh')
    fireEvent.change(input, { target: { files: [new File(['image'], 'report.png', { type: 'image/png' })] } })
    fireEvent.change(screen.getByLabelText('Tóm tắt buổi chăm sóc'), { target: { value: 'Đang soạn' } })
    fireEvent.change(screen.getByLabelText('Tình trạng chung'), { target: { value: 'IMPROVED' } })
    fireEvent.click(screen.getByRole('button', { name: 'Lưu nháp' }))

    const recover = await screen.findByRole('button', { name: 'Tải lại và bỏ ảnh đang chờ' })
    expect(screen.getByRole('button', { name: 'Lưu nháp' })).toBeDisabled()
    fireEvent.click(recover)
    await waitFor(() => expect(screen.getByRole('button', { name: 'Lưu nháp' })).toBeEnabled())
    expect(screen.getByLabelText('Tóm tắt buổi chăm sóc')).toHaveValue('Đang soạn')
    expect(await screen.findByRole('img', { name: 'Ảnh báo cáo 1' })).toBeInTheDocument()
    expect(uploadReportPhotos).toHaveBeenCalledTimes(1)
    expect(submitReport).not.toHaveBeenCalled()
  })

  it('lets the caregiver refresh a failed attachment without clearing draft edits', async () => {
    const refreshedPhoto = { ...reportPhoto, downloadUrl: 'https://example.test/refreshed.jpg' }
    vi.mocked(fetchReports)
      .mockResolvedValueOnce([{ ...draft, photos: [reportPhoto] }])
      .mockResolvedValue([{ ...draft, photos: [refreshedPhoto] }])
    renderUi(<CareReportForm bookingId='bk-1' sessionId='ses-1' />)

    fireEvent.change(await screen.findByLabelText('Tóm tắt buổi chăm sóc'), { target: { value: 'Đang soạn' } })
    fireEvent.error(screen.getByRole('img', { name: 'Ảnh báo cáo 1' }))
    fireEvent.click(screen.getByRole('button', { name: 'Tải lại ảnh' }))

    await waitFor(() =>
      expect(screen.getByRole('img', { name: 'Ảnh báo cáo 1' })).toHaveAttribute('src', refreshedPhoto.downloadUrl)
    )
    expect(screen.getByLabelText('Tóm tắt buổi chăm sóc')).toHaveValue('Đang soạn')
  })

  it('shows only submitted report photos to the customer, in display order', async () => {
    const secondPhoto = { mediaFileId: 'photo-2', displayOrder: 1, downloadUrl: 'https://example.test/second.jpg' }
    vi.mocked(fetchReports).mockResolvedValue([
      { ...draft, id: 'private-draft', photos: [{ downloadUrl: 'https://example.test/draft.jpg' }] },
      { ...draft, status: 'SUBMITTED', photos: [secondPhoto, reportPhoto] }
    ])
    vi.mocked(fetchComplaints).mockResolvedValue([])
    renderUi(<BookingAftercare bookingId='bk-1' completed={false} visited />)

    const photos = await within(await screen.findByRole('list', { name: 'Ảnh đính kèm' })).findAllByRole('img')
    expect(photos.map((photo) => photo.getAttribute('src'))).toEqual([reportPhoto.downloadUrl, secondPhoto.downloadUrl])
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
    renderUi(<BookingAftercare bookingId='bk-1' completed visited />)

    expect(await screen.findByText('Buổi sáng ổn định')).toBeInTheDocument()
    // No rating is preselected, so the review cannot be sent until one is chosen.
    expect(await screen.findByRole('button', { name: 'Gửi đánh giá' })).toBeDisabled()
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
    expect(withdraw).not.toHaveBeenCalled()
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Rút khiếu nại' }))
    await waitFor(() => expect(withdraw).toHaveBeenCalledWith('c-1'))
  })

  it('hides reports and new complaints before any visit has taken place', async () => {
    vi.mocked(fetchComplaints).mockResolvedValue([])
    renderUi(<BookingAftercare bookingId='bk-1' completed={false} visited={false} />)
    await waitFor(() => expect(fetchComplaints).toHaveBeenCalled())
    expect(screen.queryByRole('button', { name: 'Gửi khiếu nại' })).not.toBeInTheDocument()
    expect(fetchReports).not.toHaveBeenCalled()
  })
})
