import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'
import { customersPreview, featuredCustomer } from './customers-preview'

const key = 'admin.customersPage' as const
const card = 'rounded-xl bg-white p-5 shadow-sm'

export function AdminCustomerDetailPage() {
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const [noteDraft, setNoteDraft] = useState('')
  const customer = customersPreview.find((entry) => entry.id === id)
  const featured = customer?.id === featuredCustomer.id
  const locale = i18n.language === 'en' ? 'en-US' : 'vi-VN'
  const date = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh'
  })
  const datetime = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh'
  })
  const money = new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
  useDocumentTitle(t(`${key}.detailTitle`))

  if (!customer)
    return (
      <div className='mx-auto max-w-7xl space-y-4 px-4 py-10 sm:px-6'>
        <Link className='text-sm font-semibold text-primary' to='/admin/customers'>
          {t(`${key}.back`)}
        </Link>
        <p className={card}>{t(`${key}.unknown`)}</p>
      </div>
    )

  return (
    <div className='mx-auto max-w-7xl space-y-6 px-4 py-7 sm:px-6'>
      <Link
        className='inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm'
        to='/admin/customers'
      >
        <Icon name='arrow_back' />
        {t(`${key}.back`)}
      </Link>
      <section className={`${card} flex flex-wrap items-center justify-between gap-6`}>
        <div className='flex min-w-0 flex-wrap items-center gap-5'>
          <div className='flex h-24 w-24 items-center justify-center rounded-full bg-secondary-container text-3xl font-bold text-primary'>
            {customer.name
              .split(' ')
              .slice(-2)
              .map((part) => part[0])
              .join('')}
          </div>
          <div>
            <div className='flex flex-wrap items-center gap-2'>
              <h1 className='text-2xl font-bold'>{customer.name}</h1>
              <span
                className={`rounded-full px-2 py-1 text-xs font-semibold ${customer.status === 'active' ? 'bg-secondary-container text-primary' : 'bg-error-container text-on-error-container'}`}
              >
                {t(`${key}.statuses.${customer.status}`)}
              </span>
            </div>
            <p className='mt-2 text-sm text-on-surface-variant'>
              {t(`${key}.customerId`)}: <strong>#{customer.id}</strong> · {t(`${key}.joined`)}:{' '}
              {date.format(new Date(`${customer.joinedAt}T00:00:00+07:00`))}
            </p>
            <p className='mt-1 text-sm text-on-surface-variant'>
              {t(`${key}.lastActivity`)}: {datetime.format(new Date(customer.recentAt))}
            </p>
            <p className='mt-2 text-xs font-semibold text-primary'>{t(`${key}.sample`)}</p>
          </div>
        </div>
        <div className='flex flex-wrap gap-2'>
          {(['notify', 'resetPassword', 'security'] as const).map((action) => (
            <button
              className='inline-flex items-center gap-1 rounded-lg bg-surface-container px-3 py-2 text-xs font-semibold text-on-surface-variant disabled:opacity-60'
              disabled
              key={action}
              title={t(`${key}.unavailable`)}
              type='button'
            >
              <Icon
                className='text-base'
                name={action === 'notify' ? 'mail' : action === 'security' ? 'lock' : 'key'}
              />
              {t(`${key}.${action}`)}
            </button>
          ))}
        </div>
      </section>
      <section aria-label={t(`${key}.kpis.spent`)} className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {(
          [
            ['spent', money.format(customer.spentUsd), 'payments'],
            ['bookings', String(customer.bookings), 'calendar_month'],
            ['patients', String(customer.patients).padStart(2, '0'), 'family_restroom'],
            ['rating', featured ? '4.9 / 5.0' : '—', 'star']
          ] as const
        ).map(([name, value, icon]) => (
          <div className={card} key={name}>
            <div className='flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-outline'>
              <span>{t(`${key}.kpis.${name}`)}</span>
              <Icon className='text-xl text-primary' name={icon} />
            </div>
            <p className='mt-4 text-2xl font-bold'>{value}</p>
          </div>
        ))}
      </section>
      <div className='grid items-start gap-6 lg:grid-cols-[minmax(280px,1fr)_minmax(0,2fr)]'>
        <div className='space-y-6'>
          <section className={card}>
            <h2 className='mb-4 flex items-center gap-2 text-lg font-bold'>
              <Icon className='text-primary' name='contact_page' />
              {t(`${key}.profile`)}
            </h2>
            <dl className='space-y-4 text-sm'>
              {(
                [
                  ['name', customer.name],
                  ['phone', customer.phone],
                  ['email', customer.email],
                  ['region', t(`${key}.regionOptions.${customer.region}`)],
                  ...(featured ? [['address', featuredCustomer.address]] : [])
                ] as [string, string][]
              ).map(([label, value]) => (
                <div className='border-b border-outline-variant/20 pb-3 last:border-0' key={label}>
                  <dt className='text-xs text-outline'>
                    {t(`${key}.${label as 'name' | 'phone' | 'email' | 'region' | 'address'}`)}
                  </dt>
                  <dd className='mt-1 break-words font-semibold'>{value}</dd>
                </div>
              ))}
            </dl>
          </section>
          {featured && (
            <>
              <section className={card}>
                <h2 className='text-lg font-bold'>{t(`${key}.payment`)}</h2>
                <p className='mt-2 text-xs text-outline'>{t(`${key}.paymentSample`)}</p>
                <div className='mt-4 space-y-3 text-sm'>
                  <p className='rounded-lg bg-surface-container-low p-3 font-semibold'>{t(`${key}.visaSample`)}</p>
                  <p className='rounded-lg bg-surface-container-low p-3 font-semibold'>{t(`${key}.momoSample`)}</p>
                </div>
              </section>
              <section className={card}>
                <h2 className='text-lg font-bold'>{t(`${key}.notes`)}</h2>
                <p className='mt-2 text-xs text-outline'>{t(`${key}.notesHint`)}</p>
                <blockquote className='mt-4 rounded-lg border-l-4 border-primary bg-surface-container-low p-4 text-sm leading-6'>
                  {t(`${key}.sampleNote`)}
                </blockquote>
                <textarea
                  aria-label={t(`${key}.notesPlaceholder`)}
                  className='mt-4 min-h-24 w-full rounded-lg border border-outline-variant/50 p-3 text-sm'
                  onChange={(event) => setNoteDraft(event.target.value)}
                  placeholder={t(`${key}.notesPlaceholder`)}
                  value={noteDraft}
                />
                <button
                  className='mt-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50'
                  disabled
                  title={t(`${key}.unavailable`)}
                  type='button'
                >
                  {t(`${key}.saveNote`)}
                </button>
                <p className='mt-2 text-xs text-outline'>{t(`${key}.notesLocal`)}</p>
              </section>
            </>
          )}
        </div>
        <div className='space-y-6'>
          {featured ? (
            <>
              <section className={card}>
                <div className='flex flex-wrap items-center justify-between gap-3'>
                  <div>
                    <h2 className='text-lg font-bold'>{t(`${key}.patients`)}</h2>
                    <p className='mt-1 text-xs text-outline'>{t(`${key}.patientsHint`)}</p>
                  </div>
                  <button
                    className='rounded-lg bg-secondary-container/50 px-3 py-2 text-xs font-semibold text-primary disabled:opacity-50'
                    disabled
                    title={t(`${key}.unavailable`)}
                    type='button'
                  >
                    {t(`${key}.addPatient`)}
                  </button>
                </div>
                <div className='mt-4 grid gap-3'>
                  {featuredCustomer.patients.map((patient) => (
                    <article className='rounded-lg bg-surface-container-low p-4' key={patient.name}>
                      <div className='flex items-center justify-between gap-2'>
                        <h3 className='font-bold'>{patient.name}</h3>
                        <span className='text-xs text-outline'>
                          {t(`${key}.completedCount`, { count: patient.bookings })}
                        </span>
                      </div>
                      <p className='mt-1 text-xs text-outline'>
                        {patient.age} · {t(`${key}.relations.${patient.relation}`)}
                      </p>
                      <p className='mt-3 text-xs font-semibold text-on-surface-variant'>{t(`${key}.patientHistory`)}</p>
                      <p className='mt-1 text-sm leading-6'>{t(`${key}.histories.${patient.history}`)}</p>
                      <button
                        className='mt-3 text-xs font-semibold text-primary disabled:opacity-50'
                        disabled
                        title={t(`${key}.unavailable`)}
                        type='button'
                      >
                        {t(`${key}.viewPatient`)}
                      </button>
                    </article>
                  ))}
                </div>
              </section>
              <section className={card}>
                <h2 className='text-lg font-bold'>{t(`${key}.recentBookings`)}</h2>
                <p className='mt-1 text-xs text-outline'>{t(`${key}.recentBookingsHint`)}</p>
                <div className='mt-4 overflow-x-auto'>
                  <table className='w-full min-w-[650px] text-left text-xs'>
                    <thead className='bg-surface-container-low text-on-surface-variant'>
                      <tr>
                        {(['code', 'patient', 'caregiver', 'time', 'cost', 'status'] as const).map((column) => (
                          <th className='px-3 py-3' key={column} scope='col'>
                            {t(`${key}.bookingColumns.${column}`)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-outline-variant/25'>
                      {featuredCustomer.bookings.map((booking) => (
                        <tr key={booking.id}>
                          <td className='px-3 py-4'>
                            <strong>#{booking.id}</strong>
                            <small className='mt-1 block text-outline'>{t(`${key}.services.${booking.service}`)}</small>
                          </td>
                          <td className='px-3 py-4'>{booking.patient}</td>
                          <td className='px-3 py-4'>{booking.caregiver}</td>
                          <td className='px-3 py-4'>{datetime.format(new Date(booking.at))}</td>
                          <td className='px-3 py-4'>{money.format(booking.amount)}</td>
                          <td className='px-3 py-4'>
                            <span className='rounded-full bg-secondary-container/50 px-2 py-1 text-primary'>
                              {t(`${key}.bookingStatuses.${booking.status}`)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
              <section className={card}>
                <h2 className='text-lg font-bold'>{t(`${key}.audit`)}</h2>
                <p className='mt-1 text-xs text-outline'>{t(`${key}.auditHint`)}</p>
                <ol className='mt-4 space-y-4 border-l-2 border-secondary-container pl-4'>
                  {featuredCustomer.audit.map((entry) => (
                    <li className='relative text-sm' key={entry.at}>
                      <Icon className='mr-2 text-lg text-primary' name={entry.icon} />
                      <span>{t(`${key}.auditEntries.${entry.text}`)}</span>
                      <time className='mt-1 block text-xs text-outline' dateTime={entry.at}>
                        {datetime.format(new Date(entry.at))}
                      </time>
                    </li>
                  ))}
                </ol>
              </section>
            </>
          ) : (
            <section className={card}>
              <h2 className='text-lg font-bold'>{t(`${key}.patients`)}</h2>
              <p className='mt-3 text-sm text-on-surface-variant'>{t(`${key}.noExtra`)}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
