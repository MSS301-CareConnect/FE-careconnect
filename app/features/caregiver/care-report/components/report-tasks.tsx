import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { careTime } from '~/entities/care-session/care-record-preview'
import { SectionCard } from '~/shared/ui/section-card'
import { Icon } from '~/shared/ui/icon'
import type { ReportEditor } from '../hooks/use-care-report-draft'

export function ReportTasks({ editor }: { editor: ReportEditor }) {
  const { t, i18n } = useTranslation()
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [detail, setDetail] = useState('')
  const [time, setTime] = useState('12:00')
  const locale = i18n.resolvedLanguage ?? 'vi'
  const number = (value: number) => new Intl.NumberFormat(locale).format(value)
  return (
    <SectionCard
      title={t('caregiver.careReport.tasks')}
      icon='fact_check'
      action={
        <span className='rounded-full bg-secondary-container px-3 py-1 text-xs font-bold text-primary'>
          {t('caregiver.careReport.completed', {
            done: number(editor.draft.tasks.filter((task) => task.done).length),
            total: number(editor.draft.tasks.length)
          })}
        </span>
      }
    >
      <p className='mb-5 text-xs leading-6 text-outline'>{t('caregiver.careReport.taskHint')}</p>
      <div className='space-y-5'>
        {editor.draft.tasks.map((task) => (
          <div className='flex gap-3' key={task.id}>
            <input
              aria-label={t('caregiver.careReport.done', { task: task.title })}
              checked={task.done}
              className='mt-1 h-5 w-5 shrink-0 accent-primary'
              onChange={(event) =>
                editor.update({
                  tasks: editor.draft.tasks.map((item) =>
                    item.id === task.id ? { ...item, done: event.target.checked } : item
                  )
                })
              }
              type='checkbox'
            />
            <div className='min-w-0 flex-1 border-b border-outline-variant/20 pb-5'>
              <div className='flex flex-wrap justify-between gap-2'>
                <h3 className='text-sm font-bold'>{task.title}</h3>
                <time className='text-xs font-semibold text-primary'>
                  {/^\d{2}:\d{2}$/.test(task.time) ? careTime(task.time, locale) : task.time}
                </time>
              </div>
              <p className='mt-2 text-xs leading-6 text-on-surface-variant'>{task.detail}</p>
            </div>
          </div>
        ))}
      </div>
      {adding ? (
        <form
          className='mt-4 space-y-3 rounded-xl bg-surface-container-low p-4 print:hidden'
          onSubmit={(event) => {
            event.preventDefault()
            if (!title.trim()) return
            editor.update({
              tasks: [
                ...editor.draft.tasks,
                { id: crypto.randomUUID(), title: title.trim(), detail: detail.trim(), done: true, time }
              ]
            })
            setTitle('')
            setDetail('')
            setAdding(false)
          }}
        >
          <label className='block text-xs font-semibold'>
            {t('caregiver.careReport.taskTitle')}
            <input
              autoFocus
              className='mt-2 w-full rounded-lg border border-outline-variant bg-white p-3 text-sm'
              maxLength={150}
              onChange={(event) => setTitle(event.target.value)}
              required
              value={title}
            />
          </label>
          <label className='block text-xs font-semibold'>
            {t('caregiver.careReport.taskDetail')}
            <textarea
              className='mt-2 w-full rounded-lg border border-outline-variant bg-white p-3 text-sm'
              maxLength={1000}
              onChange={(event) => setDetail(event.target.value)}
              value={detail}
            />
          </label>
          <label className='block text-xs font-semibold'>
            {t('caregiver.careReport.taskTime')}
            <input
              className='ml-3 rounded-lg border border-outline-variant p-2'
              onChange={(event) => setTime(event.target.value)}
              required
              type='time'
              value={time}
            />
          </label>
          <div className='flex gap-3'>
            <button className='rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white' type='submit'>
              {t('caregiver.careReport.addConfirm')}
            </button>
            <button onClick={() => setAdding(false)} type='button'>
              {t('caregiver.careReport.cancel')}
            </button>
          </div>
        </form>
      ) : (
        <button
          className='mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-outline-variant text-xs font-semibold text-primary print:hidden'
          onClick={() => setAdding(true)}
          type='button'
        >
          <Icon name='add_circle' />
          {t('caregiver.careReport.add')}
        </button>
      )}
    </SectionCard>
  )
}
