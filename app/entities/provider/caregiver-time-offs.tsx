import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { createTimeOff, fetchTimeOffs, providerKeys, removeTimeOff } from './provider-api'

type TimeOffCopy = 'centerManager.provider.timeOff' | 'caregiver.provider.timeOff'
const inputClass = 'mt-1 rounded-lg border border-outline-variant px-3 py-2 text-sm'

/**
 * M-12: the caregiver's time off, kept by the center manager or the caregiver. ProviderService rejects time off over a
 * visit already booked and the availability search (M-16) skips caregivers who are off.
 */
export function CaregiverTimeOffs({ caregiverId, copy }: { caregiverId: string; copy: TimeOffCopy }) {
  const key = copy
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const [startAt, setStartAt] = useState('')
  const [endAt, setEndAt] = useState('')
  const [reason, setReason] = useState('')
  const timeOffs = useQuery({
    queryKey: providerKeys.timeOffs(caregiverId),
    queryFn: () => fetchTimeOffs(caregiverId, { from: new Date().toISOString() }),
    retry: false
  })
  const refresh = () => queryClient.invalidateQueries({ queryKey: providerKeys.timeOffs(caregiverId) })
  const add = useMutation({
    mutationFn: () =>
      createTimeOff(caregiverId, {
        startAt: new Date(startAt).toISOString(),
        endAt: new Date(endAt).toISOString(),
        reason: reason.trim() || undefined
      }),
    onSuccess: async () => {
      setStartAt('')
      setEndAt('')
      setReason('')
      await refresh()
    }
  })
  const remove = useMutation({ mutationFn: (id: string) => removeTimeOff(caregiverId, id), onSuccess: refresh })
  const format = (value: string) =>
    new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
  const valid = startAt !== '' && endAt !== '' && new Date(endAt) > new Date(startAt)

  function submit(event: FormEvent) {
    event.preventDefault()
    if (valid) add.mutate()
  }

  return (
    <section className='mt-6 space-y-4 rounded-2xl border border-outline-variant/20 bg-white p-5 shadow-sm'>
      <h2 className='text-lg font-semibold'>{t(`${key}.title`)}</h2>
      {timeOffs.isPending ? <p role='status'>{t(`${key}.loading`)}</p> : null}
      {timeOffs.isError ? (
        <p className='text-sm text-error' role='alert'>
          {t(`${key}.error`)}
        </p>
      ) : null}
      {timeOffs.isSuccess && timeOffs.data.length === 0 ? (
        <p className='text-sm text-on-surface-variant'>{t(`${key}.empty`)}</p>
      ) : null}
      {timeOffs.isSuccess && timeOffs.data.length > 0 ? (
        <ul className='divide-y divide-outline-variant/20 text-sm'>
          {timeOffs.data.map((item) => (
            <li className='flex flex-wrap items-center justify-between gap-2 py-2' key={item.id}>
              <span>
                {format(item.startAt)} → {format(item.endAt)}
                {item.reason ? <span className='text-on-surface-variant'> · {item.reason}</span> : null}
              </span>
              <button
                className='text-error underline disabled:opacity-50'
                disabled={remove.isPending}
                onClick={() => remove.mutate(item.id)}
                type='button'
              >
                {t(`${key}.remove`)}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <form className='flex flex-wrap items-end gap-2' onSubmit={submit}>
        <label className='flex flex-col text-sm font-medium'>
          {t(`${key}.start`)}
          <input
            className={inputClass}
            onChange={(event) => setStartAt(event.target.value)}
            type='datetime-local'
            value={startAt}
          />
        </label>
        <label className='flex flex-col text-sm font-medium'>
          {t(`${key}.end`)}
          <input
            className={inputClass}
            onChange={(event) => setEndAt(event.target.value)}
            type='datetime-local'
            value={endAt}
          />
        </label>
        <label className='flex min-w-40 flex-1 flex-col text-sm font-medium'>
          {t(`${key}.reason`)}
          <input
            className={inputClass}
            maxLength={500}
            onChange={(event) => setReason(event.target.value)}
            value={reason}
          />
        </label>
        <button
          className='rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-50'
          disabled={!valid || add.isPending}
          type='submit'
        >
          {t(`${key}.add`)}
        </button>
      </form>
      {add.isError || remove.isError ? (
        <p className='text-sm text-error' role='alert'>
          {t(`${key}.saveError`)}
        </p>
      ) : null}
    </section>
  )
}
