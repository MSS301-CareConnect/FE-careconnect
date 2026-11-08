import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createMedication, fetchCareRecipient, saveCareRecipient } from '~/entities/care-recipient/care-recipient-api'
import type { CareRecipientDetailRecord } from '~/shared/api/generated/contracts'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { PatientDetailPage } from '../patient-detail-page'

vi.mock('~/entities/care-recipient/care-recipient-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/care-recipient/care-recipient-api')>()),
  fetchCareRecipient: vi.fn(),
  saveCareRecipient: vi.fn(),
  createMedication: vi.fn()
}))

vi.mock('~/shared/ui/app-toast', () => ({ toastSuccess: vi.fn(), toastSystemError: vi.fn() }))

// The co-managers card has its own tests; here it only needs an answer so it renders no error.
vi.mock('~/entities/care-recipient/care-recipient-managers-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/care-recipient/care-recipient-managers-api')>()),
  fetchManagers: vi.fn().mockResolvedValue([]),
  fetchInvitations: vi.fn().mockResolvedValue([])
}))

const detail: CareRecipientDetailRecord = {
  myAccessLevel: 'OWNER',
  profile: {
    id: 'rec-1',
    fullName: 'Nguyễn Văn An',
    dateOfBirth: '1948-04-15',
    gender: 'MALE',
    phoneNumber: '0908123789',
    avatarUrl: 'https://cdn.example.com/an.png',
    addressLine: '208 Nguyễn Hữu Cảnh',
    district: 'Bình Thạnh',
    province: 'TP.HCM',
    latitude: 10.79,
    longitude: 106.72,
    bloodType: 'O+',
    heightCm: 168,
    weightKg: 62,
    chronicConditions: 'Tăng huyết áp độ 2',
    allergies: 'Dị ứng Penicillin',
    mobilityLevel: 'NEEDS_ASSISTANCE',
    dietaryNotes: 'Ăn nhạt',
    status: 'ACTIVE',
    version: 4
  },
  medications: [
    {
      id: 'med-1',
      medicationName: 'Amlodipine 5mg',
      dosage: '1 viên',
      frequency: 'Mỗi ngày',
      timeOfDay: ['07:30'],
      route: 'ORAL',
      startDate: '2026-10-01',
      active: true
    }
  ],
  emergencyContacts: [
    {
      id: 'contact-1',
      fullName: 'Nguyễn Mai Anh',
      relationship: 'Con gái',
      phoneNumber: '0908123456',
      primary: true,
      priority: 0
    }
  ]
}

function renderPage(entry = '/customer/patient-profiles/rec-1') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[entry]}>
        <Routes>
          <Route path='/customer/patient-profiles/:id' element={<PatientDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  localStorage.clear()
  vi.mocked(fetchCareRecipient).mockReset()
  vi.mocked(saveCareRecipient).mockReset()
  vi.mocked(createMedication).mockReset()
  await setAppLanguage('vi', false)
})

