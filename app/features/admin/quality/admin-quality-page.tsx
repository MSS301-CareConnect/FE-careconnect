import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'
import { qualityPreview } from './quality-preview'

const key = 'admin.qualityPage' as const
const card = 'rounded-xl bg-white p-5 shadow-sm'

function csvCell(value: string | number) {
  const cell = String(value)
  return `"${(/^[=+@-]/.test(cell) ? `'${cell}` : cell).replaceAll('"', '""')}"`
}

export function AdminQualityPage() {
  const { t, i18n } = useTranslation()
  const [params, setParams] = useSearchParams()
  const get = (name: string) => params.get(name) ?? ''
  const locale = i18n.language === 'en' ? 'en-US' : 'vi-VN'
  const number = new Intl.NumberFormat(locale)
  function update(name: string, value: string) {
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      if (value && value !== 'all') next.set(name, value)
      else next.delete(name)
      if (name !== 'profile') next.delete('profile')
      return next
    })
  }
  const tab = get('tab') === 'license' || get('tab') === 'center' || get('tab') === 'interview' ? get('tab') : 'all'
  const search = get('q').trim().toLocaleLowerCase(locale)
  const filtered = qualityPreview.filter((record) => {
    const matchesSearch =
      !search ||
      [record.name, record.id, record.center, record.license].some((value) =>
        value.toLocaleLowerCase(locale).includes(search)
      )
    return (
      matchesSearch &&
      (tab === 'all' || record.stage === tab) &&
      (!get('center') || record.center === get('center')) &&
      (!get('specialty') || record.specialty === get('specialty')) &&
      (!get('risk') || record.risk === get('risk'))
    )
  })
  const selected = qualityPreview.find((record) => record.id === get('profile'))
  useDocumentTitle(t(`${key}.documentTitle`))
  function exportCsv() {
    const rows: (string | number)[][] = [
      [
        t(`${key}.columns.caregiver`),
        t(`${key}.columns.center`),
        t(`${key}.columns.license`),
        t(`${key}.columns.assessment`),
        t(`${key}.columns.status`)
      ],
      ...filtered.map((record) => [
        record.id + ' ' + record.name,
        record.center,
        record.license,
        record.clinicalScore,
        t(`${key}.statuses.${record.status}`)
      ])
    ]
    const blob = new Blob(['\uFEFF' + rows.map((row) => row.map(csvCell).join(',')).join('\r\n')], {
      type: 'text/csv;charset=utf-8'
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'admin-caregiver-quality-preview.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }
  return (
    <div className='mx-auto max-w-7xl space-y-6 px-4 py-7 sm:px-6'>
      <header className='flex flex-wrap items-start justify-between gap-5'>
        <div className='max-w-3xl'>
          <h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>{t(`${key}.title`)}</h1>
          <span className='mt-2 inline-flex rounded-full bg-secondary-container px-3 py-1 text-xs font-semibold text-primary'>
            {t(`${key}.tier`)}
          </span>
          <p className='mt-2 text-sm leading-6 text-on-surface-variant'>{t(`${key}.subtitle`)}</p>
          <p className='mt-2 text-xs font-semibold text-error'>{t(`${key}.sample`)}</p>
        </div>
        <div className='flex flex-wrap gap-2'>
          <button
            className='rounded-lg bg-surface-container-low px-3 py-2 text-sm font-semibold opacity-50'
            disabled
            title={t(`${key}.unavailable`)}
            type='button'
          >
            {t(`${key}.standards`)}
          </button>
          <button
            className='inline-flex items-center gap-2 rounded-lg bg-surface-container-low px-3 py-2 text-sm font-semibold disabled:opacity-50'
            disabled={!filtered.length}
            onClick={exportCsv}
            type='button'
          >
            <Icon name='description' />
            {t(`${key}.export`)}
          </button>
          <button
            className='rounded-lg bg-surface-container-low px-3 py-2 text-sm font-semibold opacity-50'
            disabled
            title={t(`${key}.unavailable`)}
            type='button'
          >
            {t(`${key}.history`)}
          </button>
        </div>
      </header>
      <section aria-label={t(`${key}.metrics.urgent`)} className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {(
          [
            ['urgent', 14, 'pending_actions'],
            ['approved', 128, 'verified'],
            ['review', 6, 'contact_support'],
            ['rejected', 2, 'gavel']
          ] as const
        ).map(([name, value, icon]) => (
          <div className={card} key={name}>
            <div className='flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-outline'>
              <span>{t(`${key}.metrics.${name}`)}</span>
              <Icon className='text-xl text-primary' name={icon} />
            </div>
            <strong className='mt-5 block text-3xl tabular-nums'>{number.format(value)}</strong>
            <p className='mt-2 text-xs text-on-surface-variant'>{t(`${key}.metricHints.${name}`)}</p>
          </div>
        ))}
      </section>
      <section className='rounded-xl bg-secondary-container/25 p-5'>
        <div className='flex items-start gap-2'>
          <Icon className='text-2xl text-primary' name='security' />
          <div>
            <h2 className='font-bold text-primary'>{t(`${key}.process`)}</h2>
            <p className='mt-1 text-sm text-on-surface-variant'>{t(`${key}.processHint`)}</p>
          </div>
        </div>
        <ol className='mt-5 grid gap-3 md:grid-cols-3'>
          {(['center', 'license', 'admin'] as const).map((step, index) => (
            <li className='flex items-center gap-3 rounded-lg bg-white p-3' key={step}>
              <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white'>
                {index + 1}
              </span>
              <strong className='text-sm'>{t(`${key}.steps.${step}`)}</strong>
            </li>
          ))}
        </ol>
      </section>
      <section className={`${card} space-y-4`}>
        <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
          <label className='text-xs font-semibold text-on-surface-variant'>
            {t(`${key}.search`)}
            <input
              className='mt-1 block w-full rounded-lg bg-surface-container-low p-2.5 text-sm'
              onChange={(event) => update('q', event.target.value)}
              placeholder={t(`${key}.search`)}
              type='search'
              value={get('q')}
            />
          </label>
          <label className='text-xs font-semibold text-on-surface-variant'>
            {t(`${key}.center`)}
            <select
              className='mt-1 block w-full rounded-lg bg-surface-container-low p-2.5 text-sm'
              onChange={(event) => update('center', event.target.value)}
              value={get('center') || 'all'}
            >
              <option value='all'>{t(`${key}.all`)}</option>
              {qualityPreview.map((record) => (
                <option key={record.id} value={record.center}>
                  {record.center}
                </option>
              ))}
            </select>
          </label>
          <label className='text-xs font-semibold text-on-surface-variant'>
            {t(`${key}.specialty`)}
            <select
              className='mt-1 block w-full rounded-lg bg-surface-container-low p-2.5 text-sm'
              onChange={(event) => update('specialty', event.target.value)}
              value={get('specialty') || 'all'}
            >
              <option value='all'>{t(`${key}.all`)}</option>
              {(['general', 'rehab', 'elderly'] as const).map((item) => (
                <option key={item} value={item}>
                  {t(`${key}.specialties.${item}`)}
                </option>
              ))}
            </select>
          </label>
          <label className='text-xs font-semibold text-on-surface-variant'>
            {t(`${key}.risk`)}
            <select
              className='mt-1 block w-full rounded-lg bg-surface-container-low p-2.5 text-sm'
              onChange={(event) => update('risk', event.target.value)}
              value={get('risk') || 'all'}
            >
              <option value='all'>{t(`${key}.all`)}</option>
              {(['low', 'medium', 'high'] as const).map((item) => (
                <option key={item} value={item}>
                  {t(`${key}.risks.${item}`)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className='flex flex-wrap gap-2' role='tablist' aria-label={t('admin.quality')}>
          {(['all', 'license', 'center', 'interview'] as const).map((item) => (
            <button
              aria-selected={tab === item}
              className={`rounded-lg px-3 py-2 text-sm font-semibold ${tab === item ? 'bg-primary text-white' : 'bg-surface-container-low text-on-surface-variant'}`}
              key={item}
              onClick={() => update('tab', item)}
              role='tab'
              type='button'
            >
              {t(`${key}.tabs.${item}`)}
            </button>
          ))}
        </div>
      </section>
      <section className='overflow-hidden rounded-xl bg-white shadow-sm'>
        <div className='flex items-center justify-between gap-3 px-5 py-4'>
          <h2 className='text-lg font-bold'>{t(`${key}.tabs.all`)}</h2>
          <span className='text-xs text-outline'>{t(`${key}.results`, { count: filtered.length })}</span>
        </div>
        <div className='max-h-[70vh] overflow-x-auto'>
          <table className='w-full min-w-[1120px] text-left text-sm'>
            <thead className='sticky top-0 z-10 bg-surface-container-low text-xs uppercase tracking-wide text-on-surface-variant'>
              <tr>
                {(['caregiver', 'center', 'license', 'background', 'assessment', 'status', 'actions'] as const).map(
                  (column) => (
                    <th className='px-4 py-3' key={column} scope='col'>
                      {t(`${key}.columns.${column}`)}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className='divide-y divide-outline-variant/25'>
              {filtered.map((record) => (
                <tr className='align-top hover:bg-surface-container-low/40' key={record.id}>
                  <td className='px-4 py-4'>
                    <button
                      className='text-left font-bold hover:text-primary'
                      onClick={() => update('profile', record.id)}
                      type='button'
                    >
                      {record.name}
                    </button>
                    <small className='mt-1 block text-outline'>
                      {record.id} · {t(`${key}.age`, { count: record.age })}
                    </small>
                    <small className='mt-1 block text-outline'>{t(`${key}.specialties.${record.specialty}`)}</small>
                  </td>
                  <td className='px-4 py-4'>
                    <strong className='block max-w-40 text-xs leading-5'>{record.center}</strong>
                    <small className='mt-1 block text-outline'>{t(`${key}.centerSignoff`)}</small>
                  </td>
                  <td className='px-4 py-4'>
                    <strong className='block'>
                      {t(`${key}.licenseId`)}: {record.license}
                    </strong>
                    <small
                      className={`mt-1 block text-xs ${record.licenseState === 'mismatch' ? 'text-error' : 'text-primary'}`}
                    >
                      {t(`${key}.licenseStates.${record.licenseState}`)}
                    </small>
                  </td>
                  <td className='px-4 py-4'>
                    <span className='text-xs text-on-surface-variant'>{t(`${key}.backgroundSample`)}</span>
                  </td>
                  <td className='px-4 py-4'>
                    <strong>{t(`${key}.clinicalScore`, { score: record.clinicalScore })}</strong>
                    <small className='mt-1 block text-outline'>{t(`${key}.risks.${record.risk}`)}</small>
                  </td>
                  <td className='px-4 py-4'>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${record.status === 'discrepancy' ? 'bg-error-container text-on-error-container' : 'bg-secondary-container/40 text-primary'}`}
                    >
                      {t(`${key}.statuses.${record.status}`)}
                    </span>
                    <small className='mt-2 block text-outline'>
                      {t(`${key}.reviewProgress`, { value: record.progress })}
                    </small>
                  </td>
                  <td className='px-4 py-4'>
                    <div className='flex flex-col gap-2'>
                      <button
                        className='rounded-lg bg-surface-container-low px-2 py-1 text-xs font-semibold text-primary'
                        onClick={() => update('profile', record.id)}
                        type='button'
                      >
                        {t(`${key}.actions.details`)}
                      </button>
                      <button
                        className='rounded-lg bg-primary px-2 py-1 text-xs font-semibold text-white opacity-50'
                        disabled
                        title={t(`${key}.unavailable`)}
                        type='button'
                      >
                        {t(`${key}.actions.${record.status === 'discrepancy' ? 'review' : 'approve'}`)}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filtered.length && <p className='p-8 text-center text-sm text-outline'>{t(`${key}.empty`)}</p>}
        <div className='flex items-center justify-between border-t border-outline-variant/25 px-5 py-3 text-sm'>
          <button className='text-primary disabled:opacity-40' disabled type='button'>
            {t(`${key}.previous`)}
          </button>
          <span>{t(`${key}.page`, { page: 1, pages: 1 })}</span>
          <button className='text-primary disabled:opacity-40' disabled type='button'>
            {t(`${key}.next`)}
          </button>
        </div>
      </section>
      <section className='grid gap-4 lg:grid-cols-3'>
        <div className={card}>
          <h2 className='font-bold'>{t(`${key}.diagnostics`)}</h2>
          <p className='mt-2 text-sm leading-6 text-on-surface-variant'>{t(`${key}.diagnosticsHint`)}</p>
          <dl className='mt-4 space-y-2'>
            {(['identity', 'license', 'revoke'] as const).map((row) => (
              <div className='flex justify-between gap-3 border-b border-outline-variant/25 py-2 text-xs' key={row}>
                <dt>{t(`${key}.diagnosticsRows.${row}`)}</dt>
                <dd className='text-right text-outline'>{t(`${key}.diagnosticsValue`)}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className={card}>
          <h2 className='font-bold'>{t(`${key}.clinical`)}</h2>
          <Icon className='my-5 text-4xl text-primary' name='video_call' />
          <p className='text-sm leading-6 text-on-surface-variant'>{t(`${key}.clinicalHint`)}</p>
          <button
            className='mt-4 rounded-lg bg-surface-container-low px-3 py-2 text-sm font-semibold opacity-50'
            disabled
            title={t(`${key}.unavailable`)}
            type='button'
          >
            {t(`${key}.call`)}
          </button>
        </div>
        <div className={card}>
          <h2 className='font-bold'>{t(`${key}.guarantor`)}</h2>
          <Icon className='my-5 text-4xl text-primary' name='handshake' />
          <p className='text-sm leading-6 text-on-surface-variant'>{t(`${key}.guarantorHint`)}</p>
        </div>
      </section>
      {selected && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-on-surface/50 p-4'
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) update('profile', '')
          }}
          role='presentation'
        >
          <section
            aria-label={t(`${key}.previewTitle`)}
            aria-modal='true'
            className='w-full max-w-xl rounded-xl bg-white p-6 shadow-xl'
            role='dialog'
          >
            <div className='flex items-start justify-between gap-4'>
              <div>
                <h2 className='text-xl font-bold'>{t(`${key}.previewTitle`)}</h2>
                <p className='mt-1 text-sm text-outline'>
                  {selected.name} · {selected.id}
                </p>
              </div>
              <button
                aria-label={t(`${key}.close`)}
                className='rounded-lg p-1 text-outline hover:bg-surface-container-low'
                onClick={() => update('profile', '')}
                type='button'
              >
                <Icon name='close' />
              </button>
            </div>
            <p className='mt-4 rounded-lg bg-surface-container-low p-3 text-sm text-on-surface-variant'>
              {t(`${key}.previewHint`)}
            </p>
            <dl className='mt-4 space-y-3 text-sm'>
              {(
                [
                  [t(`${key}.center`), selected.center],
                  [t(`${key}.licenseId`), selected.license],
                  [t(`${key}.specialty`), t(`${key}.specialties.${selected.specialty}`)],
                  [t(`${key}.status`), t(`${key}.statuses.${selected.status}`)]
                ] as const
              ).map(([label, value]) => (
                <div className='flex justify-between gap-3 border-b border-outline-variant/25 pb-2' key={label}>
                  <dt className='text-outline'>{label}</dt>
                  <dd className='text-right font-semibold'>{value}</dd>
                </div>
              ))}
            </dl>
            <p className='mt-4 text-sm text-on-surface-variant'>{t(`${key}.candidateNotes.${selected.note}`)}</p>
            <div className='mt-5 text-right'>
              <button
                className='rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white'
                onClick={() => update('profile', '')}
                type='button'
              >
                {t(`${key}.close`)}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
