import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AdminLayout } from '~/features/admin/layout/admin-layout'
import { setAppLanguage } from '~/shared/i18n/i18n'
import { AdminRevenuePage } from '../admin-revenue-page'

function Location() {
  const location = useLocation()
  return (
    <output data-testid='location'>
      {location.pathname}
      {location.search}
    </output>
  )
}
function renderRevenue(path = '/admin/revenue') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<AdminLayout />} path='/admin'>
          <Route element={<AdminRevenuePage />} path='revenue' />
        </Route>
      </Routes>
      <Location />
    </MemoryRouter>
  )
}

describe('Admin revenue preview', () => {
  beforeEach(async () => {
    await setAppLanguage('vi', false)
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('filters transactions in the URL, previews a row, and keeps financial actions unavailable', () => {
    renderRevenue()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Quản lý Giao dịch & Doanh thu')
    expect(screen.getAllByRole('row')).toHaveLength(7)
    expect(screen.getByRole('button', { name: 'Xử lý lệnh payout' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Chờ payout (1)' }))
    expect(screen.getByTestId('location')).toHaveTextContent('status=pending')
    expect(screen.getAllByRole('row')).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'Duyệt payout' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Xem giao dịch TXN-904098' }))
    expect(screen.getByRole('dialog')).toHaveTextContent('Giao dịch #TXN-904098')
    expect(screen.getByRole('dialog')).toHaveTextContent('dữ liệu mẫu')
    fireEvent.click(screen.getAllByRole('button', { name: 'Đóng' })[1])
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'not-found' } })
    expect(screen.getByText('Không tìm thấy giao dịch')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Xuất CSV mẫu' })).toBeDisabled()
  })

  it('exports filtered sample rows and paginates them', async () => {
    const create = vi.fn<(blob: Blob) => string>(() => 'blob:admin-revenue')
    const revoke = vi.fn()
    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: create, revokeObjectURL: revoke }))
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    renderRevenue('/admin/revenue?type=deposit')
    fireEvent.click(screen.getByRole('button', { name: 'Xuất CSV mẫu' }))
    const csv = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = reject
      reader.readAsText(create.mock.calls[0][0])
    })
    expect(csv).toContain('TXN-904128')
    expect(csv).not.toContain('TXN-904115')
    expect(csv.split('\r\n')).toHaveLength(2)
    expect(click).toHaveBeenCalledOnce()
    expect(revoke).toHaveBeenCalledWith('blob:admin-revenue')
    fireEvent.click(screen.getByRole('button', { name: 'Xóa bộ lọc' }))
    fireEvent.change(screen.getByRole('combobox', { name: 'Giao dịch mỗi trang' }), { target: { value: '5' } })
    expect(screen.getAllByRole('row')).toHaveLength(6)
    fireEvent.click(screen.getByRole('button', { name: 'Trang sau' }))
    expect(screen.getByTestId('location')).toHaveTextContent('page=2')
    expect(screen.getAllByRole('row')).toHaveLength(2)
  })

  it('renders English revenue copy', async () => {
    renderRevenue()
    await act(() => setAppLanguage('en', false))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Transactions & Revenue Management')
    expect(screen.getByRole('button', { name: 'Automated bank reconciliation' })).toBeDisabled()
  })
})
