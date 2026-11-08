import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render as renderUi, screen, within } from '@testing-library/react'
import type { ReactNode } from 'react'
import { createMemoryRouter, Route, RouterProvider, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { closeCenterPicker, selectCenter } from '~/entities/care-center/selected-center'
import { fetchPublicCenter, fetchPublicCenters } from '~/entities/provider/provider-api'
import { AuthUserContext } from '~/features/shared/auth/auth-user-context'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { CustomerLayout } from '../customer-layout'

vi.mock('~/entities/provider/provider-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/provider/provider-api')>()),
  fetchPublicCenters: vi.fn(),
  fetchPublicCenter: vi.fn()
}))

const customer = { id: 'customer-1', fullName: 'An', status: 'ACTIVE' as const, roles: ['CUSTOMER'] }
const PROMPTED_KEY = 'careconnect.center-prompted'

/** The layout reads the navigation state, which needs a data router; descendant <Routes> keep the old tree. */
function MemoryRouter({ initialEntries, children }: { initialEntries: string[]; children: ReactNode }) {
  const router = createMemoryRouter([{ path: '*', element: children }], { initialEntries })
  return <RouterProvider router={router} />
}

function render(ui: ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return renderUi(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

const centers = [
  {
    centerId: 'center-b',
    centerName: 'Trung tâm Bình An',
    address: '12 Lê Lợi, Quận 1',
    operatingHours: '07:00 - 21:00',
    phoneNumber: '0281234567',
    minPrice: 150000,
    serviceCount: 4
  },
  { centerId: 'center-a', centerName: 'Phòng khám An Khang' }
]

function renderPortal(path = '/customer/services') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          element={
            <AuthUserContext value={customer}>
              <CustomerLayout />
            </AuthUserContext>
          }
        >
          <Route path='/customer/services' element={<div />} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

describe('CustomerLayout', () => {
  beforeEach(async () => {
    localStorage.clear()
    selectCenter(null)
    closeCenterPicker()
    // Header tests run as a returning visit; the first-visit dialog has its own tests below.
    sessionStorage.setItem(PROMPTED_KEY, '1')
    vi.mocked(fetchPublicCenters)
      .mockReset()
      .mockResolvedValue({ items: centers, page: 0, size: 100, totalElements: 2, totalPages: 1 })
    vi.mocked(fetchPublicCenter)
      .mockReset()
      .mockImplementation(async (id) => {
        const center = centers.find((item) => item.centerId === id)
        if (!center) throw Object.assign(new Error('not found'), { status: 404 })
        return center
      })
    await setAppLanguage('vi', false)
  })

  it('lets guests browse caregivers and services without showing private customer links', () => {
    const outletText = 'Public services'
    render(
      <MemoryRouter initialEntries={['/customer/services']}>
        <Routes>
          <Route element={<CustomerLayout audience='public' />}>
            <Route path='/customer/services' element={<div>{outletText}</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    const header = within(screen.getByRole('banner'))
    expect(screen.getByText(outletText)).toBeInTheDocument()
    expect(header.getByRole('link', { name: 'Người chăm sóc' })).toHaveAttribute('href', '/customer/caregivers')
    expect(header.getByRole('link', { name: 'Dịch vụ' })).toHaveAttribute('href', '/customer/services')
    expect(header.getByRole('link', { name: 'Trang chủ' })).toHaveAttribute('href', '/')
    expect(header.getByRole('link', { name: 'Đăng nhập' })).toHaveAttribute('href', '/login')
    expect(header.queryByRole('link', { name: 'Lịch đặt' })).not.toBeInTheDocument()
    expect(header.queryByRole('link', { name: /Đặt lịch/ })).not.toBeInTheDocument()
    expect(header.queryByRole('button', { name: 'Menu tài khoản' })).not.toBeInTheDocument()
    const bottom = within(screen.getByRole('navigation', { name: 'Điều hướng nhanh' }))
    expect(bottom.queryByRole('link', { name: 'Lịch đặt' })).not.toBeInTheDocument()
    // CR-6: the public center directory is reachable from the header, the phone navigation and the footer.
    expect(header.getByRole('link', { name: 'Trung tâm' })).toHaveAttribute('href', '/customer/centers')
    expect(bottom.getByRole('link', { name: 'Trung tâm' })).toHaveAttribute('href', '/customer/centers')
    expect(within(screen.getByRole('contentinfo')).getByRole('link', { name: 'Trung tâm' })).toHaveAttribute(
      'href',
      '/customer/centers'
    )
  })

  it('shows visitors the center selector and asks them to sign in while the directory answers 401', async () => {
    vi.mocked(fetchPublicCenters).mockRejectedValue(Object.assign(new Error('unauthorized'), { status: 401 }))
    render(
      <MemoryRouter initialEntries={['/customer/services']}>
        <Routes>
          <Route element={<CustomerLayout audience='public' />}>
            <Route path='/customer/services' element={<div />} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    fireEvent.click(await within(screen.getByRole('banner')).findByRole('button', { name: /Tất cả trung tâm/ }))
    const menu = screen.getByRole('region', { name: 'Danh sách trung tâm chăm sóc' })
    expect(await within(menu).findByText('Đăng nhập để chọn trung tâm')).toBeInTheDocument()
    expect(within(menu).getByRole('link', { name: 'Đăng nhập' })).toHaveAttribute('href', '/login')
    expect(within(menu).queryByRole('alert')).not.toBeInTheDocument()
  })

  it('links the center menu to the center directory', async () => {
    renderPortal()

    fireEvent.click(await within(screen.getByRole('banner')).findByRole('button', { name: /Tất cả trung tâm/ }))
    const menu = screen.getByRole('region', { name: 'Danh sách trung tâm chăm sóc' })
    expect(await within(menu).findByRole('link', { name: 'Xem tất cả trung tâm' })).toHaveAttribute(
      'href',
      '/customer/centers'
    )
  })

  it('renders the header with the main navigation, the booking action and the footer', () => {
    const outletText = 'Customer Content'

    render(
      <MemoryRouter initialEntries={['/customer']}>
        <Routes>
          <Route
            element={
              <AuthUserContext value={customer}>
                <CustomerLayout />
              </AuthUserContext>
            }
          >
            <Route path='/customer' element={<div>{outletText}</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    const header = within(screen.getByRole('banner'))
    const main = within(header.getByRole('navigation', { name: 'Điều hướng chính' }))
    expect(main.getByRole('link', { name: 'Trang chủ' })).toHaveAttribute('href', '/customer')
    expect(main.getByRole('link', { name: 'Người chăm sóc' })).toHaveAttribute('href', '/customer/caregivers')
    expect(main.getByRole('link', { name: 'Dịch vụ' })).toHaveAttribute('href', '/customer/services')
    // Bookings are a first-level destination now, not hidden in the avatar menu.
    expect(main.getByRole('link', { name: 'Lịch đặt' })).toHaveAttribute('href', '/customer/bookings')
    expect(header.getByRole('link', { name: 'Đặt lịch' })).toHaveAttribute('href', '/customer/booking')
    expect(header.getByRole('link', { name: 'CareConnect' })).toHaveAttribute('href', '/customer')
    expect(screen.getByText(outletText)).toBeInTheDocument()

    const footer = within(screen.getByRole('contentinfo'))
    expect(footer.getByRole('link', { name: 'Người thân' })).toHaveAttribute('href', '/customer/patient-profiles')
    expect(footer.getByRole('link', { name: /1900 6868/ })).toHaveAttribute('href', 'tel:19006868')
    expect(screen.getByText(`© ${new Date().getFullYear()} CareConnect. Bảo lưu mọi quyền.`)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Đăng xuất' })).not.toBeInTheDocument()
  })

  it('opens the avatar menu with account, family, payments, language and sign-out, then closes on Escape', () => {
    render(
      <MemoryRouter initialEntries={['/customer']}>
        <Routes>
          <Route
            element={
              <AuthUserContext value={customer}>
                <CustomerLayout />
              </AuthUserContext>
            }
          >
            <Route path='/customer' element={<div />} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    const accountButton = screen.getByRole('button', { name: 'Menu tài khoản' })
    fireEvent.click(accountButton)
    const accountMenu = screen.getByRole('navigation', { name: 'Menu tài khoản' })
    expect(accountButton).toHaveAttribute('aria-expanded', 'true')
    expect(within(accountMenu).getByRole('link', { name: 'Tài khoản' })).toHaveAttribute('href', '/customer/my-profile')
    expect(within(accountMenu).getByRole('link', { name: 'Người thân' })).toHaveAttribute(
      'href',
      '/customer/patient-profiles'
    )
    expect(within(accountMenu).getByRole('link', { name: 'Thanh toán & hoàn tiền' })).toHaveAttribute(
      'href',
      '/customer/payments'
    )
    expect(screen.getByRole('group', { name: 'Ngôn ngữ' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Đăng xuất' })).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(accountButton).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('navigation', { name: 'Menu tài khoản' })).not.toBeInTheDocument()
    expect(accountButton).toHaveFocus()
  })

  it('navigates to family profiles from the avatar menu and closes it', () => {
    const familyProfilesPage = 'Family profiles page'

    render(
      <MemoryRouter initialEntries={['/customer']}>
        <Routes>
          <Route
            element={
              <AuthUserContext value={customer}>
                <CustomerLayout />
              </AuthUserContext>
            }
          >
            <Route path='/customer' element={<div />} />
            <Route path='/customer/patient-profiles' element={<div>{familyProfilesPage}</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Menu tài khoản' }))
    fireEvent.click(
      within(screen.getByRole('navigation', { name: 'Menu tài khoản' })).getByRole('link', { name: 'Người thân' })
    )

    expect(screen.getByText(familyProfilesPage)).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Menu tài khoản' })).not.toBeInTheDocument()
  })

  it('gives phones a bottom navigation with the booking action', () => {
    render(
      <MemoryRouter initialEntries={['/customer']}>
        <Routes>
          <Route
            element={
              <AuthUserContext value={customer}>
                <CustomerLayout />
              </AuthUserContext>
            }
          >
            <Route path='/customer' element={<div />} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    const bottom = within(screen.getByRole('navigation', { name: 'Điều hướng nhanh' }))
    expect(bottom.getByRole('link', { name: 'Trang chủ' })).toHaveAttribute('href', '/customer')
    expect(bottom.getByRole('link', { name: 'Tìm' })).toHaveAttribute('href', '/customer/caregivers')
    expect(bottom.getByRole('link', { name: 'Đặt lịch' })).toHaveAttribute('href', '/customer/booking')
    expect(bottom.getByRole('link', { name: 'Lịch đặt' })).toHaveAttribute('href', '/customer/bookings')
    expect(bottom.getByRole('link', { name: 'Tài khoản' })).toHaveAttribute('href', '/customer/my-profile')
  })

  it('asks for a center on the first visit and applies the choice to the header selector', async () => {
    sessionStorage.clear()
    renderPortal()

    const dialog = await screen.findByRole('dialog', { name: 'Bạn muốn đặt chăm sóc tại trung tâm nào?' })
    expect(dialog).toHaveAttribute('open')
    // Each center shows what a family compares: hours, phone, starting price and services.
    const binhAn = await within(dialog).findByRole('button', { name: /Trung tâm Bình An/ })
    expect(binhAn).toHaveTextContent('07:00 - 21:00')
    expect(binhAn).toHaveTextContent('0281234567')
    expect(binhAn).toHaveTextContent(/Giá từ 150.000/)
    expect(binhAn).toHaveTextContent('4 dịch vụ')
    fireEvent.click(await within(dialog).findByRole('button', { name: /Phòng khám An Khang/ }))

    expect(dialog).not.toHaveAttribute('open')
    expect(within(screen.getByRole('banner')).getByRole('button', { name: /Phòng khám An Khang/ })).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('careconnect.selected-center') ?? 'null')).toEqual({
      id: 'center-a',
      name: 'Phòng khám An Khang'
    })
  })

  it('lets the visitor skip the first-visit dialog and browse the platform-wide configuration', async () => {
    sessionStorage.clear()
    renderPortal()

    const dialog = await screen.findByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: /Để sau, xem tất cả trước/ }))
    expect(dialog).not.toHaveAttribute('open')
    expect(within(screen.getByRole('banner')).getByRole('button', { name: /Tất cả trung tâm/ })).toBeInTheDocument()
  })

  it('changes the center from the dropdown beneath the header selector', async () => {
    selectCenter({ id: 'center-b', name: 'Trung tâm Bình An' })
    renderPortal()

    const selector = await within(screen.getByRole('banner')).findByRole('button', { name: /Trung tâm Bình An/ })
    fireEvent.click(selector)
    expect(selector).toHaveAttribute('aria-expanded', 'true')
    const menu = screen.getByRole('region', { name: 'Danh sách trung tâm chăm sóc' })
    expect(await within(menu).findByRole('button', { name: /Trung tâm Bình An/ })).toHaveAttribute(
      'aria-current',
      'true'
    )

    fireEvent.click(within(menu).getByRole('button', { name: /Phòng khám An Khang/ }))
    expect(screen.queryByRole('region', { name: 'Danh sách trung tâm chăm sóc' })).not.toBeInTheDocument()
    expect(selector).toHaveAccessibleName(/Phòng khám An Khang/)
    expect(selector).toHaveFocus()
  })

  it('shows retry instead of sign in when the public center list fails', async () => {
    vi.mocked(fetchPublicCenters).mockRejectedValue(Object.assign(new Error('unavailable'), { status: 401 }))
    renderPortal()

    const trigger = await within(screen.getByRole('banner')).findByRole('button', { name: /Tất cả trung tâm/ })
    act(() => {
      fireEvent.click(trigger)
    })
    const menu = screen.getByRole('region', { name: 'Danh sách trung tâm chăm sóc' })
    expect(await within(menu).findByRole('alert')).toBeInTheDocument()
    expect(within(menu).queryByRole('link', { name: 'Đăng nhập' })).not.toBeInTheDocument()
  })

  it('lists active centers with their address from the customer center endpoint', async () => {
    renderPortal()

    fireEvent.click(await within(screen.getByRole('banner')).findByRole('button', { name: /Tất cả trung tâm/ }))
    const menu = screen.getByRole('region', { name: 'Danh sách trung tâm chăm sóc' })
    expect(await within(menu).findByRole('button', { name: /Trung tâm Bình An/ })).toHaveTextContent(
      '12 Lê Lợi, Quận 1'
    )
    expect(fetchPublicCenters).toHaveBeenCalledWith({ page: 0, size: 100 })
  })

  it('shows the current name of the chosen center and forgets a center that no longer takes bookings', async () => {
    selectCenter({ id: 'center-b', name: 'Tên cũ' })
    const { unmount } = renderPortal()

    const banner = within(screen.getByRole('banner'))
    expect(await banner.findByRole('button', { name: /Trung tâm Bình An/ })).toBeInTheDocument()
    expect(fetchPublicCenter).toHaveBeenCalledWith('center-b')
    unmount()

    selectCenter({ id: 'center-closed', name: 'Trung tâm đã đóng' })
    renderPortal()
    expect(
      await within(screen.getByRole('banner')).findByRole('button', { name: /Tất cả trung tâm/ })
    ).toBeInTheDocument()
    expect(localStorage.getItem('careconnect.selected-center')).toBeNull()
  })
})
