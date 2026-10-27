import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setAppLanguage } from '~/shared/i18n/i18n'
import { CaregiverCareReportPage } from '../caregiver-care-report-page'

function renderReport(code = 'BK-8821') {
  return render(
    <MemoryRouter initialEntries={[`/caregiver/shifts/${code}/report`]}>
      <Routes>
        <Route element={<CaregiverCareReportPage />} path='/caregiver/shifts/:id/report' />
      </Routes>
    </MemoryRouter>
  )
}
describe('Caregiver report', () => {
  beforeEach(async () => {
    await setAppLanguage('vi', false)
  })
  it('edits and saves a session draft, previews family copy and keeps submission disabled', () => {
    const view = renderReport()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('BK-8821')
    fireEvent.change(screen.getByLabelText('Ghi chép chuyên môn của Điều dưỡng phụ trách'), {
      target: { value: 'Ghi chú sau ca cần giữ.' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Thêm công việc phát sinh trong ca' }))
    fireEvent.change(screen.getByLabelText('Tên công việc'), { target: { value: 'Hỗ trợ thay áo' } })
    fireEvent.click(screen.getByRole('button', { name: 'Thêm công việc' }))
    expect(screen.getByRole('checkbox', { name: 'Đã hoàn thành: Hỗ trợ thay áo' })).toBeChecked()
    fireEvent.click(screen.getAllByRole('button', { name: 'Lưu bản nháp' })[0])
    expect(screen.getByRole('status')).toHaveTextContent('Đã lưu tạm bản nháp')
    view.unmount()
    renderReport()
    expect(screen.getByLabelText('Ghi chép chuyên môn của Điều dưỡng phụ trách')).toHaveValue('Ghi chú sau ca cần giữ.')
    expect(screen.getByRole('checkbox', { name: 'Đã hoàn thành: Hỗ trợ thay áo' })).toBeChecked()
    fireEvent.click(screen.getByRole('button', { name: 'Xem bản xem trước cho gia đình' }))
    const preview = screen.getByRole('dialog', { name: 'Bản xem trước cho gia đình' })
    expect(within(preview).getByText('Ghi chú sau ca cần giữ.')).toBeInTheDocument()
    fireEvent.click(within(preview).getByRole('button', { name: 'Đóng bản xem trước' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('checkbox', { name: /Tôi đã kiểm tra/ }))
    expect(screen.getByRole('button', { name: 'Gửi báo cáo & Ký số ca trực' })).toBeDisabled()
  })
  it('does not show another patient’s clinical measurements and handles unknown IDs', () => {
    const view = renderReport('BK-8790')
    expect(screen.getByRole('heading', { name: 'Bệnh nhân Trần B' })).toBeInTheDocument()
    expect(screen.getByText('Chưa có số đo trong bản mẫu của ca này.')).toBeInTheDocument()
    expect(screen.queryByText('125/80 mmHg')).not.toBeInTheDocument()
    view.unmount()
    renderReport('missing')
    expect(screen.getByRole('heading', { name: 'Không tìm thấy báo cáo ca trực' })).toBeInTheDocument()
  })
  it('rejects invalid evidence files and translates the UI to English', async () => {
    renderReport('BK-8755')
    fireEvent.change(screen.getByLabelText('Thêm ảnh'), {
      target: { files: [new File(['bad'], 'document.pdf', { type: 'application/pdf' })] }
    })
    expect(screen.getByRole('alert')).toHaveTextContent('Chọn ảnh JPG')
    await act(() => setAppLanguage('en', false))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Care session report')
    vi.spyOn(window, 'print').mockImplementation(() => {})
    fireEvent.click(screen.getByRole('button', { name: 'Print report' }))
    expect(window.print).toHaveBeenCalledOnce()
  })
})
