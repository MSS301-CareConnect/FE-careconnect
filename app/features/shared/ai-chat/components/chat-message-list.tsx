import { motion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'
import { ViewableImage } from '~/shared/ui/image-viewer'

import type { ChatMessageView } from '../use-ai-chat'
import { ChatMessageText } from './chat-message-text'

const bubbleIn = {
  initial: { opacity: 0, y: 10, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const }
}

/** The assistant's small round avatar beside its bubbles. */
function AssistantAvatar() {
  return (
    <span
      aria-hidden='true'
      className='grid h-8 w-8 shrink-0 place-items-center rounded-full bg-forest-900 text-mint-200'
    >
      <Icon className='text-lg' name='smart_toy' />
    </span>
  )
}

const assistantBubble =
  'rounded-3xl rounded-tl-md bg-white px-4 py-2.5 text-sm leading-6 text-on-surface shadow-[var(--shadow-soft)] ring-1 ring-forest-900/5'

/**
 * The conversation, newest at the bottom; it scrolls down when a message or the "answering" line appears. Each bubble
 * rises in; the assistant's carry its avatar, the visitor's are forest.
 */
export function ChatMessageList({ messages, sending }: { messages: ChatMessageView[]; sending: boolean }) {
  const { t } = useTranslation()
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: 'end' })
  }, [messages.length, sending])

  return (
    <div aria-live='polite' className='space-y-3' role='log'>
      <motion.div className='flex items-end gap-2' {...bubbleIn}>
        <AssistantAvatar />
        <div className={`max-w-[80%] ${assistantBubble}`}>{t('aiChat.greeting')}</div>
      </motion.div>
      {messages.map((message) => {
        const mine = message.role === 'USER'
        return (
          <motion.div className={`flex items-end gap-2 ${mine ? 'justify-end' : ''}`} key={message.id} {...bubbleIn}>
            {mine ? null : <AssistantAvatar />}
            <div className={`flex max-w-[80%] flex-col gap-1 ${mine ? 'items-end' : 'items-start'}`}>
              <span className='sr-only'>{mine ? t('aiChat.you') : t('aiChat.assistant')}</span>
              {message.images.length > 0 ? (
                <ul className='flex flex-wrap justify-end gap-1.5'>
                  {message.images.map((image, index) => (
                    <li key={image.src}>
                      <ViewableImage
                        alt={image.alt || t('aiChat.imageAlt', { index: index + 1 })}
                        className='h-20 w-20 rounded-xl border border-outline-variant/50'
                        gallery={message.images.map((item, itemIndex) => ({
                          src: item.src,
                          alt: item.alt || t('aiChat.imageAlt', { index: itemIndex + 1 })
                        }))}
                        index={index}
                        src={image.src}
                      />
                    </li>
                  ))}
                </ul>
              ) : null}
              <div
                className={
                  mine
                    ? 'rounded-3xl rounded-tr-md bg-forest-900 px-4 py-2.5 text-sm leading-6 text-white shadow-[var(--shadow-soft)]'
                    : assistantBubble
                }
              >
                {mine ? (
                  <p className='whitespace-pre-line break-words'>{message.content}</p>
                ) : (
                  <ChatMessageText content={message.content} />
                )}
              </div>
            </div>
          </motion.div>
        )
      })}
      {sending ? (
        <motion.div className='flex items-end gap-2' {...bubbleIn}>
          <AssistantAvatar />
          <p className={`flex items-center gap-2 text-on-surface-variant ${assistantBubble}`} role='status'>
            <span aria-hidden='true' className='flex gap-1'>
              {[0, 1, 2].map((dot) => (
                <motion.span
                  animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                  className='h-1.5 w-1.5 rounded-full bg-forest-700'
                  key={dot}
                  transition={{ duration: 0.9, repeat: Infinity, delay: dot * 0.15 }}
                />
              ))}
            </span>
            {t('aiChat.thinking')}
          </p>
        </motion.div>
      ) : null}
      <div ref={endRef} />
    </div>
  )
}
