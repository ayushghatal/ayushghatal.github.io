import type { APIRoute } from 'astro';
import { clearSessionToken } from '../../../lib/session';

export const GET: APIRoute = async () => {
  const cookie = clearSessionToken();
  return new Response(null, {
    status: 302,
    headers: {
      Location: '/admin',
      'Set-Cookie': cookie,
    },
  });
};