describe('PatientDetailPage', () => {
  it('renders the profile header and the overview from the backend', async () => {
    vi.mocked(fetchCareRecipient).mockResolvedValue(detail)
    renderPage()

    expect(screen.getByRole('status')).toHaveTextContent('Đang tải hồ sơ sức khỏe...')
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('Nguyễn Văn An')
    expect(fetchCareRecipient).toHaveBeenCalledWith('rec-1')
    expect(screen.getByText('Quyền của bạn: Chủ sở hữu')).toBeInTheDocument()
    expect(screen.getByText(/Nam · Nhóm máu O\+/)).toBeInTheDocument()
    expect(screen.getByText('Dị ứng Penicillin')).toBeInTheDocument()
    expect(screen.getByText('208 Nguyễn Hữu Cảnh, Bình Thạnh, TP.HCM')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Đặt lịch/ })).toHaveAttribute('href', '/customer/booking?patientId=rec-1')
    expect(screen.getByRole('progressbar', { name: 'Hồ sơ hoàn thiện' })).toBeInTheDocument()
  })

  it('shows health and medications, and contacts with a call button, in their own tabs', async () => {
    vi.mocked(fetchCareRecipient).mockResolvedValue(detail)
    renderPage()

    fireEvent.click(await screen.findByRole('tab', { name: /Y tế & thuốc/ }))
    expect(screen.getByText('Tăng huyết áp độ 2')).toBeInTheDocument()
    expect(screen.getByText('Amlodipine 5mg')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: /Liên hệ khẩn cấp/ }))
    expect(screen.getByText('Nguyễn Mai Anh')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Gọi cho Nguyễn Mai Anh' })).toHaveAttribute('href', 'tel:0908123456')
  })

  it('saves one section from its drawer with the whole profile and the backend version', async () => {
    vi.mocked(fetchCareRecipient).mockResolvedValue(detail)
    vi.mocked(saveCareRecipient).mockResolvedValue({ ...detail.profile, version: 5 })
    renderPage('/customer/patient-profiles/rec-1?tab=medical')

    fireEvent.click(await screen.findByRole('button', { name: 'Sửa tiền sử & bệnh nền' }))
    const drawer = screen.getByRole('dialog', { name: 'Sửa tiền sử & bệnh nền' })
    fireEvent.change(within(drawer).getByRole('textbox', { name: 'Dị ứng thuốc & thực phẩm' }), {
      target: { value: 'Dị ứng Penicillin, tôm' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Lưu' }))

    await waitFor(() => expect(saveCareRecipient).toHaveBeenCalled())
    expect(saveCareRecipient).toHaveBeenCalledWith(
      'rec-1',
      expect.objectContaining({
        fullName: 'Nguyễn Văn An',
        allergies: 'Dị ứng Penicillin, tôm',
        avatarUrl: 'https://cdn.example.com/an.png',
        latitude: 10.79,
        mobilityLevel: 'NEEDS_ASSISTANCE',
        version: 4
      })
    )
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('reports a version conflict and keeps the drawer open', async () => {
    vi.mocked(fetchCareRecipient).mockResolvedValue(detail)
    vi.mocked(saveCareRecipient).mockRejectedValue(Object.assign(new Error('Conflict'), { status: 409 }))
    renderPage('/customer/patient-profiles/rec-1?edit=basic')

    await screen.findByRole('dialog', { name: 'Sửa thông tin cơ bản' })
    fireEvent.click(screen.getByRole('button', { name: 'Lưu' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Hồ sơ vừa được người khác cập nhật')
    expect(screen.getByRole('dialog', { name: 'Sửa thông tin cơ bản' })).toBeInTheDocument()
  })

  it('validates required fields before saving (older ?mode=edit links open the basic drawer)', async () => {
    vi.mocked(fetchCareRecipient).mockResolvedValue(detail)
    renderPage('/customer/patient-profiles/rec-1?mode=edit')

    fireEvent.change(await screen.findByRole('textbox', { name: 'Họ và tên' }), { target: { value: ' ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Lưu' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Vui lòng nhập họ tên.')
    expect(saveCareRecipient).not.toHaveBeenCalled()
  })

  it('adds a medication through the medication endpoint', async () => {
    vi.mocked(fetchCareRecipient).mockResolvedValue(detail)
    vi.mocked(createMedication).mockResolvedValue({
      id: 'med-2',
      medicationName: 'Metformin',
      startDate: '2026-10-20',
      active: true
    })
    renderPage('/customer/patient-profiles/rec-1?tab=medical')

    fireEvent.click(await screen.findByRole('button', { name: 'Thêm thuốc' }))
    fireEvent.change(screen.getByRole('combobox', { name: 'Tên thuốc' }), { target: { value: 'Metformin' } })
    fireEvent.change(screen.getByLabelText('Ngày bắt đầu'), { target: { value: '20/10/2026' } })
    fireEvent.change(screen.getByRole('textbox', { name: /Giờ dùng thuốc/ }), { target: { value: '07:30, 18:30' } })
    fireEvent.click(screen.getByRole('button', { name: 'Lưu thuốc' }))

    await waitFor(() =>
      expect(createMedication).toHaveBeenCalledWith(
        'rec-1',
        expect.objectContaining({ medicationName: 'Metformin', startDate: '2026-10-20', timeOfDay: ['07:30', '18:30'] })
      )
    )
  })

  it('fills the medication name and route from a catalog suggestion', async () => {
    vi.mocked(fetchCareRecipient).mockResolvedValue(detail)
    vi.mocked(createMedication).mockResolvedValue({
      id: 'med-3',
      medicationName: 'Salbutamol 100 mcg',
      startDate: '2026-10-20',
      active: true
    })
    renderPage('/customer/patient-profiles/rec-1?tab=medical')

    fireEvent.click(await screen.findByRole('button', { name: 'Thêm thuốc' }))
    fireEvent.change(screen.getByRole('combobox', { name: 'Tên thuốc' }), { target: { value: 'sa' } })
    fireEvent.click(screen.getByRole('option', { name: /Salbutamol 100 mcg/ }))
    fireEvent.change(screen.getByLabelText('Ngày bắt đầu'), { target: { value: '20/10/2026' } })
    fireEvent.click(screen.getByRole('button', { name: 'Lưu thuốc' }))

    await waitFor(() =>
      expect(createMedication).toHaveBeenCalledWith(
        'rec-1',
        expect.objectContaining({ medicationName: 'Salbutamol 100 mcg', route: 'INHALATION' })
      )
    )
  })

  it('hides editing controls from viewers', async () => {
    vi.mocked(fetchCareRecipient).mockResolvedValue({ ...detail, myAccessLevel: 'VIEWER' })
    renderPage('/customer/patient-profiles/rec-1?edit=basic')

    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('Nguyễn Văn An')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Sửa thông tin cơ bản' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Thao tác khác với hồ sơ' })).not.toBeInTheDocument()
  })

  it('shows a not-found state for a missing record', async () => {
    vi.mocked(fetchCareRecipient).mockRejectedValue(Object.assign(new Error('Missing'), { status: 404 }))
    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent('Hồ sơ không tồn tại hoặc đã bị xóa.')
    expect(screen.getByRole('link', { name: 'Quay lại danh sách hồ sơ' })).toHaveAttribute(
      'href',
      '/customer/patient-profiles'
    )
  })

  it('translates patient detail content when language is switched to English', async () => {
    vi.mocked(fetchCareRecipient).mockResolvedValue(detail)
    renderPage('/customer/patient-profiles/rec-1?tab=daily')
    await screen.findByRole('heading', { level: 1 })

    await setAppLanguage('en', false)

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Daily life' })).toBeInTheDocument()
    })
    expect(screen.getByText('Needs assistance')).toBeInTheDocument()
    expect(document.documentElement).toHaveAttribute('lang', 'en')
  })
})
