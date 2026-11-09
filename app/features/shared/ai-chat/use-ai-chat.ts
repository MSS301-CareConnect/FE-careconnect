import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import type { AiChatQuota } from '~/shared/api/generated/contracts'

import { aiChatKeys, fetchChatQuota, fetchConversation, isGuestLimitError, sendPrompt } from './ai-chat-api'

export interface ChatImage {
  src: string
  alt: string
}

export interface ChatMessageView {
  id: string
  role: 'USER' | 'ASSISTANT'
  content: string
  images: ChatImage[]
  createdAt?: string
}

interface PendingPrompt {
  prompt: string
  images: ChatImage[]
}

let localId = 0
const nextId = () => `local-${++localId}`

/**
 * State of the chat panel. A guest's conversation lives only in memory (AIService keeps no guest history); a
 * signed-in user's conversation is read back from AIService after each answer, so the list and the open conversation
 * always show what was saved. The question being answered is shown at once, before the answer arrives.
 */
export function useAiChat(enabled: boolean) {
  const queryClient = useQueryClient()
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [guestMessages, setGuestMessages] = useState<ChatMessageView[]>([])
  const [pending, setPending] = useState<PendingPrompt | null>(null)

  const quota = useQuery({ queryKey: aiChatKeys.quota, queryFn: fetchChatQuota, enabled, retry: false })
  const guest = quota.data?.guest ?? true
  const conversation = useQuery({
    queryKey: aiChatKeys.conversation(conversationId ?? ''),
    queryFn: () => fetchConversation(conversationId!),
    enabled: enabled && !guest && Boolean(conversationId),
    retry: false
  })

  const send = useMutation({
    mutationFn: ({ prompt, files }: { prompt: string; files: File[] }) =>
      sendPrompt(prompt, guest ? undefined : (conversationId ?? undefined), files),
    onSuccess: async (answer, { prompt }) => {
      if (guest || !answer.conversationId) {
        setGuestMessages((messages) => [
          ...messages,
          { id: nextId(), role: 'USER', content: prompt, images: [] },
          { id: nextId(), role: 'ASSISTANT', content: answer.answer, images: [], createdAt: answer.createdAt }
        ])
        if (answer.remainingGuestPrompts !== undefined) {
          queryClient.setQueryData<AiChatQuota>(aiChatKeys.quota, (current) =>
            current ? { ...current, remainingPrompts: answer.remainingGuestPrompts } : current
          )
        }
      } else {
        setConversationId(answer.conversationId)
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: aiChatKeys.conversation(answer.conversationId) }),
          queryClient.invalidateQueries({ queryKey: aiChatKeys.conversations })
        ])
      }
    },
    onError: (error) => {
      if (isGuestLimitError(error)) {
        queryClient.setQueryData<AiChatQuota>(aiChatKeys.quota, (current) =>
          current ? { ...current, remainingPrompts: 0 } : current
        )
      }
    },
    onSettled: () => setPending(null)
  })

  const saved: ChatMessageView[] = guest
    ? guestMessages
    : (conversation.data?.messages ?? []).map((message) => ({
        id: message.chatMessageId,
        role: message.messageRole,
        content: message.content,
        createdAt: message.createdAt,
        images: (message.images ?? []).flatMap((image) =>
          image.downloadUrl ? [{ src: image.downloadUrl, alt: image.originalFileName ?? '' }] : []
        )
      }))
  const messages: ChatMessageView[] = pending
    ? [...saved, { id: 'pending', role: 'USER', content: pending.prompt, images: pending.images }]
    : saved

  return {
    quota,
    guest,
    conversationId,
    conversation,
    messages,
    sending: send.isPending,
    error: send.error,
    send: (prompt: string, files: File[], previews: ChatImage[]) => {
      send.reset()
      setPending({ prompt, images: previews })
      return send.mutateAsync({ prompt, files }).then(
        () => true,
        () => false
      )
    },
    open: (id: string | null) => {
      send.reset()
      setConversationId(id)
    },
    clearError: () => send.reset()
  }
}

export type AiChatState = ReturnType<typeof useAiChat>
