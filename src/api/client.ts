import axios, { AxiosError, type AxiosRequestConfig } from 'axios';

import { API_BASE_URL } from '@/constants/config';
import { session } from '@/api/session-store';
import { ApiError, type ApiEnvelope } from '@/types/api';

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

http.interceptors.request.use((config) => {
  if (session.access) {
    config.headers.Authorization = `Bearer ${session.access}`;
  }

  return config;
});

let refreshInFlight: Promise<boolean> | null = null;

/**
 * The Go server does not expose a refresh route yet. When it appears, this
 * is the only place that has to change; until then a 401 signs the user out
 * rather than leaving the app in a half-authenticated state.
 */
async function refreshSession(): Promise<boolean> {
  if (!session.refresh) {
    return false;
  }

  if (!refreshInFlight) {
    refreshInFlight = axios
      .post(`${API_BASE_URL}/auth/refresh`, { refresh_token: session.refresh })
      .then(async (response) => {
        const payload = unwrap<{ access_token: string; refresh_token?: string }>(response.data);
        await session.save({
          access_token: payload.access_token,
          refresh_token: payload.refresh_token,
        });
        return true;
      })
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null;
      });
  }

  return refreshInFlight;
}

type RetryableConfig = AxiosRequestConfig & { _retried?: boolean };

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryableConfig | undefined;

    if (error.response?.status === 401 && config && !config._retried) {
      config._retried = true;

      if (await refreshSession()) {
        return http.request(config);
      }

      await session.clear();
    }

    throw toApiError(error);
  }
);

export function unwrap<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'success' in payload) {
    const envelope = payload as ApiEnvelope<T>;

    if (envelope.success) {
      return envelope.data as T;
    }

    throw new ApiError(
      envelope.message || 'The server rejected that request.',
      envelope.error?.code ?? 'REQUEST_FAILED',
      400,
      envelope.error?.details
    );
  }

  return payload as T;
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      return ApiError.timeout();
    }

    if (!error.response) {
      return ApiError.offline();
    }

    const body = error.response.data as Partial<ApiEnvelope<unknown>> | undefined;
    const message =
      body?.message ||
      (typeof error.response.data === 'string' ? error.response.data : '') ||
      'The server rejected that request.';

    return new ApiError(
      message,
      body?.error?.code ?? `HTTP_${error.response.status}`,
      error.response.status,
      body?.error?.details
    );
  }

  return new ApiError('Something went wrong.', 'UNKNOWN', 0);
}

export function errorMessage(error: unknown): string {
  return toApiError(error).message;
}
