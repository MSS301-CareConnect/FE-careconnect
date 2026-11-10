import { useQuery } from '@tanstack/react-query'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'

import { isAiChecking, RISK_LEVELS } from '~/entities/provider/certificate-ai'
import { CertificateAiBadge } from '~/entities/provider/certificate-ai-badge'
import { CertificateReviewDialog } from '~/entities/provider/certificate-review-dialog'
import {
  fetchCenters,
  fetchPendingCertificates,
  fetchPendingCertificateStatistics,
  providerKeys
} from '~/entities/provider/provider-api'
import { apiRequestErrorKey } from '~/shared/api/error-details'
import type { CertificateAiCheckStatus } from '~/shared/api/generated/contracts'
import { useFormat } from '~/shared/lib/format'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Button } from '~/shared/ui/button'
import { Select } from '~/shared/ui/form-field'
import { Pagination } from '~/shared/ui/pagination'
import { Skeleton } from '~/shared/ui/skeleton'
import { EmptyState, ErrorState } from '~/shared/ui/state-panels'
import { BentoPageHeader, bentoContainer } from '~/shared/ui/bento-page-header'

import { CertificateStatCards, type StatFilter } from './components/certificate-stat-cards'

const AI_FILTERS: CertificateAiCheckStatus[] = ['QUEUED', 'PROCESSING', 'FAILED']
// While any listed certificate waits for the AI, refresh so its result shows up on its own.
const AI_POLL_MS = 10_000

/**
 * Step 5 of the certificate review (2026-11-09): certificates the center confirmed, with the AI risk and warnings,
 * high risk first. Filters (risk, AI state, center, page) live in URL search parameters; `?certificate=<id>` opens
 * the review dialog.
 */
