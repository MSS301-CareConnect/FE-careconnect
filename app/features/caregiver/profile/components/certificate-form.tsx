import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, type DragEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { createCertificate, providerKeys, uploadMedia } from '~/entities/provider/provider-api'
import { validateProviderFiles } from '~/entities/provider/provider-media-panel'
import { apiRequestErrorKey } from '~/shared/api/error-details'
import { Button } from '~/shared/ui/button'
import { DatePicker } from '~/shared/ui/date-picker'
import { Icon } from '~/shared/ui/icon'
import { LocalFilePreview } from '~/shared/ui/local-file-preview'
import { Modal } from '~/shared/ui/modal'

const inputClass =
  'min-h-11 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3.5 text-[15px] text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 aria-invalid:border-error disabled:opacity-60'
const labelClass = 'mb-1 block text-sm font-medium text-on-surface'

/**
 * Add a certificate in a two-column dialog (file and preview, then the details; one column on phones). It creates the certificate
 * and then uploads its file; a failed upload keeps the created certificate so a retry does not create it twice.
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
  const [name, setName] = useState('')
  const [issuer, setIssuer] = useState('')
  const [number, setNumber] = useState('')
  const [issuedDate, setIssuedDate] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<'type' | 'size' | null>(null)
  const [dragging, setDragging] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [createdId, setCreatedId] = useState<string | null>(null)

  const nameMissing = !name.trim()
  const issuerMissing = !issuer.trim()
  const datesWrong = Boolean(issuedDate && expiryDate && expiryDate <= issuedDate)
  const valid = !nameMissing && !issuerMissing && !datesWrong && file !== null

  const save = useMutation({
    mutationFn: async () => {
      const certificateId =
        createdId ??
        (
          await createCertificate(caregiverId, {
            certificateName: name.trim(),
            issuedBy: issuer.trim(),
            credentialNumber: number.trim() || undefined,
            issuedDate: issuedDate || undefined,
            expiryDate: expiryDate || undefined
          })
        ).id
      setCreatedId(certificateId)
      try {
        await uploadMedia('CERTIFICATE', certificateId, [file as File])
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

  function pick(selected: File | undefined) {
    if (!selected) return
    const error = validateProviderFiles('CERTIFICATE', [selected])
    setFileError(error === 'type' || error === 'size' ? error : null)
    setFile(error ? null : selected)
  }
  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setDragging(false)
    pick(event.dataTransfer.files?.[0])
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
          <span className={labelClass}>{t('caregiver.me.certificates.form.file')}</span>
          <label
            className={`flex min-h-36 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-4 py-5 text-center transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary ${dragging ? 'border-primary bg-brand-50' : show(file === null) ? 'border-error/60 bg-error-container/30' : 'border-outline-variant hover:border-brand-300 hover:bg-brand-50/60'}`}
            onDragLeave={() => setDragging(false)}
            onDragOver={(event) => {
              event.preventDefault()
              setDragging(true)
            }}
            onDrop={onDrop}
          >
            <Icon
              className='text-3xl text-primary'
              name={file ? (file.type === 'application/pdf' ? 'picture_as_pdf' : 'image') : 'upload_file'}
            />
            <span className='text-sm font-semibold text-primary'>
              {file
                ? file.name
                : dragging
                  ? t('caregiver.me.certificates.form.dropActive')
                  : t('caregiver.me.certificates.form.drop')}
            </span>
            <span className='text-xs text-on-surface-variant'>
              {file
                ? `${(file.size / 1024 / 1024).toFixed(1)} MB · ${t('caregiver.me.certificates.form.replace')}`
                : t('caregiver.me.certificates.form.fileHint')}
            </span>
            <input
              accept='.pdf,.jpg,.jpeg,.png'
              aria-describedby={fileError || show(file === null) ? 'certificate-file-error' : undefined}
              aria-label={t('caregiver.me.certificates.form.file')}
              className='sr-only'
              disabled={save.isPending}
              onChange={(event) => {
                pick(event.target.files?.[0])
                event.target.value = ''
              }}
              type='file'
            />
          </label>
          {fileError || show(file === null) ? (
            <p className='mt-1 text-sm text-error' id='certificate-file-error'>
              {fileError
                ? t(`common.providerMedia.validation.${fileError}`, { maxSize: 10 })
                : t('caregiver.me.certificates.form.fileRequired')}
            </p>
          ) : null}
          {file ? (
            <div className='mt-2'>
              <LocalFilePreview file={file} image={file.type.startsWith('image/')} label={file.name} />
            </div>
          ) : null}
        </div>

        <div className='flex flex-col gap-4'>
          <div>
            <label className={labelClass} htmlFor='certificate-name'>
              {t('caregiver.me.certificates.form.name')}
            </label>
            <input
              aria-describedby={show(nameMissing) ? 'certificate-name-error' : undefined}
              aria-invalid={show(nameMissing)}
              className={inputClass}
              disabled={Boolean(createdId)}
              id='certificate-name'
              maxLength={255}
              onChange={(event) => setName(event.target.value)}
              value={name}
            />
            {show(nameMissing) ? (
              <p className='mt-1 text-sm text-error' id='certificate-name-error'>
                {t('caregiver.me.certificates.form.required')}
              </p>
            ) : null}
          </div>
          <div>
            <label className={labelClass} htmlFor='certificate-issuer'>
              {t('caregiver.me.certificates.form.issuer')}
            </label>
            <input
              aria-describedby={show(issuerMissing) ? 'certificate-issuer-error' : undefined}
              aria-invalid={show(issuerMissing)}
              className={inputClass}
              disabled={Boolean(createdId)}
              id='certificate-issuer'
              maxLength={255}
              onChange={(event) => setIssuer(event.target.value)}
              value={issuer}
            />
            {show(issuerMissing) ? (
              <p className='mt-1 text-sm text-error' id='certificate-issuer-error'>
                {t('caregiver.me.certificates.form.required')}
              </p>
            ) : null}
          </div>
          <div>
            <label className={labelClass} htmlFor='certificate-number'>
              {t('caregiver.me.certificates.form.number')}
            </label>
            <input
              className={inputClass}
              disabled={Boolean(createdId)}
              id='certificate-number'
              maxLength={100}
              onChange={(event) => setNumber(event.target.value)}
              value={number}
            />
          </div>
          <div className='grid gap-3 sm:grid-cols-2'>
            <div>
              <label className={labelClass} htmlFor='certificate-issued'>
                {t('caregiver.me.certificates.form.issuedDate')}
              </label>
              <DatePicker id='certificate-issued' onChange={setIssuedDate} value={issuedDate} />
            </div>
            <div>
              <label className={labelClass} htmlFor='certificate-expiry'>
                {t('caregiver.me.certificates.form.expiryDate')}
              </label>
              <DatePicker
                aria-describedby={datesWrong ? 'certificate-dates-error' : undefined}
                aria-invalid={datesWrong}
                id='certificate-expiry'
                onChange={setExpiryDate}
                value={expiryDate}
              />
            </div>
            {datesWrong ? (
              <p className='text-sm text-error sm:col-span-2' id='certificate-dates-error'>
                {t('caregiver.me.certificates.form.expiryBeforeIssue')}
              </p>
            ) : null}
          </div>

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
