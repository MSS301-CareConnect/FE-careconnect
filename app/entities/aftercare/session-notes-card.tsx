import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { addSessionNote, aftercareErrorKey, aftercareKeys, fetchSessionNotes } from './aftercare-api'

/** Notes written during a care session (M-17); caregivers add, everyone with access to the visit reads. */
export function SessionNotesCard({ sessionId, canWrite }: { sessionId: string; canWrite: boolean }) {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const [content, setContent] = useState('')
  const notes = useQuery({
    queryKey: aftercareKeys.notes(sessionId),
    queryFn: () => fetchSessionNotes(sessionId),
    retry: false
  })
  const add = useMutation({
    mutationFn: () => addSessionNote(sessionId, content.trim()),
    onSuccess: async () => {
      setContent('')
      await queryClient.invalidateQueries({ queryKey: aftercareKeys.notes(sessionId) })
    }
  })
  const formatter = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'short', timeStyle: 'short' })

  function submit(event: FormEvent) {
    event.preventDefault()
    if (content.trim()) add.mutate()
  }

  return (
    <section aria-labelledby={`notes-${sessionId}`} className='rounded-2xl bg-white p-5 shadow-sm'>
      <h2 className='text-base font-bold' id={`notes-${sessionId}`}>
        {t('aftercare.notes.title')}
      </h2>
      {notes.isError ? (
        <p className='mt-2 text-sm text-error' role='alert'>
          {t(aftercareErrorKey(notes.error))}
        </p>
      ) : null}
      {notes.isSuccess && notes.data.length === 0 ? (
        <p className='mt-2 text-sm text-on-surface-variant'>{t('aftercare.notes.empty')}</p>
      ) : null}
      <ul className='mt-3 flex flex-col gap-2'>
        {(notes.data ?? []).map((note) => (
          <li className='rounded-xl bg-surface-container-low p-3 text-sm' key={note.id}>
            <p className='whitespace-pre-line'>{note.content}</p>
            {note.createdAt ? (
              <p className='mt-1 text-xs text-on-surface-variant'>{formatter.format(new Date(note.createdAt))}</p>
            ) : null}
          </li>
        ))}
      </ul>
      {canWrite ? (
        <form className='mt-3 flex flex-col gap-2' onSubmit={submit}>
          <label className='text-sm font-medium'>
            {t('aftercare.notes.label')}
            <textarea
              className='mt-1 w-full rounded-lg border border-outline-variant p-2 text-sm'
              maxLength={2000}
              onChange={(event) => setContent(event.target.value)}
              rows={3}
              value={content}
            />
          </label>
          {add.isError ? (
            <p className='text-sm text-error' role='alert'>
              {t(aftercareErrorKey(add.error))}
            </p>
          ) : null}
          <button
            className='self-start rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-50'
            disabled={add.isPending || !content.trim()}
            type='submit'
          >
            {t('aftercare.notes.add')}
          </button>
        </form>
      ) : null}
    </section>
  )
}
