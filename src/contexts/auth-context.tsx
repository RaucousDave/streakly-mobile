import { useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { login, loginWithGoogle, signUp } from '@/api/auth.api';
import { session } from '@/api/session-store';
import { requestGoogleIdToken, signOutOfGoogle } from '@/auth/google';
import { completionQueue } from '@/storage/queue';
import { dailyLog } from '@/storage/daily-log';
import type { AuthUser, SignUpInput, TokenPair } from '@/types/auth';
import { jwtSubject } from '@/utils/jwt';

export type AuthStatus = 'loading' | 'signedOut' | 'signedIn';

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUpAndSignIn: (input: SignUpInput) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function userFromEmail(email: string, accessToken: string): AuthUser {
  return {
    id: jwtSubject(accessToken) ?? email,
    email,
    display_name: email.split('@')[0] || 'You',
    provider: 'EMAIL',
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [hydrated, setHydrated] = useState(false);
  const [token, setToken] = useState<string | null>(session.access);
  const [user, setUser] = useState<AuthUser | null>(session.user);

  useEffect(() => {
    let active = true;

    const unsubscribe = session.subscribe(() => {
      if (!active) {
        return;
      }

      setToken(session.access);
      setUser(session.user);
    });

    session.hydrate().finally(() => {
      if (active) {
        setHydrated(true);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const establish = useCallback(
    async (tokens: TokenPair, nextUser: AuthUser | null) => {
      await session.save(tokens, nextUser);
      // A different account must not inherit the previous account's cache.
      queryClient.clear();
    },
    [queryClient]
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      const result = await login({ email, password });
      await establish(result.tokens, result.user ?? userFromEmail(email, result.tokens.access_token));
    },
    [establish]
  );

  const signUpAndSignIn = useCallback(
    async (input: SignUpInput) => {
      const created = await signUp(input);
      // Sign-up returns the user but no token, so the handshake is completed
      // with the credentials the person just chose.
      const result = await login({ email: input.email, password: input.password });
      await establish(result.tokens, created ?? userFromEmail(input.email, result.tokens.access_token));
    },
    [establish]
  );

  const signInWithGoogle = useCallback(async () => {
    const idToken = await requestGoogleIdToken();
    const result = await loginWithGoogle(idToken);

    await establish(
      result.tokens,
      result.user ?? {
        id: jwtSubject(result.tokens.access_token) ?? 'google',
        email: '',
        display_name: 'You',
        provider: 'GOOGLE',
      }
    );
  }, [establish]);

  const signOut = useCallback(async () => {
    await signOutOfGoogle();
    await session.clear();
    completionQueue.clear();
    dailyLog.clear();
    queryClient.clear();
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status: hydrated ? (token ? 'signedIn' : 'signedOut') : 'loading',
      user,
      signIn,
      signUpAndSignIn,
      signInWithGoogle,
      signOut,
    }),
    [hydrated, token, user, signIn, signUpAndSignIn, signInWithGoogle, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
