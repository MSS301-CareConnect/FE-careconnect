import { AnimatePresence, motion } from 'motion/react'
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

const iconButton =
  'flex h-10 w-10 items-center justify-center rounded-full text-white/75 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint-200'

/**
 * The CareConnect assistant (AIService, 2026-11-09), mounted by every portal layout and the public pages. A floating
 * forest pill opens a panel that grows out of the bottom-right corner (full screen on phones): a deep forest header,
 * a soft mint conversation area and a pill composer ("Soft Bento" restyle, 2026-11-09). Guests get the daily free prompts without images and no saved
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

  return (
    <AnimatePresence initial={false}>
      {!open ? (
        <motion.button
          animate={{ opacity: 1, scale: 1, y: 0 }}
          aria-label={t('aiChat.open')}
          className='group fixed right-4 bottom-[calc(env(safe-area-inset-bottom)+6.25rem)] z-40 flex h-14 items-center gap-2.5 rounded-full bg-forest-900 py-2 pr-2 pl-2 text-white shadow-[var(--shadow-float)] ring-1 ring-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-900 sm:pr-5 lg:right-6 lg:bottom-6'
          exit={{ opacity: 0, scale: 0.8, y: 12 }}
          initial={{ opacity: 0, scale: 0.8, y: 12 }}
          key='launcher'
          onClick={() => setOpen(true)}
          ref={launcherRef}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          type='button'
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className='relative grid h-10 w-10 place-items-center rounded-full bg-mint-200 text-forest-950'>
            <Icon name='smart_toy' />
            <span
              aria-hidden='true'
              className='absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-peach-300 ring-2 ring-forest-900'
            />
          </span>
          <span className='hidden text-sm font-semibold sm:inline'>{t('aiChat.launcher')}</span>
        </motion.button>
      ) : (
        <motion.section
          animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
          aria-labelledby={titleId}
          className='fixed inset-0 z-50 flex origin-bottom-right flex-col overflow-hidden bg-white text-on-surface shadow-[var(--shadow-float)] sm:inset-auto sm:right-6 sm:bottom-6 sm:h-[min(680px,calc(100vh-3rem))] sm:w-[420px] sm:rounded-[2rem] sm:ring-1 sm:ring-forest-900/10'
          exit={{ opacity: 0, scale: 0.92, y: 16, filter: 'blur(6px)' }}
          initial={{ opacity: 0, scale: 0.92, y: 16, filter: 'blur(6px)' }}
          key='panel'
          role='dialog'
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <header className='relative isolate flex items-center gap-2.5 overflow-hidden bg-forest-900 px-4 py-4 text-white'>
            <span
              aria-hidden='true'
              className='absolute -top-16 -right-10 -z-10 h-40 w-40 rounded-full bg-mint-400/25 blur-2xl'
            />
            <span className='relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-mint-200 text-forest-950'>
              <Icon name='smart_toy' />
              <span
                aria-hidden='true'
                className='absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full bg-mint-400 ring-2 ring-forest-900'
              />
            </span>
            <div className='min-w-0 flex-1'>
              <h2 className='truncate text-base font-bold' id={titleId}>
                {view === 'history' ? t('aiChat.history') : t('aiChat.title')}
              </h2>
              <p className='truncate text-xs text-white/65'>
                {view === 'history' ? '' : (chat.conversation.data?.title ?? t('aiChat.subtitle'))}
              </p>
            </div>
            {quota && !quota.guest ? (
              <>
                <button
                  aria-label={view === 'history' ? t('aiChat.backToChat') : t('aiChat.history')}
                  aria-pressed={view === 'history'}
                  className={iconButton}
                  onClick={() => setView(view === 'history' ? 'chat' : 'history')}
                  title={view === 'history' ? t('aiChat.backToChat') : t('aiChat.history')}
                  type='button'
                >
                  <Icon name={view === 'history' ? 'chat' : 'history'} />
                </button>
                <button
                  aria-label={t('aiChat.newChat')}
                  className={iconButton}
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
              className={iconButton}
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
            <div className='flex-1 overflow-y-auto bg-gradient-to-b from-mint-50/70 to-white p-4'>
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
              <div className='flex-1 overflow-y-auto bg-gradient-to-b from-mint-50/70 via-white to-white px-4 py-5'>
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
              <footer className='space-y-2 border-t border-forest-900/5 bg-white px-4 pt-3 pb-4'>
                {quota?.guest ? (
                  <div className='flex flex-wrap items-center justify-between gap-2 rounded-full bg-mint-50 px-4 py-2 text-xs ring-1 ring-mint-100'>
                    <p className={exhausted ? 'font-semibold text-error' : 'text-on-surface-variant'}>
                      {exhausted
                        ? t('aiChat.guestExhausted')
                        : t('aiChat.guestRemaining', {
                            count: quota.remainingPrompts ?? 0,
                            limit: quota.dailyPromptLimit ?? 0
                          })}
                    </p>
                    <Link
                      className='rounded-full bg-forest-900 px-3 py-1 font-semibold text-white transition-colors hover:bg-forest-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-900'
                      to={`/login?next=${next}`}
                    >
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
        </motion.section>
      )}
    </AnimatePresence>
  )
}
