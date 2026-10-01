import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import { setAppLanguage } from '~/shared/i18n/i18n'
import { AdminCustomerDetailPage } from '../admin-customer-detail-page'
import { AdminCustomersPage } from '../admin-customers-page'

function Location() {
  const location = useLocation()
  return <output data-testid='location'>{location.pathname + location.search}</output>
}

function renderCustomers(path = '/admin/customers') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<AdminCustomersPage />} path='/admin/customers' />
        <Route element={<AdminCustomerDetailPage />} path='/admin/customers/:id' />
      </Routes>
      <Location />
    </MemoryRouter>
  )
}

describe('Admin customer preview', () => {
  beforeEach(async () => {
    await setAppLanguage('vi', false)
  })

  it('filters the sample through URL parameters and opens the matching detail', async () => {
    renderCustomers()
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Nguyễn Mai Anh' } })
    expect(screen.getByTestId('location')).toHaveTextContent('q=Nguy')
    expect(screen.getByText('1 khách hàng trong mẫu')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('link', { name: 'Nguyễn Mai Anh' }))
    expect(screen.getByTestId('location')).toHaveTextContent('/admin/customers/CUST-1024')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Nguyễn Mai Anh')
    expect(screen.getByRole('heading', { name: 'Người bệnh được bảo hộ' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Nguyễn Văn Hùng' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tạm khóa tài khoản' })).toBeDisabled()
    await act(() => setAppLanguage('en', false))
    expect(
      screen.getByText('High blood pressure and recovering from a mild stroke. Monitor blood pressure twice per shift.')
    ).toBeInTheDocument()
  })

  it('does not reuse one customer’s clinical details for another account', () => {
    renderCustomers('/admin/customers/CUST-1045')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Trần Quang Huy')
    expect(screen.getByText('Bản thiết kế chưa cung cấp thông tin chi tiết cho khách hàng này.')).toBeInTheDocument()
    expect(screen.queryByText('Nguyễn Văn Hùng')).not.toBeInTheDocument()
  })

  it('handles unknown IDs and translates navigation into English', async () => {
    renderCustomers('/admin/customers/UNKNOWN')
    expect(screen.getByText('Không tìm thấy khách hàng trong dữ liệu mẫu.')).toBeInTheDocument()
    await act(() => setAppLanguage('en', false))
    expect(screen.getByRole('link', { name: 'Back to customer list' })).toHaveAttribute('href', '/admin/customers')
  })

  it('filters by status without mutating account state', () => {
    renderCustomers()
    const status = screen.getByLabelText('Trạng thái')
    fireEvent.change(status, { target: { value: 'locked' } })
    expect(screen.getByText('2 khách hàng trong mẫu')).toBeInTheDocument()
    const table = screen.getByRole('table')
    expect(within(table).getByRole('link', { name: 'Lê Hoàng Nam' })).toBeInTheDocument()
    expect(within(table).queryByRole('link', { name: 'Nguyễn Mai Anh' })).not.toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('status=locked')
  })
})
