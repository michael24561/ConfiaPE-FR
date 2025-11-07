export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface RequestOptions {
  method?: HttpMethod;
  path: string; // e.g. /api/auth/login
  body?: unknown;
  headers?: Record<string, string>;
  token?: string;
}

export async function request<T>({ method = 'GET', path, body, headers = {}, token }: RequestOptions): Promise<T> {
  const url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  console.log(`[API Request] ${method} ${url}`);

  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };
  if (token) finalHeaders['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers: finalHeaders,
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await res.json() : await res.text();

  console.log(`[API Response] ${res.status} ${res.statusText}`, payload);

  if (!res.ok) {
    // Intentar extraer mensaje de error del payload
    let message = 'Request failed';
    if (isJson && payload) {
      if (payload.error) message = payload.error;
      else if (payload.message) message = payload.message;
      else if (payload.data?.error) message = payload.data.error;
      else if (payload.data?.message) message = payload.data.message;
    }
    if (message === 'Request failed' && res.statusText) {
      message = res.statusText;
    }
    throw new Error(typeof message === 'string' ? message : 'Request failed');
  }

  return payload as T;
}

export function getApiBaseUrl(): string {
  return BASE_URL;
}


