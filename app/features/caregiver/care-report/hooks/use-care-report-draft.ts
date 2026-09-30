import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  type CareReportDraft,
  readCareReportDraft,
  saveCareReportDraft
} from '~/entities/care-session/care-report-draft'
import type { CareRecordPreview } from '~/entities/care-session/care-record-preview'

export function useCareReportDraft(record: CareRecordPreview) {
  const { t } = useTranslation()
  const [draft, setDraft] = useState<CareReportDraft>(
    () =>
      readCareReportDraft(record.code) ?? {
        record,
        notes: record.code === 'BK-8821' ? t('caregiver.careReport.defaultNotes') : '',
        advice: record.code === 'BK-8821' ? t('caregiver.careReport.defaultAdvice') : '',
        condition: 'stable',
        files: [],
        vitals:
          record.code === 'BK-8821'
            ? { pressure: '125/80', pulse: 74, oxygen: 98, temperature: 36.6, glucose: 6.2 }
            : null,
        tasks:
          record.code === 'BK-8821'
            ? (['vitals', 'meal', 'medicine', 'hygiene', 'mobility'] as const).map((key, index) => ({
                id: key,
                title: t(`caregiver.careReport.taskCopy.${key}.title`),
                detail: t(`caregiver.careReport.taskCopy.${key}.detail`),
                done: true,
                time: ['08:45', '08:50', '09:15', '09:45', '10:30'][index]
              }))
            : []
      }
  )
  const [saved, setSaved] = useState(false)
  function update(next: Partial<CareReportDraft>) {
    setDraft((current) => ({ ...current, ...next }))
    setSaved(false)
  }
  function save() {
    saveCareReportDraft(record.code, draft)
    setSaved(true)
  }
  return { draft, update, save, saved }
}
export type ReportEditor = ReturnType<typeof useCareReportDraft>
