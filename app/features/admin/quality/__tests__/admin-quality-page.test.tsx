import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import { setAppLanguage } from '~/shared/i18n/i18n'
import { AdminQualityPage } from '../admin-quality-page'

function Location() {
  const location = useLocation()
  return <output data-testid='location'>{location.pathname + location.search}</output>
}
function renderPage() {
  render(
    <MemoryRouter initialEntries={['/admin/quality']}>
      <Routes>
        <Route element={<AdminQualityPage />} path='/admin/quality' />
      </Routes>
      <Location />
    </MemoryRouter>
  )
}

describe('Admin caregiver quality preview', () => {
  beforeEach(async () => {
    await setAppLanguage('vi', false)
  })

  it('filters license checks and opens the matching read-only profile', () => {
    renderPage()
    fireEvent.click(screen.getByRole('tab', { name: 'Chờ kiểm tra CCHN' }))
    expect(screen.getByText('1 hồ sơ trong mẫu')).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('tab=license')
    const table = screen.getByRole('table')
    expect(within(table).getByText('Lê Quốc Khánh')).toBeInTheDocument()
    expect(within(table).queryByText('Nguyễn Thị Thu Hương')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Xem hồ sơ mẫu' }))
    expect(screen.getByRole('dialog', { name: 'Hồ sơ điều dưỡng mẫu' })).toHaveTextContent('009214/HCM-CCHN')
    expect(screen.getByRole('button', { name: 'Yêu cầu phúc tra' })).toBeDisabled()
  })

  it('keeps live verification unavailable and supports English', async () => {
    renderPage()
    expect(screen.getByText(/Các trạng thái trong bảng chỉ mang tính minh họa/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Bắt đầu cuộc gọi kiểm tra' })).toBeDisabled()
    await act(() => setAppLanguage('en', false))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Caregiver verification & quality control')
    expect(screen.getByText(/Table statuses are samples only/)).toBeInTheDocument()
  })
})
