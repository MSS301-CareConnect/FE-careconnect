import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import {
  bookingKeys,
  createCaregiverChangeRequest,
  type CaregiverChangeCreatePayload
} from '~/entities/booking/booking-api'
import { formatDateTime, isUpcomingOccurrence } from '~/entities/booking/booking-format'
import type { BookingDetailRecord, BookingOccurrenceRecord } from '~/shared/api/generated/contracts'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'
import { Modal } from '~/shared/ui/modal'

const REASON_OPTIONS = [
  { code: 'SKILL_MISMATCH', label: 'Kỹ năng chuyên môn chưa phù hợp', icon: 'medical_services' },
  { code: 'ATTITUDE_ISSUE', label: 'Thái độ giao tiếp / phục vụ chưa tốt', icon: 'sentiment_dissatisfied' },
  { code: 'PUNCTUALITY_ISSUE', label: 'Không đúng giờ / hay đến muộn', icon: 'schedule' },
  { code: 'PERSONAL_PREFERENCE', label: 'Gia đình muốn thử nhân sự khác', icon: 'person' },
  { code: 'OTHER', label: 'Lý do khác', icon: 'more_horiz' }
] as const

type ReasonCode = (typeof REASON_OPTIONS)[number]['code']

export interface CaregiverChangeDialogProps {
  booking: BookingDetailRecord
  initialOccurrence?: BookingOccurrenceRecord | null
  onClose: () => void
}

