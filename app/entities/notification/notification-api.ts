import {
  getUnreadNotificationCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead
} from '~/shared/api/generated/api/notification/notification'
import { csrfHeaders } from '~/shared/api/csrf'
import { env } from '~/shared/config/env'

const readOptions = { credentials: 'include' as const }
const writeOptions = async () => ({ credentials: 'include' as const, headers: await csrfHeaders() })
export const NOTIFICATION_PAGE_SIZE = 10

function result<T>(response: { data: { code: number; result: T } }): T {
  if (response.data.code !== 200) throw new Error(`BookingService returned code ${response.data.code}`)
  return response.data.result
}

function success(response: { data: { code: number } }): void {
  if (response.data.code !== 200) throw new Error(`BookingService returned code ${response.data.code}`)
}

export const notificationKeys = {
  all: ['notification'] as const,
  list: ['notification', 'list'] as const,
  unread: ['notification', 'unread'] as const
}

export async function fetchNotifications() {
  return result(await listNotifications({ page: 0, size: NOTIFICATION_PAGE_SIZE }, readOptions))
}

export async function fetchUnreadCount() {
  return result(await getUnreadNotificationCount(readOptions)).count
}

export async function readNotification(id: string) {
  success(await markNotificationRead(id, await writeOptions()))
}

export async function readAllNotifications() {
  success(await markAllNotificationsRead(await writeOptions()))
}

/** BookingService SSE endpoint (`GET /notifications/stream`), sent with the session cookie. */
export const notificationStreamUrl = `${env.API_BASE_URL}/v1/notifications/stream`
