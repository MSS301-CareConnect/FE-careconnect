import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { apiErrorStatus, apiRequestErrorKey } from '~/shared/api/error-details'
import { DatePicker } from '~/shared/ui/date-picker'
import { TimeSelect } from '~/shared/ui/time-select'

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
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('08:00')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('17:00')
  const startAt = startDate ? `${startDate}T${startTime}` : ''
  const endAt = endDate ? `${endDate}T${endTime}` : ''
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
      setStartDate('')
      setEndDate('')
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
          {t(apiRequestErrorKey(timeOffs.error, `${key}.error`))}
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
        <fieldset className='flex flex-col text-sm font-medium'>
          <legend>{t(`${key}.start`)}</legend>
          <span className='mt-1 flex gap-2'>
            <DatePicker aria-label={t(`${key}.start`)} className='w-40' onChange={setStartDate} value={startDate} />
            <TimeSelect
              aria-label={t('common.kit.chooseTime')}
              className='w-28'
              onChange={setStartTime}
              value={startTime}
            />
          </span>
        </fieldset>
        <fieldset className='flex flex-col text-sm font-medium'>
          <legend>{t(`${key}.end`)}</legend>
          <span className='mt-1 flex gap-2'>
            <DatePicker
              aria-label={t(`${key}.end`)}
              className='w-40'
              defaultMonth={startDate || undefined}
              min={startDate || undefined}
              onChange={setEndDate}
              value={endDate}
            />
            <TimeSelect
              aria-label={t('common.kit.chooseTime')}
              className='w-28'
              onChange={setEndTime}
              value={endTime}
            />
          </span>
        </fieldset>
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
          {t(
            apiErrorStatus(add.error ?? remove.error) === 409
              ? `${key}.saveError`
              : apiRequestErrorKey(add.error ?? remove.error, `${key}.actionError`)
          )}
        </p>
      ) : null}
    </section>
  )
}
