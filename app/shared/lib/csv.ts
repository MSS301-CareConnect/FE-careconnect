/** One quoted CSV cell; a value starting with = + @ - gets a leading quote so a spreadsheet never runs it as a formula. */
export function csvCell(value: string | number) {
  const cell = String(value)
  return `"${(/^[=+@-]/.test(cell) ? `'${cell}` : cell).replaceAll('"', '""')}"`
}

/** Saves rows as a UTF-8 CSV (with BOM, so Excel reads Vietnamese) through a temporary download link. */
export function downloadCsv(fileName: string, rows: ReadonlyArray<ReadonlyArray<string | number>>) {
  const blob = new Blob(['﻿' + rows.map((row) => row.map(csvCell).join(',')).join('\r\n')], {
    type: 'text/csv;charset=utf-8'
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}
