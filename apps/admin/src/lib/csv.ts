export interface CsvColumn<T> {
  key: string
  label: string
  /** Formats the cell for the file; defaults to `String(value)`. */
  value: (row: T) => string | number | null | undefined
}

function escapeCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  const text = String(value)
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/** Builds RFC 4180-style CSV text with a header row. */
export function toCsv<T>(rows: readonly T[], columns: ReadonlyArray<CsvColumn<T>>): string {
  const header = columns.map((column) => escapeCell(column.label)).join(',')
  const body = rows.map((row) => columns.map((column) => escapeCell(column.value(row))).join(','))
  return [header, ...body].join('\r\n')
}

/** Byte-order mark so spreadsheet apps read the UTF-8 rupee sign correctly. */
const BOM = '\uFEFF'

/** Triggers a client-side download of `text` as a CSV file. */
export function downloadCsv(filename: string, text: string): void {
  const blob = new Blob([BOM, text], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
