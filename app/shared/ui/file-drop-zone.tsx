import { useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Icon } from './icon'
import { LocalFilePreview } from './local-file-preview'

/**
 * A large area that opens the file picker when clicked (or Enter / Space) and accepts dropped files. Chosen files are
 * listed below with an image preview that opens in the viewer and a remove button; the caller validates them.
 */
export function FileDropZone({
  accept,
  multiple = false,
  disabled = false,
  files,
  onFiles,
  onRemove,
  hint,
  label,
  describedBy
}: {
  accept: string
  multiple?: boolean
  disabled?: boolean
  files: File[]
  /** The files the user picked or dropped, before validation. */
  onFiles: (files: File[]) => void
  onRemove: (file: File) => void
  hint?: string
  /** Accessible name of the hidden file input. */
  label: string
  describedBy?: string
}) {
  const { t } = useTranslation()
  const input = useRef<HTMLInputElement>(null)
  const hintId = useId()
  const [dragging, setDragging] = useState(false)

  return (
    <div className='flex flex-col gap-3'>
      <div
        aria-describedby={[hint ? hintId : null, describedBy].filter(Boolean).join(' ') || undefined}
        aria-disabled={disabled || undefined}
        className={`flex min-h-28 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed px-4 py-5 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${dragging ? 'border-primary bg-brand-50' : 'border-outline-variant bg-surface-container-low hover:border-brand-300 hover:bg-brand-50'} ${disabled ? 'pointer-events-none opacity-60' : ''}`}
        onClick={() => input.current?.click()}
        onDragLeave={() => setDragging(false)}
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          const dropped = Array.from(event.dataTransfer.files)
          if (dropped.length) onFiles(multiple ? dropped : dropped.slice(0, 1))
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            input.current?.click()
          }
        }}
        role='button'
        tabIndex={disabled ? -1 : 0}
      >
        <Icon className='text-3xl text-primary' name='upload' />
        <span className='text-sm font-semibold text-primary'>
          {dragging ? t('common.kit.fileDrop.dropActive') : t('common.kit.fileDrop.drop')}
        </span>
        {hint ? (
          <span className='text-xs text-on-surface-variant' id={hintId}>
            {hint}
          </span>
        ) : null}
        <input
          accept={accept}
          aria-label={label}
          className='sr-only'
          disabled={disabled}
          multiple={multiple}
          onChange={(event) => {
            const picked = Array.from(event.target.files ?? [])
            event.target.value = ''
            if (picked.length) onFiles(picked)
          }}
          onClick={(event) => event.stopPropagation()}
          ref={input}
          tabIndex={-1}
          type='file'
        />
      </div>
      {files.length ? (
        <ul aria-label={t('common.kit.fileDrop.selected', { count: files.length })} className='flex flex-wrap gap-3'>
          {files.map((file) => (
            <li
              className='flex w-40 flex-col gap-1.5 rounded-xl border border-outline-variant bg-surface-container-lowest p-2'
              key={`${file.name}-${file.size}-${file.lastModified}`}
            >
              {file.type.startsWith('image/') ? (
                <LocalFilePreview className='h-24 w-full rounded-lg' file={file} image label={file.name} />
              ) : (
                <span className='grid h-24 place-items-center rounded-lg bg-surface-container-low text-primary'>
                  <Icon className='text-3xl' name={file.type === 'application/pdf' ? 'picture_as_pdf' : 'draft'} />
                </span>
              )}
              <span className='flex items-center gap-1'>
                <span className='min-w-0 flex-1 truncate text-xs font-medium text-on-surface'>{file.name}</span>
                <button
                  aria-label={t('common.kit.fileDrop.remove', { name: file.name })}
                  className='grid h-8 w-8 shrink-0 place-items-center rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-error focus-visible:outline-2 focus-visible:outline-primary'
                  disabled={disabled}
                  onClick={() => onRemove(file)}
                  type='button'
                >
                  <Icon className='text-lg' name='close' />
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