export function AdminCertificatesPage() {
  const { t } = useTranslation()
  const { dateTime } = useFormat()
  const id = useId()
  useDocumentTitle(t('admin.certificatesPage.title'))
  const [params, setParams] = useSearchParams()
  const riskLevel = RISK_LEVELS.find((item) => item === params.get('risk'))
  const aiCheckStatus = AI_FILTERS.find((item) => item === params.get('ai'))
  const centerId = params.get('center') || undefined
  const page = Math.max(0, Number(params.get('page')) || 0)
  const selectedId = params.get('certificate')
  const filters = { centerId, riskLevel, aiCheckStatus, page }

  const certificates = useQuery({
    queryKey: providerKeys.pendingCertificates(filters),
    queryFn: () => fetchPendingCertificates(filters),
    retry: false,
    refetchInterval: (query) => (query.state.data?.items.some(isAiChecking) ? AI_POLL_MS : false)
  })
  const statistics = useQuery({
    queryKey: providerKeys.pendingCertificateStatistics(centerId),
    queryFn: () => fetchPendingCertificateStatistics(centerId),
    retry: false,
    refetchInterval: (query) => ((query.state.data?.checking ?? 0) > 0 ? AI_POLL_MS : false)
  })
  const centers = useQuery({
    queryKey: [...providerKeys.centers, 'certificate-filter'],
    queryFn: () => fetchCenters({ page: 0, size: 100 }),
    retry: false
  })
  const items = certificates.data?.items ?? []
  const selected = items.find((item) => item.id === selectedId)
  const filtered = Boolean(riskLevel || aiCheckStatus || centerId)
  const activeStat: StatFilter =
    riskLevel ?? (aiCheckStatus === 'FAILED' ? 'failed' : aiCheckStatus ? 'checking' : 'total')

  function update(changes: Record<string, string | undefined>) {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        for (const [name, value] of Object.entries(changes)) {
          if (value) next.set(name, value)
          else next.delete(name)
        }
        return next
      },
      { replace: true }
    )
  }

  function selectStat(stat: StatFilter) {
    if (stat === 'total') return update({ risk: undefined, ai: undefined, page: undefined })
    if (stat === 'checking') return update({ risk: undefined, ai: 'QUEUED', page: undefined })
    if (stat === 'failed') return update({ risk: undefined, ai: 'FAILED', page: undefined })
    update({ risk: stat, ai: undefined, page: undefined })
  }

  return (
    <div className={`${bentoContainer} space-y-6`}>
      <BentoPageHeader
        description={t('admin.certificatesPage.description')}
        meta={t('admin.certificatesPage.steps')}
        title={t('admin.certificatesPage.title')}
      />

      <CertificateStatCards active={activeStat} onSelect={selectStat} statistics={statistics.data} />

      <fieldset className='flex flex-wrap items-end gap-3 rounded-2xl border border-forest-900/[0.06] bg-surface-container-lowest p-5 shadow-xs'>
        <legend className='sr-only'>{t('admin.certificatesPage.filters')}</legend>
        <label className='text-sm font-semibold text-on-surface' htmlFor={`${id}-center`}>
          {t('admin.certificatesPage.center')}
          <Select
            className='mt-1 w-auto min-w-56'
            id={`${id}-center`}
            onChange={(event) => update({ center: event.target.value || undefined, page: undefined })}
            value={centerId ?? ''}
          >
            <option value=''>{t('admin.certificatesPage.allCenters')}</option>
            {(centers.data?.items ?? []).map((center) => (
              <option key={center.id} value={center.id}>
                {center.centerName}
              </option>
            ))}
          </Select>
        </label>
        <label className='text-sm font-semibold text-on-surface' htmlFor={`${id}-risk`}>
          {t('admin.certificatesPage.columns.ai')}
          <Select
            className='mt-1 w-auto'
            id={`${id}-risk`}
            onChange={(event) => update({ risk: event.target.value || undefined, ai: undefined, page: undefined })}
            value={riskLevel ?? ''}
          >
            <option value=''>{t('admin.certificatesPage.allRisks')}</option>
            {RISK_LEVELS.map((level) => (
              <option key={level} value={level}>
                {t(`certificateReview.riskLevels.${level}`)}
              </option>
            ))}
          </Select>
        </label>
        {filtered ? (
          <Button
            onClick={() => update({ risk: undefined, ai: undefined, center: undefined, page: undefined })}
            size='sm'
            variant='ghost'
          >
            {t('admin.certificatesPage.clear')}
          </Button>
        ) : null}
      </fieldset>

      {certificates.isPending ? (
        <div aria-label={t('admin.certificatesPage.loading')} className='space-y-3' role='status'>
          <Skeleton className='h-16 w-full rounded-2xl' />
          <Skeleton className='h-16 w-full rounded-2xl' />
        </div>
      ) : null}
      {certificates.isError ? (
        <ErrorState
          message={t(apiRequestErrorKey(certificates.error, 'admin.certificatesPage.error'))}
          onRetry={() => void certificates.refetch()}
        />
      ) : null}
      {certificates.data && items.length === 0 ? (
        <EmptyState
          icon='workspace_premium'
          title={t(filtered ? 'admin.certificatesPage.emptyFiltered' : 'admin.certificatesPage.empty')}
        />
      ) : null}
      {items.length > 0 ? (
        <div className='overflow-x-auto rounded-2xl border border-outline-variant/60 bg-surface-container-lowest shadow-xs'>
          <table className='w-full min-w-[860px] text-left text-sm'>
            <thead className='bg-surface-container-low text-xs text-on-surface-variant'>
              <tr>
                <th className='px-4 py-3 font-semibold' scope='col'>
                  {t('admin.certificatesPage.columns.caregiver')}
                </th>
                <th className='px-4 py-3 font-semibold' scope='col'>
                  {t('admin.certificatesPage.columns.certificate')}
                </th>
                <th className='px-4 py-3 font-semibold' scope='col'>
                  {t('admin.certificatesPage.columns.confirmedAt')}
                </th>
                <th className='px-4 py-3 font-semibold' scope='col'>
                  {t('admin.certificatesPage.columns.ai')}
                </th>
                <th className='px-4 py-3 font-semibold' scope='col'>
                  {t('admin.certificatesPage.columns.warnings')}
                </th>
                <th className='px-4 py-3' scope='col'>
                  <span className='sr-only'>{t('admin.certificatesPage.open')}</span>
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-outline-variant/60'>
              {items.map((certificate) => {
                const warningCount = certificate.aiWarnings?.length ?? 0
                return (
                  <tr key={certificate.id}>
                    <td className='px-4 py-3'>
                      <p className='font-semibold text-on-surface'>{certificate.caregiverName ?? '—'}</p>
                      <p className='text-xs text-on-surface-variant'>{certificate.centerName ?? '—'}</p>
                    </td>
                    <td className='px-4 py-3'>
                      <p className='font-medium text-on-surface'>{certificate.certificateName}</p>
                      <p className='text-xs text-on-surface-variant'>{certificate.issuedBy}</p>
                    </td>
                    <td className='px-4 py-3 text-on-surface-variant'>
                      {certificate.centerVerifiedAt ? (
                        <time dateTime={certificate.centerVerifiedAt}>{dateTime(certificate.centerVerifiedAt)}</time>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className='px-4 py-3'>
                      <CertificateAiBadge certificate={certificate} />
                    </td>
                    <td className='px-4 py-3 text-on-surface-variant'>
                      {certificate.aiCheckStatus === 'COMPLETED'
                        ? warningCount > 0
                          ? t('admin.certificatesPage.warningCount', { count: warningCount })
                          : t('admin.certificatesPage.noWarning')
                        : '—'}
                    </td>
                    <td className='px-4 py-3 text-right'>
                      <Button onClick={() => update({ certificate: certificate.id })} size='sm' variant='outline'>
                        {t('admin.certificatesPage.open')}
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : null}
      {certificates.data && certificates.data.totalPages > 1 ? (
        <Pagination
          ariaLabel={t('admin.certificatesPage.pagination')}
          onPageChange={(next) => update({ page: next > 0 ? String(next) : undefined })}
          page={page}
          totalPages={certificates.data.totalPages}
        />
      ) : null}

      {selected ? (
        <CertificateReviewDialog certificate={selected} onClose={() => update({ certificate: undefined })} />
      ) : null}
    </div>
  )
}
