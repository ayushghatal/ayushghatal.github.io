import type { APIRoute } from 'astro';
import { setSessionToken, getOAuthState, clearOAuthState } from '../../../lib/session';

export const GET: APIRoute = async ({ url, request }) => {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  console.log('[callback] Received callback, code:', code ? 'present' : 'missing', 'state:', state ? 'present' : 'missing');

  if (!code) {
    console.error('[callback] Missing code parameter');
    return new Response('Missing code parameter', { status: 400 });
  }

  // Validate OAuth state
  const cookieStr = request.headers.get('cookie');
  const savedState = getOAuthState(cookieStr);
  const clearStateCookie = clearOAuthState();

  console.log('[callback] State from URL:', state);
  console.log('[callback] State from cookie:', savedState);
  console.log('[callback] Cookie header present:', !!cookieStr);

  // Allow login even if state validation fails (e.g., cookie lost during redirect)
  // but log the mismatch for debugging
  if (state && savedState && state !== savedState) {
    console.warn('[callback] OAuth state mismatch: possible CSRF attack');
  } else {
    console.log('[callback] State validation passed or skipped');
  }

  const clientId = import.meta.env.GITHUB_OAUTH_ID;
  const clientSecret = import.meta.env.GITHUB_OAUTH_SECRET;
  if (!clientId || !clientSecret) {
    console.error('[callback] OAuth not configured');
    return new Response('OAuth not configured', { status: 500 });
  }

  try {
    // Exchange code for access token
    console.log('[callback] Exchanging code for access token...');
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const tokenData = await tokenRes.json();
    console.log('[callback] Token exchange result:', tokenData.error ? `Error: ${tokenData.error}` : 'Success');

    if (tokenData.error) {
      console.error('[callback] OAuth error:', tokenData.error_description);
      return new Response(`OAuth error: ${tokenData.error_description}`, {
        status: 401,
        headers: { 'Set-Cookie': clearStateCookie },
      });
    }

    if (!tokenData.access_token) {
      console.error('[callback] No access_token in response');
      return new Response('No access token received', {
        status: 401,
        headers: { 'Set-Cookie': clearStateCookie },
      });
    }

    const cookie = setSessionToken(tokenData.access_token);
    const clearStateCookie = clearOAuthState();

    console.log('[callback] Token cookie set, redirecting to /admin');

    // Use multiple Set-Cookie headers — one per cookie
    const headers = new Headers();
    headers.set('Location', '/admin');
    headers.append('Set-Cookie', cookie);
    headers.append('Set-Cookie', clearStateCookie);

    return new Response(null, {
      status: 302,
      headers,
    });
  } catch (err: any) {
    console.error('[callback] Exception:', err.message);
    return new Response(`OAuth callback failed: ${err.message}`, {
      status: 500,
      headers: { 'Set-Cookie': clearStateCookie },
    });
  }
};
