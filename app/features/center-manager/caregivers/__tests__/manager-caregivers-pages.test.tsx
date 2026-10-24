import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createCertificate,
  fetchCaregiver,
  fetchCaregivers,
  fetchCertificates,
  fetchProviderMedia,
  saveCaregiver,
  uploadMedia
} from '~/entities/provider/provider-api'
import { AuthUserContext } from '~/features/shared/auth/auth-user-context'
import type { ProviderCaregiverRecord } from '~/shared/api/generated/contracts'
import { setAppLanguage } from '~/shared/i18n/i18n'
import { ManagerCaregiverDetailPage } from '../manager-caregiver-detail-page'
import { ManagerCaregiversPage } from '../manager-caregivers-page'

vi.mock('~/entities/provider/provider-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~/entities/provider/provider-api')>()),
  fetchCaregivers: vi.fn(),
  fetchCaregiver: vi.fn(),
  fetchCertificates: vi.fn(),
  fetchProviderMedia: vi.fn(),
  saveCaregiver: vi.fn(),
  createCertificate: vi.fn(),
  uploadMedia: vi.fn()
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
  vi.mocked(uploadMedia).mockReset()
  await setAppLanguage('en', false)
})

describe('Center Manager Provider caregivers', () => {
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
