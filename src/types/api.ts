/**
 * Every Streakly endpoint answers with the same envelope, except the
 * handshake and the Google exchange which answer with raw JSON.
 */
export type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    details?: unknown;
  };
};

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: unknown;

  constructor(message: string, code: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }

  static offline() {
    return new ApiError(
      'No connection. Your check-ins are saved on this phone.',
      'OFFLINE',
      0
    );
  }

  static timeout() {
    return new ApiError('The server took too long to answer.', 'TIMEOUT', 0);
  }
}

export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError;
}
