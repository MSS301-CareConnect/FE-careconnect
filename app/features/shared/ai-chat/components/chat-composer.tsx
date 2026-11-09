import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'

import type { AiChatQuota } from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'

import type { ChatImage } from '../use-ai-chat'

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MB = 1024 * 1024

interface Attachment {
  file: File
  url: string
}

type ValidationError =
  | { key: 'aiChat.validation.promptRequired' }
  | { key: 'aiChat.validation.promptTooLong'; max: number }
  | { key: 'aiChat.validation.tooManyImages'; count: number }
  | { key: 'aiChat.validation.imageType' }
  | { key: 'aiChat.validation.imageSize'; size: number }
  | { key: 'aiChat.validation.totalSize'; size: number }

/** Checks the images against the limits AIService returned (count, type, size of each, total size). */
function validateImages(files: File[], quota: AiChatQuota): ValidationError | null {
  if (files.length > quota.maxImages) return { key: 'aiChat.validation.tooManyImages', count: quota.maxImages }
  if (files.some((file) => !IMAGE_TYPES.includes(file.type))) return { key: 'aiChat.validation.imageType' }
  if (files.some((file) => file.size > quota.maxImageSizeMb * MB)) {
    return { key: 'aiChat.validation.imageSize', size: quota.maxImageSizeMb }
  }
  const total = files.reduce((sum, file) => sum + file.size, 0)
  if (total > quota.maxTotalImageSizeMb * MB) {
    return { key: 'aiChat.validation.totalSize', size: quota.maxTotalImageSizeMb }
  }
  return null
}

/** Checks the question and images before sending, so most mistakes never reach the server. */
function validate(prompt: string, files: File[], quota: AiChatQuota): ValidationError | null {
  if (!prompt.trim()) return { key: 'aiChat.validation.promptRequired' }
  if (prompt.trim().length > quota.maxPromptLength) {
    return { key: 'aiChat.validation.promptTooLong', max: quota.maxPromptLength }
  }
  return validateImages(files, quota)
}

/**
 * Question box: Enter sends, Shift+Enter adds a line. Signed-in users attach up to `maxImages` images (previewed
 * before sending); guests see why the button is locked. The previews stay alive until the answer arrives because the
 * pending question shows them.
 */
