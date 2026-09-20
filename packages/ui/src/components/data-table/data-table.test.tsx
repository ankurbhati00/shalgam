import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { RowSelectionState } from '@tanstack/react-table'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'

import {
  DataTable,
  DataTablePagination,
  DataTableSelectionBar,
  createDataTableColumnHelper,
  selectionColumn,
  useDataTable,
} from './index'

interface Row {
  id: string
  name: string
  amount: number
}

const rows: Row[] = [
  { id: 'a', name: 'Atta', amount: 249 },
  { id: 'b', name: 'Basmati', amount: 145 },
  { id: 'c', name: 'Curd', amount: 38 },
]

const helper = createDataTableColumnHelper<Row>()
const columns = helper.columns([
  selectionColumn<Row>(),
  helper.accessor('name', { header: 'Product' }),
  helper.accessor('amount', { header: 'Amount', meta: { align: 'end', numeric: true } }),
])

function Harness({ data = rows, loading = false }: { data?: Row[]; loading?: boolean }) {
  const [selection, setSelection] = useState<RowSelectionState>({})
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableRowSelection: true,
    rowSelection: selection,
    onRowSelectionChange: setSelection,
    initialState: { pagination: { pageIndex: 0, pageSize: 2 } },
  })
  return (
    <div>
      <DataTableSelectionBar table={table}>
        <button type="button">Archive</button>
      </DataTableSelectionBar>
      <DataTable table={table} loading={loading} caption="Products" />
      <DataTablePagination table={table} />
    </div>
  )
}

describe('DataTable', () => {
  it('sorts by clicking a header and exposes aria-sort', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    const header = screen.getByRole('columnheader', { name: /amount/i })
    expect(header).toHaveAttribute('aria-sort', 'none')
    // Numeric columns sort descending first (largest amounts on top), then ascending.
    await user.click(within(header).getByRole('button'))
    expect(header).toHaveAttribute('aria-sort', 'descending')
    expect(screen.getAllByRole('row')[1]?.querySelectorAll('td')[1]).toHaveTextContent('Atta')
    await user.click(within(header).getByRole('button'))
    expect(header).toHaveAttribute('aria-sort', 'ascending')
    expect(screen.getAllByRole('row')[1]?.querySelectorAll('td')[1]).toHaveTextContent('Curd')
  })

  it('selects rows and shows the bulk-action bar', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    expect(screen.queryByRole('region', { name: /bulk actions/i })).not.toBeInTheDocument()
    await user.click(screen.getAllByRole('checkbox', { name: /select row/i })[0]!)
    const bar = screen.getByRole('region', { name: /bulk actions/i })
    expect(bar).toHaveTextContent('1 selected')
    await user.click(screen.getByRole('checkbox', { name: /select all rows on this page/i }))
    expect(bar).toHaveTextContent('2 selected')
    await user.click(within(bar).getByRole('button', { name: /clear/i }))
    expect(screen.queryByRole('region', { name: /bulk actions/i })).not.toBeInTheDocument()
  })

  it('paginates and reports the visible range', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    expect(screen.getByText('1–2 of 3')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /next page/i }))
    expect(screen.getByText('3–3 of 3')).toBeInTheDocument()
  })

  it('renders skeleton rows while loading and an empty state without data', () => {
    const { rerender } = render(<Harness data={[]} loading />)
    expect(screen.getByRole('table')).toHaveAttribute('aria-busy')
    rerender(<Harness data={[]} />)
    expect(screen.getByText(/nothing here yet/i)).toBeInTheDocument()
  })
})
