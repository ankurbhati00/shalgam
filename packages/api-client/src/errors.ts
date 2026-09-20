import type { ApiErrorBody } from '@shalgam/types'

export type ApiErrorCode =
  | 'network_error'
  | 'timeout'
  | 'bad_request'
  | 'validation_error'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'rate_limited'
  | 'server_error'
  | 'unknown'

export class ApiError extends Error {
  readonly status: number
  readonly code: ApiErrorCode | (string & {})
  readonly details: Record<string, string[]> | undefined

  constructor(input: {
    message: string
    status: number
    code: ApiErrorCode | (string & {})
    details?: Record<string, string[]>
    cause?: unknown
  }) {
    super(input.message, { cause: input.cause })
    this.name = 'ApiError'
    this.status = input.status
    this.code = input.code
    this.details = input.details
  }

  get isNetworkError(): boolean {
    return this.status === 0
  }

  get isNotFound(): boolean {
    return this.status === 404
  }

  get isValidationError(): boolean {
    return this.status === 422 || this.code === 'validation_error'
  }

  /** True for errors worth retrying automatically (network blips, 5xx, rate limits). */
  get isRetryable(): boolean {
    return this.status === 0 || this.status === 429 || this.status >= 500
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

function codeForStatus(status: number): ApiErrorCode {
  switch (status) {
    case 400:
      return 'bad_request'
    case 401:
      return 'unauthorized'
    case 403:
      return 'forbidden'
    case 404:
      return 'not_found'
    case 409:
      return 'conflict'
    case 422:
      return 'validation_error'
    case 429:
      return 'rate_limited'
    default:
      return status >= 500 ? 'server_error' : 'unknown'
  }
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as { error?: unknown }
  if (typeof candidate.error !== 'object' || candidate.error === null) return false
  const error = candidate.error as { message?: unknown }
  return typeof error.message === 'string'
}

export async function apiErrorFromResponse(response: Response): Promise<ApiError> {
  let body: unknown = null
  try {
    body = await response.json()
  } catch {
    // Non-JSON error bodies are fine; fall back to status text.
  }
  if (isApiErrorBody(body)) {
    return new ApiError({
      message: body.error.message,
      status: response.status,
      code: body.error.code || codeForStatus(response.status),
      details: body.error.details,
    })
  }
  return new ApiError({
    message: response.statusText || `Request failed with status ${response.status}`,
    status: response.status,
    code: codeForStatus(response.status),
  })
}

/** Human-friendly message for UI error states. */
export function getErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
) {
  if (isApiError(error)) {
    if (error.isNetworkError) return 'You appear to be offline. Check your connection and retry.'
    return error.message || fallback
  }
  if (error instanceof Error && error.message) return error.message
  return fallback
}
