import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const ICON_WARNING = 'report_problem'
const ICON_SEND = 'send'
const ICON_CLOSE = 'close'

interface ReportIncidentModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (reason: string) => void
}

export function ReportIncidentModal({ isOpen, onClose, onSubmit }: ReportIncidentModalProps) {
  const { t } = useTranslation()
  const [reason, setReason] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (reason.trim()) {
      onSubmit(reason)
      alert(t('caregiver.shiftDetail.incidentModal.success'))
      setReason('')
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs'>
      <div className='w-full max-w-lg rounded-2xl bg-surface-container-lowest p-6 shadow-2xl'>
        {/* Modal Header */}
        <div className='flex items-center justify-between pb-3 border-b border-outline-variant/20'>
          <div className='flex items-center gap-2'>
            <span className='material-symbols-outlined text-[24px] text-error'>{ICON_WARNING}</span>
            <h3 className='text-lg font-bold text-on-surface'>{t('caregiver.shiftDetail.incidentModal.title')}</h3>
          </div>
          <button
            className='rounded-lg p-1 text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            onClick={onClose}
            type='button'
          >
            <span className='material-symbols-outlined text-[20px]'>{ICON_CLOSE}</span>
          </button>
        </div>

        {/* Modal Body */}
        <form className='mt-4 space-y-4' onSubmit={handleSubmit}>
          <p className='text-xs leading-relaxed text-on-surface-variant sm:text-sm'>
            {t('caregiver.shiftDetail.incidentModal.desc')}
          </p>

          <div>
            <textarea
              className='w-full rounded-xl border border-outline-variant bg-surface-container-low p-3.5 text-sm text-on-surface outline-hidden focus:border-primary focus:ring-1 focus:ring-primary'
              onChange={(e) => setReason(e.target.value)}
              placeholder={t('caregiver.shiftDetail.incidentModal.placeholder')}
              required
              rows={4}
              value={reason}
            />
          </div>

          <div className='flex flex-wrap items-center justify-end gap-2 pt-2'>
            <button
              className='cursor-pointer rounded-lg bg-surface-container px-4 py-2.5 text-xs font-semibold text-on-surface transition-colors hover:bg-surface-container-high sm:text-sm'
              onClick={onClose}
              type='button'
            >
              {t('caregiver.shiftDetail.incidentModal.cancel')}
            </button>
            <button
              className='inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-error px-4 py-2.5 text-xs font-bold text-on-error shadow-xs transition-colors hover:bg-error/90 sm:text-sm'
              type='submit'
            >
              <span className='material-symbols-outlined text-[18px]'>{ICON_SEND}</span>
              {t('caregiver.shiftDetail.incidentModal.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
