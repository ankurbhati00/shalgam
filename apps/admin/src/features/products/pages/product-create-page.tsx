import { useNavigate } from 'react-router'

import { PageHeader } from '../../../components/page-header'
import { ProductForm } from '../components/product-form'

export function ProductCreatePage() {
  const navigate = useNavigate()
  return (
    <>
      <PageHeader
        title="New product"
        description="Fill in the basics, set a price and decide whether it goes live right away."
      />
      <ProductForm
        onSaved={() => void navigate('/products')}
        onCancel={() => void navigate('/products')}
      />
    </>
  )
}

export const route = {
  Component: ProductCreatePage,
  handle: { title: 'New product', parent: { label: 'Products', to: '/products' } },
}
