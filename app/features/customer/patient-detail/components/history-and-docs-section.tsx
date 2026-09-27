import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'

import type { AttachedDocItem, CareSessionHistoryItem } from '../types'

export interface HistoryAndDocsSectionProps {
  sessionHistory: CareSessionHistoryItem[]
  attachedDocs: AttachedDocItem[]
  activeTab: 'history' | 'docs'
  onTabChange: (tab: 'history' | 'docs') => void
}

export function HistoryAndDocsSection({
  sessionHistory,
  attachedDocs,
  activeTab,
  onTabChange
}: HistoryAndDocsSectionProps) {
  const { t } = useTranslation()

  return (
    <div className='flex flex-col gap-4 rounded-xl bg-surface-container-lowest p-6 shadow-sm'>
      {/* Sub-tabs Header */}
      <div className='flex flex-wrap items-center gap-4 border-b border-surface-container pb-2'>
        <button
          type='button'
          onClick={() => onTabChange('history')}
          className={`-mb-2 pb-2 text-sm transition-all ${
            activeTab === 'history'
              ? 'border-b-2 border-primary font-bold text-primary'
              : 'font-medium text-on-surface-variant hover:text-primary'
          }`}
        >
          {t('customer.patientDetail.historyAndDocs.tabHistory')}
        </button>
        <button
          type='button'
          onClick={() => onTabChange('docs')}
          className={`-mb-2 pb-2 text-sm transition-all ${
            activeTab === 'docs'
              ? 'border-b-2 border-primary font-bold text-primary'
              : 'font-medium text-on-surface-variant hover:text-primary'
          }`}
        >
          {t('customer.patientDetail.historyAndDocs.tabDocs')}
        </button>
      </div>

      {/* Tab 1: Session History */}
      {activeTab === 'history' && (
        <div className='flex flex-col gap-3'>
          {sessionHistory.map((sess) => (
            <div
              key={sess.id}
              className='flex flex-col justify-between gap-3 rounded-lg bg-surface-container-low p-3 md:flex-row md:items-center'
            >
              <div className='flex items-center gap-3'>
                <span className='flex h-10 w-10 items-center justify-center rounded-full bg-surface-container font-mono text-xs font-bold text-primary'>
                  {sess.date}
                </span>
                <div className='flex flex-col'>
                  <span className='text-xs font-semibold text-on-surface'>{sess.title}</span>
                  <span className='text-[11px] text-on-surface-variant'>
                    {sess.nurse} • {sess.objectiveAchieved}
                  </span>
                </div>
              </div>

              <div className='flex items-center gap-4'>
                <div className='text-left md:text-right'>
                  <span className='text-xs font-semibold text-primary'>{sess.vitals}</span>
                  <p className='text-[11px] text-on-surface-variant'>{sess.notes}</p>
                </div>
                <button
                  type='button'
                  className='rounded-lg bg-surface-container-high px-3 py-1.5 text-xs text-on-surface transition-colors hover:bg-surface-container'
                >
                  {t('customer.patientDetail.historyAndDocs.viewSessionReport')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Attached Docs */}
      {activeTab === 'docs' && (
        <div className='flex flex-col gap-3'>
          <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
            {attachedDocs.map((doc) => (
              <div key={doc.id} className='flex items-center justify-between rounded-lg bg-surface-container-low p-3'>
                <div className='flex items-center gap-3'>
                  <Icon name='picture_as_pdf' className='text-3xl text-error' />
                  <div className='flex flex-col'>
                    <span className='max-w-[200px] truncate text-xs font-semibold text-on-surface'>{doc.fileName}</span>
                    <span className='text-[11px] text-on-surface-variant'>
                      {doc.fileSize} • {doc.uploadDate}
                    </span>
                  </div>
                </div>
                <button
                  type='button'
                  title={t('customer.patientDetail.historyAndDocs.previewDoc')}
                  className='rounded-lg p-2 text-primary hover:bg-surface-container'
                >
                  <Icon name='visibility' className='text-lg' />
                </button>
              </div>
            ))}
          </div>

          <div className='mt-2 flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-outline-variant p-6 transition-colors hover:bg-surface-container-low'>
            <Icon name='cloud_upload' className='text-3xl text-primary' />
            <span className='text-xs font-medium text-on-surface'>
              {t('customer.patientDetail.historyAndDocs.uploadTitle')}
            </span>
            <span className='text-[11px] text-on-surface-variant'>
              {t('customer.patientDetail.historyAndDocs.uploadSubtitle')}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
