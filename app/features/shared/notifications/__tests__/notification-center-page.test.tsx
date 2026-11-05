import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  fetchNotificationPage,
  fetchUnreadCount,
  readNotification,
  removeNotifications,
  removeReadNotifications,
  setNotificationsRead,
  unreadNotification
} from '~/entities/notification/notification-api'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { NotificationCenterPage } from '../notification-center-page'

vi.mock('~/entities/notification/notification-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/notification/notification-api')>()),
  fetchNotificationPage: vi.fn(),
  fetchUnreadCount: vi.fn(),
  readNotification: vi.fn(),
  unreadNotification: vi.fn(),
  readAllNotifications: vi.fn(),
  removeNotification: vi.fn(),
  removeNotifications: vi.fn(),
  removeReadNotifications: vi.fn(),
  setNotificationsRead: vi.fn()
}))

function renderPage(path = '/center-manager/notifications') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<NotificationCenterPage portal='center-manager' />} path='/center-manager/notifications' />
          <Route element={<p data-testid='booking-detail' />} path='/center-manager/bookings/:id' />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  vi.clearAllMocks()
  await setAppLanguage('vi', false)
  vi.mocked(fetchUnreadCount).mockResolvedValue(1)
  vi.mocked(fetchNotificationPage).mockResolvedValue({
    items: [
      {
        id: 'n-1',
        type: 'CENTER_ACTION_DUE',
        title: 'Lịch đặt sắp quá hạn xử lý',
        body: 'Lịch BK-1: cần xác nhận trước 10:36 04/11/2026',
        refType: 'BOOKING',
        refId: 'bk-1',
        bookingId: 'bk-1',
        createdAt: new Date().toISOString()
      },
      {
        id: 'n-2',
        type: 'REVIEW_CREATED',
        title: 'Có đánh giá mới',
        readAt: '2026-10-01T02:00:00Z',
        createdAt: '2026-10-01T01:00:00Z'
      }
    ],
    page: 0,
    size: 20,
    totalElements: 2,
    totalPages: 1
  })
  vi.mocked(readNotification).mockResolvedValue()
  vi.mocked(unreadNotification).mockResolvedValue()
  vi.mocked(removeNotifications).mockResolvedValue(1)
  vi.mocked(removeReadNotifications).mockResolvedValue(1)
  vi.mocked(setNotificationsRead).mockResolvedValue(1)
})

describe('NotificationCenterPage', () => {
  it('groups notifications by day, filters unread ones and marks one read when opened', async () => {
    renderPage()

    expect(await screen.findByRole('region', { name: 'Hôm nay' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Trước đó' })).toBeInTheDocument()
    expect(screen.getByText('1 thông báo chưa đọc')).toBeInTheDocument()

    // A notification without a page still counts as read once opened.
    fireEvent.click(screen.getByRole('button', { name: /^Có đánh giá mới/ }))
    expect(readNotification).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: /^Chưa đọc/ }))
    await waitFor(() =>
      expect(fetchNotificationPage).toHaveBeenLastCalledWith(expect.objectContaining({ unreadOnly: true, page: 0 }))
    )

    fireEvent.click(await screen.findByRole('button', { name: /^Lịch đặt sắp quá hạn xử lý/ }))
    expect(await screen.findByTestId('booking-detail')).toBeInTheDocument()
    expect(readNotification).toHaveBeenCalledWith('n-1', expect.anything())
  })

  it('marks one unread, then marks and deletes a selection from the selection bar', async () => {
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: 'Đánh dấu chưa đọc “Có đánh giá mới”' }))
    await waitFor(() => expect(unreadNotification).toHaveBeenCalledWith('n-2', expect.anything()))

    fireEvent.click(screen.getByRole('checkbox', { name: 'Chọn thông báo “Có đánh giá mới”' }))
    const bar = screen.getByRole('toolbar', { name: 'Thao tác với thông báo đã chọn' })
    expect(within(bar).getByText('Đã chọn 1')).toBeInTheDocument()
    // The selected notification is already read: only "mark unread" applies.
    expect(within(bar).getByRole('button', { name: 'Đánh dấu đã đọc' })).toBeDisabled()
    fireEvent.click(within(bar).getByRole('button', { name: 'Đánh dấu chưa đọc' }))
    await waitFor(() => expect(setNotificationsRead).toHaveBeenCalledWith(['n-2'], false))

    fireEvent.click(screen.getByRole('checkbox', { name: 'Chọn tất cả thông báo trên trang' }))
    fireEvent.click(screen.getByRole('button', { name: 'Xóa đã chọn' }))
    const confirm = await screen.findByRole('dialog', { name: 'Xóa 2 thông báo?' })
    fireEvent.click(within(confirm).getByRole('button', { name: 'Xóa' }))
    await waitFor(() => expect(removeNotifications).toHaveBeenCalledWith(['n-1', 'n-2'], expect.anything()))

    fireEvent.click(screen.getByRole('button', { name: 'Thao tác khác' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Xóa thông báo đã đọc' }))
    const confirmRead = await screen.findByRole('dialog', { name: 'Xóa mọi thông báo đã đọc?' })
    fireEvent.click(within(confirmRead).getByRole('button', { name: 'Xóa' }))
    await waitFor(() => expect(removeReadNotifications).toHaveBeenCalled())
  })
})
