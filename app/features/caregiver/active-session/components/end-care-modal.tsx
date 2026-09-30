import { useTranslation } from 'react-i18next'

const ICON_CHECK_CIRCLE = 'check_circle'
const ICON_CLOSE = 'close'
const ICON_PIN_DROP = 'pin_drop'
const ICON_FACT_CHECK = 'fact_check'
const ICON_CHECK = 'check'
const ICON_INFO = 'info'
const ICON_BACK = 'arrow_back'
const ICON_ASSIGNMENT = 'assignment_turned_in'

interface EndCareModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  code?: string
}

export function EndCareModal({ isOpen, onClose, onConfirm, code = 'CC-BK-882194' }: EndCareModalProps) {
  const { t } = useTranslation()

  if (!isOpen) return null

  const handleConfirmClick = () => {
    onClose()
    onConfirm()
  }

  const checklistItems = [
    {
      title: t('caregiver.activeSession.endCareModal.item1Title'),
      tag: t('caregiver.activeSession.endCareModal.item1Tag'),
      desc: t('caregiver.activeSession.endCareModal.item1Desc')
    },
    {
      title: t('caregiver.activeSession.endCareModal.item2Title'),
      tag: t('caregiver.activeSession.endCareModal.item2Tag'),
      desc: t('caregiver.activeSession.endCareModal.item2Desc')
    },
    {
      title: t('caregiver.activeSession.endCareModal.item3Title'),
      tag: t('caregiver.activeSession.endCareModal.item3Tag'),
      desc: t('caregiver.activeSession.endCareModal.item3Desc')
    },
    {
      title: t('caregiver.activeSession.endCareModal.item4Title'),
      tag: t('caregiver.activeSession.endCareModal.item4Tag'),
      desc: t('caregiver.activeSession.endCareModal.item4Desc')
    },
    {
      title: t('caregiver.activeSession.endCareModal.item5Title'),
      tag: t('caregiver.activeSession.endCareModal.item5Tag'),
      desc: t('caregiver.activeSession.endCareModal.item5Desc')
    }
  ]

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/60 backdrop-blur-sm'
      id='careModalBackdrop'
    >
      <div
        className='relative flex flex-col w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-xl bg-surface-container-lowest shadow-2xl transition-all'
        id='careEndModal'
      >
        {/* 1. Modal Header */}
        <div className='flex items-start justify-between gap-4 p-5 bg-surface-container-low sm:p-6'>
          <div className='flex items-start gap-4'>
            <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary-container'>
              <span
                className='material-symbols-outlined text-[28px] text-on-secondary-container'
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {ICON_CHECK_CIRCLE}
              </span>
            </div>
            <div>
              <div className='mb-1 flex items-center gap-2'>
                <span className='rounded bg-primary px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-on-primary'>
                  {t('caregiver.activeSession.endCareModal.badgeCompleted')}
                </span>
                <span className='text-xs text-on-surface-variant'>
                  {t('caregiver.activeSession.endCareModal.codeLabel', { code })}
                </span>
              </div>
              <h2 className='text-lg font-bold text-on-surface sm:text-xl'>
                {t('caregiver.activeSession.endCareModal.title')}
              </h2>
              <p className='text-xs text-on-surface-variant sm:text-sm'>
                {t('caregiver.activeSession.endCareModal.subtitle')}
              </p>
            </div>
          </div>
          <button
            aria-label={t('caregiver.activeSession.endCareModal.closeAria')}
            className='flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface'
            id='modalCloseBtn'
            onClick={onClose}
            type='button'
          >
            <span className='material-symbols-outlined text-[20px]'>{ICON_CLOSE}</span>
          </button>
        </div>

        {/* 2. Modal Scrollable Body */}
        <div className='space-y-6 overflow-y-auto p-5 sm:p-6'>
          {/* Status Badge & Time Overview Section */}
          <div className='rounded-xl bg-surface-container-low p-4'>
            <div className='mb-3 flex items-center justify-between'>
              <span className='text-xs font-semibold uppercase tracking-wider text-on-surface-variant'>
                {t('caregiver.activeSession.endCareModal.statsTitle')}
              </span>
              <span className='inline-flex items-center gap-1.5 rounded-full bg-secondary-container px-3 py-1 text-xs font-bold text-on-secondary-container'>
                <span className='h-2 w-2 rounded-full bg-primary' />
                <span>{t('caregiver.activeSession.endCareModal.planCompletedBadge')}</span>
              </span>
            </div>

            <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
              <div className='rounded-lg bg-surface-container-lowest p-3'>
                <span className='block text-xs text-on-surface-variant'>
                  {t('caregiver.activeSession.endCareModal.scheduleLabel')}
                </span>
                <span className='font-mono text-sm font-semibold text-on-surface'>
                  {t('caregiver.activeSession.endCareModal.scheduleVal')}
                </span>
                <span className='block text-xs text-outline'>
                  {t('caregiver.activeSession.endCareModal.scheduleSub')}
                </span>
              </div>

              <div className='rounded-lg bg-surface-container-lowest p-3'>
                <span className='block text-xs text-on-surface-variant'>
                  {t('caregiver.activeSession.endCareModal.checkInOutLabel')}
                </span>
                <span className='font-mono text-sm font-semibold text-on-surface'>
                  {t('caregiver.activeSession.endCareModal.checkInOutVal')}
                </span>
                <span className='flex items-center gap-1 text-xs text-primary'>
                  <span className='material-symbols-outlined text-[14px]'>{ICON_PIN_DROP}</span>
                  <span>{t('caregiver.activeSession.endCareModal.gpsVerifiedSub')}</span>
                </span>
              </div>

              <div className='rounded-lg bg-surface-container-lowest p-3'>
                <span className='block text-xs text-on-surface-variant'>
                  {t('caregiver.activeSession.endCareModal.totalDurationLabel')}
                </span>
                <span className='text-sm font-bold text-primary'>
                  {t('caregiver.activeSession.endCareModal.totalDurationVal')}
                </span>
                <span className='block text-xs text-outline'>
                  {t('caregiver.activeSession.endCareModal.totalDurationSub')}
                </span>
              </div>
            </div>
          </div>

          {/* Checklist Bàn giao & Nghiệp vụ Hoàn Thành */}
          <div>
            <div className='mb-2 flex items-center justify-between'>
              <h3 className='flex items-center gap-2 text-sm font-bold text-on-surface sm:text-base'>
                <span className='material-symbols-outlined text-[20px] text-primary'>{ICON_FACT_CHECK}</span>
                <span>{t('caregiver.activeSession.endCareModal.checklistTitle')}</span>
              </h3>
              <span className='text-xs font-semibold text-primary'>
                {t('caregiver.activeSession.endCareModal.checklistCount')}
              </span>
            </div>

            <div className='space-y-2'>
              {checklistItems.map((item, idx) => (
                <div
                  className='flex items-start gap-3 rounded-lg bg-surface-container-low p-3 transition-colors hover:bg-surface-container'
                  key={idx}
                >
                  <div className='mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary-container'>
                    <span className='material-symbols-outlined text-[16px] font-bold text-on-secondary-container'>
                      {ICON_CHECK}
                    </span>
                  </div>
                  <div className='flex-1'>
                    <div className='flex items-center justify-between gap-2'>
                      <span className='text-xs font-semibold text-on-surface sm:text-sm'>{item.title}</span>
                      <span className='rounded bg-surface-container px-2 py-0.5 text-xs font-medium text-primary'>
                        {item.tag}
                      </span>
                    </div>
                    <p className='mt-0.5 text-xs text-on-surface-variant'>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Thông báo điều hướng & Pháp lý y tế */}
          <div className='flex items-start gap-3 rounded-xl bg-surface-container-high p-4 text-on-surface'>
            <span className='material-symbols-outlined mt-0.5 shrink-0 text-[22px] text-primary'>{ICON_INFO}</span>
            <div className='text-xs leading-relaxed sm:text-sm'>
              <span className='mb-1 block font-bold text-on-surface'>
                {t('caregiver.activeSession.endCareModal.dispatchNoticeTitle')}
              </span>
              <span>{t('caregiver.activeSession.endCareModal.dispatchNoticeDesc')}</span>
            </div>
          </div>
        </div>

        {/* 3. Modal Action Footer */}
        <div className='flex flex-col-reverse items-center justify-between gap-3 border-t border-outline-variant/15 bg-surface-container-low p-4 sm:flex-row sm:p-5'>
          <button
            className='flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-xs font-semibold text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface sm:w-auto sm:text-sm'
            id='backToCheckBtn'
            onClick={onClose}
            type='button'
          >
            <span className='material-symbols-outlined text-[18px]'>{ICON_BACK}</span>
            <span>{t('caregiver.activeSession.endCareModal.backBtn')}</span>
          </button>

          <button
            className='flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-xs font-bold text-on-primary shadow-md transition-all hover:bg-primary-container disabled:opacity-75 sm:w-auto sm:text-sm'
            id='confirmEndShiftBtn'
            onClick={handleConfirmClick}
            type='button'
          >
            <span>{t('caregiver.activeSession.endCareModal.confirmBtn')}</span>
            <span className='material-symbols-outlined text-[20px]'>{ICON_ASSIGNMENT}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
