import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { closeCenterPicker, selectCenter, useSelectedCenter } from '~/entities/care-center/selected-center'
import { fetchPublicCenters } from '~/entities/provider/provider-api'
import { setAppLanguage } from '~/shared/i18n/i18n'
import { Toaster } from '~/shared/ui/toaster'

import { CentersPage } from '../centers-page'

vi.mock('~/entities/provider/provider-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/provider/provider-api')>()),
  fetchPublicCenters: vi.fn(),
  fetchPublicCenter: vi.fn(async (id: string) => ({ centerId: id, centerName: 'Trung tâm Bình An' }))
}))

const centers = [
  {
    centerId: 'center-b',
    centerName: 'Trung tâm Bình An',
    address: '12 Lê Lợi, Quận 1',
    operatingHours: '07:00 - 21:00',
    phoneNumber: '0281234567',
    minPrice: 150000,
    serviceCount: 4,
    imageUrls: ['https://cdn.test/binh-an.jpg']
  },
  { centerId: 'center-a', centerName: 'Phòng khám An Khang', address: '5 Hai Bà Trưng, Đà Nẵng' }
]

function SelectedProbe() {
  const { center } = useSelectedCenter()
  return <output data-testid='selected'>{center?.id ?? 'none'}</output>
}

function renderPage(path = '/customer/centers') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<CentersPage />} path='/customer/centers' />
        </Routes>
        <SelectedProbe />
        <Toaster />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('CentersPage', () => {
  beforeEach(async () => {
    localStorage.clear()
    selectCenter(null)
    closeCenterPicker()
    vi.mocked(fetchPublicCenters)
      .mockReset()
      .mockResolvedValue({ items: centers, page: 0, size: 100, totalElements: 2, totalPages: 1 })
    await setAppLanguage('vi', false)
  })

  it('lists every active center with the facts to compare and links to its page', async () => {
    renderPage()

    const binhAn = (await screen.findByRole('link', { name: 'Xem trung tâm Trung tâm Bình An' })).closest('article')!
    expect(within(binhAn).getByRole('link', { name: 'Xem trung tâm Trung tâm Bình An' })).toHaveAttribute(
      'href',
      '/customer/centers/center-b'
    )
    expect(within(binhAn).getByText('12 Lê Lợi, Quận 1')).toBeInTheDocument()
    expect(within(binhAn).getByText('07:00 - 21:00')).toBeInTheDocument()
    expect(within(binhAn).getByText('0281234567')).toBeInTheDocument()
    expect(within(binhAn).getByText('Giá từ 150.000 ₫')).toBeInTheDocument()
    expect(within(binhAn).getByText('4 dịch vụ')).toBeInTheDocument()
    expect(within(binhAn).getByRole('img', { name: 'Ảnh trung tâm Trung tâm Bình An' })).toHaveAttribute(
      'src',
      'https://cdn.test/binh-an.jpg'
    )
    expect(screen.getByText('2 trung tâm')).toBeInTheDocument()
  })

  it('searches by name or address without diacritics', async () => {
    renderPage('/customer/centers?q=da nang')

    expect(await screen.findByRole('link', { name: 'Xem trung tâm Phòng khám An Khang' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Xem trung tâm Trung tâm Bình An' })).not.toBeInTheDocument()
  })

  it('shows a clear way back when nothing matches', async () => {
    renderPage('/customer/centers?q=khong co')

    const empty = (await screen.findByRole('heading', { name: 'Không có trung tâm khớp với từ khóa này.' }))
      .parentElement!
    fireEvent.click(within(empty).getByRole('button', { name: 'Xóa tìm kiếm' }))
    expect(await screen.findByRole('link', { name: 'Xem trung tâm Phòng khám An Khang' })).toBeInTheDocument()
  })

  it('makes a center the header choice only when asked, with a toast naming it', async () => {
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: 'Chọn trung tâm Trung tâm Bình An' }))

    expect(screen.getByTestId('selected')).toHaveTextContent('center-b')
    expect(await screen.findByText('Đang xem trung tâm Trung tâm Bình An')).toBeInTheDocument()
    const binhAn = screen.getByRole('link', { name: 'Xem trung tâm Trung tâm Bình An' }).closest('article')!
    expect(within(binhAn).getByText('Đang chọn')).toBeInTheDocument()
    expect(within(binhAn).queryByRole('button', { name: /Chọn trung tâm/ })).not.toBeInTheDocument()
  })

  it('asks a visitor to sign in while the directory still answers 401', async () => {
    vi.mocked(fetchPublicCenters).mockRejectedValue(Object.assign(new Error('unauthorized'), { status: 401 }))
    renderPage()

    expect(await screen.findByText('Đăng nhập để chọn trung tâm')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Đăng nhập' })).toHaveAttribute(
      'href',
      `/login?next=${encodeURIComponent('/customer/centers')}`
    )
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('offers a retry when the directory fails for another reason', async () => {
    vi.mocked(fetchPublicCenters).mockRejectedValue(Object.assign(new Error('down'), { status: 503 }))
    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent('Chưa tải được danh sách trung tâm.')
  })
})
