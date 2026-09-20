import type { Report, ReportColumn, ReportRow } from '@shalgam/types'
import {
  Button,
  createDataTableColumnHelper,
  DataTable,
  DataTablePagination,
  DataTableToolbar,
  ErrorState,
  Select,
  Skeleton,
  StatCard,
  Tab,
  Tabs,
  TabsList,
  Text,
  useDataTable,
} from '@shalgam/ui'
import { formatDate, formatDateTime } from '@shalgam/utils'
import { Download } from 'lucide-react'
import { useMemo } from 'react'

import { DateRangeFilter } from '../../../components/filters/date-range-filter'
import { FilterBar } from '../../../components/filters/filter-bar'
import { PageHeader } from '../../../components/page-header'
import { downloadCsv, toCsv } from '../../../lib/csv'
import { formatByKind } from '../../../lib/format'
import { useCategoryOptions } from '../../categories/hooks/use-category-options'
import { useReport } from '../api/queries'
import { REPORT_TYPES, useReportParams } from '../hooks/use-report-params'

interface IndexedRow {
  rowId: string
  data: ReportRow
}

const helper = createDataTableColumnHelper<IndexedRow>()

function formatCell(value: string | number | null | undefined, column: ReportColumn): string {
  return formatByKind(value, column.format, (iso) =>
    column.key === 'date' ? formatDate(iso) : formatDateTime(iso),
  )
}

function buildColumns(columns: ReportColumn[]) {
  return helper.columns(
    columns.map((column) =>
      helper.accessor((row) => row.data[column.key] ?? null, {
        id: column.key,
        header: column.label,
        cell: (info) => formatCell(info.getValue(), column),
        meta: { align: column.align ?? 'start', numeric: column.format !== 'text' },
      }),
    ),
  )
}

function exportReport(report: Report) {
  const csv = toCsv(
    report.rows,
    report.columns.map((column) => ({
      key: column.key,
      label: column.label,
      value: (row: ReportRow) => row[column.key],
    })),
  )
  downloadCsv(
    `shalgam-${report.type}-report-${report.range.from.slice(0, 10)}-to-${report.range.to.slice(0, 10)}`,
    csv,
  )
}

function ReportTable({ report }: { report: Report }) {
  const columns = useMemo(() => buildColumns(report.columns), [report.columns])
  const rows = useMemo<IndexedRow[]>(
    () => report.rows.map((data, index) => ({ rowId: String(index), data })),
    [report.rows],
  )
  const table = useDataTable({
    data: rows,
    columns,
    getRowId: (row) => row.rowId,
    initialState: { pagination: { pageIndex: 0, pageSize: 20 } },
  })
  return (
    <div className="space-y-3">
      <DataTable table={table} density="compact" caption={report.title} />
      <DataTablePagination table={table} />
    </div>
  )
}

export function ReportsPage() {
  const filters = useReportParams()
  const { options: categoryOptions } = useCategoryOptions()
  const { data: report, isPending, isFetching, isError, refetch } = useReport(filters.params)
  const current = REPORT_TYPES.find((option) => option.value === filters.type)

  return (
    <>
      <PageHeader
        title="Reports"
        description={current?.description}
        actions={
          <Button
            leadingIcon={<Download />}
            disabled={!report || report.rows.length === 0}
            onClick={() => report && exportReport(report)}
          >
            Export CSV
          </Button>
        }
      >
        <Tabs
          value={filters.type}
          onValueChange={(value) => {
            const next = REPORT_TYPES.find((option) => option.value === value)
            if (next) filters.setType(next.value)
          }}
        >
          <TabsList aria-label="Report type" scrollable>
            {REPORT_TYPES.map((option) => (
              <Tab key={option.value} value={option.value}>
                {option.label}
              </Tab>
            ))}
          </TabsList>
        </Tabs>
        <FilterBar>
          <DateRangeFilter
            choice={filters.choice}
            range={filters.range}
            onChange={filters.setRange}
          />
          <Select
            aria-label="Category"
            size="sm"
            className="w-48"
            options={[{ value: '__all', label: 'All categories' }, ...categoryOptions]}
            value={filters.categoryId ?? '__all'}
            onValueChange={(value) =>
              filters.setCategory(value && value !== '__all' ? value : null)
            }
          />
          {filters.type === 'inventory' && (
            <Text as="span" size="xs" tone="muted">
              Inventory is a snapshot; the date range does not apply.
            </Text>
          )}
        </FilterBar>
      </PageHeader>

      {isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : (
        <div
          className={isFetching && report ? 'space-y-4 opacity-70 transition-opacity' : 'space-y-4'}
          aria-busy={isFetching || undefined}
        >
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {isPending
              ? Array.from({ length: 4 }, (_, index) => (
                  <StatCard
                    key={index}
                    label={<Skeleton shape="text" className="w-24" />}
                    value=""
                    loading
                  />
                ))
              : report.summary.map((item) => (
                  <StatCard
                    key={item.label}
                    label={item.label}
                    value={formatByKind(item.value, item.format, formatDate)}
                  />
                ))}
          </div>
          {isPending ? (
            <Skeleton className="h-96 rounded-xl" />
          ) : (
            <>
              <DataTableToolbar>
                <Text size="sm" tone="muted">
                  {report.title} · {formatDate(report.range.from)} – {formatDate(report.range.to)} ·
                  generated {formatDateTime(report.generatedAt)}
                </Text>
              </DataTableToolbar>
              <ReportTable key={`${report.type}-${report.generatedAt}`} report={report} />
            </>
          )}
        </div>
      )}
    </>
  )
}

export const route = {
  Component: ReportsPage,
  handle: { title: 'Reports' },
}
