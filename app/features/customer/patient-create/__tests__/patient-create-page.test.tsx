import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'

import { setAppLanguage } from '~/shared/i18n/i18n'

import { PatientCreatePage } from '../patient-create-page'

describe('PatientCreatePage', () => {
  beforeEach(async () => {
    localStorage.clear()
    await setAppLanguage('vi', false)
  })

  it('renders patient creation form with all initial sections in Vietnamese', () => {
    render(
      <MemoryRouter>
        <PatientCreatePage />
      </MemoryRouter>
    )

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Tạo mới Hồ sơ Người bệnh cần chăm sóc'
      })
    ).toBeInTheDocument()

    expect(screen.getByText('Thông tin định danh & Cơ bản')).toBeInTheDocument()
    expect(screen.getByText('Tình trạng Bệnh nền & Tiền sử Y khoa')).toBeInTheDocument()
    expect(screen.getByText('Đơn thuốc đang sử dụng & Lịch uống')).toBeInTheDocument()

    // Form inputs defaults
    expect(screen.getByDisplayValue('Nguyễn Văn An')).toBeInTheDocument()
    expect(screen.getByDisplayValue('079056012499')).toBeInTheDocument()
    expect(screen.getByDisplayValue('GD4797931405928')).toBeInTheDocument()
    expect(screen.getByText('23.0')).toBeInTheDocument() // Initial BMI
    expect(screen.getByText('Bình thường')).toBeInTheDocument()
  })

  it('recalculates BMI dynamically when height and weight are changed', () => {
    render(
      <MemoryRouter>
        <PatientCreatePage />
      </MemoryRouter>
    )

    const heightInput = screen.getByLabelText('Chiều cao (cm)')
    const weightInput = screen.getByLabelText('Cân nặng (kg)')

    // 170cm, 85kg -> BMI = 85 / (1.7 * 1.7) = 29.4 (Tiền béo phì)
    fireEvent.change(heightInput, { target: { value: '170' } })
    fireEvent.change(weightInput, { target: { value: '85' } })

    expect(screen.getByText('29.4')).toBeInTheDocument()
    expect(screen.getByText('Tiền béo phì')).toBeInTheDocument()
  })

  it('adds and removes allergy tags dynamically', () => {
    render(
      <MemoryRouter>
        <PatientCreatePage />
      </MemoryRouter>
    )

    expect(screen.getByText('Kháng sinh nhóm Penicillin')).toBeInTheDocument()

    const allergyInput = screen.getByPlaceholderText('Nhập tên thuốc hoặc thực phẩm gây dị ứng...')
    const addAllergyBtn = screen.getByRole('button', {
      name: '+ Thêm dị ứng'
    })

    fireEvent.change(allergyInput, { target: { value: 'Đậu phộng' } })
    fireEvent.click(addAllergyBtn)

    expect(screen.getByText('Đậu phộng')).toBeInTheDocument()

    // Remove an allergy
    const removeButtons = screen.getAllByRole('button', {
      name: 'Xóa dị ứng'
    })
    fireEvent.click(removeButtons[0])
    expect(screen.queryByText('Kháng sinh nhóm Penicillin')).not.toBeInTheDocument()
  })

  it('adds a new medicine row and removes an existing medicine', () => {
    render(
      <MemoryRouter>
        <PatientCreatePage />
      </MemoryRouter>
    )

    expect(screen.getByDisplayValue('Amlodipine 5mg')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Metformin 850mg')).toBeInTheDocument()

    const addMedicineBtn = screen.getByRole('button', {
      name: '+ Thêm thuốc mới'
    })
    fireEvent.click(addMedicineBtn)

    const deleteButtons = screen.getAllByRole('button', {
      name: 'Xóa thuốc'
    })
    expect(deleteButtons.length).toBe(3)

    // Delete first medicine
    fireEvent.click(deleteButtons[0])
    expect(screen.queryByDisplayValue('Amlodipine 5mg')).not.toBeInTheDocument()
  })

  it('saves draft and shows draft notification banner', () => {
    render(
      <MemoryRouter>
        <PatientCreatePage />
      </MemoryRouter>
    )

    const saveDraftButtons = screen.getAllByRole('button', {
      name: /Lưu nháp|Lưu bản nháp/i
    })
    fireEvent.click(saveDraftButtons[0])

    expect(screen.getByText(/Bản nháp đã được tự động lưu vào tài khoản của bạn lúc/i)).toBeInTheDocument()

    const closeDraftBtn = screen.getByRole('button', {
      name: 'Đóng thông báo'
    })
    fireEvent.click(closeDraftBtn)
    expect(screen.queryByText(/Bản nháp đã được tự động lưu vào tài khoản của bạn lúc/i)).not.toBeInTheDocument()
  })

  it('submits form and displays success modal dialog with action links', () => {
    render(
      <MemoryRouter>
        <PatientCreatePage />
      </MemoryRouter>
    )

    const completeBtn = screen.getByRole('button', {
      name: 'Hoàn tất tạo hồ sơ người bệnh'
    })
    fireEvent.click(completeBtn)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Tạo hồ sơ thành công!'
      })
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Hồ sơ người bệnh Nguyễn Văn An đã được khởi tạo an toàn và sẵn sàng để bạn đặt lịch chăm sóc tại nhà ngay bây giờ.'
      )
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', {
        name: 'Tìm điều dưỡng cho người bệnh này'
      })
    ).toHaveAttribute('href', '/caregivers')
    expect(
      screen.getByRole('link', {
        name: 'Quay về danh sách hồ sơ'
      })
    ).toHaveAttribute('href', '/customer/patient-profiles')
  })

  it('translates patient creation page to English when language is switched', async () => {
    render(
      <MemoryRouter>
        <PatientCreatePage />
      </MemoryRouter>
    )

    await setAppLanguage('en', false)

    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: 'Create New Care Recipient Health Profile'
        })
      ).toBeInTheDocument()
    })
    expect(screen.getByText('Identity & Basic Information')).toBeInTheDocument()
    expect(screen.getByText('Chronic Pathologies & Medical Background')).toBeInTheDocument()
    expect(screen.getByText('Current Prescriptions & Schedule')).toBeInTheDocument()
    expect(document.documentElement).toHaveAttribute('lang', 'en')
  })
})
