import { http, unwrap } from '@/api/client';
import { normalizeUser } from '@/api/normalize';
import type { AuthUser, Credentials, SignUpInput, TokenPair } from '@/types/auth';

export async function login(credentials: Credentials): Promise<{ tokens: TokenPair; user: AuthUser | null }> {
  const response = await http.post('/auth/login', credentials);
  const tokens = unwrap<TokenPair>(response.data);

  return { tokens, user: null };
}

export async function signUp(input: SignUpInput): Promise<AuthUser | null> {
  const response = await http.post('/auth/sign-up', input);
  return normalizeUser(unwrap<unknown>(response.data));
}

export async function loginWithGoogle(idToken: string): Promise<{ tokens: TokenPair; user: AuthUser | null }> {
  const response = await http.post('/auth/google', { id_token: idToken });
  const payload = response.data as { access_token?: string; user?: unknown };

  if (!payload?.access_token) {
    throw new Error('Google sign-in did not return a token.');
  }

  return {
    tokens: { access_token: payload.access_token },
    user: normalizeUser(payload.user),
  };
}
