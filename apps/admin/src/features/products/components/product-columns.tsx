import type { Product } from '@shalgam/types'
import { Badge, createDataTableColumnHelper, Price, ProductImage, StatusBadge } from '@shalgam/ui'
import { formatNumber } from '@shalgam/utils'
import { Star } from 'lucide-react'
import { Link } from 'react-router'

import { RelativeTime } from '../../../components/relative-time'
import { productStatusMap } from '../../../components/status-maps'
import { CategoryName } from '../../categories/components/category-name'
import { ProductActionsMenu } from './product-actions-menu'

const helper = createDataTableColumnHelper<Product>()

export const productColumns = helper.columns([
  helper.accessor('name', {
    header: 'Product',
    cell: (info) => {
      const product = info.row.original
      return (
        <span className="flex min-w-0 items-center gap-3">
          <ProductImage src={product.imageUrl} alt="" className="size-9 shrink-0" rounded="md" />
          <span className="min-w-0">
            <Link
              to={`/products/${product.id}/edit`}
              className="block truncate rounded-xs font-medium text-text focus-ring hover:text-primary-strong hover:underline"
            >
              {product.name}
            </Link>
            <span className="block truncate text-xs text-text-muted">
              {product.brand} · {product.unit}
            </span>
          </span>
        </span>
      )
    },
    meta: { width: '18rem' },
  }),
  helper.accessor('categoryId', {
    header: 'Category',
    enableSorting: false,
    cell: (info) => (
      <span className="flex flex-col text-sm">
        <span className="text-text">
          <CategoryName id={info.getValue()} />
        </span>
        <span className="text-xs text-text-muted">
          <CategoryName id={info.row.original.subcategoryId} />
        </span>
      </span>
    ),
    meta: { hideBelow: 'md' },
  }),
  helper.accessor('price', {
    header: 'Price',
    cell: (info) => <Price amount={info.getValue()} mrp={info.row.original.mrp} size="sm" />,
    meta: { align: 'end', numeric: true },
  }),
  helper.accessor('stock', {
    header: 'Stock',
    cell: (info) => {
      const stock = info.getValue()
      if (stock === 0)
        return (
          <Badge tone="danger" size="sm">
            Out
          </Badge>
        )
      return (
        <span className={stock <= 15 ? 'font-medium text-warning-text' : undefined}>
          {formatNumber(stock)}
        </span>
      )
    },
    meta: { align: 'end', numeric: true, width: '5rem' },
  }),
  helper.accessor((row) => row.rating.average, {
    id: 'rating',
    header: 'Rating',
    cell: (info) => (
      <span className="inline-flex items-center gap-1 text-text">
        <Star aria-hidden className="size-3.5 text-warning-600" />
        {info.getValue().toFixed(1)}
        <span className="text-xs text-text-muted">
          ({formatNumber(info.row.original.rating.count)})
        </span>
      </span>
    ),
    meta: { align: 'end', numeric: true, hideBelow: 'lg' },
  }),
  helper.accessor('status', {
    header: 'Status',
    cell: (info) => <StatusBadge status={info.getValue()} map={productStatusMap} size="sm" />,
  }),
  helper.accessor('updatedAt', {
    header: 'Updated',
    cell: (info) => (
      <RelativeTime value={info.getValue()} className="whitespace-nowrap text-text-muted" />
    ),
    meta: { hideBelow: 'xl' },
  }),
  helper.display({
    id: 'actions',
    header: () => <span className="sr-only">Actions</span>,
    enableHiding: false,
    meta: { align: 'end', width: '3rem', label: 'Actions' },
    cell: (info) => <ProductActionsMenu product={info.row.original} />,
  }),
])
