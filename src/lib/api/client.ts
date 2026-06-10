type QueryValue = string | number | boolean | null | undefined
type Query = Record<string, QueryValue>

type RequestOptions = {
  query?: Query
  body?: unknown
  headers?: Record<string, string>
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

const defaultBaseUrl =
  import.meta.env.PROD
    ? 'http://savemyfriendship-env.eba-h8rmizc9.ap-northeast-2.elasticbeanstalk.com'
    : ''
export const baseUrl = import.meta.env.VITE_API_BASE_URL ?? defaultBaseUrl

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
  { query, body, headers: customHeaders }: RequestOptions = {},
): Promise<T> {
  const headers = new Headers({ Accept: 'application/json', ...customHeaders })
  const accessToken = localStorage.getItem('accessToken')

  if (accessToken && !headers.has('Authorization')) {
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
  let data: any

  const text = await response.text()
  if (contentType.includes('application/json')) {
    try {
      data = JSON.parse(text)
    } catch (e) {
      data = text
    }
  } else {
    data = text
  }

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    }

    // 401 리다이렉트는 인증 화면 연동 단계에서 처리한다.
    console.error(`API Error (${response.status} ${method} ${path}):`, data)
    const message =
      typeof data === 'object' && data !== null && 'message' in data
        ? String((data as { message?: unknown }).message)
        : 'API 요청에 실패했어요.'
    throw new ApiError(response.status, message, data)
  }

  return data as T
}

export const client = {
  get: <T>(path: string, query?: Query, headers?: Record<string, string>) =>
    request<T>('GET', path, { query, headers }),
  getList: <T>(path: string, query?: Query, headers?: Record<string, string>) =>
    request<T[]>('GET', path, { query, headers }),
  post: <T>(
    path: string,
    body?: unknown,
    query?: Query,
    headers?: Record<string, string>,
  ) => request<T>('POST', path, { body, query, headers }),
  patch: <T>(
    path: string,
    body?: unknown,
    query?: Query,
    headers?: Record<string, string>,
  ) => request<T>('PATCH', path, { body, query, headers }),
  del: <T>(path: string, headers?: Record<string, string>) =>
    request<T>('DELETE', path, { headers }),
  blob: async (path: string, query?: Query): Promise<Blob> => {
    const accessToken = localStorage.getItem('accessToken')
    const headers = new Headers()
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`)
    }

    const response = await fetch(buildUrl(path, query), {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      throw new ApiError(response.status, '파일 다운로드에 실패했어요.', null)
    }

    return response.blob()
  },
}