export function ChatComposer({
  quota,
  disabled,
  sending,
  onSend
}: {
  quota: AiChatQuota
  disabled: boolean
  sending: boolean
  onSend: (prompt: string, files: File[], previews: ChatImage[]) => Promise<boolean>
}) {
  const { t } = useTranslation()
  const id = useId()
  const fileInput = useRef<HTMLInputElement>(null)
  const [prompt, setPrompt] = useState('')
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [error, setError] = useState<ValidationError | { key: 'aiChat.guestImagesLocked' } | null>(null)
  const [dragging, setDragging] = useState(false)
  const urls = useRef<string[]>([])
  const canAttach = quota.imagesAllowed && !disabled && !sending && attachments.length < quota.maxImages

  useEffect(() => () => urls.current.forEach((url) => URL.revokeObjectURL(url)), [])

  // Opens the system file dialog so the user picks images from any folder of the device.
  function pickFromFolder() {
    if (canAttach) fileInput.current?.click()
  }

  function addFiles(list: FileList | null) {
    if (!list || list.length === 0) return
    if (!quota.imagesAllowed) return setError({ key: 'aiChat.guestImagesLocked' })
    const added = Array.from(list).map((file) => {
      const url = URL.createObjectURL(file)
      urls.current.push(url)
      return { file, url }
    })
    const next = [...attachments, ...added]
    setAttachments(next)
    setError(
      validateImages(
        next.map((item) => item.file),
        quota
      )
    )
  }

  function removeAttachment(url: string) {
    URL.revokeObjectURL(url)
    urls.current = urls.current.filter((item) => item !== url)
    const next = attachments.filter((item) => item.url !== url)
    setAttachments(next)
    setError(null)
  }

  async function submit() {
    if (disabled || sending) return
    const files = attachments.map((item) => item.file)
    const problem = validate(prompt, files, quota)
    setError(problem)
    if (problem) return
    const sent = attachments
    const previews = sent.map((item, index) => ({ src: item.url, alt: t('aiChat.imageAlt', { index: index + 1 }) }))
    const question = prompt.trim()
    setPrompt('')
    setAttachments([])
    const ok = await onSend(question, files, previews)
    if (!ok) {
      // Keep what was typed so the user can retry without retyping.
      setPrompt(question)
      setAttachments(sent)
      return
    }
    sent.forEach((item) => {
      URL.revokeObjectURL(item.url)
      urls.current = urls.current.filter((url) => url !== item.url)
    })
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      void submit()
    }
  }

  const errorText = error
    ? t(
        error.key,
        'max' in error
          ? { max: error.max }
          : 'count' in error
            ? { count: error.count }
            : 'size' in error
              ? { size: error.size }
              : {}
      )
    : null
  const length = prompt.trim().length
  const nearLimit = length > quota.maxPromptLength * 0.8

  return (
    <form
      className={`relative space-y-2 rounded-2xl ${dragging ? 'ring-2 ring-primary ring-offset-2' : ''}`}
      // Images dragged from a folder (Explorer / Finder) are attached like picked ones.
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false)
      }}
      onDragOver={(event) => {
        if (!Array.from(event.dataTransfer.types).includes('Files')) return
        event.preventDefault()
        setDragging(true)
      }}
      onDrop={(event) => {
        event.preventDefault()
        setDragging(false)
        if (!disabled && !sending) addFiles(event.dataTransfer.files)
      }}
      onSubmit={(event) => {
        event.preventDefault()
        void submit()
      }}
    >
      {dragging ? (
        <div
          aria-hidden='true'
          className='pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-2xl border-2 border-dashed border-primary bg-surface-container-lowest/90 text-sm font-semibold text-primary'
        >
          {quota.imagesAllowed ? t('aiChat.dropHere') : t('aiChat.guestImagesLocked')}
        </div>
      ) : null}
      {attachments.length > 0 ? (
        <ul className='flex flex-wrap gap-2'>
          {attachments.map((item, index) => (
            <li className='relative' key={item.url}>
              <img
                alt={t('aiChat.imageAlt', { index: index + 1 })}
                className='h-16 w-16 rounded-xl border border-outline-variant/60 object-cover'
                src={item.url}
              />
              <button
                aria-label={t('aiChat.removeImage', { name: item.file.name })}
                className='absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-on-surface text-surface shadow focus-visible:outline-2 focus-visible:outline-primary'
                onClick={() => removeAttachment(item.url)}
                type='button'
              >
                <Icon className='text-sm' name='close' />
              </button>
            </li>
          ))}
          {attachments.length < quota.maxImages ? (
            <li>
              <button
                aria-label={t('aiChat.addMore')}
                className='flex h-16 w-16 items-center justify-center rounded-xl border-2 border-dashed border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50'
                disabled={!canAttach}
                onClick={pickFromFolder}
                title={t('aiChat.addMore')}
                type='button'
              >
                <Icon name='add' />
              </button>
            </li>
          ) : null}
        </ul>
      ) : null}
      <div className='flex items-end gap-2 rounded-2xl border border-outline-variant bg-surface-container-lowest p-1.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20'>
        {quota.imagesAllowed ? (
          <>
            <input
              accept={IMAGE_TYPES.join(',')}
              className='sr-only'
              id={`${id}-images`}
              multiple
              onChange={(event) => {
                addFiles(event.target.files)
                event.target.value = ''
              }}
              ref={fileInput}
              tabIndex={-1}
              type='file'
            />
            <button
              aria-label={t('aiChat.attach')}
              className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-container-low hover:text-primary focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50'
              disabled={!canAttach}
              onClick={pickFromFolder}
              title={t('aiChat.attachHint', { count: quota.maxImages, size: quota.maxImageSizeMb })}
              type='button'
            >
              <Icon name='add_photo_alternate' />
            </button>
          </>
        ) : (
          <span
            className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-outline'
            title={t('aiChat.guestImagesLocked')}
          >
            <Icon name='lock' />
            <span className='sr-only'>{t('aiChat.guestImagesLocked')}</span>
          </span>
        )}
        <label className='sr-only' htmlFor={`${id}-prompt`}>
          {t('aiChat.placeholder')}
        </label>
        <textarea
          aria-describedby={errorText ? `${id}-error` : undefined}
          aria-invalid={errorText ? true : undefined}
          className='max-h-32 min-h-11 flex-1 resize-none bg-transparent px-1 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none'
          disabled={disabled}
          id={`${id}-prompt`}
          onChange={(event) => {
            setPrompt(event.target.value)
            setError(null)
          }}
          onKeyDown={onKeyDown}
          placeholder={t('aiChat.placeholder')}
          rows={1}
          value={prompt}
        />
        <button
          aria-label={t('aiChat.send')}
          className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50'
          disabled={disabled || sending}
          type='submit'
        >
          <Icon name='send' />
        </button>
      </div>
      <div className='flex items-start justify-between gap-3 text-xs'>
        {errorText ? (
          <p className='font-medium text-error' id={`${id}-error`}>
            {errorText}
          </p>
        ) : (
          <p className='text-on-surface-variant'>
            {quota.imagesAllowed
              ? t('aiChat.attachHint', { count: quota.maxImages, size: quota.maxImageSizeMb })
              : t('aiChat.guestImagesLocked')}
          </p>
        )}
        {nearLimit ? (
          <span
            className={`shrink-0 tabular-nums ${length > quota.maxPromptLength ? 'text-error' : 'text-on-surface-variant'}`}
          >
            {t('aiChat.charCount', { count: length, max: quota.maxPromptLength })}
          </span>
        ) : null}
      </div>
    </form>
  )
}
