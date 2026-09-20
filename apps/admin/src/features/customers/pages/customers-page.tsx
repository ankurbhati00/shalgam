import { PageHeader } from '../../../components/page-header'
import { CustomersTable } from '../components/customers-table'

export function CustomersPage() {
  return (
    <>
      <PageHeader
        title="Customers"
        description="Everyone who has shopped with Shalgam, with lifetime value and recency."
      />
      <CustomersTable />
    </>
  )
}

export const route = {
  Component: CustomersPage,
  handle: { title: 'Customers' },
}
