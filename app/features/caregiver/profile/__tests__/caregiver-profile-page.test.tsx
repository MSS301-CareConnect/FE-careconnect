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
  saveCertificate,
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
  saveCertificate: vi.fn(),
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
  it('creates the certificate and uploads photos picked from a folder and dropped in', async () => {
    vi.mocked(createCertificate).mockResolvedValue({
      id: 'certificate-1',
      caregiverId: 'caregiver-1',
      certificateName: 'First aid',
      issuedBy: 'Red Cross',
      verificationStatus: 'PENDING',
      version: 1
    })
    vi.mocked(uploadMedia).mockResolvedValue([])
    const pickerClick = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {})
    renderProfile('/caregiver/profile?tab=certificates')

    fireEvent.click((await screen.findAllByRole('button', { name: 'Add certificate' }))[0])
    const drawer = screen.getByRole('dialog', { name: 'Add certificate' })
    // "Choose from a folder" opens the system file dialog.
    fireEvent.click(within(drawer).getByRole('button', { name: 'Choose from a folder' }))
    expect(pickerClick).toHaveBeenCalledTimes(1)
    const front = new File(['front'], 'front.pdf', { type: 'application/pdf' })
    fireEvent.change(within(drawer).getByLabelText('Choose from a folder'), { target: { files: [front] } })
    // A second side dragged in from Explorer / Finder joins the first one.
    const back = new File(['back'], 'back.pdf', { type: 'application/pdf' })
    fireEvent.drop(within(drawer).getByRole('group', { name: 'Certificate photos or files' }), {
      dataTransfer: { files: [back] }
    })
    expect(within(drawer).getByRole('button', { name: 'Remove back.pdf' })).toBeInTheDocument()
    fireEvent.click(within(drawer).getByRole('button', { name: 'Choose more from a folder' }))
    expect(pickerClick).toHaveBeenCalledTimes(2)
    pickerClick.mockRestore()
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
    await waitFor(() => expect(uploadMedia).toHaveBeenCalledWith('CERTIFICATE', 'certificate-1', [front, back]))
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
    fireEvent.change(within(drawer).getByLabelText('Choose from a folder'), {
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
        verificationStatus: 'REJECTED',
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

  it('offers delete only before the center confirms or after a rejection', async () => {
    vi.mocked(fetchCertificates).mockResolvedValue([
      certificateOf('pending', 'Pending one', 'PENDING'),
      certificateOf('rejected', 'Rejected one', 'REJECTED'),
      certificateOf('center', 'Center one', 'CENTER_VERIFIED'),
      certificateOf('verified', 'Verified one', 'ADMIN_VERIFIED')
    ])
    renderProfile('/caregiver/profile?tab=certificates')

    expect(await screen.findByRole('button', { name: 'Delete Pending one' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete Rejected one' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Delete Center one' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Delete Verified one' })).not.toBeInTheDocument()
    // Every certificate can still be corrected.
    expect(screen.getByRole('button', { name: 'Edit Verified one' })).toBeInTheDocument()
  })

  it('explains a delete the backend refused because the center confirmed meanwhile', async () => {
    vi.mocked(fetchCertificates).mockResolvedValue([certificateOf('pending', 'First aid', 'PENDING')])
    vi.mocked(removeCertificate).mockRejectedValue(
      Object.assign(new Error('Conflict'), { status: 409, info: { code: 4253 } })
    )
    renderProfile('/caregiver/profile?tab=certificates')

    fireEvent.click(await screen.findByRole('button', { name: 'Delete First aid' }))
    const dialog = screen.getByRole('dialog', { name: 'Delete this certificate?' })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete' }))
    expect(
      await within(dialog).findByText(
        'This certificate is being reviewed or is already verified, so it can no longer be deleted.'
      )
    ).toBeInTheDocument()
  })

  it('saves edited details of a pending certificate with its version', async () => {
    vi.mocked(fetchCertificates).mockResolvedValue([certificateOf('pending', 'First aid', 'PENDING')])
    vi.mocked(fetchProviderMedia).mockResolvedValue([mediaOf('photo-1')])
    vi.mocked(saveCertificate).mockResolvedValue(certificateOf('pending', 'First aid level 2', 'PENDING'))
    renderProfile('/caregiver/profile?tab=certificates')

    fireEvent.click(await screen.findByRole('button', { name: 'Edit First aid' }))
    const dialog = screen.getByRole('dialog', { name: 'Edit certificate' })
    expect(await within(dialog).findByText('Files attached: 1')).toBeInTheDocument()
    const save = within(dialog).getByRole('button', { name: 'Save changes' })
    // Nothing changed yet: saving would only send the certificate back for review.
    expect(save).toBeDisabled()
    fireEvent.change(within(dialog).getByLabelText('Certificate name'), { target: { value: 'First aid level 2' } })
    fireEvent.click(save)

    await waitFor(() =>
      expect(saveCertificate).toHaveBeenCalledWith('pending', {
        certificateName: 'First aid level 2',
        issuedBy: 'Red Cross',
        credentialNumber: undefined,
        issuedDate: undefined,
        expiryDate: undefined,
        version: 4
      })
    )
  })

  it('warns and asks again before editing a verified certificate', async () => {
    vi.mocked(fetchCertificates).mockResolvedValue([certificateOf('verified', 'First aid', 'ADMIN_VERIFIED')])
    vi.mocked(saveCertificate).mockResolvedValue(certificateOf('verified', 'First aid', 'PENDING'))
    renderProfile('/caregiver/profile?tab=certificates')

    fireEvent.click(await screen.findByRole('button', { name: 'Edit First aid' }))
    const dialog = screen.getByRole('dialog', { name: 'Edit certificate' })
    expect(within(dialog).getByText(/Families will not see it as verified/)).toBeInTheDocument()
    expect(await within(dialog).findByText(/No photo yet/)).toBeInTheDocument()
    fireEvent.change(within(dialog).getByLabelText('Issued by'), { target: { value: 'Red Cross Vietnam' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save changes' }))
    expect(saveCertificate).not.toHaveBeenCalled()

    const confirm = screen.getByRole('dialog', { name: 'Send for review again?' })
    fireEvent.click(within(confirm).getByRole('button', { name: 'Save and send for review' }))
    await waitFor(() =>
      expect(saveCertificate).toHaveBeenCalledWith(
        'verified',
        expect.objectContaining({ issuedBy: 'Red Cross Vietnam' })
      )
    )
  })

  it('reads a version conflict while editing as a reload request', async () => {
    vi.mocked(fetchCertificates).mockResolvedValue([certificateOf('pending', 'First aid', 'PENDING')])
    vi.mocked(saveCertificate).mockRejectedValue(
      Object.assign(new Error('Conflict'), { status: 409, info: { code: 4251 } })
    )
    renderProfile('/caregiver/profile?tab=certificates')

    fireEvent.click(await screen.findByRole('button', { name: 'Edit First aid' }))
    const dialog = screen.getByRole('dialog', { name: 'Edit certificate' })
    fireEvent.change(within(dialog).getByLabelText('Certificate name'), { target: { value: 'CPR' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save changes' }))
    expect(
      await within(dialog).findByText('The certificate was just updated. Reload and try again.')
    ).toBeInTheDocument()
  })
})

function certificateOf(
  id: string,
  certificateName: string,
  verificationStatus: 'PENDING' | 'CENTER_VERIFIED' | 'ADMIN_VERIFIED' | 'REJECTED'
) {
  return { id, caregiverId: 'caregiver-1', certificateName, issuedBy: 'Red Cross', verificationStatus, version: 4 }
}

function mediaOf(mediaFileId: string) {
  return { mediaFileId, mediaFileType: 'IMAGE' as const, displayOrder: 0, downloadUrl: '/front.jpg' }
}

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
