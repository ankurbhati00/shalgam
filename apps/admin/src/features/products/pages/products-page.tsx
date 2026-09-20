import { PageHeader } from '../../../components/page-header'
import { ProductsTable } from '../components/products-table'

export function ProductsPage() {
  return (
    <>
      <PageHeader
        title="Products"
        description="The full catalog across every status. Drafts and archived items are hidden from shoppers."
      />
      <ProductsTable />
    </>
  )
}

export const route = {
  Component: ProductsPage,
  handle: { title: 'Products' },
}
