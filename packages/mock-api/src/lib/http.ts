import type { ApiErrorBody } from '@shalgam/types'
import { delay, HttpResponse } from 'msw'

export interface MockConfig {
  /** Latency range in ms, or `0` to disable (tests). */
  latency: [min: number, max: number] | 0
  /** Probability (0–1) that any request fails with a 500. Useful for demoing error states. */
  errorRate: number
}

export const mockConfig: MockConfig = {
  latency: [160, 620],
  errorRate: 0,
}

export function configureMockApi(partial: Partial<MockConfig>): void {
  Object.assign(mockConfig, partial)
}

export function errorResponse(
  status: number,
  code: string,
  message: string,
  details?: Record<string, string[]>,
): HttpResponse<ApiErrorBody> {
  return HttpResponse.json<ApiErrorBody>({ error: { code, message, details } }, { status })
}

export const notFound = (what: string) => errorResponse(404, 'not_found', `${what} was not found.`)

export const validationError = (
  details: Record<string, string[]>,
  message = 'Please fix the highlighted fields.',
) => errorResponse(422, 'validation_error', message, details)

const STATUS_MESSAGES: Record<number, [code: string, message: string]> = {
  400: ['bad_request', 'The request could not be understood.'],
  401: ['unauthorized', 'You need to sign in.'],
  403: ['forbidden', 'You are not allowed to do that.'],
  404: ['not_found', 'Not found.'],
  409: ['conflict', 'The resource was modified by someone else.'],
  429: ['rate_limited', 'Too many requests. Slow down a little.'],
  500: ['server_error', 'The Shalgam API hiccuped. Please try again.'],
  503: ['server_error', 'Service temporarily unavailable.'],
}

/**
 * Applies artificial latency and error injection. Returns a response when the
 * request should fail, otherwise `null` so the handler continues.
 *
 * Force an error with `?mockError=500` or the `x-mock-error: 500` header.
 */
export async function simulate(request: Request): Promise<HttpResponse<ApiErrorBody> | null> {
  if (mockConfig.latency !== 0) {
    const [min, max] = mockConfig.latency
    await delay(Math.round(min + Math.random() * (max - min)))
  }
  const url = new URL(request.url)
  const forced = url.searchParams.get('mockError') ?? request.headers.get('x-mock-error')
  const status = forced
    ? Number(forced)
    : mockConfig.errorRate > 0 && Math.random() < mockConfig.errorRate
      ? 500
      : null
  if (status !== null && Number.isFinite(status) && status >= 400) {
    const [code, message] = STATUS_MESSAGES[status] ?? ['unknown', 'Request failed.']
    return errorResponse(status, code, message)
  }
  return null
}

/** Trims a string body field and converts empty/missing values to `null`. */
export function orNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

export async function readJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T
  } catch {
    return null
  }
}
