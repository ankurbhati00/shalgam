import type { ISODateString, ListParams } from './common'

export type InventoryStatus = 'in_stock' | 'low_stock' | 'out_of_stock'

export interface InventoryItem {
  productId: string
  sku: string
  productName: string
  productImageUrl: string
  unit: string
  categoryId: string
  categoryName: string
  onHand: number
  reserved: number
  available: number
  reorderLevel: number
  status: InventoryStatus
  lastRestockedAt: ISODateString | null
  updatedAt: ISODateString
}

export type InventoryMovementType = 'restock' | 'sale' | 'adjustment' | 'return' | 'damage'

export interface InventoryMovement {
  id: string
  productId: string
  productName: string
  type: InventoryMovementType
  /** Signed quantity: positive adds stock, negative removes it. */
  quantity: number
  balanceAfter: number
  reference: string | null
  note: string | null
  actor: string
  createdAt: ISODateString
}

export interface InventoryListParams extends ListParams {
  status?: InventoryStatus[]
  categoryId?: string[]
}

export interface InventoryMovementListParams extends ListParams {
  productId?: string
  type?: InventoryMovementType[]
}

export interface StockAdjustmentInput {
  productId: string
  type: Extract<InventoryMovementType, 'restock' | 'adjustment' | 'damage'>
  quantity: number
  note: string | null
}

export interface InventorySummary {
  totalSkus: number
  inStock: number
  lowStock: number
  outOfStock: number
  stockValue: number
}
