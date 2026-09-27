import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'

import { setAppLanguage } from '~/shared/i18n/i18n'

import { PatientProfilesPage } from '../patient-profiles-page'

describe('PatientProfilesPage', () => {
  beforeEach(async () => {
    localStorage.clear()
    await setAppLanguage('vi', false)
  })

  it('renders patient profiles list with vitals and notes in Vietnamese', () => {
    render(
      <MemoryRouter>
        <PatientProfilesPage />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Hồ sơ người cần chăm sóc' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Nguyễn Văn A' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Trần Thị Lan' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Nguyễn Minh Khang' })).toBeInTheDocument()
    expect(screen.getByText('Bố ruột')).toBeInTheDocument()
    expect(screen.getByText('Mẹ ruột')).toBeInTheDocument()
    expect(screen.getByText('Con trai')).toBeInTheDocument()
    expect(screen.getByText('Đang có ca chăm sóc')).toBeInTheDocument()
  })

  it('filters patients by search query', () => {
    render(
      <MemoryRouter>
        <PatientProfilesPage />
      </MemoryRouter>
    )

    const searchInput = screen.getByPlaceholderText('Tìm theo họ tên, CCCD hoặc mã BHYT...')
    fireEvent.change(searchInput, { target: { value: 'Lan' } })

    expect(screen.getByText('Trần Thị Lan')).toBeInTheDocument()
    expect(screen.queryByText('Nguyễn Văn A')).not.toBeInTheDocument()
    expect(screen.queryByText('Nguyễn Minh Khang')).not.toBeInTheDocument()
  })

  it('filters patients by relationship dropdown', () => {
    render(
      <MemoryRouter>
        <PatientProfilesPage />
      </MemoryRouter>
    )

    const selectElements = screen.getAllByRole('combobox')
    const relationshipSelect = selectElements[0]
    fireEvent.change(relationshipSelect, { target: { value: 'children' } })

    expect(screen.getByText('Nguyễn Minh Khang')).toBeInTheDocument()
    expect(screen.queryByText('Nguyễn Văn A')).not.toBeInTheDocument()
    expect(screen.queryByText('Trần Thị Lan')).not.toBeInTheDocument()
  })

  it('deletes a patient profile from the list', () => {
    render(
      <MemoryRouter>
        <PatientProfilesPage />
      </MemoryRouter>
    )

    const deleteButtons = screen.getAllByRole('button', { name: /Xóa/i })
    expect(deleteButtons.length).toBe(3)

    fireEvent.click(deleteButtons[0])
    expect(screen.queryByText('Nguyễn Văn A')).not.toBeInTheDocument()
  })

  it('switches text to English when language is changed', async () => {
    render(
      <MemoryRouter>
        <PatientProfilesPage />
      </MemoryRouter>
    )

    await setAppLanguage('en', false)

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Profiles of Care Recipients' })).toBeInTheDocument()
    })
    expect(screen.getByText('Active care session')).toBeInTheDocument()
    expect(screen.getByText('Stable health')).toBeInTheDocument()
    expect(document.documentElement).toHaveAttribute('lang', 'en')
  })
})
