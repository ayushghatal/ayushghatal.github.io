import type { APIRoute } from 'astro';
import { getSessionToken } from '../../../lib/session';
import { getFiles } from '../../../lib/github';

export const GET: APIRoute = async ({ request }) => {
  const cookies = request.headers.get('cookie');
  const token = getSessionToken(cookies);

  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const writingFiles = await getFiles(token, 'src/pages/writing');
    const projectFiles = await getFiles(token, 'src/pages/projects');

    const posts = [
      ...writingFiles
        .filter((f) => f.name.endsWith('.mdx'))
        .map((f) => ({
          slug: f.name.replace('.mdx', ''),
          collection: 'writing' as const,
          sha: f.sha,
          path: f.path,
        })),
      ...projectFiles
        .filter((f) => f.name.endsWith('.mdx'))
        .map((f) => ({
          slug: f.name.replace('.mdx', ''),
          collection: 'projects' as const,
          sha: f.sha,
          path: f.path,
        })),
    ];

    return new Response(JSON.stringify({ posts }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
