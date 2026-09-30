import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setAppLanguage } from '~/shared/i18n/i18n'
import { CaregiverProfilePage } from '../caregiver-profile-page'

describe('Caregiver profile', () => {
  beforeEach(async () => {
    await setAppLanguage('vi', false)
  })
  it('validates edits, keeps saved changes and discards cancelled edits', () => {
    render(
      <MemoryRouter>
        <CaregiverProfilePage />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Chỉnh sửa' }))
    fireEvent.change(screen.getByLabelText('Số điện thoại liên lạc'), { target: { value: 'abc' } })
    fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi trong bản xem thử' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Nhập số điện thoại hợp lệ')
    fireEvent.change(screen.getByLabelText('Số điện thoại liên lạc'), { target: { value: '0909000123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi trong bản xem thử' }))
    expect(screen.getByText('0909000123')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Đã giữ thay đổi')
    fireEvent.click(screen.getByRole('button', { name: 'Chỉnh sửa' }))
    fireEvent.change(screen.getByLabelText('Số điện thoại liên lạc'), { target: { value: '0909000456' } })
    fireEvent.click(screen.getByRole('button', { name: 'Hủy thay đổi' }))
    expect(screen.getByText('0909000123')).toBeInTheDocument()
    expect(screen.queryByText('0909000456')).not.toBeInTheDocument()
  })
  it('validates document uploads and releases local preview URLs when removed', () => {
    const create = vi.fn(() => 'blob:credential')
    const revoke = vi.fn()
    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: create, revokeObjectURL: revoke }))
    render(
      <MemoryRouter>
        <CaregiverProfilePage />
      </MemoryRouter>
    )
    const upload = screen.getByLabelText('Chọn chứng chỉ hoặc văn bằng mới')
    fireEvent.change(upload, { target: { files: [new File(['bad'], 'script.html', { type: 'text/html' })] } })
    expect(screen.getByRole('alert')).toHaveTextContent('Chọn tối đa 5 tệp')
    fireEvent.change(upload, {
      target: { files: [new File(['sample'], 'certificate.pdf', { type: 'application/pdf' })] }
    })
    expect(screen.getByRole('link', { name: 'Xem tệp certificate.pdf' })).toHaveAttribute('href', 'blob:credential')
    fireEvent.click(screen.getByRole('button', { name: 'Xóa tệp certificate.pdf' }))
    expect(revoke).toHaveBeenCalledWith('blob:credential')
    expect(screen.queryByRole('link', { name: 'Xem tệp certificate.pdf' })).not.toBeInTheDocument()
    vi.unstubAllGlobals()
  })
  it('toggles availability, provides section links and translates into English', async () => {
    render(
      <MemoryRouter>
        <CaregiverProfilePage />
      </MemoryRouter>
    )
    const toggle = screen.getByRole('switch')
    expect(toggle).toBeChecked()
    fireEvent.click(toggle)
    expect(toggle).not.toBeChecked()
    expect(screen.getByRole('link', { name: 'Chứng chỉ & Hồ sơ y tế' })).toHaveAttribute('href', '#certificates')
    expect(screen.getByRole('button', { name: 'Đổi mật khẩu tài khoản' })).toBeDisabled()
    await act(() => setAppLanguage('en', false))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('My Profile & Professional Credentials')
  })
})
