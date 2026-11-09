import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { ViewableImage } from '~/shared/ui/image-viewer'

import type { ChatMessageView } from '../use-ai-chat'
import { ChatMessageText } from './chat-message-text'

/** The conversation, newest at the bottom; it scrolls down when a message or the "answering" line appears. */
export function ChatMessageList({ messages, sending }: { messages: ChatMessageView[]; sending: boolean }) {
  const { t } = useTranslation()
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: 'end' })
  }, [messages.length, sending])

  return (
    <div aria-live='polite' className='space-y-3' role='log'>
      <div className='max-w-[85%] rounded-2xl rounded-tl-sm bg-surface-container-low px-3.5 py-2.5 text-sm leading-6 text-on-surface'>
        {t('aiChat.greeting')}
      </div>
      {messages.map((message) => {
        const mine = message.role === 'USER'
        return (
          <div className={`flex flex-col gap-1 ${mine ? 'items-end' : 'items-start'}`} key={message.id}>
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
              className={`max-w-[85%] px-3.5 py-2.5 text-sm leading-6 ${
                mine
                  ? 'rounded-2xl rounded-tr-sm bg-primary text-on-primary'
                  : 'rounded-2xl rounded-tl-sm bg-surface-container-low text-on-surface'
              }`}
            >
              {mine ? (
                <p className='whitespace-pre-line break-words'>{message.content}</p>
              ) : (
                <ChatMessageText content={message.content} />
              )}
            </div>
          </div>
        )
      })}
      {sending ? (
        <p className='flex items-center gap-2 text-sm text-on-surface-variant' role='status'>
          <span aria-hidden='true' className='flex gap-1'>
            <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-primary' />
            <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:150ms]' />
            <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:300ms]' />
          </span>
          {t('aiChat.thinking')}
        </p>
      ) : null}
      <div ref={endRef} />
    </div>
  )
}
