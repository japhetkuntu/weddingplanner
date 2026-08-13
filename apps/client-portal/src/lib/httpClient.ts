const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

interface ApiEnvelope<T> {
  message: string;
  code: number;
  data: T | null;
  errors: { field?: string; message: string }[] | null;
}

export class ApiError extends Error {
  code: number;
  constructor(message: string, code: number) {
    super(message);
    this.code = code;
  }
}

const ACCESS_TOKEN_KEY = "ovutor.client.accessToken";
const REFRESH_TOKEN_KEY = "ovutor.client.refreshToken";

export const tokenStore = {
  getAccessToken: () => sessionStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => sessionStorage.getItem(REFRESH_TOKEN_KEY),
  setTokens: (accessToken: string, refreshToken: string) => {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  clear: () => {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

let refreshInFlight: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  const refreshToken = tokenStore.getRefreshToken();
  if (!refreshToken) return false;

  const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) return false;

  const body: ApiEnvelope<{ accessToken: string; refreshToken: string }> = await res.json();
  if (!body.data) return false;

  tokenStore.setTokens(body.data.accessToken, body.data.refreshToken);
  return true;
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  skipAuth?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}, isRetry = false): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  const accessToken = tokenStore.getAccessToken();
  if (accessToken && !options.skipAuth) headers.Authorization = `Bearer ${accessToken}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (res.status === 401 && !options.skipAuth && !isRetry) {
    refreshInFlight ??= refreshTokens().finally(() => {
      refreshInFlight = null;
    });
    const refreshed = await refreshInFlight;
    if (refreshed) return request<T>(path, options, true);
    tokenStore.clear();
    window.location.href = "/login";
    throw new ApiError("Your session has expired. Please sign in again.", 401);
  }

  const body: ApiEnvelope<T> = await res.json();
  if (!res.ok || body.code >= 400) {
    throw new ApiError(body.message, body.code);
  }
  return body.data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown, options?: Partial<RequestOptions>) =>
    request<T>(path, { method: "POST", body, ...options }),
};
