import { GOOGLE_WEB_CLIENT_ID } from '@/constants/config';

let configured = false;
type GoogleSignInModule = typeof import('@react-native-google-signin/google-signin');
let googleModule: GoogleSignInModule | null = null;

function getGoogleModule(): GoogleSignInModule {
  if (googleModule) {
    return googleModule;
  }

  try {
    // Expo Go does not include this native module. Load it only when Google
    // sign-in is requested so the rest of the client can still boot there.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    googleModule = require('@react-native-google-signin/google-signin') as GoogleSignInModule;
    return googleModule;
  } catch {
    throw new Error(
      'Native Google sign-in is unavailable in this app binary. Use a development build instead of Expo Go.'
    );
  }
}

function configure() {
  if (configured) {
    return;
  }

  if (!GOOGLE_WEB_CLIENT_ID) {
    throw new Error(
      'Google sign-in is not configured. Set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID and rebuild the app.'
    );
  }

  getGoogleModule().GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    offlineAccess: false,
  });
  configured = true;
}

/**
 * Native Google sign-in. The ID token is what the Go server validates, so
 * nothing else from the Google profile is trusted or sent.
 */
export async function requestGoogleIdToken(): Promise<string> {
  const { GoogleSignin, statusCodes } = getGoogleModule();
  configure();
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  try {
    const response = await GoogleSignin.signIn();

    if (response.type === 'cancelled') {
      throw new Error('Google sign-in was cancelled.');
    }

    const idToken = response.data.idToken;

    if (!idToken) {
      throw new Error('Google did not return an ID token. Check the web client ID.');
    }

    return idToken;
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error) {
      const code = String((error as { code: unknown }).code);

      if (code === statusCodes.SIGN_IN_CANCELLED) {
        throw new Error('Google sign-in was cancelled.');
      }

      if (code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error('Google Play Services is missing or out of date on this phone.');
      }
    }

    throw error;
  }
}

/** Clears the cached Google account so the next sign-in shows the chooser. */
export async function signOutOfGoogle(): Promise<void> {
  try {
    await getGoogleModule().GoogleSignin.signOut();
  } catch {
    // Signing out locally must never block signing out of Streakly.
  }
}
