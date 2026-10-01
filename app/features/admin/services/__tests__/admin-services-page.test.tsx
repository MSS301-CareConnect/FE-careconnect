import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import { setAppLanguage } from '~/shared/i18n/i18n'
import { AdminServicesPage } from '../admin-services-page'

function Location() {
  const location = useLocation()
  return <output data-testid='location'>{location.pathname + location.search}</output>
}

function renderPage(path = '/admin/services') {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<AdminServicesPage />} path='/admin/services' />
      </Routes>
      <Location />
    </MemoryRouter>
  )
}

describe('Admin service catalog preview', () => {
  beforeEach(async () => {
    await setAppLanguage('vi', false)
  })

  it('filters services in the URL and opens a read-only price preview', () => {
    renderPage()
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'CC-ELD-01' } })
    expect(screen.getByText('1 dịch vụ trong mẫu')).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('q=CC-ELD-01')
    fireEvent.click(screen.getByRole('button', { name: /Xem cấu hình bảng giá: Chăm sóc người cao tuổi/ }))
    const dialog = screen.getByRole('dialog', { name: 'Bảng giá & điều kiện phục vụ' })
    expect(within(dialog).getByText(/350\.000/)).toBeInTheDocument()
    expect(within(dialog).getByText(/650\.000/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Thêm dịch vụ mới' })).toBeDisabled()
  })

  it('shows the master catalog and translates the page', async () => {
    renderPage()
    fireEvent.click(screen.getByRole('tab', { name: 'Danh mục chuẩn toàn hệ thống' }))
    expect(screen.getByTestId('location')).toHaveTextContent('tab=master')
    expect(screen.getByText('2 dịch vụ')).toBeInTheDocument()
    await act(() => setAppLanguage('en', false))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Center service catalog & pricing')
    expect(screen.getByRole('tab', { name: 'Platform master catalog' })).toHaveAttribute('aria-selected', 'true')
  })
})
