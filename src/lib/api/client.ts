type QueryValue = string | number | boolean | null | undefined
type Query = Record<string, QueryValue>

type RequestOptions = {
  query?: Query
  body?: unknown
}

export class ApiError extends Error {
  status: number
  data: unknown

  constructor(status: number, message: string, data: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? ''

function buildUrl(path: string, query?: Query) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  const url = new URL(cleanPath, baseUrl || window.location.origin)

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      url.searchParams.set(key, String(value))
    }
  })

  if (!baseUrl) {
    return `${url.pathname}${url.search}`
  }

  return url.toString()
}

async function request<T>(
  method: string,
  path: string,
  { query, body }: RequestOptions = {},
): Promise<T> {
  const headers = new Headers({ Accept: 'application/json' })
  const accessToken = localStorage.getItem('accessToken')

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  if (body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const contentType = response.headers.get('content-type') ?? ''
  const data = contentType.includes('application/json')
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    // TODO(STEP 9): 401이면 토큰 정리/로그인 리다이렉트 처리.
    const message =
      typeof data === 'object' && data !== null && 'message' in data
        ? String((data as { message?: unknown }).message)
        : 'API 요청에 실패했어요.'
    throw new ApiError(response.status, message, data)
  }

  return data as T
}

export const client = {
  get: <T>(path: string, query?: Query) => request<T>('GET', path, { query }),
  getList: <T>(path: string, query?: Query) =>
    request<T[]>('GET', path, { query }),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, { body }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>('PATCH', path, { body }),
  del: <T>(path: string) => request<T>('DELETE', path),
}
