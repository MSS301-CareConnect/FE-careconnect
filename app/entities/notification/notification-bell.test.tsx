import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { setAppLanguage } from '~/shared/i18n/i18n'

import {
  fetchNotifications,
  fetchUnreadCount,
  readAllNotifications,
  readNotification,
  removeNotification
} from './notification-api'
import { NotificationBell } from './notification-bell'

vi.mock('./notification-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./notification-api')>()),
  fetchNotifications: vi.fn(),
  fetchUnreadCount: vi.fn(),
  readNotification: vi.fn(),
  readAllNotifications: vi.fn(),
  removeNotification: vi.fn()
}))

class FakeEventSource {
  static instances: FakeEventSource[] = []
  listeners = new Map<string, () => void>()
  closed = false
  constructor(
    public url: string,
    public init?: EventSourceInit
  ) {
    FakeEventSource.instances.push(this)
  }
  addEventListener(name: string, listener: () => void) {
    this.listeners.set(name, listener)
  }
  removeEventListener(name: string) {
    this.listeners.delete(name)
  }
  close() {
    this.closed = true
  }
}

function renderBell() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/customer']}>
        <Routes>
          <Route element={<NotificationBell portal='customer' />} path='/customer' />
          <Route element={<p data-testid='booking-page' />} path='/customer/bookings/:id' />
          <Route element={<p data-testid='notification-center' />} path='/customer/notifications' />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  vi.clearAllMocks()
  FakeEventSource.instances = []
  vi.stubGlobal('EventSource', FakeEventSource)
  await setAppLanguage('vi', false)
  vi.mocked(fetchNotifications).mockResolvedValue({
    items: [
      {
        id: 'n-1',
        type: 'BOOKING_CONFIRMED',
        title: 'Lịch chăm sóc đã được xác nhận',
        refType: 'BOOKING',
        refId: 'bk-1',
        bookingId: 'bk-1',
        createdAt: '2026-11-01T01:00:00Z'
      },
      {
        id: 'n-2',
        type: 'REFUND_COMPLETED',
        title: 'Hoàn tiền thành công',
        readAt: '2026-11-01T02:00:00Z',
        createdAt: '2026-11-01T01:30:00Z'
      }
    ],
    page: 0,
    size: 10,
    totalElements: 2,
    totalPages: 1
  })
  vi.mocked(readNotification).mockResolvedValue()
  vi.mocked(readAllNotifications).mockResolvedValue()
  vi.mocked(removeNotification).mockResolvedValue()
})

describe('NotificationBell (H-06)', () => {
  it('shows the unread badge, lists notifications and marks them read', async () => {
    vi.mocked(fetchUnreadCount).mockResolvedValue(1)
    renderBell()

    const bell = await screen.findByRole('button', { name: 'Thông báo (1 chưa đọc)' })
    fireEvent.click(bell)
    await screen.findByRole('button', { name: /^Lịch chăm sóc đã được xác nhận/ })
    fireEvent.click(screen.getByRole('button', { name: 'Đánh dấu đã đọc tất cả' }))
    await waitFor(() => expect(readAllNotifications).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: 'Xóa thông báo “Hoàn tiền thành công”' }))
    await waitFor(() => expect(removeNotification).toHaveBeenCalledWith('n-2', expect.anything()))
    expect(screen.getByRole('link', { name: 'Xem tất cả thông báo' })).toHaveAttribute(
      'href',
      '/customer/notifications'
    )
  })

  it('opens the related page of a notification and marks it read', async () => {
    vi.mocked(fetchUnreadCount).mockResolvedValue(1)
    renderBell()

    fireEvent.click(await screen.findByRole('button', { name: 'Thông báo (1 chưa đọc)' }))
    fireEvent.click(await screen.findByRole('button', { name: /^Lịch chăm sóc đã được xác nhận/ }))
    expect(await screen.findByTestId('booking-page')).toBeInTheDocument()
    await waitFor(() => expect(readNotification).toHaveBeenCalledWith('n-1', expect.anything()))
  })

  it('subscribes to the SSE stream with cookies and refreshes on a notification event', async () => {
    vi.mocked(fetchUnreadCount).mockResolvedValueOnce(0).mockResolvedValue(3)
    const view = renderBell()

    expect(await screen.findByRole('button', { name: 'Thông báo' })).toBeInTheDocument()
    const source = FakeEventSource.instances[0]
    expect(source.url).toBe('/api/v1/notifications/stream')
    expect(source.init?.withCredentials).toBe(true)
    source.listeners.get('notification')?.()
    expect(await screen.findByRole('button', { name: 'Thông báo (3 chưa đọc)' })).toBeInTheDocument()

    view.unmount()
    expect(source.closed).toBe(true)
  })
})
