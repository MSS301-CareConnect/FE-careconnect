import {
  deleteNotification,
  deleteNotifications,
  deleteReadNotifications,
  getUnreadNotificationCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  markNotificationUnread,
  updateNotificationsReadState
} from '~/shared/api/generated/api/notification/notification'
import type { ListNotificationsParams } from '~/shared/api/generated/contracts'
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
  page: (params: ListNotificationsParams) => ['notification', 'page', params] as const,
  unread: ['notification', 'unread'] as const
}

/** The latest notifications for the bell. */
export async function fetchNotifications() {
  return result(await listNotifications({ page: 0, size: NOTIFICATION_PAGE_SIZE }, readOptions))
}

/** A page of the notification center, optionally only unread ones. */
export async function fetchNotificationPage(params: ListNotificationsParams) {
  return result(await listNotifications(params, readOptions))
}

export async function fetchUnreadCount() {
  return result(await getUnreadNotificationCount(readOptions)).count
}

export async function readNotification(id: string) {
  success(await markNotificationRead(id, await writeOptions()))
}

export async function unreadNotification(id: string) {
  success(await markNotificationUnread(id, await writeOptions()))
}

export async function readAllNotifications() {
  success(await markAllNotificationsRead(await writeOptions()))
}

/** Marks the selected notifications read or unread; returns how many changed. */
export async function setNotificationsRead(ids: string[], read: boolean) {
  return result(await updateNotificationsReadState({ ids, read }, await writeOptions())).updated
}

/** Soft-deletes one of the user's notifications. */
export async function removeNotification(id: string) {
  success(await deleteNotification(id, await writeOptions()))
}

/** Deletes the selected notifications; returns how many were the user's and got deleted. */
export async function removeNotifications(ids: string[]) {
  return result(await deleteNotifications({ ids }, await writeOptions())).deleted
}

/** Deletes every notification the user has already read. */
export async function removeReadNotifications() {
  return result(await deleteReadNotifications(await writeOptions())).deleted
}

/** BookingService SSE endpoint (`GET /notifications/stream`), sent with the session cookie. */
export const notificationStreamUrl = `${env.API_BASE_URL}/v1/notifications/stream`
