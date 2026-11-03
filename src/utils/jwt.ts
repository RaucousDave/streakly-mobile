/**
 * Reads the `sub` claim out of the access token so the client can stamp the
 * session user without a second round trip. The token is never trusted for
 * authorisation here; the server re-verifies it on every request.
 */
function decodeBase64Url(value: string): string | null {
  try {
    const normalised = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalised.padEnd(Math.ceil(normalised.length / 4) * 4, '=');

    if (typeof globalThis.atob === 'function') {
      return globalThis.atob(padded);
    }

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let output = '';
    let buffer = 0;
    let bits = 0;

    for (const char of padded.replace(/=+$/, '')) {
      const index = chars.indexOf(char);

      if (index < 0) {
        continue;
      }

      buffer = (buffer << 6) | index;
      bits += 6;

      if (bits >= 8) {
        bits -= 8;
        output += String.fromCharCode((buffer >> bits) & 0xff);
      }
    }

    return output;
  } catch {
    return null;
  }
}

export function jwtSubject(token: string | null | undefined): string | null {
  if (!token) {
    return null;
  }

  const payload = token.split('.')[1];

  if (!payload) {
    return null;
  }

  const json = decodeBase64Url(payload);

  if (!json) {
    return null;
  }

  try {
    const claims = JSON.parse(json) as { sub?: unknown };
    return typeof claims.sub === 'string' ? claims.sub : null;
  } catch {
    return null;
  }
}
