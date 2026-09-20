import { ApiError, apiErrorFromResponse } from './errors'
import { buildQueryString, type QueryParams } from './query-string'

export interface ApiClientConfig {
  /** Base path or absolute URL, e.g. `/api` or `https://api.shalgam.in/v1`. */
  baseUrl: string
  /** Custom fetch implementation (tests, SSR). Defaults to the global fetch. */
  fetch?: typeof globalThis.fetch
  defaultHeaders?: Record<string, string>
  /** Request timeout in milliseconds; `0` disables it. */
  timeoutMs?: number
}

export interface RequestOptions {
  params?: QueryParams
  headers?: Record<string, string>
  signal?: AbortSignal
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface ApiClient {
  get<T>(path: string, options?: RequestOptions): Promise<T>
  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T>
  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T>
  patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T>
  delete<T = void>(path: string, options?: RequestOptions): Promise<T>
  /** Update configuration at runtime (e.g. point at a real backend). */
  configure(config: Partial<ApiClientConfig>): void
  readonly config: Readonly<ApiClientConfig>
}

function joinUrl(baseUrl: string, path: string): string {
  const base = baseUrl.replace(/\/+$/, '')
  const rest = path.startsWith('/') ? path : `/${path}`
  return `${base}${rest}`
}

function combineSignals(signals: Array<AbortSignal | undefined>): AbortSignal | undefined {
  const present = signals.filter((signal): signal is AbortSignal => signal !== undefined)
  if (present.length === 0) return undefined
  if (present.length === 1) return present[0]
  return AbortSignal.any(present)
}

/**
 * Creates the single HTTP transport used by every Shalgam service.
 * It knows nothing about MSW: swapping the mock backend for a real one is a
 * matter of pointing `baseUrl` elsewhere and not starting the worker.
 */
export function createApiClient(initialConfig: ApiClientConfig): ApiClient {
  let config: ApiClientConfig = { timeoutMs: 15_000, ...initialConfig }

  async function request<T>(
    method: HttpMethod,
    path: string,
    body: unknown,
    options: RequestOptions = {},
  ): Promise<T> {
    const fetchImpl = config.fetch ?? globalThis.fetch
    const url = joinUrl(config.baseUrl, path) + buildQueryString(options.params)
    const timeout = config.timeoutMs ?? 0
    const timeoutSignal = timeout > 0 ? AbortSignal.timeout(timeout) : undefined
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...config.defaultHeaders,
      ...options.headers,
    }
    if (body !== undefined) headers['Content-Type'] = 'application/json'

    let response: Response
    try {
      response = await fetchImpl(url, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: combineSignals([options.signal, timeoutSignal]),
      })
    } catch (cause) {
      if (options.signal?.aborted) throw cause
      const isTimeout = cause instanceof DOMException && cause.name === 'TimeoutError'
      throw new ApiError({
        message: isTimeout ? 'The request timed out.' : 'Network request failed.',
        status: 0,
        code: isTimeout ? 'timeout' : 'network_error',
        cause,
      })
    }

    if (!response.ok) throw await apiErrorFromResponse(response)
    if (response.status === 204) return undefined as T
    return (await response.json()) as T
  }

  return {
    get: (path, options) => request('GET', path, undefined, options),
    post: (path, body, options) => request('POST', path, body, options),
    put: (path, body, options) => request('PUT', path, body, options),
    patch: (path, body, options) => request('PATCH', path, body, options),
    delete: (path, options) => request('DELETE', path, undefined, options),
    configure(next) {
      config = { ...config, ...next }
    },
    get config() {
      return config
    },
  }
}
