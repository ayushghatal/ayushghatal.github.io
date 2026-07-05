import type { APIRoute } from 'astro';
import { getSessionToken } from '../../../lib/session';
import { getUser } from '../../../lib/github';

export const GET: APIRoute = async ({ request }) => {
  const cookies = request.headers.get('cookie');
  const token = getSessionToken(cookies);

  console.log('[me] Cookie header present:', !!cookies);
  console.log('[me] Token extracted:', token ? 'present' : 'missing');

  if (!token) {
    console.log('[me] No token, returning 401');
    return new Response(JSON.stringify({ authenticated: false }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const user = await getUser(token);
  if (!user) {
    console.log('[me] GitHub API returned null user, token may be invalid');
    return new Response(JSON.stringify({ authenticated: false }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  console.log('[me] User authenticated:', user.login);
  return new Response(
    JSON.stringify({
      authenticated: true,
      user: {
        login: user.login,
        name: user.name,
        avatar_url: user.avatar_url,
      },
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    },
  );
};
