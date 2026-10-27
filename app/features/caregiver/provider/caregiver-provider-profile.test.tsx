import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createCertificate,
  fetchCertificates,
  fetchMyCaregiverProfile,
  fetchProviderMedia,
  uploadMedia
} from '~/entities/provider/provider-api'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { CaregiverProviderProfilePage } from './caregiver-provider-pages'

vi.mock('~/entities/provider/provider-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/provider/provider-api')>()),
  createCertificate: vi.fn(),
  fetchCertificates: vi.fn(),
  fetchMyCaregiverProfile: vi.fn(),
  fetchProviderMedia: vi.fn(),
  uploadMedia: vi.fn()
}))

beforeEach(async () => {
  vi.mocked(createCertificate).mockReset()
  vi.mocked(fetchCertificates).mockReset()
  vi.mocked(fetchMyCaregiverProfile).mockReset()
  vi.mocked(fetchProviderMedia).mockReset()
  vi.mocked(uploadMedia).mockReset()
  await setAppLanguage('en', false)
})

describe('Caregiver certificate upload entry', () => {
  it('opens each certificate file editor inside its own card', async () => {
    vi.mocked(fetchMyCaregiverProfile).mockResolvedValue({
      id: 'caregiver-1',
      centerId: 'center-1',
      fullName: 'Lan Nguyen',
      caregiverStatus: 'ACTIVE',
      verificationStatus: 'PENDING',
      version: 1
    })
    vi.mocked(fetchCertificates).mockResolvedValue([
      {
        id: 'certificate-1',
        caregiverId: 'caregiver-1',
        certificateName: 'First aid',
        issuedBy: 'Red Cross',
        verificationStatus: 'PENDING',
        version: 1
      },
      {
        id: 'certificate-2',
        caregiverId: 'caregiver-1',
        certificateName: 'Nursing',
        issuedBy: 'College',
        verificationStatus: 'PENDING',
        version: 1
      }
    ])
    vi.mocked(fetchProviderMedia).mockResolvedValue([])

    render(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <MemoryRouter>
          <CaregiverProviderProfilePage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    const firstButton = await screen.findByRole('button', { name: /First aid/ })
    const secondButton = screen.getByRole('button', { name: /Nursing/ })
    const firstCard = firstButton.closest('li')!
    const secondCard = secondButton.closest('li')!

    fireEvent.click(firstButton)
    expect(firstButton).toHaveAttribute('aria-expanded', 'true')
    expect(await within(firstCard).findByRole('heading', { name: 'Certificate files' })).toBeInTheDocument()
    expect(within(secondCard).queryByRole('heading', { name: 'Certificate files' })).not.toBeInTheDocument()

    fireEvent.click(secondButton)
    expect(firstButton).toHaveAttribute('aria-expanded', 'false')
    expect(within(firstCard).queryByRole('heading', { name: 'Certificate files' })).not.toBeInTheDocument()
    expect(await within(secondCard).findByRole('heading', { name: 'Certificate files' })).toBeInTheDocument()
    expect(fetchProviderMedia).toHaveBeenCalledWith('CERTIFICATE', 'certificate-2')
  })

  it('uploads a selected certificate file together with its details and keeps avatar editing separate', async () => {
    vi.mocked(fetchMyCaregiverProfile).mockResolvedValue({
      id: 'caregiver-1',
      centerId: 'center-1',
      fullName: 'Lan Nguyen',
      caregiverStatus: 'ACTIVE',
      verificationStatus: 'PENDING',
      version: 1
    })
    vi.mocked(fetchCertificates).mockResolvedValue([])
    vi.mocked(createCertificate).mockResolvedValue({
      id: 'certificate-1',
      caregiverId: 'caregiver-1',
      certificateName: 'First aid',
      issuedBy: 'Red Cross',
      verificationStatus: 'PENDING',
      version: 1
    })
    vi.mocked(fetchProviderMedia).mockResolvedValue([])
    vi.mocked(uploadMedia).mockResolvedValue([])

    render(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <MemoryRouter>
          <CaregiverProviderProfilePage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(await screen.findByText('Lan Nguyen')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Manage profile photos' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Caregiver profile photos' })).not.toBeInTheDocument()
    const file = new File(['sample'], 'first-aid.pdf', { type: 'application/pdf' })
    fireEvent.change(screen.getByLabelText('Certificate image or PDF'), { target: { files: [file] } })
    fireEvent.change(screen.getByLabelText('Certificate name'), { target: { value: 'First aid' } })
    fireEvent.change(screen.getByLabelText('Issued by'), { target: { value: 'Red Cross' } })
    fireEvent.submit(screen.getByRole('button', { name: 'Save and upload certificate' }).closest('form')!)

    await waitFor(() =>
      expect(createCertificate).toHaveBeenCalledWith('caregiver-1', {
        certificateName: 'First aid',
        issuedBy: 'Red Cross'
      })
    )
    await waitFor(() => expect(uploadMedia).toHaveBeenCalledWith('CERTIFICATE', 'certificate-1', [file]))
    expect(await screen.findByRole('status')).toHaveTextContent('Certificate saved and uploaded.')
    expect(screen.queryByRole('heading', { name: 'Certificate files' })).not.toBeInTheDocument()
  })

  it('retries a failed file upload without creating the certificate twice', async () => {
    vi.mocked(fetchMyCaregiverProfile).mockResolvedValue({
      id: 'caregiver-1',
      centerId: 'center-1',
      fullName: 'Lan Nguyen',
      caregiverStatus: 'ACTIVE',
      verificationStatus: 'PENDING',
      version: 1
    })
    vi.mocked(fetchCertificates).mockResolvedValue([])
    vi.mocked(fetchProviderMedia).mockResolvedValue([])
    vi.mocked(createCertificate).mockResolvedValue({
      id: 'certificate-1',
      caregiverId: 'caregiver-1',
      certificateName: 'First aid',
      issuedBy: 'Red Cross',
      verificationStatus: 'PENDING',
      version: 1
    })
    vi.mocked(uploadMedia).mockRejectedValueOnce(new Error('Media unavailable')).mockResolvedValueOnce([])
    render(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <MemoryRouter>
          <CaregiverProviderProfilePage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(await screen.findByText('Lan Nguyen')).toBeInTheDocument()
    const file = new File(['sample'], 'first-aid.pdf', { type: 'application/pdf' })
    fireEvent.change(screen.getByLabelText('Certificate image or PDF'), { target: { files: [file] } })
    fireEvent.change(screen.getByLabelText('Certificate name'), { target: { value: 'First aid' } })
    fireEvent.change(screen.getByLabelText('Issued by'), { target: { value: 'Red Cross' } })
    fireEvent.submit(screen.getByRole('button', { name: 'Save and upload certificate' }).closest('form')!)
    expect(await screen.findByRole('button', { name: 'Retry file upload' })).toBeInTheDocument()
    fireEvent.submit(screen.getByRole('button', { name: 'Retry file upload' }).closest('form')!)
    await waitFor(() => expect(uploadMedia).toHaveBeenCalledTimes(2))
    expect(createCertificate).toHaveBeenCalledTimes(1)
  })
})
