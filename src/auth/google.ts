import { GOOGLE_WEB_CLIENT_ID } from '@/constants/config';

type GoogleAccounts = {
  accounts: {
    id: {
      initialize: (config: {
        client_id: string;
        callback: (response: { credential?: string }) => void;
        ux_mode?: 'popup' | 'redirect';
      }) => void;
      prompt: (listener?: (notification: { isNotDisplayed: () => boolean }) => void) => void;
    };
  };
};

declare global {
  interface Window {
    google?: GoogleAccounts;
  }
}

const SCRIPT_ID = 'streakly-google-identity';
let scriptPromise: Promise<GoogleAccounts> | null = null;

function loadIdentityScript(): Promise<GoogleAccounts> {
  if (window.google) {
    return Promise.resolve(window.google);
  }

  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
      const script = existing ?? document.createElement('script');

      script.id = SCRIPT_ID;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google) {
          resolve(window.google);
        } else {
          reject(new Error('Google Identity Services failed to load.'));
        }
      };
      script.onerror = () => reject(new Error('Could not reach Google sign-in.'));

      if (!existing) {
        document.head.appendChild(script);
      }
    });
  }

  return scriptPromise;
}

/**
 * Web only. The preview build asks Google Identity Services for an ID token
 * so the same Go endpoint can verify it; native builds use google.native.ts.
 */
export async function requestGoogleIdToken(): Promise<string> {
  if (!GOOGLE_WEB_CLIENT_ID) {
    throw new Error('Set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to enable Google sign-in.');
  }

  const google = await loadIdentityScript();

  return new Promise<string>((resolve, reject) => {
    let settled = false;

    google.accounts.id.initialize({
      client_id: GOOGLE_WEB_CLIENT_ID,
      ux_mode: 'popup',
      callback: (response) => {
        if (settled) {
          return;
        }

        settled = true;

        if (response.credential) {
          resolve(response.credential);
        } else {
          reject(new Error('Google did not return a credential.'));
        }
      },
    });

    google.accounts.id.prompt((notification) => {
      if (!settled && notification.isNotDisplayed()) {
        settled = true;
        reject(new Error('Google sign-in was blocked by the browser. Allow pop-ups and try again.'));
      }
    });
  });
}

export async function signOutOfGoogle(): Promise<void> {
  // Google Identity Services keeps no server session in the browser preview.
}
