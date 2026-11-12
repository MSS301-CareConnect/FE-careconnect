import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchCareRecipient, fetchCareRecipients } from '~/entities/care-recipient/care-recipient-api'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { screenStroke } from '../stroke-screening-api'
import { StrokeScreeningPage } from '../stroke-screening-page'

vi.mock('../stroke-screening-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../stroke-screening-api')>()),
  screenStroke: vi.fn()
}))
vi.mock('~/entities/care-recipient/care-recipient-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/care-recipient/care-recipient-api')>()),
  fetchCareRecipients: vi.fn(),
  fetchCareRecipient: vi.fn()
}))

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <StrokeScreeningPage />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

function answer(question: string, choice: 'Có' | 'Không' | 'Nam' | 'Nữ') {
  fireEvent.click(within(screen.getByRole('radiogroup', { name: question })).getByRole('radio', { name: choice }))
}

function fillAll() {
  answer('Giới tính', 'Nữ')
  fireEvent.change(screen.getByLabelText('Tuổi'), { target: { value: '68' } })
  fireEvent.change(screen.getByLabelText('Chỉ số BMI'), { target: { value: '31,5' } })
  answer('Bị cao huyết áp?', 'Có')
  answer('Bị cholesterol (mỡ máu) cao?', 'Có')
  answer('Bị tiểu đường?', 'Có')
  answer('Từng bị nhồi máu cơ tim?', 'Không')
  answer('Từng bị đau thắt ngực hoặc bệnh mạch vành?', 'Có')
  answer('Hiện đang hút thuốc?', 'Có')
}

beforeEach(async () => {
  vi.clearAllMocks()
  await setAppLanguage('vi', false)
  vi.mocked(fetchCareRecipients).mockResolvedValue({
    items: [{ id: 'rec-1', fullName: 'Bà Lan', status: 'ACTIVE' }],
    page: 0,
    size: 50,
    totalElements: 1,
    totalPages: 1
  } as Awaited<ReturnType<typeof fetchCareRecipients>>)
})

describe('Stroke screening page', () => {
  it('enables the screening only once all nine answers are valid, then shows the result and the disclaimer', async () => {
    vi.mocked(screenStroke).mockResolvedValue({
      predictedClass: 1,
      modelScore: 0.812345,
      screeningResult: 'NEEDS_FURTHER_ASSESSMENT',
      recommendation: 'Nên trao đổi với bác sĩ.',
      disclaimer: 'Kết quả chỉ dùng để hỗ trợ sàng lọc.'
    })
    renderPage()
    const submit = screen.getByRole('button', { name: 'Thực hiện sàng lọc' })
    expect(submit).toBeDisabled()

    fillAll()
    fireEvent.change(screen.getByLabelText('Tuổi'), { target: { value: '10' } })
    expect(await screen.findByText('Tuổi phải từ 18 đến 120.')).toBeInTheDocument()
    expect(submit).toBeDisabled()

    fireEvent.change(screen.getByLabelText('Tuổi'), { target: { value: '68' } })
    expect(submit).toBeEnabled()
    fireEvent.click(submit)

    expect(await screen.findByRole('heading', { name: 'Nên được đánh giá thêm' })).toBeInTheDocument()
    expect(vi.mocked(screenStroke).mock.calls[0][0]).toEqual({
      sex: 'FEMALE',
      age: 68,
      bmi: 31.5,
      hypertension: true,
      highCholesterol: true,
      diabetes: true,
      myocardialInfarctionHistory: false,
      anginaOrChdHistory: true,
      currentSmoker: true
    })
    expect(screen.getByRole('meter', { name: 'Chỉ số mô hình' })).toHaveAttribute('aria-valuenow', '81')
    expect(screen.getByText('Nên trao đổi với bác sĩ.')).toBeInTheDocument()
    expect(screen.getByText('Kết quả chỉ dùng để hỗ trợ sàng lọc.')).toBeInTheDocument()
    expect(screen.queryByText(/predictedClass|Xác suất mắc/)).not.toBeInTheDocument()

    answer('Hiện đang hút thuốc?', 'Không')
    expect(screen.getByText(/Thông tin đã thay đổi sau lần sàng lọc này/)).toBeInTheDocument()
  })

  it('keeps the answers and offers a retry when the model service is unavailable', async () => {
    vi.mocked(screenStroke)
      .mockRejectedValueOnce(Object.assign(new Error('AIService'), { status: 503, info: { code: 8613 } }))
      .mockResolvedValueOnce({
        predictedClass: 0,
        modelScore: 0.12,
        screeningResult: 'LOWER_SCREENING_PATTERN',
        recommendation: 'Duy trì khám định kỳ.',
        disclaimer: 'Không phải chẩn đoán.'
      })
    renderPage()
    fillAll()
    fireEvent.click(screen.getByRole('button', { name: 'Thực hiện sàng lọc' }))

    expect(await screen.findByText(/Dịch vụ sàng lọc tạm thời chưa sẵn sàng/)).toBeInTheDocument()
    expect(screen.getByLabelText('Tuổi')).toHaveValue('68')
    fireEvent.click(screen.getByRole('button', { name: 'Thử lại' }))
    expect(await screen.findByRole('heading', { name: 'Mức tương đồng thấp hơn' })).toBeInTheDocument()
  })

  it('does not offer a retry when the account may not use the tool', async () => {
    vi.mocked(screenStroke).mockRejectedValue(
      Object.assign(new Error('AIService'), { status: 403, info: { code: 403 } })
    )
    renderPage()
    fillAll()
    fireEvent.click(screen.getByRole('button', { name: 'Thực hiện sàng lọc' }))

    expect(await screen.findByText(/không có quyền sử dụng chức năng sàng lọc/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Thử lại' })).not.toBeInTheDocument()
  })

  it('prefills age, sex and BMI from a chosen family profile and shows its chronic conditions', async () => {
    vi.mocked(fetchCareRecipient).mockResolvedValue({
      profile: {
        id: 'rec-1',
        fullName: 'Bà Lan',
        dateOfBirth: '1950-01-01',
        gender: 'FEMALE',
        heightCm: 150,
        weightKg: 54,
        chronicConditions: 'Tăng huyết áp',
        status: 'ACTIVE'
      }
    } as Awaited<ReturnType<typeof fetchCareRecipient>>)
    renderPage()
    const select = await screen.findByRole('combobox', { name: 'Hồ sơ người thân' })
    await screen.findByRole('option', { name: 'Bà Lan' })
    fireEvent.change(select, { target: { value: 'rec-1' } })

    expect(await screen.findByText(/Đã điền sẵn từ hồ sơ của Bà Lan/)).toBeInTheDocument()
    expect(screen.getByText('Tăng huyết áp')).toBeInTheDocument()
    expect(screen.getByLabelText('Chỉ số BMI')).toHaveValue('24')
    expect(
      within(screen.getByRole('radiogroup', { name: 'Giới tính' })).getByRole('radio', { name: 'Nữ' })
    ).toBeChecked()
    expect(
      within(screen.getByRole('radiogroup', { name: 'Bị cao huyết áp?' })).getByRole('radio', { name: 'Có' })
    ).not.toBeChecked()
  })
})
