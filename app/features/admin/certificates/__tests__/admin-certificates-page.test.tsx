import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  fetchCenters,
  fetchPendingCertificates,
  fetchPendingCertificateStatistics,
  fetchProviderMedia,
  startCertificateAiCheck,
  verifyCertificate
} from '~/entities/provider/provider-api'
import type { ProviderCertificateRecord } from '~/shared/api/generated/contracts'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { AdminCertificatesPage } from '../admin-certificates-page'

vi.mock('~/entities/provider/provider-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/provider/provider-api')>()),
  fetchCenters: vi.fn(),
  fetchPendingCertificates: vi.fn(),
  fetchPendingCertificateStatistics: vi.fn(),
  fetchProviderMedia: vi.fn(),
  startCertificateAiCheck: vi.fn(),
  verifyCertificate: vi.fn()
}))

const highRisk: ProviderCertificateRecord = {
  id: 'c1',
  caregiverId: 'g1',
  caregiverName: 'Nguyễn Văn An',
  centerId: 'center-1',
  centerName: 'Trung tâm An Bình',
  certificateName: 'Điều dưỡng cơ bản',
  issuedBy: 'Bệnh viện Bạch Mai',
  credentialNumber: '12/QĐ-BV',
  expiryDate: '2030-01-15',
  verificationStatus: 'CENTER_VERIFIED',
  centerVerifiedAt: '2026-11-09T02:00:00Z',
  aiCheckStatus: 'COMPLETED',
  aiRiskLevel: 'HIGH',
  aiCheckedAt: '2026-11-09T02:01:00Z',
  aiWarnings: [
    { code: 'MISMATCH', field: 'HOLDER_NAME', declaredValue: 'Nguyễn Văn An', extractedValue: 'Trần Thị Bình' }
  ],
  aiExtracted: { holderName: 'Trần Thị Bình', credentialNumber: '12/QĐ-BV', expiryDate: '2030-01-15' },
  version: 2
}
const checking: ProviderCertificateRecord = {
  ...highRisk,
  id: 'c2',
  certificateName: 'Sơ cứu',
  aiCheckStatus: 'QUEUED',
  aiRiskLevel: undefined,
  aiWarnings: undefined,
  aiExtracted: undefined
}
const page = (items: ProviderCertificateRecord[]) => ({
  items,
  page: 0,
  size: 20,
  totalElements: items.length,
  totalPages: 1
})

function renderPage(path = '/admin/certificates') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <AdminCertificatesPage />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  vi.clearAllMocks()
  await setAppLanguage('vi', false)
  vi.mocked(fetchPendingCertificates).mockResolvedValue(page([highRisk, checking]))
  vi.mocked(fetchPendingCertificateStatistics).mockResolvedValue({
    total: 2,
    high: 1,
    medium: 0,
    low: 0,
    undetermined: 0,
    checking: 1,
    failed: 0
  })
  vi.mocked(fetchCenters).mockResolvedValue({ items: [], page: 0, size: 100, totalElements: 0, totalPages: 0 } as never)
  vi.mocked(fetchProviderMedia).mockResolvedValue([])
})

describe('AdminCertificatesPage', () => {
  it('lists confirmed certificates with their AI result and filters from a count card', async () => {
    renderPage()

    const row = (await screen.findByText('Điều dưỡng cơ bản')).closest('tr')!
    expect(within(row).getByText('Rủi ro cao')).toBeInTheDocument()
    expect(within(row).getByText('1 cảnh báo')).toBeInTheDocument()
    expect(screen.getByText('Sơ cứu').closest('tr')!).toHaveTextContent('Chờ AI kiểm tra')

    fireEvent.click(screen.getByRole('button', { name: /Rủi ro cao/ }))
    await waitFor(() =>
      expect(fetchPendingCertificates).toHaveBeenLastCalledWith(expect.objectContaining({ riskLevel: 'HIGH', page: 0 }))
    )
  })

  it('compares the declaration with the AI reading and needs a reason to approve a high-risk certificate', async () => {
    vi.mocked(verifyCertificate).mockResolvedValue({ ...highRisk, verificationStatus: 'ADMIN_VERIFIED' })
    renderPage('/admin/certificates?certificate=c1')

    const dialog = await screen.findByRole('dialog')
    const holderRow = within(dialog).getByRole('rowheader', { name: 'Họ tên người được cấp' }).closest('tr')!
    expect(holderRow).toHaveTextContent('Nguyễn Văn An')
    expect(holderRow).toHaveTextContent('Trần Thị Bình')
    expect(holderRow).toHaveTextContent('Không khớp')
    expect(within(dialog).getByText('Họ tên người được cấp: thông tin khai báo khác với trên ảnh.')).toBeInTheDocument()

    fireEvent.click(within(dialog).getByRole('button', { name: 'Duyệt chứng chỉ' }))
    expect(
      await within(dialog).findByText('Kết quả AI chưa ở mức thấp hoặc trung bình — nhập lý do để duyệt.')
    ).toBeInTheDocument()
    expect(verifyCertificate).not.toHaveBeenCalled()

    fireEvent.change(within(dialog).getByLabelText('Lý do / ghi chú'), { target: { value: 'Đã gọi trung tâm cấp' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Duyệt chứng chỉ' }))
    await waitFor(() =>
      expect(verifyCertificate).toHaveBeenCalledWith('c1', {
        approved: true,
        reason: 'Đã gọi trung tâm cấp',
        version: 2
      })
    )
  })

  it('runs the AI check again from the dialog', async () => {
    vi.mocked(startCertificateAiCheck).mockResolvedValue({ ...highRisk, aiCheckStatus: 'QUEUED' })
    renderPage('/admin/certificates?certificate=c1')

    fireEvent.click(await screen.findByRole('button', { name: 'Chạy lại AI' }))

    await waitFor(() => expect(startCertificateAiCheck).toHaveBeenCalledWith('c1'))
  })
})
