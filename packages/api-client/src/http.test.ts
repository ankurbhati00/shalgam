import { describe, expect, it, vi } from 'vitest'

import { ApiError, getErrorMessage } from './errors'
import { createApiClient } from './http'
import { buildQueryString } from './query-string'

describe('buildQueryString', () => {
  it('serializes arrays as repeated keys and omits empty values', () => {
    const qs = buildQueryString({
      page: 2,
      status: ['placed', 'packed'],
      q: '',
      inStock: true,
      categoryId: undefined,
      from: new Date('2026-01-01T00:00:00.000Z'),
    })
    expect(qs).toBe(
      '?page=2&status=placed&status=packed&inStock=true&from=2026-01-01T00%3A00%3A00.000Z',
    )
  })

  it('returns an empty string when nothing is set', () => {
    expect(buildQueryString({ a: undefined })).toBe('')
    expect(buildQueryString(undefined)).toBe('')
  })
})

describe('createApiClient', () => {
  it('joins the base url, sends JSON bodies and parses JSON responses', async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify({ id: 'p1' }), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    )
    const client = createApiClient({ baseUrl: '/api/', fetch: fetchMock })
    const result = await client.post<{ id: string }>(
      '/products',
      { name: 'Tomato' },
      { params: { dry: true } },
    )

    expect(result).toEqual({ id: 'p1' })
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('/api/products?dry=true')
    expect(init.method).toBe('POST')
    expect(init.body).toBe(JSON.stringify({ name: 'Tomato' }))
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json')
  })

  it('turns error bodies into ApiError instances', async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            error: {
              code: 'validation_error',
              message: 'Invalid product',
              details: { price: ['Too low'] },
            },
          }),
          { status: 422 },
        ),
      ),
    )
    const client = createApiClient({ baseUrl: '/api', fetch: fetchMock })
    const error = await client.get('/products/x').catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    const apiError = error as ApiError
    expect(apiError.status).toBe(422)
    expect(apiError.isValidationError).toBe(true)
    expect(apiError.details).toEqual({ price: ['Too low'] })
    expect(getErrorMessage(apiError)).toBe('Invalid product')
  })

  it('wraps network failures', async () => {
    const fetchMock = vi.fn(() => Promise.reject(new TypeError('Failed to fetch')))
    const client = createApiClient({ baseUrl: '/api', fetch: fetchMock })
    const error = (await client.get('/products').catch((e: unknown) => e)) as ApiError
    expect(error.isNetworkError).toBe(true)
    expect(error.isRetryable).toBe(true)
    expect(getErrorMessage(error)).toMatch(/offline/)
  })

  it('can be reconfigured to point at another backend', () => {
    const client = createApiClient({ baseUrl: '/api' })
    client.configure({ baseUrl: 'https://api.shalgam.in/v1' })
    expect(client.config.baseUrl).toBe('https://api.shalgam.in/v1')
  })
})
