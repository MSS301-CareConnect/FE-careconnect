import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createCertificate,
  fetchCaregiverServices,
  fetchCertificates,
  fetchMyCaregiverProfile,
  fetchProviderMedia,
  removeCertificate,
  removeMedia,
  uploadMedia
} from '~/entities/provider/provider-api'
import { fetchWebSessions, revokeSession } from '~/features/shared/auth/security-api'
import { AuthUserContext } from '~/features/shared/auth/auth-user-context'
import { setAppLanguage } from '~/shared/i18n/i18n'

import { CaregiverProfilePage } from '../caregiver-profile-page'

vi.mock('~/entities/provider/provider-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/provider/provider-api')>()),
  createCertificate: vi.fn(),
  fetchCaregiverServices: vi.fn(),
  fetchCertificates: vi.fn(),
  fetchMyCaregiverProfile: vi.fn(),
  fetchProviderMedia: vi.fn(),
  removeCertificate: vi.fn(),
  removeMedia: vi.fn(),
  uploadMedia: vi.fn()
}))
vi.mock('~/features/shared/auth/security-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/features/shared/auth/security-api')>()),
  fetchWebSessions: vi.fn(),
  revokeSession: vi.fn()
}))

const profile = {
  id: 'caregiver-1',
  centerId: 'center-1',
  centerName: 'TT An Tâm',
  fullName: 'Lan Nguyen',
  caregiverStatus: 'ACTIVE',
  verificationStatus: 'VERIFIED',
  experienceYears: 10,
  dateOfBirth: '2000-10-22',
  version: 1
} as const

function renderProfile(path = '/caregiver/profile') {
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <AuthUserContext
        value={{
          id: 'user-1',
          fullName: 'Lan Nguyen',
          email: 'lan@example.com',
          phoneNumber: '0912345678',
          roles: ['CAREGIVER'],
          status: 'ACTIVE'
        }}
      >
        <MemoryRouter initialEntries={[path]}>
          <CaregiverProfilePage />
        </MemoryRouter>
      </AuthUserContext>
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  vi.clearAllMocks()
  vi.mocked(fetchMyCaregiverProfile).mockResolvedValue(profile)
  vi.mocked(fetchCaregiverServices).mockResolvedValue([])
  vi.mocked(fetchCertificates).mockResolvedValue([])
  vi.mocked(fetchProviderMedia).mockResolvedValue([])
  await setAppLanguage('en', false)
})

describe('Caregiver profile — information', () => {
  it('shows formatted details, marks centre-managed fields and lists missing items', async () => {
    vi.mocked(fetchCaregiverServices).mockResolvedValue([
      { centerServiceId: 'cs-1', careServiceId: 'svc-1', serviceName: 'Hỗ trợ ăn uống' }
    ])
    renderProfile()

    expect(await screen.findByRole('heading', { name: 'Lan Nguyen' })).toBeInTheDocument()
    expect(screen.getByText('22/10/2000')).toBeInTheDocument()
    expect(screen.getByText('0912 345 678')).toBeInTheDocument()
    expect(await screen.findByText('Hỗ trợ ăn uống')).toBeInTheDocument()
    // One banner for everything the center keeps instead of a lock on every row.
    expect(screen.getAllByText('Managed by your center')).toHaveLength(1)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    expect(screen.getByText(/At least one certificate/)).toBeInTheDocument()
    expect(screen.queryByText('caregiver-1')).not.toBeInTheDocument()
  })

  it('opens the file picker and replaces the avatar, removing the old photo after the upload', async () => {
    vi.mocked(fetchProviderMedia)
      .mockResolvedValueOnce([{ mediaFileId: 'old-photo', mediaFileType: 'IMAGE', downloadUrl: '/old.jpg' }])
      .mockResolvedValue([{ mediaFileId: 'new-photo', mediaFileType: 'IMAGE', downloadUrl: '/new.jpg' }])
    vi.mocked(uploadMedia).mockResolvedValue([])
    vi.mocked(removeMedia).mockResolvedValue(undefined)
    renderProfile()

    const button = await screen.findByRole('button', { name: 'Change profile photo' })
    await waitFor(() => expect(button).toBeEnabled())
    const input = document.querySelector<HTMLInputElement>('input[type="file"]')!
    const openPicker = vi.spyOn(input, 'click')
    fireEvent.click(button)
    expect(openPicker).toHaveBeenCalledOnce()

    const file = new File(['image'], 'avatar.png', { type: 'image/png' })
    fireEvent.change(input, { target: { files: [file] } })
    await waitFor(() => expect(uploadMedia).toHaveBeenCalledWith('CAREGIVER_PROFILE', 'caregiver-1', [file]))
    await waitFor(() => expect(removeMedia).toHaveBeenCalledWith('CAREGIVER_PROFILE', 'caregiver-1', 'old-photo'))
    expect(vi.mocked(uploadMedia).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(removeMedia).mock.invocationCallOrder[0]
    )
  })
})

