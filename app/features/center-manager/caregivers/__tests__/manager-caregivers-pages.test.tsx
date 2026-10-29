import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  changeCaregiverStatus,
  createCertificate,
  createCaregiver,
  createTimeOff,
  fetchCaregiver,
  fetchCaregivers,
  fetchCertificates,
  fetchProviderMedia,
  fetchTimeOffs,
  saveCaregiver,
  uploadMedia,
  verifyCertificateByCenter
} from '~/entities/provider/provider-api'
import { AuthUserContext } from '~/features/shared/auth/auth-user-context'
import type { ProviderCaregiverRecord } from '~/shared/api/generated/contracts'
import { setAppLanguage } from '~/shared/i18n/i18n'
import { ManagerCaregiverDetailPage } from '../manager-caregiver-detail-page'
import { ManagerCaregiversPage } from '../manager-caregivers-page'
import { provisionCaregiverAccount } from '../caregiver-onboarding-api'

vi.mock('../caregiver-onboarding-api', () => ({ provisionCaregiverAccount: vi.fn() }))

vi.mock('~/entities/provider/provider-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/provider/provider-api')>()),
  fetchCaregivers: vi.fn(),
  fetchCaregiver: vi.fn(),
  fetchCertificates: vi.fn(),
  fetchProviderMedia: vi.fn(),
  saveCaregiver: vi.fn(),
  createCertificate: vi.fn(),
  createCaregiver: vi.fn(),
  uploadMedia: vi.fn(),
  changeCaregiverStatus: vi.fn(),
  verifyCertificateByCenter: vi.fn(),
  fetchTimeOffs: vi.fn(),
  createTimeOff: vi.fn()
}))

const person: ProviderCaregiverRecord = {
  id: 'caregiver-1',
  centerId: 'center-1',
  fullName: 'Lan Nguyen',
  caregiverStatus: 'ACTIVE',
  verificationStatus: 'PENDING',
  experienceYears: 3,
  version: 4
}

function renderManager(path = '/center-manager/caregivers', centerId = 'center-1') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <AuthUserContext.Provider value={{ centerId, roles: ['CENTER_MANAGER'] }}>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route element={<ManagerCaregiversPage />} path='/center-manager/caregivers' />
            <Route element={<ManagerCaregiverDetailPage />} path='/center-manager/caregivers/:id' />
          </Routes>
        </MemoryRouter>
      </AuthUserContext.Provider>
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  vi.mocked(fetchCaregivers).mockReset()
  vi.mocked(fetchCaregiver).mockReset()
  vi.mocked(fetchCertificates).mockReset()
  vi.mocked(fetchProviderMedia).mockReset()
  vi.mocked(saveCaregiver).mockReset()
  vi.mocked(createCertificate).mockReset()
  vi.mocked(createCaregiver).mockReset()
  vi.mocked(provisionCaregiverAccount).mockReset()
  vi.mocked(uploadMedia).mockReset()
  vi.mocked(changeCaregiverStatus).mockReset()
  vi.mocked(verifyCertificateByCenter).mockReset()
  vi.mocked(createTimeOff).mockReset()
  vi.mocked(fetchTimeOffs).mockReset().mockResolvedValue([])
  await setAppLanguage('en', false)
})

