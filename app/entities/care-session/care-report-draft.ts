import type { CareRecordPreview } from './care-record-preview'

export interface ReportTaskDraft {
  id: string
  title: string
  detail: string
  done: boolean
  time: string
}
export interface CareReportDraft {
  record: CareRecordPreview
  tasks: ReportTaskDraft[]
  notes: string
  advice: string
  condition: 'stable' | 'monitor' | 'concern'
  vitals: { pressure: string; pulse: number; oxygen: number; temperature: number; glucose: number | null } | null
  files: File[]
}

// Preview drafts stay in memory only; no patient information is written to browser storage.
const drafts = new Map<string, CareReportDraft>()
export function readCareReportDraft(code: string) {
  return drafts.get(code)
}
export function saveCareReportDraft(code: string, draft: CareReportDraft) {
  drafts.set(code, {
    ...draft,
    record: { ...draft.record },
    tasks: draft.tasks.map((task) => ({ ...task })),
    vitals: draft.vitals ? { ...draft.vitals } : null,
    files: [...draft.files]
  })
}
