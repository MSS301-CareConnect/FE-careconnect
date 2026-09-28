import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useParams } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setAppLanguage } from '~/shared/i18n/i18n'
import { CustomerCareReportPage } from '../care-report-page'
import { CustomerBookingsPage } from '../bookings-page'
import { CustomerBookingDetailPage } from '../booking-detail-page'

function ReportRoute() {
  const { code } = useParams()
  return <CustomerCareReportPage code={code ?? ''} />
}

function renderReport(path = '/customer/bookings/CC-BK-9750/report') {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path='/customer/bookings' element={<CustomerBookingsPage />} />
        <Route path='/customer/bookings/:code/report' element={<ReportRoute />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('CustomerCareReportPage', () => {
  beforeEach(async () => {
    localStorage.clear()
    await setAppLanguage('vi', false)
  })

  it('opens the completed booking report from the booking list', () => {
    renderReport('/customer/bookings')
    const reportLink = screen.getByRole('link', { name: 'Đọc báo cáo chăm sóc' })
    expect(reportLink).toHaveAttribute('href', '/customer/bookings/CC-BK-9750/report')
    fireEvent.click(reportLink)
    expect(screen.getByRole('heading', { level: 1, name: 'Báo cáo chăm sóc · CC-BK-9750' })).toBeInTheDocument()
    expect(screen.getAllByText('ĐD. Lê Thị Thanh Mai')).toHaveLength(2)
    expect(screen.getByText('Nguyễn Thị A')).toBeInTheDocument()
    expect(screen.getByText('4 giờ')).toBeInTheDocument()
  })

  it('provides the report link on completed booking details', () => {
    render(
      <MemoryRouter>
        <CustomerBookingDetailPage code='CC-BK-9750' />
      </MemoryRouter>
    )
    expect(screen.getByRole('link', { name: 'Đọc báo cáo chăm sóc' })).toHaveAttribute(
      'href',
      '/customer/bookings/CC-BK-9750/report'
    )
  })

  it.each(['CC-BK-9810', 'CC-BK-9824', 'CC-BK-9640', 'UNKNOWN'])('does not show a report for %s', (code) => {
    renderReport(`/customer/bookings/${code}/report`)
    expect(screen.getByRole('heading', { name: 'Chưa có báo cáo chăm sóc' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Danh mục công việc đã thực hiện' })).not.toBeInTheDocument()
  })

  it('supports printing the report', () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => undefined)
    renderReport()
    fireEvent.click(screen.getByRole('button', { name: 'In / lưu PDF báo cáo' }))
    expect(print).toHaveBeenCalledOnce()
    print.mockRestore()
  })

  it('updates report copy when the language changes', async () => {
    renderReport()
    await setAppLanguage('en', false)
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Care report · CC-BK-9750' })).toBeInTheDocument())
  })
})
