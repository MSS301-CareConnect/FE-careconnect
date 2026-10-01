import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import { setAppLanguage } from '~/shared/i18n/i18n'
import { AdminReviewsComplaintsPage } from '../admin-reviews-complaints-page'

function Location() {
  const location = useLocation()
  return <output data-testid='location'>{location.pathname + location.search}</output>
}

function renderPage() {
  render(
    <MemoryRouter initialEntries={['/admin/reviews-complaints']}>
      <Routes>
        <Route element={<AdminReviewsComplaintsPage />} path='/admin/reviews-complaints' />
      </Routes>
      <Location />
    </MemoryRouter>
  )
}

describe('Admin reviews and complaints preview', () => {
  beforeEach(async () => {
    await setAppLanguage('vi', false)
  })

  it('filters sample cases and opens the selected read-only case', () => {
    renderPage()
    fireEvent.change(screen.getByRole('combobox', { name: 'Mức độ' }), { target: { value: 'critical' } })
    expect(screen.getByTestId('location')).toHaveTextContent('level=critical')
    expect(screen.getByText('KN-2026-089')).toBeInTheDocument()
    expect(screen.queryByText('KN-2026-092')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Xem hồ sơ mẫu' }))
    const dialog = screen.getByRole('dialog', { name: 'Chi tiết hồ sơ khiếu nại mẫu' })
    expect(dialog).toHaveTextContent('BK-8821')
    expect(screen.getByRole('button', { name: /Duyệt hoàn 50% ký quỹ/ })).toBeDisabled()
  })

  it('switches tabs and supports English', async () => {
    renderPage()
    fireEvent.click(screen.getByRole('tab', { name: 'Báo cáo Vi phạm Tác phong & Kỷ luật' }))
    expect(screen.getByTestId('location')).toHaveTextContent('tab=violations')
    expect(screen.getByText(/cần kết nối nguồn dữ liệu/)).toBeInTheDocument()
    await act(() => setAppLanguage('en', false))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Customer reviews & complaint management')
  })
})
