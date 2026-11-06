import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createRecipientAddress, fetchRecipientAddresses } from '~/entities/care-recipient/care-recipient-api'
import { fetchPublicCenter } from '~/entities/provider/provider-api'
import type { BookingDetailRecord } from '~/shared/api/generated/contracts'
import { setAppLanguage } from '~/shared/i18n/i18n'
import { pickOption } from '~/shared/test/pickers'

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
vi.mock('~/entities/provider/provider-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/provider/provider-api')>()),
  fetchPublicCenter: vi.fn()
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

function renderDialog(customer = true) {
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter>
        <ServiceAddressDialog booking={booking} customer={customer} onClose={vi.fn()} open />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  vi.clearAllMocks()
  vi.mocked(fetchPublicCenter).mockResolvedValue(undefined as unknown as Awaited<ReturnType<typeof fetchPublicCenter>>)
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

  it('locks visits under 24 hours, picks a saved address from the book and sends only the ticked visits', async () => {
    renderDialog()

    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes[0]).toBeDisabled()
    expect(checkboxes[1]).toBeChecked()
    expect(checkboxes[2]).toBeChecked()
    expect(screen.getByText('Còn dưới 24 giờ — không đổi được')).toBeInTheDocument()
    fireEvent.click(checkboxes[2])

    expect(await screen.findByText('Sổ địa chỉ của Bà Lan')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Quản lý sổ địa chỉ/ })).toHaveAttribute(
      'href',
      '/customer/patient-profiles/rec-1?tab=addresses'
    )
    const saved = await screen.findByRole('radio', { name: /Nhà con gái/ })
    fireEvent.click(saved)
    expect(saved).toHaveAttribute('aria-checked', 'true')
    expect(screen.queryByLabelText('Số nhà, tên đường')).not.toBeInTheDocument()

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

  it('asks for a new address before saving', async () => {
    renderDialog()
    fireEvent.click(screen.getByRole('button', { name: 'Đổi địa chỉ 2 buổi' }))
    expect(await screen.findByText('Chọn địa chỉ mới cho các buổi đã chọn.')).toBeInTheDocument()
    expect(updateServiceAddressRequest).not.toHaveBeenCalled()
  })

  it('says so when the address book is empty', async () => {
    vi.mocked(fetchRecipientAddresses).mockResolvedValue([])
    renderDialog()
    expect(await screen.findByText(/Sổ địa chỉ chưa có địa chỉ nào/)).toBeInTheDocument()
  })

  it('types an address in the new province → ward lists and saves it to the address book', async () => {
    vi.mocked(createRecipientAddress).mockResolvedValue({
      id: 'addr-2',
      label: 'Nhà anh Minh',
      addressLine: '3 Hàng Bài',
      ward: 'Phường Hoàn Kiếm',
      province: 'Thành phố Hà Nội'
    })
    renderDialog()

    fireEvent.click(screen.getByRole('radio', { name: /Nhập địa chỉ khác/ }))
    // The province of the current address is suggested ("Hà Nội" → today's "Thành phố Hà Nội").
    await waitFor(() => expect(screen.getByLabelText('Tỉnh / thành phố')).toHaveTextContent('Thành phố Hà Nội'))
    fireEvent.click(screen.getByRole('button', { name: 'Đổi địa chỉ 2 buổi' }))
    expect(await screen.findByText('Chọn phường / xã.')).toBeInTheDocument()
    expect(screen.getByText('Nhập số nhà, tên đường.')).toBeInTheDocument()

    await pickOption(screen.getByLabelText('Phường / xã'), 'Phường Hoàn Kiếm', 'hoan kiem')
    fireEvent.change(screen.getByLabelText('Số nhà, tên đường'), { target: { value: '3 Hàng Bài' } })
    fireEvent.click(screen.getByLabelText('Lưu vào sổ địa chỉ của Bà Lan'))
    fireEvent.click(screen.getByRole('button', { name: 'Đổi địa chỉ 2 buổi' }))
    expect(await screen.findByText('Nhập tên gợi nhớ để lưu địa chỉ.')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Tên gợi nhớ'), { target: { value: 'Nhà anh Minh' } })
    fireEvent.click(screen.getByRole('button', { name: 'Đổi địa chỉ 2 buổi' }))
    await waitFor(() =>
      expect(createRecipientAddress).toHaveBeenCalledWith('rec-1', {
        label: 'Nhà anh Minh',
        addressLine: '3 Hàng Bài',
        ward: 'Phường Hoàn Kiếm',
        district: undefined,
        province: 'Thành phố Hà Nội'
      })
    )
    await waitFor(() => expect(updateServiceAddressRequest).toHaveBeenCalled())
  })

  it('lets the center move every visit not started, without the address book', () => {
    renderDialog(false)
    expect(screen.getAllByRole('checkbox').every((box) => !(box as HTMLInputElement).disabled)).toBe(true)
    expect(screen.queryByText('Sổ địa chỉ của Bà Lan')).not.toBeInTheDocument()
    expect(fetchRecipientAddresses).not.toHaveBeenCalled()
  })

  it('blocks submit and shows an error when the new address is in a different province than the center', async () => {
    vi.mocked(fetchPublicCenter).mockResolvedValue({
      centerId: 'center-1',
      centerName: 'Trung tâm Hà Nội',
      address: '45 Kim Mã, Ba Đình, Hà Nội'
    } as unknown as Awaited<ReturnType<typeof fetchPublicCenter>>)
    vi.mocked(fetchRecipientAddresses).mockResolvedValue([
      {
        id: 'addr-hcm',
        label: 'Nhà con gái TP.HCM',
        addressLine: '9 Nguyễn Trãi',
        district: 'Quận 5',
        province: 'Thành phố Hồ Chí Minh'
      }
    ])
    renderDialog()

    fireEvent.click(await screen.findByRole('radio', { name: /Nhà con gái TP\.HCM/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Đổi địa chỉ 2 buổi' }))

    expect(await screen.findByText(/Địa chỉ mới không nằm trong khu vực hoạt động của trung tâm chăm sóc/)).toBeInTheDocument()
    expect(updateServiceAddressRequest).not.toHaveBeenCalled()
  })
})
