import { describe, expect, it } from 'vitest'

import { queryKeys } from './keys'
import { orderQueries, productQueries } from './options'

describe('query keys', () => {
  it('nests list keys under the collection so broad invalidation works', () => {
    const list = queryKeys.orders.list({ page: 2, status: ['placed'] })
    expect(list.slice(0, 2)).toEqual(queryKeys.orders.lists())
    expect(list[0]).toBe(queryKeys.orders.all[0])
  })

  it('keeps detail keys distinct from list keys', () => {
    expect(queryKeys.products.detail('x')).not.toEqual(queryKeys.products.list({ q: 'x' }))
  })

  it('builds query options that reuse the key factory', () => {
    expect(orderQueries.list({ page: 1 }).queryKey).toEqual(queryKeys.orders.list({ page: 1 }))
    expect(productQueries.search('a').enabled).toBe(false)
    expect(productQueries.search('atta').enabled).toBe(true)
  })
})