describe('Center Manager Provider caregivers', () => {
  it('creates the account and center profile from one form without asking for an account ID', async () => {
    vi.mocked(fetchCaregivers).mockResolvedValue({ items: [], page: 0, size: 20, totalElements: 0, totalPages: 0 })
    vi.mocked(provisionCaregiverAccount).mockResolvedValue('user-1')
    vi.mocked(createCaregiver).mockResolvedValue({ ...person, userId: 'user-1' })
    renderManager()

    fireEvent.click(await screen.findByRole('button', { name: 'Add caregiver' }))
    expect(screen.queryByLabelText('Account ID')).not.toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Sign-in email'), { target: { value: 'lan@example.com' } })
    fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Lan Nguyen' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() =>
      expect(provisionCaregiverAccount).toHaveBeenCalledWith('lan@example.com', 'Lan Nguyen', undefined)
    )
    await waitFor(() =>
      expect(createCaregiver).toHaveBeenCalledWith(
        'center-1',
        expect.objectContaining({ userId: 'user-1', fullName: 'Lan Nguyen' })
      )
    )
  })

  it('retries only the profile after an account was created', async () => {
    vi.mocked(fetchCaregivers).mockResolvedValue({ items: [], page: 0, size: 20, totalElements: 0, totalPages: 0 })
    vi.mocked(provisionCaregiverAccount).mockResolvedValue('user-1')
    vi.mocked(createCaregiver)
      .mockRejectedValueOnce(new Error('Provider unavailable'))
      .mockResolvedValueOnce({ ...person, userId: 'user-1' })
    renderManager()

    fireEvent.click(await screen.findByRole('button', { name: 'Add caregiver' }))
    fireEvent.change(screen.getByLabelText('Sign-in email'), { target: { value: 'lan@example.com' } })
    fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Lan Nguyen' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The account was created, but the profile was not saved.'
    )
    fireEvent.click(screen.getByRole('button', { name: 'Retry saving profile' }))

    await waitFor(() => expect(createCaregiver).toHaveBeenCalledTimes(2))
    expect(provisionCaregiverAccount).toHaveBeenCalledTimes(1)
  })

  it('loads only the assigned center and opens a real caregiver profile with certificates', async () => {
    vi.mocked(fetchCaregivers).mockResolvedValue({
      items: [person],
      page: 0,
      size: 20,
      totalElements: 1,
      totalPages: 1
    })
    vi.mocked(fetchCaregiver).mockResolvedValue(person)
    vi.mocked(fetchCertificates).mockResolvedValue([])
    renderManager()

    expect(await screen.findByText('Lan Nguyen')).toBeInTheDocument()
    expect(fetchCaregivers).toHaveBeenCalledWith('center-1', {
      page: 0,
      size: 20,
      verification: undefined,
      status: undefined
    })
    fireEvent.click(screen.getByRole('link', { name: 'View details for Lan Nguyen' }))
    expect(await screen.findByRole('heading', { name: 'Lan Nguyen' })).toBeInTheDocument()
    expect(await screen.findByText('No certificates yet.')).toBeInTheDocument()
  })

  it('sends the backend version when updating a caregiver', async () => {
    vi.mocked(fetchCaregiver).mockResolvedValue(person)
    vi.mocked(fetchCertificates).mockResolvedValue([])
    vi.mocked(saveCaregiver).mockResolvedValue({ ...person, fullName: 'Lan Tran', version: 5 })
    renderManager('/center-manager/caregivers/caregiver-1')

    expect(await screen.findByRole('heading', { name: 'Lan Nguyen' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Edit profile' }))
    fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Lan Tran' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() =>
      expect(saveCaregiver).toHaveBeenCalledWith(
        'caregiver-1',
        expect.objectContaining({ fullName: 'Lan Tran', version: 4 })
      )
    )
    // ProviderService rejects unknown fields, so the profile PUT never carries the status.
    expect(vi.mocked(saveCaregiver).mock.calls[0]?.[1]).not.toHaveProperty('caregiverStatus')
    expect(changeCaregiverStatus).not.toHaveBeenCalled()
  })

  it('changes the status through its own request before saving the profile with the new version (M-12)', async () => {
    vi.mocked(fetchCaregiver).mockResolvedValue(person)
    vi.mocked(fetchCertificates).mockResolvedValue([])
    vi.mocked(changeCaregiverStatus).mockResolvedValue({ ...person, caregiverStatus: 'SUSPENDED', version: 5 })
    vi.mocked(saveCaregiver).mockResolvedValue({ ...person, caregiverStatus: 'SUSPENDED', version: 6 })
    renderManager('/center-manager/caregivers/caregiver-1')

    fireEvent.click(await screen.findByRole('button', { name: 'Edit profile' }))
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'SUSPENDED' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() =>
      expect(saveCaregiver).toHaveBeenCalledWith('caregiver-1', expect.objectContaining({ version: 5 }))
    )
    expect(changeCaregiverStatus).toHaveBeenCalledWith('caregiver-1', { status: 'SUSPENDED', version: 4 })
    expect(vi.mocked(changeCaregiverStatus).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(saveCaregiver).mock.invocationCallOrder[0] ?? 0
    )
  })

  it('does not save the profile when the status change is rejected (M-12)', async () => {
    vi.mocked(fetchCaregiver).mockResolvedValue(person)
    vi.mocked(fetchCertificates).mockResolvedValue([])
    vi.mocked(changeCaregiverStatus).mockRejectedValue(new Error('conflict'))
    renderManager('/center-manager/caregivers/caregiver-1')

    fireEvent.click(await screen.findByRole('button', { name: 'Edit profile' }))
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'INACTIVE' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(saveCaregiver).not.toHaveBeenCalled()
  })

  it('offers the active status only to a verified caregiver (PRV-06)', async () => {
    vi.mocked(fetchCaregiver).mockResolvedValue({ ...person, caregiverStatus: 'INACTIVE' })
    vi.mocked(fetchCertificates).mockResolvedValue([])
    renderManager('/center-manager/caregivers/caregiver-1')

    fireEvent.click(await screen.findByRole('button', { name: 'Edit profile' }))
    expect(screen.getByRole('option', { name: 'Active' })).toBeDisabled()
    expect(screen.getByRole('option', { name: 'Suspended' })).toBeEnabled()
  })

  it('lets a verified caregiver be activated', async () => {
    vi.mocked(fetchCaregiver).mockResolvedValue({
      ...person,
      caregiverStatus: 'INACTIVE',
      verificationStatus: 'VERIFIED'
    })
    vi.mocked(fetchCertificates).mockResolvedValue([])
    renderManager('/center-manager/caregivers/caregiver-1')

    fireEvent.click(await screen.findByRole('button', { name: 'Edit profile' }))
    expect(screen.getByRole('option', { name: 'Active' })).toBeEnabled()
  })

  it('confirms a pending certificate as the first review step (M-12)', async () => {
    const certificate = {
      id: 'certificate-1',
      caregiverId: 'caregiver-1',
      certificateName: 'First aid',
      issuedBy: 'Red Cross',
      verificationStatus: 'PENDING' as const,
      version: 1
    }
    vi.mocked(fetchCaregiver).mockResolvedValue(person)
    vi.mocked(fetchCertificates).mockResolvedValue([certificate])
    vi.mocked(verifyCertificateByCenter).mockResolvedValue({ ...certificate, verificationStatus: 'CENTER_VERIFIED' })
    renderManager('/center-manager/caregivers/caregiver-1')

    fireEvent.click(await screen.findByRole('button', { name: 'Confirm certificate' }))
    await waitFor(() =>
      expect(verifyCertificateByCenter).toHaveBeenCalledWith('certificate-1', {
        approved: true,
        reason: undefined,
        version: 1
      })
    )
  })

  it('adds time off for the caregiver (M-12)', async () => {
    vi.mocked(fetchCaregiver).mockResolvedValue(person)
    vi.mocked(fetchCertificates).mockResolvedValue([])
    vi.mocked(createTimeOff).mockResolvedValue({} as never)
    renderManager('/center-manager/caregivers/caregiver-1')

    const add = await screen.findByRole('button', { name: 'Add time off' })
    expect(add).toBeDisabled()
    fireEvent.change(screen.getByLabelText('Start'), { target: { value: '2026-12-01T08:00' } })
    fireEvent.change(screen.getByLabelText('End'), { target: { value: '2026-12-02T08:00' } })
    fireEvent.click(add)
    await waitFor(() =>
      expect(createTimeOff).toHaveBeenCalledWith('caregiver-1', {
        startAt: new Date('2026-12-01T08:00').toISOString(),
        endAt: new Date('2026-12-02T08:00').toISOString(),
        reason: undefined
      })
    )
  })

  it('opens certificate file upload beside the selected certificate', async () => {
    vi.mocked(fetchCaregiver).mockResolvedValue(person)
    vi.mocked(fetchCertificates).mockResolvedValue([
      {
        id: 'certificate-1',
        caregiverId: 'caregiver-1',
        certificateName: 'First aid',
        issuedBy: 'Red Cross',
        verificationStatus: 'PENDING',
        version: 1
      }
    ])
    vi.mocked(fetchProviderMedia).mockResolvedValue([])
    renderManager('/center-manager/caregivers/caregiver-1')

    fireEvent.click(await screen.findByRole('button', { name: 'Upload certificate file' }))
    await waitFor(() => expect(fetchProviderMedia).toHaveBeenCalledWith('CERTIFICATE', 'certificate-1'))
    expect(screen.getAllByLabelText('Upload files')).toHaveLength(2)
  })

  it('creates and uploads a certificate in one form', async () => {
    vi.mocked(fetchCaregiver).mockResolvedValue(person)
    vi.mocked(fetchCertificates).mockResolvedValue([])
    vi.mocked(createCertificate).mockResolvedValue({
      id: 'certificate-1',
      caregiverId: 'caregiver-1',
      certificateName: 'First aid',
      issuedBy: 'Red Cross',
      verificationStatus: 'PENDING',
      version: 1
    })
    vi.mocked(uploadMedia).mockResolvedValue([])
    vi.mocked(fetchProviderMedia).mockResolvedValue([])
    renderManager('/center-manager/caregivers/caregiver-1')

    fireEvent.click(await screen.findByRole('button', { name: 'Add certificate' }))
    const file = new File(['sample'], 'first-aid.png', { type: 'image/png' })
    fireEvent.change(screen.getByLabelText('Certificate image or PDF'), { target: { files: [file] } })
    fireEvent.change(screen.getByLabelText('Certificate name'), { target: { value: 'First aid' } })
    fireEvent.change(screen.getByLabelText('Issued by'), { target: { value: 'Red Cross' } })
    fireEvent.submit(screen.getByRole('button', { name: 'Save and upload certificate' }).closest('form')!)

    await waitFor(() =>
      expect(createCertificate).toHaveBeenCalledWith(
        'caregiver-1',
        expect.objectContaining({
          certificateName: 'First aid',
          issuedBy: 'Red Cross'
        })
      )
    )
    await waitFor(() => expect(uploadMedia).toHaveBeenCalledWith('CERTIFICATE', 'certificate-1', [file]))
  })

  it('blocks a manager without an assigned center before requesting Provider data', () => {
    renderManager('/center-manager/caregivers', '')
    expect(screen.getByRole('alert')).toHaveTextContent('no assigned center')
    expect(fetchCaregivers).not.toHaveBeenCalled()
  })
})
