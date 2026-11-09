import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { AiConversationSummary } from '~/shared/api/generated/contracts'
import { useFormat } from '~/shared/lib/format'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'
import { ConfirmDialog } from '~/shared/ui/modal'

import { aiChatErrorKey, aiChatKeys, fetchConversations, removeConversation, renameConversation } from '../ai-chat-api'

const TITLE_MAX = 120

/**
 * Saved conversations of a signed-in user (any role): open, rename (inline, with the version AIService returned) and
 * delete behind a confirmation. Results are announced in the panel because not every portal mounts a toaster.
 */
export function ConversationHistory({
  activeId,
  onOpen,
  onDeleted
}: {
  activeId: string | null
  onOpen: (id: string) => void
  onDeleted: (id: string) => void
}) {
  const { t } = useTranslation()
  const { dateTime } = useFormat()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<{ id: string; title: string } | null>(null)
  const [titleError, setTitleError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<AiConversationSummary | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const conversations = useQuery({ queryKey: aiChatKeys.conversations, queryFn: fetchConversations, retry: false })

  const rename = useMutation({
    mutationFn: ({ conversation, title }: { conversation: AiConversationSummary; title: string }) =>
      renameConversation(conversation.conversationId, title, conversation.version),
    onSuccess: async (_saved, { conversation }) => {
      setEditing(null)
      setNotice(t('aiChat.toast.renamed'))
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: aiChatKeys.conversations }),
        queryClient.invalidateQueries({ queryKey: aiChatKeys.conversation(conversation.conversationId) })
      ])
    }
  })
  const remove = useMutation({
    mutationFn: (conversation: AiConversationSummary) => removeConversation(conversation.conversationId),
    onSuccess: async (_done, conversation) => {
      setDeleting(null)
      setNotice(t('aiChat.toast.deleted'))
      onDeleted(conversation.conversationId)
      queryClient.removeQueries({ queryKey: aiChatKeys.conversation(conversation.conversationId) })
      await queryClient.invalidateQueries({ queryKey: aiChatKeys.conversations })
    }
  })

  function saveTitle(conversation: AiConversationSummary) {
    const title = editing?.title.trim() ?? ''
    if (!title) return setTitleError(t('aiChat.validation.titleRequired'))
    if (title.length > TITLE_MAX) return setTitleError(t('aiChat.validation.titleTooLong'))
    setTitleError(null)
    rename.mutate({ conversation, title })
  }

  if (conversations.isPending) {
    return (
      <p className='p-4 text-sm text-on-surface-variant' role='status'>
        {t('aiChat.historyLoading')}
      </p>
    )
  }
  if (conversations.isError) {
    return (
      <div className='space-y-2 p-4 text-sm' role='alert'>
        <p className='text-error'>{t('aiChat.historyError')}</p>
        <Button onClick={() => void conversations.refetch()} size='sm' variant='outline'>
          {t('aiChat.retry')}
        </Button>
      </div>
    )
  }

  return (
    <div className='space-y-2'>
      <p aria-live='polite' className='min-h-5 text-xs font-medium text-success'>
        {notice}
      </p>
      {conversations.data.length === 0 ? (
        <p className='rounded-xl bg-surface-container-low p-4 text-sm text-on-surface-variant'>
          {t('aiChat.historyEmpty')}
        </p>
      ) : (
        <ul className='space-y-1.5'>
          {conversations.data.map((conversation) => {
            const active = conversation.conversationId === activeId
            const isEditing = editing?.id === conversation.conversationId
            return (
              <li
                className={`rounded-xl border p-2.5 ${active ? 'border-primary bg-primary/5' : 'border-outline-variant/60'}`}
                key={conversation.conversationId}
              >
                {isEditing ? (
                  <form
                    className='space-y-2'
                    onSubmit={(event) => {
                      event.preventDefault()
                      saveTitle(conversation)
                    }}
                  >
                    <label
                      className='block text-xs font-semibold text-on-surface'
                      htmlFor={`rename-${conversation.conversationId}`}
                    >
                      {t('aiChat.renameLabel')}
                    </label>
                    <input
                      aria-describedby={titleError ? `rename-error-${conversation.conversationId}` : undefined}
                      aria-invalid={titleError ? true : undefined}
                      autoFocus
                      className='min-h-11 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-sm focus:border-primary focus:outline-none aria-[invalid=true]:border-error'
                      id={`rename-${conversation.conversationId}`}
                      maxLength={TITLE_MAX + 20}
                      onChange={(event) => {
                        setEditing({ id: conversation.conversationId, title: event.target.value })
                        setTitleError(null)
                      }}
                      value={editing.title}
                    />
                    {titleError ? (
                      <p className='text-xs font-medium text-error' id={`rename-error-${conversation.conversationId}`}>
                        {titleError}
                      </p>
                    ) : null}
                    {rename.isError ? (
                      <p className='text-xs font-medium text-error' role='alert'>
                        {t(aiChatErrorKey(rename.error))}
                      </p>
                    ) : null}
                    <div className='flex justify-end gap-2'>
                      <Button
                        onClick={() => {
                          setEditing(null)
                          setTitleError(null)
                          rename.reset()
                        }}
                        size='sm'
                        variant='ghost'
                      >
                        {t('aiChat.cancel')}
                      </Button>
                      <Button loading={rename.isPending} size='sm' type='submit'>
                        {t('aiChat.save')}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className='flex items-center gap-1'>
                    <button
                      aria-current={active ? 'true' : undefined}
                      className='min-h-11 min-w-0 flex-1 rounded-lg px-1.5 text-left focus-visible:outline-2 focus-visible:outline-primary'
                      onClick={() => onOpen(conversation.conversationId)}
                      type='button'
                    >
                      <span className='block truncate text-sm font-semibold text-on-surface'>{conversation.title}</span>
                      <span className='block text-xs text-on-surface-variant'>
                        {t('aiChat.updatedAt', { time: dateTime(conversation.updatedAt) })}
                      </span>
                    </button>
                    <button
                      aria-label={t('aiChat.renameItem', { title: conversation.title })}
                      className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface focus-visible:outline-2 focus-visible:outline-primary'
                      onClick={() => {
                        rename.reset()
                        setTitleError(null)
                        setEditing({ id: conversation.conversationId, title: conversation.title })
                      }}
                      type='button'
                    >
                      <Icon className='text-lg' name='edit' />
                    </button>
                    <button
                      aria-label={t('aiChat.deleteItem', { title: conversation.title })}
                      className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-on-surface-variant hover:bg-error-container hover:text-error focus-visible:outline-2 focus-visible:outline-primary'
                      onClick={() => {
                        remove.reset()
                        setDeleting(conversation)
                      }}
                      type='button'
                    >
                      <Icon className='text-lg' name='delete' />
                    </button>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
      <ConfirmDialog
        cancelLabel={t('aiChat.cancel')}
        confirmLabel={t('aiChat.delete')}
        description={deleting ? t('aiChat.deleteDescription', { title: deleting.title }) : undefined}
        error={remove.isError ? t(aiChatErrorKey(remove.error)) : undefined}
        loading={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting)}
        open={Boolean(deleting)}
        title={t('aiChat.deleteTitle')}
        tone='danger'
      />
    </div>
  )
}
