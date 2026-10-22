import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createRecipientProfile } from '~/entities/care-recipient/care-recipient-api'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { PatientCreatePage } from '../patient-create-page'

vi.mock('~/entities/care-recipient/care-recipient-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/care-recipient/care-recipient-api')>()),
  createRecipientProfile: vi.fn()
}))

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/customer/patient-profiles/new']}>
        <PatientCreatePage />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText(/Họ và tên người bệnh/), { target: { value: 'Nguyễn Văn An' } })
  fireEvent.change(screen.getByLabelText(/Mối quan hệ với bạn/), { target: { value: 'father' } })
  fireEvent.change(screen.getByLabelText(/Ngày sinh/), { target: { value: '1956-08-14' } })
  fireEvent.click(screen.getByRole('radio', { name: 'Nam' }))
}

describe('PatientCreatePage', () => {
  beforeEach(async () => {
    localStorage.clear()
    vi.mocked(createRecipientProfile).mockReset()
    await setAppLanguage('vi', false)
  })

  it('starts with an empty form and no sample patient data', () => {
    renderPage()

    expect(screen.getByRole('heading', { level: 1, name: 'Tạo mới Hồ sơ Người bệnh cần chăm sóc' })).toBeInTheDocument()
    expect(screen.getByLabelText(/Họ và tên người bệnh/)).toHaveValue('')
    expect(screen.getByText('Chưa có thuốc nào. Bấm "+ Thêm thuốc mới" nếu người bệnh đang dùng thuốc.')).toBeVisible()
    expect(screen.queryByRole('button', { name: /Lưu nháp/ })).not.toBeInTheDocument()
  })

  it('recalculates BMI when height and weight change', () => {
    renderPage()

    fireEvent.change(screen.getByLabelText('Chiều cao (cm)'), { target: { value: '170' } })
    fireEvent.change(screen.getByLabelText('Cân nặng (kg)'), { target: { value: '85' } })

    expect(screen.getByText('29.4')).toBeInTheDocument()
    expect(screen.getByText('Tiền béo phì')).toBeInTheDocument()
  })

  it('shows each missing required field under its own input and focuses the first one', () => {
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Hoàn tất tạo hồ sơ người bệnh' }))

    const fullName = screen.getByLabelText(/Họ và tên người bệnh/)
    expect(fullName).toHaveAttribute('aria-invalid', 'true')
    expect(fullName).toHaveAccessibleDescription('Vui lòng nhập họ và tên người bệnh.')
    expect(fullName).toHaveFocus()
    expect(screen.getByLabelText(/Mối quan hệ với bạn/)).toHaveAccessibleDescription(
      'Vui lòng chọn mối quan hệ của người bệnh với bạn.'
    )
    expect(screen.getByLabelText(/Ngày sinh/)).toHaveAccessibleDescription('Vui lòng nhập ngày sinh.')
    expect(screen.getByRole('radiogroup', { name: /Giới tính/ })).toHaveAccessibleDescription(
      'Vui lòng chọn giới tính.'
    )
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(createRecipientProfile).not.toHaveBeenCalled()
  })

  it('clears a field error as soon as the user edits that field and refocuses the next invalid one', () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Hoàn tất tạo hồ sơ người bệnh' }))

    const fullName = screen.getByLabelText(/Họ và tên người bệnh/)
    fireEvent.change(fullName, { target: { value: 'Nguyễn Văn An' } })
    expect(fullName).not.toHaveAttribute('aria-invalid')
    expect(screen.queryByText('Vui lòng nhập họ và tên người bệnh.')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Hoàn tất tạo hồ sơ người bệnh' }))
    expect(screen.getByLabelText(/Mối quan hệ với bạn/)).toHaveFocus()
  })

  it('marks an incomplete medication row and focuses its name', () => {
    renderPage()
    fillRequiredFields()
    fireEvent.click(screen.getByRole('button', { name: '+ Thêm thuốc mới' }))
    fireEvent.change(screen.getByLabelText('Liều lượng'), { target: { value: '1 viên' } })

    fireEvent.click(screen.getByRole('button', { name: 'Hoàn tất tạo hồ sơ người bệnh' }))

    const name = screen.getByRole('combobox', { name: 'Tên thuốc' })
    expect(name).toHaveAccessibleDescription('Nhập tên thuốc hoặc xóa dòng này.')
    expect(name).toHaveFocus()
    expect(createRecipientProfile).not.toHaveBeenCalled()
  })

  it('creates the profile with medications and an emergency contact in one request', async () => {
    vi.mocked(createRecipientProfile).mockResolvedValue({
      profile: { id: 'rec-1', fullName: 'Nguyễn Văn An', status: 'ACTIVE', version: 0 },
      myAccessLevel: 'OWNER'
    })
    renderPage()
    fillRequiredFields()

    fireEvent.change(screen.getByPlaceholderText('Nhập tên thuốc hoặc thực phẩm gây dị ứng...'), {
      target: { value: 'Penicillin' }
    })
    fireEvent.click(screen.getByRole('button', { name: '+ Thêm dị ứng' }))
    fireEvent.change(screen.getByLabelText('Họ tên người liên hệ'), { target: { value: 'Nguyễn Mai Anh' } })
    fireEvent.change(screen.getByLabelText('Quan hệ với người bệnh'), { target: { value: 'Con gái' } })
    fireEvent.change(screen.getByLabelText('Số điện thoại'), { target: { value: '0908123789' } })

    fireEvent.click(screen.getByRole('button', { name: '+ Thêm thuốc mới' }))
    fireEvent.change(screen.getByLabelText('Tên thuốc'), { target: { value: 'Amlodipine 5mg' } })
    fireEvent.change(screen.getByLabelText('Ngày bắt đầu dùng'), { target: { value: '2026-10-01' } })
    fireEvent.change(screen.getByLabelText('Liều lượng'), { target: { value: '1 viên' } })

    fireEvent.click(screen.getByRole('button', { name: 'Hoàn tất tạo hồ sơ người bệnh' }))

    await waitFor(() => expect(createRecipientProfile).toHaveBeenCalledTimes(1))
    expect(vi.mocked(createRecipientProfile).mock.calls[0][0]).toMatchObject({
      fullName: 'Nguyễn Văn An',
      relationshipType: 'CHILD',
      dateOfBirth: '1956-08-14',
      gender: 'MALE',
      allergies: 'Penicillin',
      medications: [{ medicationName: 'Amlodipine 5mg', startDate: '2026-10-01', dosage: '1 viên', active: true }],
      emergencyContacts: [
        { fullName: 'Nguyễn Mai Anh', relationship: 'Con gái', phoneNumber: '0908123789', primary: true }
      ]
    })

    expect(await screen.findByRole('dialog', { name: 'Tạo hồ sơ thành công!' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Xem hồ sơ vừa tạo' })).toHaveAttribute(
      'href',
      '/customer/patient-profiles/rec-1'
    )
    expect(screen.getByRole('link', { name: 'Tìm điều dưỡng cho người bệnh này' })).toHaveAttribute(
      'href',
      '/customer/caregivers'
    )
  })

  it('puts a backend validation error on the matching field', async () => {
    vi.mocked(createRecipientProfile).mockRejectedValue(
      Object.assign(new Error('Bad request'), { status: 400, info: { code: 2107 } })
    )
    renderPage()
    fillRequiredFields()

    fireEvent.click(screen.getByRole('button', { name: 'Lưu hồ sơ người bệnh' }))

    const birthDate = screen.getByLabelText(/Ngày sinh/)
    await waitFor(() => expect(birthDate).toHaveAccessibleDescription('Ngày sinh không được ở tương lai.'))
    expect(birthDate).toHaveFocus()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('keeps a form-level alert for server failures that belong to no field', async () => {
    vi.mocked(createRecipientProfile).mockRejectedValue(Object.assign(new Error('Server error'), { status: 500 }))
    renderPage()
    fillRequiredFields()

    fireEvent.click(screen.getByRole('button', { name: 'Lưu hồ sơ người bệnh' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Không thể tạo hồ sơ lúc này. Vui lòng thử lại.')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('translates the creation page to English', async () => {
    renderPage()

    await setAppLanguage('en', false)

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: 'Create New Care Recipient Health Profile' })
      ).toBeInTheDocument()
    })
    expect(screen.getByText('Emergency contact')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Male' })).toBeInTheDocument()
    expect(document.documentElement).toHaveAttribute('lang', 'en')
  })
})
