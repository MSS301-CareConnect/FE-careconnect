import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import { setAppLanguage } from '~/shared/i18n/i18n'
import { CustomerCaregiversPage } from '../caregivers-page'

describe('CustomerCaregiversPage', () => {
  beforeEach(async () => {
    localStorage.clear()
    await setAppLanguage('vi', false)
  })

  it('renders search banner, filters sidebar and caregiver cards in Vietnamese', () => {
    render(
      <MemoryRouter>
        <CustomerCaregiversPage />
      </MemoryRouter>
    )

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Tìm kiếm & Đặt lịch Người chăm sóc uy tín'
      })
    ).toBeInTheDocument()

    expect(screen.getByRole('heading', { level: 2, name: 'Bộ lọc nâng cao' })).toBeInTheDocument()

    expect(screen.getByText('Nguyễn Thị Bích Loan')).toBeInTheDocument()
    expect(screen.getByText('Trần Hữu Nam')).toBeInTheDocument()
    expect(screen.getByText('Lê Thị Thanh Mai')).toBeInTheDocument()

    expect(screen.getByText('Điều dưỡng viên chính quy')).toBeInTheDocument()
    expect(screen.getByText('Cử nhân Điều dưỡng Hồi sức')).toBeInTheDocument()
    expect(screen.getByText('Chuyên viên Chăm sóc Người cao tuổi')).toBeInTheDocument()

    expect(screen.getByText('220.000 đ')).toBeInTheDocument()
    expect(screen.getByText('260.000 đ')).toBeInTheDocument()
    expect(screen.getByText('190.000 đ')).toBeInTheDocument()
  })

  it('filters caregivers by gender selection', () => {
    render(
      <MemoryRouter>
        <CustomerCaregiversPage />
      </MemoryRouter>
    )

    const maleButton = screen.getByRole('button', { name: 'Nam' })
    fireEvent.click(maleButton)

    expect(screen.getByText('Trần Hữu Nam')).toBeInTheDocument()
    expect(screen.queryByText('Nguyễn Thị Bích Loan')).not.toBeInTheDocument()
    expect(screen.queryByText('Lê Thị Thanh Mai')).not.toBeInTheDocument()
  })

  it('allows clearing and editing search input', () => {
    render(
      <MemoryRouter>
        <CustomerCaregiversPage />
      </MemoryRouter>
    )

    const clearButton = screen.getByRole('button', { name: 'Xoá tìm kiếm' })
    fireEvent.click(clearButton)

    const searchInput = screen.getByPlaceholderText(
      'Tìm theo tên điều dưỡng, chuyên môn y tế, bệnh viện đào tạo hoặc khu vực (Quận/Huyện)...'
    )
    expect(searchInput).toHaveValue('')

    fireEvent.change(searchInput, { target: { value: 'Bác sĩ' } })
    expect(searchInput).toHaveValue('Bác sĩ')
  })

  it('resets filters when clicking reset button', () => {
    render(
      <MemoryRouter>
        <CustomerCaregiversPage />
      </MemoryRouter>
    )

    const maleButton = screen.getByRole('button', { name: 'Nam' })
    fireEvent.click(maleButton)
    expect(screen.queryByText('Nguyễn Thị Bích Loan')).not.toBeInTheDocument()

    const resetButton = screen.getByRole('button', { name: 'Đặt lại bộ lọc' })
    fireEvent.click(resetButton)

    expect(screen.getByText('Nguyễn Thị Bích Loan')).toBeInTheDocument()
    expect(screen.getByText('Trần Hữu Nam')).toBeInTheDocument()
    expect(screen.getByText('Lê Thị Thanh Mai')).toBeInTheDocument()
  })

  it('switches text to English when language is changed', async () => {
    render(
      <MemoryRouter>
        <CustomerCaregiversPage />
      </MemoryRouter>
    )

    await setAppLanguage('en', false)

    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: 'Search & Book Trusted Caregivers'
        })
      ).toBeInTheDocument()
    })

    expect(screen.getByRole('heading', { level: 2, name: 'Advanced Filters' })).toBeInTheDocument()
    expect(screen.getByText('Registered Nurse')).toBeInTheDocument()
    expect(document.documentElement).toHaveAttribute('lang', 'en')
  })
})