export function CaregiverChangeDialog({
  booking,
  initialOccurrence,
  onClose
}: CaregiverChangeDialogProps) {
  const { t, i18n } = useTranslation()
  const language = i18n.language
  const queryClient = useQueryClient()

  const upcoming = (booking.occurrences ?? []).filter((o) => isUpcomingOccurrence(o))
  const [scope, setScope] = useState<'ALL_REMAINING' | 'SPECIFIC_OCCURRENCES'>(
    initialOccurrence ? 'SPECIFIC_OCCURRENCES' : 'ALL_REMAINING'
  )
  const [selectedIds, setSelectedIds] = useState<string[]>(
    initialOccurrence ? [initialOccurrence.id] : []
  )
  const [reasonCode, setReasonCode] = useState<ReasonCode>('PERSONAL_PREFERENCE')
  const [reasonDetail, setReasonDetail] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: (payload: CaregiverChangeCreatePayload) =>
      createCaregiverChangeRequest(booking.id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: bookingKeys.detail(booking.id) })
      void queryClient.invalidateQueries({ queryKey: bookingKeys.all })
      onClose()
    },
    onError: (err: any) => {
      setErrorMessage(err?.info?.message || 'Có lỗi xảy ra khi gửi yêu cầu đổi người chăm sóc.')
    }
  })

  function toggleAll() {
    if (selectedIds.length === upcoming.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(upcoming.map((o) => o.id))
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (scope === 'SPECIFIC_OCCURRENCES' && selectedIds.length === 0) {
      setErrorMessage('Vui lòng chọn ít nhất một buổi cần đổi người chăm sóc.')
      return
    }
    if (!reasonDetail.trim()) {
      setErrorMessage('Vui lòng nhập lý do cụ thể để trung tâm sắp xếp nhân sự phù hợp.')
      return
    }

    setErrorMessage(null)
    mutation.mutate({
      scopeType: scope,
      occurrenceIds: scope === 'SPECIFIC_OCCURRENCES' ? selectedIds : undefined,
      reasonCode,
      reasonDetail: reasonDetail.trim()
    })
  }

  const isValid =
    (scope === 'ALL_REMAINING' || selectedIds.length > 0) &&
    reasonDetail.trim().length > 0 &&
    !mutation.isPending

  return (
    <Modal
      dismissOnBackdrop
      footer={
        <div className='flex items-center justify-between w-full'>
          <span className='text-xs text-on-surface-variant'>
            Yêu cầu sẽ được trung tâm xem xét và phản hồi trong thời gian sớm nhất.
          </span>
          <div className='flex gap-2.5'>
            <Button onClick={onClose} type='button' variant='secondary'>
              Quay lại
            </Button>
            <Button
              disabled={!isValid}
              loading={mutation.isPending}
              onClick={handleSubmit}
              type='submit'
              variant='primary'
            >
              Gửi yêu cầu đổi
            </Button>
          </div>
        </div>
      }
      onClose={onClose}
      open
      size='xl'
      title={`Yêu cầu đổi người chăm sóc #${booking.bookingCode}`}
    >
      <form className='flex flex-col gap-4 text-sm' onSubmit={handleSubmit}>
        {errorMessage && (
          <div className='rounded-xl border border-error/30 bg-error-container p-3 text-xs font-semibold text-on-error-container'>
            {errorMessage}
          </div>
        )}

        {/* 2-column layout */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {/* Left Column: Scope & Occurrences */}
          <div className='flex flex-col gap-3.5'>
            <span className='font-bold text-xs uppercase tracking-wider text-on-surface-variant'>
              1. Phạm vi áp dụng đổi người
            </span>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-2.5'>
              <button
                type='button'
                onClick={() => setScope('ALL_REMAINING')}
                className={`flex items-start gap-2.5 rounded-xl border p-3 text-left transition-all ${
                  scope === 'ALL_REMAINING'
                    ? 'border-primary bg-primary/5 ring-1.5 ring-primary'
                    : 'border-outline-variant/60 bg-surface-container-lowest hover:border-outline-variant'
                }`}
              >
                <div
                  className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border ${
                    scope === 'ALL_REMAINING' ? 'border-primary bg-primary text-white' : 'border-outline-variant'
                  }`}
                >
                  {scope === 'ALL_REMAINING' && <div className='h-1.5 w-1.5 rounded-full bg-white' />}
                </div>
                <div>
                  <span className='block font-semibold text-xs text-on-surface'>Tất cả buổi còn lại</span>
                  <span className='block text-[11px] text-on-surface-variant mt-0.5'>
                    Toàn bộ {upcoming.length} buổi sắp tới
                  </span>
                </div>
              </button>

              <button
                type='button'
                onClick={() => setScope('SPECIFIC_OCCURRENCES')}
                className={`flex items-start gap-2.5 rounded-xl border p-3 text-left transition-all ${
                  scope === 'SPECIFIC_OCCURRENCES'
                    ? 'border-primary bg-primary/5 ring-1.5 ring-primary'
                    : 'border-outline-variant/60 bg-surface-container-lowest hover:border-outline-variant'
                }`}
              >
                <div
                  className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border ${
                    scope === 'SPECIFIC_OCCURRENCES' ? 'border-primary bg-primary text-white' : 'border-outline-variant'
                  }`}
                >
                  {scope === 'SPECIFIC_OCCURRENCES' && <div className='h-1.5 w-1.5 rounded-full bg-white' />}
                </div>
                <div>
                  <span className='block font-semibold text-xs text-on-surface'>Chỉ một số buổi</span>
                  <span className='block text-[11px] text-on-surface-variant mt-0.5'>
                    {selectedIds.length > 0 ? `Đã chọn ${selectedIds.length} buổi` : 'Tùy chọn từng buổi'}
                  </span>
                </div>
              </button>
            </div>

            {/* Checklist if SPECIFIC_OCCURRENCES */}
            {scope === 'SPECIFIC_OCCURRENCES' && (
              <div className='rounded-xl border border-outline-variant/60 bg-surface-container-low/40 p-3'>
                <div className='mb-2 flex items-center justify-between text-xs'>
                  <span className='font-semibold text-on-surface'>Chọn các buổi muốn đổi:</span>
                  <button
                    type='button'
                    onClick={toggleAll}
                    className='font-semibold text-primary hover:underline'
                  >
                    {selectedIds.length === upcoming.length ? 'Bỏ chọn' : 'Chọn tất cả'}
                  </button>
                </div>
                <ul className='flex max-h-52 flex-col gap-1.5 overflow-y-auto pr-1 text-xs'>
                  {upcoming.map((occ) => {
                    const checked = selectedIds.includes(occ.id)
                    return (
                      <li key={occ.id}>
                        <label
                          className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-2.5 py-2 transition-colors ${
                            checked
                              ? 'border-primary/50 bg-surface-container-lowest shadow-2xs font-semibold'
                              : 'border-transparent bg-surface-container-lowest/70 hover:bg-surface-container-lowest'
                          }`}
                        >
                          <input
                            checked={checked}
                            className='accent-primary rounded'
                            onChange={(e) =>
                              setSelectedIds(
                                e.target.checked
                                  ? [...selectedIds, occ.id]
                                  : selectedIds.filter((id) => id !== occ.id)
                              )
                            }
                            type='checkbox'
                          />
                          <span className='truncate text-on-surface'>
                            Buổi #{occ.occurrenceNo} · {formatDateTime(occ.startAt, language)}
                          </span>
                        </label>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column: Reason Code & Detail */}
          <div className='flex flex-col gap-3.5'>
            <span className='font-bold text-xs uppercase tracking-wider text-on-surface-variant'>
              2. Lý do đổi người chăm sóc
            </span>

            {/* Reason Code Selectors */}
            <div className='grid grid-cols-1 gap-1.5'>
              {REASON_OPTIONS.map((item) => (
                <label
                  key={item.code}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2 text-xs transition-colors ${
                    reasonCode === item.code
                      ? 'border-primary bg-primary/5 text-primary font-semibold ring-1 ring-primary'
                      : 'border-outline-variant/50 bg-surface-container-lowest hover:bg-surface-container-low text-on-surface'
                  }`}
                >
                  <input
                    checked={reasonCode === item.code}
                    className='accent-primary'
                    name='reasonCode'
                    onChange={() => setReasonCode(item.code)}
                    type='radio'
                  />
                  <Icon className='text-sm text-primary' name={item.icon} />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>

            {/* Detail Reason Textarea */}
            <div>
              <label className='flex items-center gap-1 font-semibold text-xs text-on-surface' htmlFor='reasonDetail'>
                <span>Mô tả chi tiết</span>
                <span className='text-rose-600 font-bold'>*</span>
              </label>
              <textarea
                className='mt-1.5 w-full rounded-xl border border-outline-variant bg-surface-container-lowest p-3 text-xs text-on-surface focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 transition-all'
                id='reasonDetail'
                maxLength={500}
                onChange={(e) => setReasonDetail(e.target.value)}
                placeholder='Nhập thông tin cụ thể (ví dụ: Chuyên viên chưa quen thao tác đo huyết áp, gia đình muốn người có kinh nghiệm hơn...)'
                required
                rows={3}
                value={reasonDetail}
              />
            </div>
          </div>
        </div>
      </form>
    </Modal>
  )
}
