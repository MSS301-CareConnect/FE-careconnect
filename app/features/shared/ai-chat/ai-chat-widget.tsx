import { useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router'

import { Icon } from '~/shared/ui/icon'

import { aiChatErrorKey } from './ai-chat-api'
import { ChatComposer } from './components/chat-composer'
import { ChatMessageList } from './components/chat-message-list'
import { ConversationHistory } from './components/conversation-history'
import { useAiChat } from './use-ai-chat'

type View = 'chat' | 'history'

/**
 * The CareConnect assistant (AIService, 2026-11-09), mounted by every portal layout and the public pages. A floating
 * button opens a panel (full screen on phones). Guests get the daily free prompts without images and no saved
 * history; any signed-in role keeps conversations (open, rename, delete) and may attach up to three images.
 * AIService decides who is a guest (`GET /ai/chat/quota`), so the panel never guesses from the route.
 */
export function AiChatWidget() {
  const { t } = useTranslation()
  const location = useLocation()
  const titleId = useId()
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<View>('chat')
  const launcherRef = useRef<HTMLButtonElement>(null)
  const chat = useAiChat(open)
  const quota = chat.quota.data
  const exhausted = Boolean(quota?.guest && quota.remainingPrompts !== undefined && quota.remainingPrompts <= 0)
  const next = encodeURIComponent(`${location.pathname}${location.search}`)

  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !document.querySelector('dialog[open]')) {
        setOpen(false)
        launcherRef.current?.focus()
      }
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [open])

  if (!open) {
    return (
      <button
        aria-label={t('aiChat.open')}
        className='fixed bottom-24 right-4 z-40 flex h-14 items-center gap-2 rounded-full bg-primary px-4 text-on-primary shadow-lg transition-transform hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:bottom-6 lg:right-6'
        onClick={() => setOpen(true)}
        ref={launcherRef}
        type='button'
      >
        <Icon name='smart_toy' />
        <span className='hidden text-sm font-semibold sm:inline'>{t('aiChat.launcher')}</span>
      </button>
    )
  }

  return (
    <section
      aria-labelledby={titleId}
      className='fixed inset-0 z-50 flex flex-col bg-surface-container-lowest text-on-surface shadow-2xl sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[min(680px,calc(100vh-3rem))] sm:w-[420px] sm:rounded-3xl sm:border sm:border-outline-variant/60'
      role='dialog'
    >
      <header className='flex items-center gap-2 border-b border-outline-variant/60 px-4 py-3'>
        <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary'>
          <Icon name='smart_toy' />
        </span>
        <div className='min-w-0 flex-1'>
          <h2 className='truncate text-base font-bold' id={titleId}>
            {view === 'history' ? t('aiChat.history') : t('aiChat.title')}
          </h2>
          <p className='truncate text-xs text-on-surface-variant'>
            {view === 'history' ? '' : (chat.conversation.data?.title ?? t('aiChat.subtitle'))}
          </p>
        </div>
        {quota && !quota.guest ? (
          <>
            <button
              aria-label={view === 'history' ? t('aiChat.backToChat') : t('aiChat.history')}
              aria-pressed={view === 'history'}
              className='flex h-11 w-11 items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface focus-visible:outline-2 focus-visible:outline-primary'
              onClick={() => setView(view === 'history' ? 'chat' : 'history')}
              title={view === 'history' ? t('aiChat.backToChat') : t('aiChat.history')}
              type='button'
            >
              <Icon name={view === 'history' ? 'chat' : 'history'} />
            </button>
            <button
              aria-label={t('aiChat.newChat')}
              className='flex h-11 w-11 items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface focus-visible:outline-2 focus-visible:outline-primary'
              onClick={() => {
                chat.open(null)
                setView('chat')
              }}
              title={t('aiChat.newChat')}
              type='button'
            >
              <Icon name='add_comment' />
            </button>
          </>
        ) : null}
        <button
          aria-label={t('aiChat.close')}
          className='flex h-11 w-11 items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface focus-visible:outline-2 focus-visible:outline-primary'
          onClick={() => {
            setOpen(false)
            setView('chat')
          }}
          type='button'
        >
          <Icon name='close' />
        </button>
      </header>

      {view === 'history' ? (
        <div className='flex-1 overflow-y-auto p-4'>
          <ConversationHistory
            activeId={chat.conversationId}
            onDeleted={(id) => {
              if (id === chat.conversationId) chat.open(null)
            }}
            onOpen={(id) => {
              chat.open(id)
              setView('chat')
            }}
          />
        </div>
      ) : (
        <>
          <div className='flex-1 overflow-y-auto px-4 py-4'>
            {chat.quota.isError ? (
              <div className='space-y-2 text-sm' role='alert'>
                <p className='text-error'>{t(aiChatErrorKey(chat.quota.error))}</p>
                <button
                  className='font-semibold text-primary underline'
                  onClick={() => void chat.quota.refetch()}
                  type='button'
                >
                  {t('aiChat.retry')}
                </button>
              </div>
            ) : null}
            {chat.conversation.isPending && chat.conversationId ? (
              <p className='text-sm text-on-surface-variant' role='status'>
                {t('aiChat.conversationLoading')}
              </p>
            ) : null}
            {chat.conversation.isError ? (
              <div className='space-y-2 text-sm' role='alert'>
                <p className='text-error'>{t('aiChat.conversationError')}</p>
                <button
                  className='font-semibold text-primary underline'
                  onClick={() => void chat.conversation.refetch()}
                  type='button'
                >
                  {t('aiChat.retry')}
                </button>
              </div>
            ) : (
              <ChatMessageList messages={chat.messages} sending={chat.sending} />
            )}
          </div>
          <footer className='space-y-2 border-t border-outline-variant/60 px-4 pb-4 pt-3'>
            {quota?.guest ? (
              <div className='flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface-container-low px-3 py-2 text-xs'>
                <p className={exhausted ? 'font-semibold text-error' : 'text-on-surface-variant'}>
                  {exhausted
                    ? t('aiChat.guestExhausted')
                    : t('aiChat.guestRemaining', {
                        count: quota.remainingPrompts ?? 0,
                        limit: quota.dailyPromptLimit ?? 0
                      })}
                </p>
                <Link className='font-semibold text-primary underline' to={`/login?next=${next}`}>
                  {t('aiChat.signIn')}
                </Link>
              </div>
            ) : null}
            {chat.error ? (
              <p className='text-xs font-medium text-error' role='alert'>
                {t(aiChatErrorKey(chat.error))}
              </p>
            ) : null}
            {quota ? (
              <ChatComposer
                disabled={exhausted || chat.conversation.isError}
                onSend={chat.send}
                quota={quota}
                sending={chat.sending}
              />
            ) : null}
            <p className='text-[11px] leading-4 text-on-surface-variant'>
              {quota?.guest ? `${t('aiChat.guestHistory')} ` : ''}
              {t('aiChat.disclaimer')}
            </p>
          </footer>
        </>
      )}
    </section>
  )
}
