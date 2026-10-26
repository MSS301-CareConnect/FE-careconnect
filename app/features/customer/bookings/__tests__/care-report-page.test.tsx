import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useParams } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setAppLanguage } from '~/shared/i18n/i18n'
import { CustomerCareReportPage } from '../care-report-page'

function ReportRoute() {
  const { code } = useParams()
  return <CustomerCareReportPage code={code ?? ''} />
}

function renderReport(path = '/customer/bookings/CC-BK-9750/report') {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
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
