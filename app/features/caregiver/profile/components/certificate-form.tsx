import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef, useState, type DragEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { createCertificate, providerKeys, uploadMedia } from '~/entities/provider/provider-api'
import { validateProviderFiles } from '~/entities/provider/provider-media-panel'
import { apiRequestErrorKey } from '~/shared/api/error-details'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'
import { LocalFilePreview } from '~/shared/ui/local-file-preview'
import { Modal } from '~/shared/ui/modal'

import {
  CertificateDetailsFields,
  EMPTY_CERTIFICATE_DETAILS,
  certificateLabelClass as labelClass,
  certificateRequestOf,
  checkCertificateDetails,
  type CertificateDetails
} from './certificate-details-fields'

// Front and back plus a few pages; the AI check reads up to five images of one certificate.
const MAX_CERTIFICATE_FILES = 5

/**
 * Add a certificate in a two-column dialog (files and previews, then the details; one column on phones). Photos and
 * PDFs are picked from a folder through the system file dialog or dragged in, up to five per certificate (front and
 * back). It creates the certificate and then uploads its files; a failed upload keeps the created certificate so a
 * retry does not create it twice.
 */
export function CertificateForm({
  caregiverId,
  open,
  onClose,
  onCreated
}: {
  caregiverId: string
  open: boolean
  onClose: () => void
  onCreated: (certificateId: string) => void
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [details, setDetails] = useState<CertificateDetails>(EMPTY_CERTIFICATE_DETAILS)
  const [files, setFiles] = useState<File[]>([])
  const [fileError, setFileError] = useState<'type' | 'size' | 'count' | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [createdId, setCreatedId] = useState<string | null>(null)

  const valid = checkCertificateDetails(details).valid && files.length > 0

  const save = useMutation({
    mutationFn: async () => {
      const certificateId = createdId ?? (await createCertificate(caregiverId, certificateRequestOf(details))).id
      setCreatedId(certificateId)
      try {
        await uploadMedia('CERTIFICATE', certificateId, files)
      } catch (error) {
        await queryClient.invalidateQueries({ queryKey: providerKeys.certificates(caregiverId) })
        throw error
      }
      return certificateId
    },
    onSuccess: async (certificateId) => {
      toast.success(t('caregiver.me.certificates.form.saved'))
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: providerKeys.certificates(caregiverId) }),
        queryClient.invalidateQueries({ queryKey: providerKeys.media('CERTIFICATE', certificateId) })
      ])
      onCreated(certificateId)
    }
  })

  // Opens the system file dialog so the caregiver picks the photos from any folder of the device.
  function pickFromFolder() {
    if (!save.isPending) fileInput.current?.click()
  }
  function addFiles(selected: File[]) {
    if (selected.length === 0) return
    const next = [...files, ...selected]
    const error = next.length > MAX_CERTIFICATE_FILES ? 'count' : validateProviderFiles('CERTIFICATE', next)
    setFileError(error)
    if (!error) setFiles(next)
  }
  function removeFile(file: File) {
    setFileError(null)
    setFiles((current) => current.filter((item) => item !== file))
  }
  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragging(false)
    if (!save.isPending) addFiles(Array.from(event.dataTransfer.files ?? []))
  }

  const show = (missing: boolean) => submitted && missing
  return (
    <Modal
      description={t('caregiver.me.certificates.form.description')}
      dismissOnBackdrop={false}
      footer={
        <>
          <Button disabled={save.isPending} onClick={onClose} variant='outline'>
            {t('caregiver.ui.actions.cancel')}
          </Button>
          <Button
            loading={save.isPending}
            loadingLabel={t('caregiver.me.certificates.form.uploading')}
            onClick={() => {
              setSubmitted(true)
              if (valid) save.mutate()
            }}
          >
            {createdId ? t('caregiver.me.certificates.form.retry') : t('caregiver.me.certificates.form.save')}
          </Button>
        </>
      }
      onClose={onClose}
      open={open}
      size='xl'
      title={t('caregiver.me.certificates.form.title')}
    >
      <form
        className='grid gap-5 lg:grid-cols-2'
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          setSubmitted(true)
          if (valid) save.mutate()
        }}
      >
        <div>
          <span className={labelClass} id='certificate-files-label'>
            {t('caregiver.me.certificates.form.file')}
          </span>
          <div
            aria-labelledby='certificate-files-label'
            className={`flex min-h-36 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-5 text-center transition-colors ${dragging ? 'border-primary bg-brand-50' : show(files.length === 0) ? 'border-error/60 bg-error-container/30' : 'border-outline-variant'}`}
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false)
            }}
            onDragOver={(event) => {
              event.preventDefault()
              setDragging(true)
            }}
            onDrop={onDrop}
            role='group'
          >
            <Icon className='text-3xl text-primary' name='upload_file' />
            <span className='text-sm font-semibold text-on-surface'>
              {dragging ? t('caregiver.me.certificates.form.dropActive') : t('caregiver.me.certificates.form.drop')}
            </span>
            <Button
              disabled={save.isPending || files.length >= MAX_CERTIFICATE_FILES}
              onClick={pickFromFolder}
              size='sm'
              variant='outline'
            >
              <Icon className='text-base' name='folder_open' />
              {t('caregiver.me.certificates.form.chooseFromFolder')}
            </Button>
            <span className='text-xs text-on-surface-variant' id='certificate-file-hint'>
              {t('caregiver.me.certificates.form.fileHint', { count: MAX_CERTIFICATE_FILES })}
            </span>
            <input
              accept='.pdf,.jpg,.jpeg,.png'
              aria-describedby={
                fileError || show(files.length === 0)
                  ? 'certificate-file-hint certificate-file-error'
                  : 'certificate-file-hint'
              }
              aria-label={t('caregiver.me.certificates.form.chooseFromFolder')}
              className='sr-only'
              disabled={save.isPending}
              multiple
              onChange={(event) => {
                addFiles(Array.from(event.target.files ?? []))
                event.target.value = ''
              }}
              ref={fileInput}
              tabIndex={-1}
              type='file'
            />
          </div>
          {fileError || show(files.length === 0) ? (
            <p className='mt-1 text-sm text-error' id='certificate-file-error'>
              {fileError === 'count'
                ? t('caregiver.me.certificates.form.tooManyFiles', { count: MAX_CERTIFICATE_FILES })
                : fileError
                  ? t(`common.providerMedia.validation.${fileError}`, { maxSize: 10 })
                  : t('caregiver.me.certificates.form.fileRequired')}
            </p>
          ) : null}
          {files.length > 0 ? (
            <ul className='mt-3 grid grid-cols-2 gap-2'>
              {files.map((file) => (
                <li className='relative' key={`${file.name}-${file.size}-${file.lastModified}`}>
                  <LocalFilePreview
                    className='h-28 w-full rounded-xl'
                    file={file}
                    image={file.type.startsWith('image/')}
                    label={file.name}
                  />
                  <button
                    aria-label={t('caregiver.me.certificates.form.removeFile', { name: file.name })}
                    className='absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-on-surface text-surface shadow focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50'
                    disabled={save.isPending}
                    onClick={() => removeFile(file)}
                    type='button'
                  >
                    <Icon className='text-sm' name='close' />
                  </button>
                </li>
              ))}
              {files.length < MAX_CERTIFICATE_FILES ? (
                <li>
                  <button
                    className='flex h-28 w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-outline-variant text-sm font-medium text-on-surface-variant hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50'
                    disabled={save.isPending}
                    onClick={pickFromFolder}
                    type='button'
                  >
                    <Icon name='add_photo_alternate' />
                    {t('caregiver.me.certificates.form.addMore')}
                  </button>
                </li>
              ) : null}
            </ul>
          ) : null}
        </div>

        <div className='flex flex-col gap-4'>
          <CertificateDetailsFields
            disabled={Boolean(createdId)}
            onChange={setDetails}
            showErrors={submitted}
            value={details}
          />

          {save.isPending ? (
            <div aria-hidden='true' className='h-1 overflow-hidden rounded-full bg-surface-container-high'>
              <div className='cg-progress-bar h-full w-full bg-primary' />
            </div>
          ) : null}
          {save.isError ? (
            <p className='rounded-lg bg-error-container p-3 text-sm text-on-error-container' role='alert'>
              {createdId
                ? t('caregiver.me.certificates.form.uploadFailed')
                : t(apiRequestErrorKey(save.error, 'caregiver.provider.actionError'))}
            </p>
          ) : null}
        </div>
        <button aria-hidden='true' className='sr-only' tabIndex={-1} type='submit'>
          {t('caregiver.me.certificates.form.save')}
        </button>
      </form>
    </Modal>
  )
}
