/**
 * Simple cookie-based session helpers for the CMS.
 * The "session" is just the GitHub access token stored in a cookie.
 */

const TOKEN_COOKIE = 'cms_github_token';
const STATE_COOKIE = 'cms_oauth_state';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function isSecure(): boolean {
  // In dev over HTTP, don't set Secure flag. In production over HTTPS, set it.
  // Astro's import.meta.env.MODE is 'development' during `astro dev`.
  return import.meta.env.MODE !== 'development';
}

export function setSessionToken(token: string): string {
  const secure = isSecure() ? '; Secure' : '';
  return `${TOKEN_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}${secure}`;
}

export function clearSessionToken(): string {
  return `${TOKEN_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function setOAuthState(state: string): string {
  const secure = isSecure() ? '; Secure' : '';
  return `${STATE_COOKIE}=${encodeURIComponent(state)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600${secure}`;
}

export function getOAuthState(cookies: string | null): string | null {
  if (!cookies) return null;
  const match = cookies.match(new RegExp(`${STATE_COOKIE}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function clearOAuthState(): string {
  return `${STATE_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function getSessionToken(cookies: string | null): string | null {
  if (!cookies) return null;
  const match = cookies.match(new RegExp(`${TOKEN_COOKIE}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}
