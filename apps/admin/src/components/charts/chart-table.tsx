import { cn } from '@shalgam/ui'

export type ChartCellValue = string | number | null

export interface ChartTableColumn {
  key: string
  label: string
  format?: (value: ChartCellValue) => string
}

export interface ChartTableData {
  caption: string
  columns: ChartTableColumn[]
  /** Any row objects; cells are read by column key and shown when string or number. */
  rows: readonly object[]
}

function cellValue(row: object, key: string): ChartCellValue {
  const raw = (row as Record<string, unknown>)[key]
  return typeof raw === 'string' || typeof raw === 'number' ? raw : null
}

/**
 * The WCAG-clean twin of a chart: a real table with the same numbers.
 * Visually hidden by default so screen-reader users get the data, not a picture.
 */
export function ChartTable({
  data,
  visible = false,
  className,
}: {
  data: ChartTableData
  visible?: boolean
  className?: string
}) {
  return (
    <div className={cn(visible ? 'overflow-x-auto' : 'sr-only', className)}>
      <table className="w-full text-sm">
        <caption className="text-start text-xs font-medium text-text-muted">{data.caption}</caption>
        <thead>
          <tr>
            {data.columns.map((column) => (
              <th key={column.key} scope="col" className="px-2 py-1 text-start font-semibold">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, index) => (
            <tr key={index}>
              {data.columns.map((column) => {
                const value = cellValue(row, column.key)
                return (
                  <td key={column.key} className="px-2 py-1">
                    {column.format ? column.format(value) : (value ?? '—')}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
