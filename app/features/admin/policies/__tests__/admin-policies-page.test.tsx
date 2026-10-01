import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import { setAppLanguage } from '~/shared/i18n/i18n'
import { AdminPoliciesPage } from '../admin-policies-page'

function renderPage() {
  render(
    <MemoryRouter initialEntries={['/admin/policies']}>
      <Routes>
        <Route element={<AdminPoliciesPage />} path='/admin/policies' />
      </Routes>
    </MemoryRouter>
  )
}

describe('Admin policy preview', () => {
  beforeEach(async () => {
    await setAppLanguage('vi', false)
  })

  it('changes only the local deposit simulation and keeps publishing disabled', () => {
    renderPage()
    expect(screen.getByText(/Cọc dự kiến: 300\.000/)).toBeInTheDocument()
    fireEvent.change(screen.getByRole('slider', { name: 'Tỷ lệ đặt cọc tiêu chuẩn' }), { target: { value: '40' } })
    expect(screen.getByText(/Cọc dự kiến: 400\.000/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Lưu thay đổi chính sách/ })).toBeDisabled()
    expect(screen.getAllByText('Thay đổi chỉ hiển thị trên thiết bị này và không được lưu.').length).toBeGreaterThan(0)
  })

  it('selects a draft payout cycle and translates the page', async () => {
    renderPage()
    fireEvent.click(screen.getByRole('radio', { name: /Hàng tháng/ }))
    expect(screen.getByRole('radio', { name: /Hàng tháng/ })).toBeChecked()
    await act(() => setAppLanguage('en', false))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Policy settings & financial reconciliation')
    expect(screen.getByRole('radio', { name: /Monthly/ })).toBeChecked()
  })
})
