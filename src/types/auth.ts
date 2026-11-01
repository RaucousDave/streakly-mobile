export type AuthProvider = 'GOOGLE' | 'EMAIL';

export type AuthUser = {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string | null;
  provider: AuthProvider | string;
  time_zone?: string;
  freeze_balance?: number;
};

export type Session = {
  accessToken: string;
  refreshToken?: string;
  user?: AuthUser;
};

export type TokenPair = {
  access_token: string;
  refresh_token?: string;
};

export type Credentials = {
  email: string;
  password: string;
};

export type SignUpInput = {
  email: string;
  password: string;
  display_name: string;
  timezone: string;
};
