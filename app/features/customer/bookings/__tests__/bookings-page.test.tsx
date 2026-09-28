import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'

import { setAppLanguage } from '~/shared/i18n/i18n'

import { CustomerBookingsPage } from '../bookings-page'

describe('CustomerBookingsPage', () => {
  beforeEach(async () => {
    localStorage.clear()
    await setAppLanguage('vi', false)
  })

  it('renders the customer booking overview and links to a new booking', () => {
    render(
      <MemoryRouter>
        <CustomerBookingsPage />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Quản lý lịch chăm sóc' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Đặt lịch chăm sóc mới' })).toHaveAttribute('href', '/customer/booking')
    expect(screen.getAllByText('#CC-BK-9810').length).toBeGreaterThan(0)
    expect(screen.getAllByText('#CC-BK-9640').length).toBeGreaterThan(0)
  })

  it('filters by status and searches booking codes, then resets an empty result', () => {
    render(
      <MemoryRouter initialEntries={['/customer/bookings']}>
        <CustomerBookingsPage />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByRole('button', { name: /Đã hoàn thành 1/i }))
    expect(screen.getAllByText('#CC-BK-9750').length).toBeGreaterThan(0)
    expect(screen.queryByText('#CC-BK-9810')).not.toBeInTheDocument()

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'missing' } })
    expect(screen.getByRole('heading', { name: 'Không tìm thấy ca trực phù hợp' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Đặt lại bộ lọc' }))
    expect(screen.getAllByText('#CC-BK-9810').length).toBeGreaterThan(0)
  })

  it('updates visible copy when the language changes', async () => {
    render(
      <MemoryRouter>
        <CustomerBookingsPage />
      </MemoryRouter>
    )
    await setAppLanguage('en', false)

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Manage care bookings' })).toBeInTheDocument()
    })
  })
})
