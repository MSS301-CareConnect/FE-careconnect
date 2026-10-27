import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'

import { setAppLanguage } from '~/shared/i18n/i18n'
import { CaregiverLayout } from '../../layout/caregiver-layout'
import { CaregiverSchedulePage } from '../caregiver-schedule-page'

function LocationProbe() {
  const location = useLocation()
  return <output data-testid='location'>{location.pathname + location.search}</output>
}

function renderSchedule(entry = '/caregiver/schedule') {
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter initialEntries={[entry]}>
        <LocationProbe />
        <Routes>
          <Route element={<CaregiverLayout />}>
            <Route path='/caregiver/schedule' element={<CaregiverSchedulePage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('Caregiver schedule', () => {
  beforeEach(async () => {
    localStorage.clear()
    await setAppLanguage('vi', false)
  })

  it('renders today and tomorrow with the correct caregiver navigation and language switch order', () => {
    renderSchedule()
    expect(screen.getByRole('heading', { level: 1, name: 'Lịch trực & Phân ca Điều dưỡng' })).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(5)
    expect(screen.getByRole('article', { name: 'Cụ Nguyễn Văn A' })).toBeInTheDocument()
    expect(screen.getByRole('article', { name: 'Bệnh nhân Trần B' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Hôm nay.*20\/09/ })).toBeInTheDocument()
    expect(screen.getByText(/Chưa phải lịch phân ca thực tế/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Lịch trực' })).toHaveAttribute('aria-current', 'page')
    expect(screen.queryByRole('link', { name: 'Lịch đặt của tôi' })).not.toBeInTheDocument()
    const header = screen.getByRole('banner')
    const language = within(header).getByRole('group', { name: 'Ngôn ngữ' })
    const notification = within(header).getByRole('link', { name: 'Xem thông báo mẫu' })
    expect(language.compareDocumentPosition(notification) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('filters today and tomorrow and records the range in the URL', () => {
    renderSchedule()
    fireEvent.click(screen.getByRole('button', { name: /Ngày mai \(21[-/]09\)/ }))
    expect(screen.queryByRole('article', { name: 'Cụ Nguyễn Văn A' })).not.toBeInTheDocument()
    expect(screen.getByRole('article', { name: 'Bệnh nhân Trần B' })).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('scope=tomorrow')
    fireEvent.click(screen.getByRole('button', { name: /Hôm nay \(20[-/]09\)/ }))
    expect(screen.getByRole('article', { name: 'Cụ Nguyễn Văn A' })).toBeInTheDocument()
    expect(screen.queryByRole('article', { name: 'Bệnh nhân Trần B' })).not.toBeInTheDocument()
  })

  it('combines status and patient filters and resets an empty result', () => {
    renderSchedule()
    fireEvent.click(screen.getByRole('button', { name: 'Bộ lọc' }))
    fireEvent.change(screen.getByRole('combobox', { name: 'Trạng thái ca trực' }), { target: { value: 'confirmed' } })
    expect(screen.getByRole('article', { name: 'Bà Trần Thị C' })).toBeInTheDocument()
    expect(screen.queryByRole('article', { name: 'Cụ Nguyễn Văn A' })).not.toBeInTheDocument()
    fireEvent.change(screen.getByRole('searchbox', { name: 'Tìm bệnh nhân' }), { target: { value: 'missing' } })
    expect(screen.getByRole('heading', { name: 'Không có ca trực phù hợp' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Đặt lại bộ lọc' }))
    expect(screen.getByRole('article', { name: 'Cụ Nguyễn Văn A' })).toBeInTheDocument()
  })

  it('selects a day off from the date strip and returns to the sample overview', () => {
    renderSchedule()
    fireEvent.click(screen.getByRole('button', { name: /Xem lịch ngày 25[-/]09/ }))
    expect(screen.getByRole('heading', { name: 'Không có ca trực phù hợp' })).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('date=2026-09-25')
    fireEvent.click(screen.getByRole('button', { name: 'Về lịch mẫu ban đầu' }))
    expect(screen.getByRole('article', { name: 'Cụ Nguyễn Văn A' })).toBeInTheDocument()
  })

  it('switches to a real month calendar and opens the selected day in list view', () => {
    renderSchedule()
    fireEvent.click(screen.getByRole('button', { name: 'Lịch biểu' }))
    expect(screen.getByRole('table', { name: 'Lịch ca trực theo tháng' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '1 ca trực vào 21/09/2026' }))
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(screen.getByRole('article', { name: 'Bệnh nhân Trần B' })).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('view=list')
  })

  it('restores valid URL filters and handles months without preview sessions', () => {
    renderSchedule('/caregiver/schedule?scope=day&date=2026-09-23&status=upcoming')
    expect(screen.getByRole('article', { name: 'Bà Trần Thị C' })).toBeInTheDocument()
    expect(screen.getByRole('article', { name: 'Bệnh nhân Trần B' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Tháng sau' }))
    expect(screen.getByRole('heading', { name: 'Không có ca trực phù hợp' })).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('month=2026-10')
    expect(screen.queryByRole('heading', { name: 'Ca mở chờ tiếp nhận' })).not.toBeInTheDocument()
  })

  it('normalizes invalid URL values and supports month navigation across year boundaries', () => {
    const first = renderSchedule('/caregiver/schedule?month=invalid&date=2026-02-31&scope=invalid&status=invalid')
    expect(screen.getByRole('article', { name: 'Cụ Nguyễn Văn A' })).toBeInTheDocument()
    first.unmount()
    renderSchedule('/caregiver/schedule?month=2026-12')
    fireEvent.click(screen.getByRole('button', { name: 'Tháng sau' }))
    expect(screen.getByTestId('location')).toHaveTextContent('month=2027-01')
  })

  it('disables remote care, assignment and leave actions', () => {
    renderSchedule()
    for (const name of ['Vào ca / Báo cáo', 'Gọi người nhà', 'Ghi chú điều dưỡng', 'Xem bệnh án']) {
      expect(screen.getByRole('button', { name })).toBeDisabled()
    }
    for (const button of screen.getAllByRole('button', { name: 'Nhận ca ngay' })) expect(button).toBeDisabled()
    for (const button of screen.getAllByRole('button', { name: 'Báo bận / Xin nghỉ' })) expect(button).toBeDisabled()
  })

  it('updates copy, dates and document title when switching to English', async () => {
    renderSchedule()
    fireEvent.click(screen.getByRole('button', { name: 'Chuyển sang Tiếng Anh' }))
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Caregiver Schedule & Assignments' })).toBeInTheDocument()
    )
    expect(screen.getByRole('heading', { name: /Today.*Sunday/ })).toBeInTheDocument()
    expect(screen.getByRole('article', { name: 'Mr. Nguyễn Văn A' })).toBeInTheDocument()
    expect(document.title).toBe('Caregiver schedule | CareConnect')
  })
})
