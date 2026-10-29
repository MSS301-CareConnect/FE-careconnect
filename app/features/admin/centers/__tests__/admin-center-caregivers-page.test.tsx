import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  fetchCaregiver,
  fetchCaregivers,
  fetchCenter,
  fetchCertificates,
  verifyCertificate
} from '~/entities/provider/provider-api'
import type { ProviderCaregiverRecord, ProviderCertificateRecord } from '~/shared/api/generated/contracts'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { AdminCenterCaregiversPage } from '../admin-center-caregivers-page'

vi.mock('~/entities/provider/provider-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/provider/provider-api')>()),
  fetchCenter: vi.fn(),
  fetchCaregivers: vi.fn(),
  fetchCaregiver: vi.fn(),
  fetchCertificates: vi.fn(),
  verifyCertificate: vi.fn()
}))

const caregiver: ProviderCaregiverRecord = {
  id: 'cg-1',
  centerId: 'ct-1',
  fullName: 'Lan Nguyen',
  caregiverStatus: 'ACTIVE',
  verificationStatus: 'VERIFIED',
  version: 2
}

function certificate(id: string, verificationStatus: ProviderCertificateRecord['verificationStatus']) {
  return {
    id,
    caregiverId: 'cg-1',
    certificateName: `Cert ${id}`,
    issuedBy: 'Red Cross',
    verificationStatus,
    version: 3
  }
}

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/admin/centers/ct-1/caregivers?caregiver=cg-1']}>
        <Routes>
          <Route element={<AdminCenterCaregiversPage />} path='/admin/centers/:id/caregivers' />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  vi.clearAllMocks()
  vi.mocked(fetchCenter).mockResolvedValue({ id: 'ct-1', name: 'Care One' } as never)
  vi.mocked(fetchCaregivers).mockResolvedValue({
    items: [caregiver],
    page: 0,
    size: 20,
    totalElements: 1,
    totalPages: 1
  })
  vi.mocked(fetchCaregiver).mockResolvedValue(caregiver)
  await setAppLanguage('en', false)
})

describe('Admin certificate review (two steps)', () => {
  it('approves only a certificate the center confirmed, sending approved instead of a status', async () => {
    vi.mocked(fetchCertificates).mockResolvedValue([certificate('a', 'PENDING'), certificate('b', 'CENTER_VERIFIED')])
    vi.mocked(verifyCertificate).mockResolvedValue(certificate('b', 'ADMIN_VERIFIED'))
    renderPage()

    expect(await screen.findByText('Waiting for the center to confirm first')).toBeInTheDocument()
    expect(screen.getByText('Confirmed by center')).toBeInTheDocument()
    const approve = screen.getAllByRole('button', { name: 'Approve' })
    // Caregiver approve button + one per certificate: the PENDING certificate stays disabled.
    const enabled = approve.filter((button) => !(button as HTMLButtonElement).disabled)
    fireEvent.click(enabled.at(-1)!)
    await waitFor(() =>
      expect(verifyCertificate).toHaveBeenCalledWith('b', { approved: true, reason: undefined, version: 3 })
    )
    expect(verifyCertificate).not.toHaveBeenCalledWith('a', expect.anything())
  })
})
