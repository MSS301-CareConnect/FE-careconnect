import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createRecipientAddress, fetchRecipientAddresses } from '~/entities/care-recipient/care-recipient-api'
import type { BookingDetailRecord } from '~/shared/api/generated/contracts'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { updateServiceAddressRequest } from './booking-api'
import { ServiceAddressDialog, canChangeServiceAddress } from './service-address-dialog'

vi.mock('./booking-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./booking-api')>()),
  updateServiceAddressRequest: vi.fn()
}))
vi.mock('~/entities/care-recipient/care-recipient-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/care-recipient/care-recipient-api')>()),
  fetchRecipientAddresses: vi.fn(),
  createRecipientAddress: vi.fn()
}))

const HOUR = 3_600_000
const at = (hours: number) => new Date(Date.now() + hours * HOUR).toISOString()

const booking: BookingDetailRecord = {
  id: 'bk-1',
  bookingCode: 'BK0001',
  status: 'CONFIRMED',
  recipientId: 'rec-1',
  centerId: 'center-1',
  bookingType: 'CUSTOM',
  startDate: '2030-01-01',
  totalAmount: 600000,
  recipientSnapshot: { fullName: 'Bà Lan', addressLine: '12 Lý Thường Kiệt', province: 'Hà Nội' },
  occurrences: [
    { id: 'soon', occurrenceNo: 1, startAt: at(5), endAt: at(7), status: 'SCHEDULED' },
    { id: 'later', occurrenceNo: 2, startAt: at(50), endAt: at(52), status: 'SCHEDULED' },
    { id: 'last', occurrenceNo: 3, startAt: at(98), endAt: at(100), status: 'SCHEDULED' }
  ]
}

function renderDialog() {
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <ServiceAddressDialog booking={booking} onClose={vi.fn()} open />
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  vi.clearAllMocks()
  vi.mocked(fetchRecipientAddresses).mockResolvedValue([
    {
      id: 'addr-1',
      label: 'Nhà con gái',
      addressLine: '9 Nguyễn Trãi',
      district: 'Quận 5',
      province: 'TP. Hồ Chí Minh'
    }
  ])
  vi.mocked(updateServiceAddressRequest).mockResolvedValue(booking)
  await setAppLanguage('vi', false)
})

describe('Change care address of chosen visits', () => {
  it('needs a visit at least 24 hours away for the customer, any upcoming one for the center', () => {
    const soonOnly = { ...booking, occurrences: booking.occurrences?.slice(0, 1) }
    expect(canChangeServiceAddress(soonOnly, Date.now())).toBe(false)
    expect(canChangeServiceAddress(soonOnly, Date.now(), false)).toBe(true)
  })

  it('locks visits under 24 hours, uses a saved address and sends only the ticked visits', async () => {
    renderDialog()

    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes[0]).toBeDisabled()
    expect(checkboxes[1]).toBeChecked()
    expect(checkboxes[2]).toBeChecked()
    fireEvent.click(checkboxes[2])

    fireEvent.click(await screen.findByRole('button', { name: /Nhà con gái/ }))
    expect(screen.getByLabelText('Số nhà, tên đường')).toHaveValue('9 Nguyễn Trãi')

    fireEvent.click(screen.getByRole('button', { name: 'Đổi địa chỉ 1 buổi' }))
    await waitFor(() =>
      expect(updateServiceAddressRequest).toHaveBeenCalledWith('bk-1', {
        addressLine: '9 Nguyễn Trãi',
        ward: undefined,
        district: 'Quận 5',
        province: 'TP. Hồ Chí Minh',
        note: undefined,
        occurrenceIds: ['later']
      })
    )
    expect(createRecipientAddress).not.toHaveBeenCalled()
  })

  it('saves a typed address to the address book when asked', async () => {
    vi.mocked(createRecipientAddress).mockResolvedValue({
      id: 'addr-2',
      label: 'Nhà anh Minh',
      addressLine: '3 Hàng Bài',
      province: 'Hà Nội'
    })
    renderDialog()

    fireEvent.click(screen.getByRole('button', { name: /Nhập địa chỉ khác/ }))
    fireEvent.change(screen.getByLabelText('Số nhà, tên đường'), { target: { value: '3 Hàng Bài' } })
    fireEvent.change(screen.getByLabelText('Tỉnh / thành phố'), { target: { value: 'Hà Nội' } })
    fireEvent.click(screen.getByLabelText('Lưu vào sổ địa chỉ của Bà Lan'))
    fireEvent.click(screen.getByRole('button', { name: 'Đổi địa chỉ 2 buổi' }))
    expect(await screen.findByText('Nhập tên gợi nhớ để lưu địa chỉ.')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Tên gợi nhớ'), { target: { value: 'Nhà anh Minh' } })
    fireEvent.click(screen.getByRole('button', { name: 'Đổi địa chỉ 2 buổi' }))
    await waitFor(() =>
      expect(createRecipientAddress).toHaveBeenCalledWith('rec-1', {
        label: 'Nhà anh Minh',
        addressLine: '3 Hàng Bài',
        ward: undefined,
        district: undefined,
        province: 'Hà Nội'
      })
    )
    await waitFor(() => expect(updateServiceAddressRequest).toHaveBeenCalled())
  })
})
