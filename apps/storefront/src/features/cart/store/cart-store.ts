import type { Product } from '@shalgam/types'
import { roundMoney } from '@shalgam/utils'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'

/** A product snapshot taken when it was added; the server re-prices at checkout. */
export interface CartLine {
  productId: string
  slug: string
  name: string
  unit: string
  imageUrl: string
  price: number
  mrp: number
  maxPerOrder: number
  quantity: number
}

interface CartState {
  lines: Record<string, CartLine>
  isOpen: boolean
  add: (product: Product, quantity?: number) => void
  setQuantity: (productId: string, quantity: number) => void
  remove: (productId: string) => void
  clear: () => void
  open: () => void
  close: () => void
  setOpen: (open: boolean) => void
}

/**
 * Client state: what the shopper intends to buy. Persisted so a refresh
 * keeps the basket. Product truth (price, stock) stays in TanStack Query.
 */
export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: {},
      isOpen: false,
      add: (product, quantity = 1) =>
        set((state) => {
          const existing = state.lines[product.id]
          const next = Math.min(product.maxPerOrder, (existing?.quantity ?? 0) + quantity)
          return {
            lines: {
              ...state.lines,
              [product.id]: {
                productId: product.id,
                slug: product.slug,
                name: product.name,
                unit: product.unit,
                imageUrl: product.imageUrl,
                price: product.price,
                mrp: product.mrp,
                maxPerOrder: product.maxPerOrder,
                quantity: next,
              },
            },
          }
        }),
      setQuantity: (productId, quantity) =>
        set((state) => {
          const line = state.lines[productId]
          if (!line) return state
          if (quantity <= 0) {
            const { [productId]: _removed, ...rest } = state.lines
            return { lines: rest }
          }
          return {
            lines: {
              ...state.lines,
              [productId]: { ...line, quantity: Math.min(line.maxPerOrder, quantity) },
            },
          }
        }),
      remove: (productId) =>
        set((state) => {
          const { [productId]: _removed, ...rest } = state.lines
          return { lines: rest }
        }),
      clear: () => set({ lines: {} }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      setOpen: (open) => set({ isOpen: open }),
    }),
    {
      name: 'shalgam:cart:v1',
      partialize: (state) => ({ lines: state.lines }),
    },
  ),
)

export interface CartTotals {
  count: number
  subtotal: number
  /** Sum of (mrp − price) × quantity. */
  savings: number
}

export function computeTotals(lines: CartLine[]): CartTotals {
  return {
    count: lines.reduce((acc, line) => acc + line.quantity, 0),
    subtotal: roundMoney(lines.reduce((acc, line) => acc + line.price * line.quantity, 0)),
    savings: roundMoney(
      lines.reduce((acc, line) => acc + Math.max(0, line.mrp - line.price) * line.quantity, 0),
    ),
  }
}

export const useCartLines = () => useCartStore(useShallow((state) => Object.values(state.lines)))
export const useCartLine = (productId: string) => useCartStore((state) => state.lines[productId])
export const useCartCount = () =>
  useCartStore((state) => Object.values(state.lines).reduce((acc, line) => acc + line.quantity, 0))
export const useCartTotals = () =>
  useCartStore(useShallow((state) => computeTotals(Object.values(state.lines))))
