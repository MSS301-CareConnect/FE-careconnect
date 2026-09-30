import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { careDate } from '~/entities/care-session/care-record-preview'
import { SectionCard } from '~/shared/ui/section-card'

const fieldClass =
  'mt-2 w-full rounded-lg border border-outline-variant/40 bg-white p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15'
export function ProfilePersonal() {
  const { t, i18n } = useTranslation()
  const [saved, setSaved] = useState({ phone: '0903123456', email: 'nguyenmai@example.com', address: '', bio: '' })
  const [draft, setDraft] = useState(saved)
  const [editing, setEditing] = useState(false)
  const [notice, setNotice] = useState(false)
  const [error, setError] = useState<'phoneError' | 'emailError' | 'required' | null>(null)
  const displayed = {
    ...saved,
    address: saved.address || t('caregiver.profile.addressValue'),
    bio: saved.bio || t('caregiver.profile.bioValue')
  }
  function submit(event: FormEvent) {
    event.preventDefault()
    if (!draft.address.trim() || !draft.bio.trim()) {
      setError('required')
      return
    }
    if (!/^\+?[\d\s()-]+$/.test(draft.phone) || !/^\d{9,15}$/.test(draft.phone.replace(/\D/g, ''))) {
      setError('phoneError')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)) {
      setError('emailError')
      return
    }
    setSaved({
      phone: draft.phone.trim(),
      email: draft.email.trim(),
      address: draft.address.trim(),
      bio: draft.bio.trim()
    })
    setEditing(false)
    setError(null)
    setNotice(true)
  }
  return (
    <SectionCard
      action={
        !editing && (
          <button
            className='rounded-lg bg-secondary-container px-3 py-2 text-xs font-bold text-primary print:hidden'
            onClick={() => {
              setDraft(displayed)
              setEditing(true)
              setNotice(false)
            }}
            type='button'
          >
            {t('caregiver.profile.edit')}
          </button>
        )
      }
      icon='person'
      id='personal'
      title={t('caregiver.profile.personalTitle')}
    >
      <form noValidate onSubmit={submit}>
        <div className='grid gap-x-6 gap-y-5 sm:grid-cols-2'>
          <div>
            <p className='text-xs text-outline'>{t('caregiver.profile.fullName')}</p>
            <p className='mt-2 text-sm font-semibold'>{t('caregiver.profile.name')}</p>
          </div>
          <div>
            <p className='text-xs text-outline'>{t('caregiver.profile.birth')}</p>
            <p className='mt-2 text-sm font-semibold'>
              {careDate('1998-05-18', i18n.resolvedLanguage ?? 'vi')} · {t('caregiver.profile.female')}
            </p>
          </div>
          {(['phone', 'email', 'address', 'bio'] as const).map((key) => (
            <div className={key === 'bio' || key === 'address' ? 'sm:col-span-2' : ''} key={key}>
              {editing ? (
                <label className='block text-xs font-medium text-on-surface-variant'>
                  {t(`caregiver.profile.${key}`)}
                  {key === 'bio' ? (
                    <textarea
                      className={fieldClass}
                      maxLength={2000}
                      onChange={(event) => setDraft({ ...draft, [key]: event.target.value })}
                      required
                      rows={4}
                      value={draft[key]}
                    />
                  ) : (
                    <input
                      autoComplete={key === 'phone' ? 'tel' : key === 'email' ? 'email' : 'street-address'}
                      className={fieldClass}
                      maxLength={key === 'phone' ? 25 : 250}
                      onChange={(event) => setDraft({ ...draft, [key]: event.target.value })}
                      required
                      type={key === 'phone' ? 'tel' : key === 'email' ? 'email' : 'text'}
                      value={draft[key]}
                    />
                  )}
                </label>
              ) : (
                <>
                  <p className='text-xs text-outline'>{t(`caregiver.profile.${key}`)}</p>
                  <p
                    className={`mt-2 whitespace-pre-wrap break-words text-sm leading-6 ${key === 'bio' ? 'rounded-xl bg-surface-container-low p-4 text-on-surface-variant' : 'font-medium'}`}
                  >
                    {displayed[key]}
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
        <div className='mt-5'>
          <h3 className='text-xs text-outline'>{t('caregiver.profile.areas')}</h3>
          <div className='mt-3 flex flex-wrap gap-2'>
            {(['district7', 'district4', 'nhaBe'] as const).map((key) => (
              <span
                className='rounded-md bg-secondary-container px-3 py-1.5 text-xs font-semibold text-primary'
                key={key}
              >
                {t(`caregiver.profile.${key}`)}
              </span>
            ))}
          </div>
          <p className='mt-3 text-xs text-outline'>
            {t('caregiver.profile.radius', { distance: new Intl.NumberFormat(i18n.resolvedLanguage).format(10) })}
          </p>
        </div>
        {error && (
          <p className='mt-4 text-sm text-error' role='alert'>
            {t(`caregiver.profile.${error}`)}
          </p>
        )}
        {notice && (
          <p className='mt-4 text-sm text-primary' role='status'>
            {t('caregiver.profile.saved')}
          </p>
        )}
        {editing && (
          <div className='mt-5 flex flex-wrap gap-3 print:hidden'>
            <button className='rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white' type='submit'>
              {t('caregiver.profile.save')}
            </button>
            <button
              className='rounded-xl border border-outline-variant/40 px-4 py-3 text-sm'
              onClick={() => {
                setEditing(false)
                setError(null)
              }}
              type='button'
            >
              {t('caregiver.profile.cancel')}
            </button>
          </div>
        )}
      </form>
    </SectionCard>
  )
}
