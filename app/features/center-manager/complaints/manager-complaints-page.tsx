import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'

import { ComplaintQueue } from '~/entities/aftercare/complaint-queue'
import { FeedbackList } from '~/entities/aftercare/feedback-list'
import { useAuthUser } from '~/features/shared/auth/auth-user-context'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Tabs, tabId, tabPanelId } from '~/shared/ui/tabs'

import { BentoPageHeader, bentoContainer } from '~/shared/ui/bento-page-header'

const TABS = ['reviews', 'complaints'] as const
type Tab = (typeof TABS)[number]

/** "Reviews and feedback": the center's customer reviews (answered here) and its complaint queue, in `?tab=`. */
export function ManagerComplaintsPage() {
  const { t } = useTranslation()
  const centerId = useAuthUser()?.centerId ?? undefined
  const [params, setParams] = useSearchParams()
  const tab: Tab = TABS.find((item) => item === params.get('tab')) ?? 'reviews'
  const title = t(tab === 'reviews' ? 'aftercare.reviews.title' : 'aftercare.queue.managerTitle')
  useDocumentTitle(title)
  return (
    <div className={bentoContainer}>
      <BentoPageHeader icon='reviews' title={t('centerManager.feedback')} variant='hero' />
      <Tabs
        idBase='manager-feedback'
        items={TABS.map((value) => ({ value, label: t(`aftercare.feedbackPage.${value}`) }))}
        label={t('aftercare.feedbackPage.tabs')}
        onChange={(value) => setParams({ tab: value }, { replace: true })}
        value={tab}
      />
      <div aria-labelledby={tabId('manager-feedback', tab)} id={tabPanelId('manager-feedback')} role='tabpanel'>
        {tab === 'reviews' ? (
          centerId ? (
            <FeedbackList canReply caregiverHref={(id) => `/center-manager/caregivers/${id}`} centerId={centerId} />
          ) : null
        ) : (
          <ComplaintQueue role='CENTER_MANAGER' />
        )}
      </div>
    </div>
  )
}
