import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setAppLanguage } from '~/shared/i18n/i18n'
import { CenterManagerLayout } from '../../layout/center-manager-layout'
import { ManagerCaregiverDetailPage } from '../manager-caregiver-detail-page'
import { ManagerCaregiversPage } from '../manager-caregivers-page'

function Location() {
  return (
    <output data-testid='location'>
      {useLocation().pathname}
      {useLocation().search}
    </output>
  )
}
function renderManager(path = '/center-manager/caregivers') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<CenterManagerLayout />} path='/center-manager'>
          <Route element={<ManagerCaregiversPage />} path='caregivers' />
          <Route element={<ManagerCaregiverDetailPage />} path='caregivers/:id' />
        </Route>
      </Routes>
      <Location />
    </MemoryRouter>
  )
}

describe('Center Manager caregiver screens', () => {
  beforeEach(async () => {
    await setAppLanguage('vi', false)
  })

  it('uses its own manager shell, filters the roster, and opens the matching detail', () => {
    renderManager()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Quản lý Người chăm sóc & CCHN')
    expect(screen.getByRole('navigation', { name: 'Menu quản lý trung tâm' })).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(7)
    expect(screen.getByRole('button', { name: 'Thêm người chăm sóc' })).toBeDisabled()
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'CG-1088' } })
    expect(screen.getAllByRole('row')).toHaveLength(2)
    expect(screen.getByRole('link', { name: 'Xem chi tiết KTV. Hoàng Minh Tuấn' })).toHaveAttribute(
      'href',
      '/center-manager/caregivers/CG-1088'
    )
    fireEvent.click(screen.getByRole('link', { name: 'Xem chi tiết KTV. Hoàng Minh Tuấn' }))
    expect(screen.getByTestId('location')).toHaveTextContent('/center-manager/caregivers/CG-1088')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Hoàng Minh Tuấn')
    expect(screen.queryByText('142/5 Nguyễn Thị Thập')).not.toBeInTheDocument()
  })

  it('applies queue and URL filters, and exports only the filtered caregiver', async () => {
    const create = vi.fn<(blob: Blob) => string>(() => 'blob:manager')
    const revoke = vi.fn()
    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: create, revokeObjectURL: revoke }))
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    renderManager()
    fireEvent.click(screen.getByRole('button', { name: /Hàng đợi CCHN/ }))
    expect(screen.getByTestId('location')).toHaveTextContent('verification=pending')
    expect(screen.getAllByRole('row')).toHaveLength(2)
    expect(screen.getByRole('link', { name: 'Xem chi tiết ĐD. Lê Thị Hồng Hạnh' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Xuất danh sách (CSV)' }))
    const csv = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = reject
      reader.readAsText(create.mock.calls[0][0])
    })
    expect(csv).toContain('CG-1150')
    expect(csv).not.toContain('CG-1024')
    expect(csv.split('\r\n')).toHaveLength(2)
    expect(click).toHaveBeenCalledOnce()
    expect(revoke).toHaveBeenCalledWith('blob:manager')
    click.mockRestore()
    vi.unstubAllGlobals()
  })

  it('shows sample clinical sections only for the supplied profile and handles unknown IDs', () => {
    const view = renderManager('/center-manager/caregivers/CG-1024')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Trần Thùy Dương')
    expect(screen.getByRole('heading', { name: 'Thẩm định Pháp lý & CCHN' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Lịch biểu Trực Hàng tuần' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Đổi ca / Phân công' })).toBeDisabled()
    const documents = screen.getByRole('heading', { name: 'Tài liệu Y tế đính kèm' }).closest('section')
    expect(documents).not.toBeNull()
    expect(within(documents!).getAllByRole('listitem')).toHaveLength(4)
    view.unmount()
    renderManager('/center-manager/caregivers/UNKNOWN')
    expect(screen.getByRole('heading', { name: 'Không tìm thấy hồ sơ người chăm sóc' })).toBeInTheDocument()
  })

  it('switches both manager screens to English', async () => {
    renderManager('/center-manager/caregivers/CG-1024')
    await act(() => setAppLanguage('en', false))
    expect(screen.getByRole('link', { name: 'Back to caregiver list' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Nursing Skills & Clinical Procedures' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Change shift / Assign' })).toBeDisabled()
  })
})
