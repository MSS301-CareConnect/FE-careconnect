import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  fetchCaregiver,
  fetchCaregiverServices,
  fetchCertificates,
  fetchProviderMedia,
  verifyCertificate
} from '~/entities/provider/provider-api'
import type { ProviderCaregiverRecord, ProviderCertificateRecord } from '~/shared/api/generated/contracts'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { AdminCaregiverProfilePage } from './admin-caregiver-profile-page'

vi.mock('~/entities/provider/provider-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/provider/provider-api')>()),
  fetchCaregiver: vi.fn(),
  fetchCaregiverServices: vi.fn(),
  fetchCertificates: vi.fn(),
  fetchProviderMedia: vi.fn(),
  verifyCertificate: vi.fn()
}))

const caregiver: ProviderCaregiverRecord = {
  id: 'cg-1',
  centerId: 'ct-1',
  centerName: 'Care One',
  fullName: 'Lan Nguyen',
  gender: 'FEMALE',
  experienceYears: 4,
  bio: 'Five years with elderly care.',
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
      <MemoryRouter>
        <AdminCaregiverProfilePage id='cg-1' />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  vi.clearAllMocks()
  vi.mocked(fetchCaregiverServices).mockResolvedValue([
    { centerServiceId: 'svc-1', serviceName: 'Elderly care' } as never
  ])
  vi.mocked(fetchCaregiver).mockResolvedValue(caregiver)
  await setAppLanguage('en', false)
})

describe('AdminCaregiverProfilePage', () => {
  it('shows the profile, the assigned services and the certificates', async () => {
    vi.mocked(fetchCertificates).mockResolvedValue([])
    vi.mocked(fetchProviderMedia).mockResolvedValue([])
    renderPage()

    expect(await screen.findByRole('heading', { level: 1, name: 'Lan Nguyen' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Care One/ })).toHaveAttribute('href', '/admin/centers/ct-1?tab=staff')
    expect(screen.getByText('Female')).toBeInTheDocument()
    expect(screen.getByText('Five years with elderly care.')).toBeInTheDocument()
    expect(await screen.findByText('Elderly care')).toBeInTheDocument()
    expect(fetchCaregiver).toHaveBeenCalledWith('cg-1')
  })
})

describe('Admin certificate review (two steps)', () => {
  it('reviews only a certificate the center confirmed, in the review dialog with the AI state', async () => {
    vi.mocked(fetchCertificates).mockResolvedValue([
      certificate('a', 'PENDING'),
      { ...certificate('b', 'CENTER_VERIFIED'), aiCheckStatus: 'FAILED' }
    ])
    vi.mocked(verifyCertificate).mockResolvedValue(certificate('b', 'ADMIN_VERIFIED'))
    vi.mocked(fetchProviderMedia).mockResolvedValue([])
    renderPage()

    expect(await screen.findByText('Waiting for the center to confirm first')).toBeInTheDocument()
    expect(screen.getByText('Confirmed by center')).toBeInTheDocument()
    expect(screen.getByText('AI check failed')).toBeInTheDocument()
    // Only the confirmed certificate opens the review (the PENDING one waits for the center).
    fireEvent.click(screen.getByRole('button', { name: 'Review' }))
    const dialog = await screen.findByRole('dialog', { name: 'Review certificate: Cert b' })

    // Without a LOW / MEDIUM AI result the admin must write why the certificate is approved (ProviderService 4256).
    fireEvent.click(within(dialog).getByRole('button', { name: 'Approve certificate' }))
    expect(
      await within(dialog).findByText('The AI result is not low or medium — enter a reason to approve.')
    ).toBeInTheDocument()
    fireEvent.change(within(dialog).getByLabelText('Reason / note'), { target: { value: 'Original seen' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Approve certificate' }))
    await waitFor(() =>
      expect(verifyCertificate).toHaveBeenCalledWith('b', { approved: true, reason: 'Original seen', version: 3 })
    )
    expect(verifyCertificate).not.toHaveBeenCalledWith('a', expect.anything())
  })
})