describe('Caregiver profile — certificates', () => {
  it('creates the certificate with its details and uploads the dropped file', async () => {
    vi.mocked(createCertificate).mockResolvedValue({
      id: 'certificate-1',
      caregiverId: 'caregiver-1',
      certificateName: 'First aid',
      issuedBy: 'Red Cross',
      verificationStatus: 'PENDING',
      version: 1
    })
    vi.mocked(uploadMedia).mockResolvedValue([])
    renderProfile('/caregiver/profile?tab=certificates')

    fireEvent.click((await screen.findAllByRole('button', { name: 'Add certificate' }))[0])
    const drawer = screen.getByRole('dialog', { name: 'Add certificate' })
    const file = new File(['sample'], 'first-aid.pdf', { type: 'application/pdf' })
    fireEvent.change(within(drawer).getByLabelText('Certificate file'), { target: { files: [file] } })
    fireEvent.change(within(drawer).getByLabelText('Certificate name'), { target: { value: 'First aid' } })
    fireEvent.change(within(drawer).getByLabelText('Issued by'), { target: { value: 'Red Cross' } })
    fireEvent.click(within(drawer).getByRole('button', { name: 'Save certificate' }))

    await waitFor(() =>
      expect(createCertificate).toHaveBeenCalledWith('caregiver-1', {
        certificateName: 'First aid',
        issuedBy: 'Red Cross',
        credentialNumber: undefined,
        issuedDate: undefined,
        expiryDate: undefined
      })
    )
    await waitFor(() => expect(uploadMedia).toHaveBeenCalledWith('CERTIFICATE', 'certificate-1', [file]))
  })

  it('retries a failed file upload without creating the certificate twice', async () => {
    vi.mocked(createCertificate).mockResolvedValue({
      id: 'certificate-1',
      caregiverId: 'caregiver-1',
      certificateName: 'First aid',
      issuedBy: 'Red Cross',
      verificationStatus: 'PENDING',
      version: 1
    })
    vi.mocked(uploadMedia).mockRejectedValueOnce(new Error('Media unavailable')).mockResolvedValueOnce([])
    renderProfile('/caregiver/profile?tab=certificates')

    fireEvent.click((await screen.findAllByRole('button', { name: 'Add certificate' }))[0])
    const drawer = screen.getByRole('dialog', { name: 'Add certificate' })
    fireEvent.change(within(drawer).getByLabelText('Certificate file'), {
      target: { files: [new File(['sample'], 'first-aid.pdf', { type: 'application/pdf' })] }
    })
    fireEvent.change(within(drawer).getByLabelText('Certificate name'), { target: { value: 'First aid' } })
    fireEvent.change(within(drawer).getByLabelText('Issued by'), { target: { value: 'Red Cross' } })
    fireEvent.click(within(drawer).getByRole('button', { name: 'Save certificate' }))

    fireEvent.click(await within(drawer).findByRole('button', { name: 'Retry file upload' }))
    await waitFor(() => expect(uploadMedia).toHaveBeenCalledTimes(2))
    expect(createCertificate).toHaveBeenCalledTimes(1)
  })

  it('shows review and expiry states and deletes after confirmation', async () => {
    vi.mocked(fetchCertificates).mockResolvedValue([
      {
        id: 'certificate-1',
        caregiverId: 'caregiver-1',
        certificateName: 'First aid',
        issuedBy: 'Red Cross',
        verificationStatus: 'ADMIN_VERIFIED',
        expiryDate: '2020-01-01',
        version: 3
      }
    ])
    vi.mocked(removeCertificate).mockResolvedValue(undefined)
    renderProfile('/caregiver/profile?tab=certificates')

    expect(await screen.findByText('Expired')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Delete First aid' }))
    const dialog = screen.getByRole('dialog', { name: 'Delete this certificate?' })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(removeCertificate).toHaveBeenCalledWith('certificate-1', 3))
  })
})

describe('Caregiver profile — security', () => {
  it('names devices from their browser, keeps this device first and signs out the others', async () => {
    vi.mocked(fetchWebSessions).mockResolvedValue([
      {
        sessionId: 'other',
        isCurrent: false,
        ip: '172.21.0.3',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Version/17.0 Mobile/15E148 Safari/604.1',
        lastActiveAt: new Date().toISOString()
      },
      {
        sessionId: 'current',
        isCurrent: true,
        ip: '172.21.0.2',
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36'
      }
    ])
    vi.mocked(revokeSession).mockResolvedValue(undefined)
    renderProfile('/caregiver/profile?tab=security')

    const region = await screen.findByRole('region', { name: 'Signed-in devices' })
    const devices = await within(region).findAllByRole('listitem')
    expect(devices[0]).toHaveTextContent('Chrome · Windows 10/11')
    expect(devices[0]).toHaveTextContent('This device')
    expect(within(devices[0]).queryByRole('button', { name: 'Sign out' })).not.toBeInTheDocument()
    expect(devices[1]).toHaveTextContent('Safari · iOS')
    expect(screen.queryByText(/Mozilla/)).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Sign out all other devices' }))
    const dialog = screen.getByRole('dialog', { name: 'Sign out all other devices?' })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Sign out all other devices' }))
    await waitFor(() => expect(revokeSession).toHaveBeenCalledWith('other'))
    expect(revokeSession).not.toHaveBeenCalledWith('current')
  })

  it('checks the new password rules as the caregiver types', async () => {
    vi.mocked(fetchWebSessions).mockResolvedValue([])
    renderProfile('/caregiver/profile?tab=security')

    fireEvent.change(await screen.findByLabelText('New password'), { target: { value: 'abc' } })
    expect(screen.getByText(/Strength: Weak/)).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('New password'), { target: { value: 'Abcdef1!' } })
    expect(screen.getByText(/Strength: Strong/)).toBeInTheDocument()
  })
})
