import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'

import { setAppLanguage } from '~/shared/i18n/i18n'

import { PatientDetailPage } from '../patient-detail-page'

describe('PatientDetailPage', () => {
  beforeEach(async () => {
    localStorage.clear()
    await setAppLanguage('vi', false)
  })

  it('renders patient medical records, vitals, caregiver and emergency contacts in Vietnamese', () => {
    render(
      <MemoryRouter>
        <PatientDetailPage />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Hồ sơ y tế: Nguyễn Văn A')
    expect(screen.getByText('(Bố ruột - CC-MED-0941)')).toBeInTheDocument()
    expect(screen.getByText('Trần Thị Bích Loan')).toBeInTheDocument()
    expect(screen.getByText('Nguyễn Mai Anh (Bạn - Con gái)')).toBeInTheDocument()
    expect(screen.getByText('O (Rh+)')).toBeInTheDocument()
    expect(screen.getByText('Amlodipine 5mg')).toBeInTheDocument()
  })

  it('toggles edit mode and saves updates with toast notification', () => {
    render(
      <MemoryRouter>
        <PatientDetailPage />
      </MemoryRouter>
    )

    const toggleButton = screen.getByRole('switch')
    expect(toggleButton).toHaveAttribute('aria-checked', 'false')

    // Click toggle to enter edit mode
    fireEvent.click(toggleButton)
    expect(toggleButton).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByText('Chế độ chỉnh sửa')).toBeInTheDocument()

    const saveButton = screen.getByRole('button', { name: /Lưu cập nhật/i })
    expect(saveButton).toBeInTheDocument()

    // Click save
    fireEvent.click(saveButton)
    expect(toggleButton).toHaveAttribute('aria-checked', 'false')
    expect(screen.getByText('Đã lưu và đồng bộ thông tin hồ sơ người bệnh thành công!')).toBeInTheDocument()
  })

  it('switches between care history tab and attached documents tab', () => {
    render(
      <MemoryRouter>
        <PatientDetailPage />
      </MemoryRouter>
    )

    const historyTab = screen.getByRole('button', {
      name: /Lịch sử các ca chăm sóc/i
    })
    const docsTab = screen.getByRole('button', {
      name: /Tài liệu & Kết quả xét nghiệm/i
    })

    expect(historyTab).toBeInTheDocument()
    expect(docsTab).toBeInTheDocument()

    // By default, history items are shown
    expect(screen.getByText('Ca chăm sóc bán trú 8 tiếng (Hôm qua)')).toBeInTheDocument()

    // Switch to documents tab
    fireEvent.click(docsTab)
    expect(screen.getByText('Don-thuoc-BV-DHYD-T10-2024.pdf')).toBeInTheDocument()
    expect(screen.getByText('Xet-nghiem-mau-Sinh-hoa-Q3.pdf')).toBeInTheDocument()
  })

  it('translates patient detail content when language is switched to English', async () => {
    render(
      <MemoryRouter>
        <PatientDetailPage />
      </MemoryRouter>
    )

    await setAppLanguage('en', false)

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Medical Record: Nguyễn Văn A')
    })
    expect(screen.getByText('Active care session in progress')).toBeInTheDocument()
    expect(screen.getByText('View mode')).toBeInTheDocument()
    expect(document.documentElement).toHaveAttribute('lang', 'en')
  })
})
