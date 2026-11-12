import {
  deleteAiConversation,
  getAiChatQuota,
  getAiConversation,
  listAiConversations,
  sendAiChatPrompt,
  updateAiConversation
} from '~/shared/api/generated/api/ai-chat/ai-chat'
import type { AiChatPromptPayload } from '~/shared/api/generated/contracts'
import { readOptions, serviceResponse, writeOptions } from '~/shared/api/request'
import { apiErrorCode, apiErrorStatus, apiRequestErrorKey } from '~/shared/api/error-details'
import { refreshSession } from '~/shared/api/session-refresh'

const { result } = serviceResponse('AIService')

/**
 * The chat endpoints are public but AIService still reads the session cookie to tell a guest from a signed-in user,
 * so an expired access cookie answers 401: refresh the session once and repeat the call (same rule as /users/me).
 */
async function withSessionRefresh<T>(call: () => Promise<T>): Promise<T> {
  try {
    return await call()
  } catch (error) {
    if (apiErrorStatus(error) !== 401) throw error
    await refreshSession()
    return call()
  }
}

export const aiChatKeys = {
  all: ['ai-chat'] as const,
  quota: ['ai-chat', 'quota'] as const,
  conversations: ['ai-chat', 'conversations'] as const,
  conversation: (id: string) => ['ai-chat', 'conversation', id] as const
}

/** Who is asking: a guest (prompts left today, no images) or a signed-in user of any role (image limits). */
export async function fetchChatQuota() {
  return withSessionRefresh(async () => result(await getAiChatQuota(readOptions)))
}

export async function fetchConversations() {
  return withSessionRefresh(async () => result(await listAiConversations(readOptions)))
}

export async function fetchConversation(conversationId: string) {
  return withSessionRefresh(async () => result(await getAiConversation(conversationId, readOptions)))
}

/** One question: the JSON part "request" (prompt + optional conversation) and up to three images. */
export async function sendPrompt(prompt: string, conversationId: string | undefined, images: File[]) {
  const payload: AiChatPromptPayload = conversationId ? { prompt, conversationId } : { prompt }
  const request = new Blob([JSON.stringify(payload)], { type: 'application/json' })
  return withSessionRefresh(async () =>
    result(await sendAiChatPrompt({ request, images: images.length > 0 ? images : undefined }, await writeOptions()))
  )
}

export async function renameConversation(conversationId: string, title: string, version: number) {
  return withSessionRefresh(async () =>
    result(await updateAiConversation(conversationId, { title, version }, await writeOptions()))
  )
}

export async function removeConversation(conversationId: string) {
  return withSessionRefresh(async () => {
    const response = await deleteAiConversation(conversationId, await writeOptions())
    if (response.data.code !== 200) throw new Error(`AIService returned code ${response.data.code}`)
  })
}

const KNOWN_CODES = [
  8100, 8101, 8102, 8103, 8104, 8105, 8106, 8107, 8108, 8109, 8110, 8111, 8200, 8202, 8203, 8204, 8205
] as const
export type AiChatErrorKey =
  | `aiChat.errors.e${(typeof KNOWN_CODES)[number]}`
  | 'aiChat.errors.unavailable'
  | 'aiChat.errors.network'
  | 'aiChat.errors.generic'

/** An AIService failure as a translation key; Groq / Media outages (8300+, 503) read as "busy, try later". */
export function aiChatErrorKey(error: unknown): AiChatErrorKey {
  const code = KNOWN_CODES.find((item) => item === apiErrorCode(error))
  if (code) return `aiChat.errors.e${code}`
  const requestKey = apiRequestErrorKey(error, 'aiChat.errors.generic')
  if (requestKey === 'errors.request.network') return 'aiChat.errors.network'
  if (requestKey === 'errors.request.unavailable' || requestKey === 'errors.request.server') {
    return 'aiChat.errors.unavailable'
  }
  return 'aiChat.errors.generic'
}

export function isGuestLimitError(error: unknown) {
  return apiErrorCode(error) === 8108
}
