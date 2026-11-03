import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Tabs, tabPanelId } from '~/shared/ui/tabs'

import { useMyCaregiverProfile, useToday } from '../data/caregiver-queries'
import { CaregiverError, CaregiverPageHeader, cgContainer } from '../ui/caregiver-page'
import { MyCalendar } from './calendar/my-calendar'
import { ShiftSignup } from './shifts/shift-signup'
import { TimeOffPanel } from './time-off/time-off-panel'

export type WorkTab = 'calendar' | 'shifts' | 'timeOff'

const TAB_PATHS: Record<WorkTab, string> = {
  calendar: '/caregiver/schedule',
  shifts: '/caregiver/work-shifts',
  timeOff: '/caregiver/time-off'
}

/**
 * "Lịch làm việc": availability, shift sign-up and time off as tabs of one page. Each tab keeps its own route
 * (/caregiver/schedule, /caregiver/work-shifts, /caregiver/time-off) so old links still open the right tab.
 */
export function CaregiverWorkPage({ tab }: { tab: WorkTab }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const today = useToday()
  const profile = useMyCaregiverProfile()
  useDocumentTitle(t('caregiver.work.documentTitle'))

  return (
    <div className={cgContainer}>
      <CaregiverPageHeader description={t('caregiver.work.subtitle')} title={t('caregiver.work.title')} />
      <Tabs
        className='mb-5'
        idBase='caregiver-work'
        items={(Object.keys(TAB_PATHS) as WorkTab[]).map((value) => ({
          value,
          label: t(`caregiver.work.tabs.${value}`)
        }))}
        label={t('caregiver.work.tabsLabel')}
        onChange={(value) => void navigate(TAB_PATHS[value], { replace: true })}
        value={tab}
      />
      <div
        aria-labelledby={`caregiver-work-tab-${tab}`}
        className='cg-page-in'
        id={tabPanelId('caregiver-work')}
        key={tab}
        role='tabpanel'
      >
        {profile.isError ? (
          <CaregiverError
            message={t('caregiver.provider.profileError')}
            onRetry={() => void profile.refetch()}
            retryLabel={t('caregiver.ui.actions.retry')}
          />
        ) : null}
        {tab === 'calendar' ? <MyCalendar profileId={profile.data?.id} today={today} /> : null}
        {tab === 'shifts' ? (
          <ShiftSignup centerId={profile.data?.centerId} centerName={profile.data?.centerName} />
        ) : null}
        {tab === 'timeOff' ? <TimeOffPanel caregiverId={profile.data?.id} today={today} /> : null}
      </div>
    </div>
  )
}
