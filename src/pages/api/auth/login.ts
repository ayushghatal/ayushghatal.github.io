import type { APIRoute } from 'astro';
import { setOAuthState } from '../../../lib/session';

export const GET: APIRoute = async ({ redirect }) => {
  const clientId = import.meta.env.GITHUB_OAUTH_ID;
  if (!clientId) {
    console.error('[login] GITHUB_OAUTH_ID not configured');
    return new Response('GITHUB_OAUTH_ID not configured', { status: 500 });
  }

  const state = crypto.randomUUID();
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo,user&state=${state}`;

  // Store state in a cookie so we can verify it in the callback
  const stateCookie = setOAuthState(state);
  console.log('[login] Redirecting to GitHub OAuth, state cookie set');

  return new Response(null, {
    status: 302,
    headers: {
      Location: url,
      'Set-Cookie': stateCookie,
    },
  });
};
