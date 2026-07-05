import type { APIRoute } from 'astro';
import { getSessionToken } from '../../../lib/session';
import { createOrUpdateFiles } from '../../../lib/github';

interface CreatePostBody {
  slug: string;
  collection: 'writing' | 'projects';
  frontmatter: Record<string, any>;
  body: string;
}

function sanitizeSlug(slug: string): string {
  return slug
    .replace(/[/\\]/g, '')
    .replace(/\.\./g, '')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .trim();
}

function validateCollection(collection: string): collection is 'writing' | 'projects' {
  return collection === 'writing' || collection === 'projects';
}

function buildFrontmatter(fm: Record<string, any>): string {
  const lines: string[] = [];
  for (const [key, value] of Object.entries(fm)) {
    if (value === null || value === undefined) continue;
    if (Array.isArray(value)) {
      lines.push(`${key}: [${value.map((v) => {
        const s = String(v);
        if (s.includes('"') || s.includes('[') || s.includes(']') || s.includes(',')) {
          return `"${s.replace(/"/g, '\\"')}"`;
        }
        return `"${s}"`;
      }).join(', ')}]`);
    } else if (typeof value === 'boolean') {
      lines.push(`${key}: ${value}`);
    } else if (typeof value === 'number') {
      lines.push(`${key}: ${value}`);
    } else {
      // Quote strings that contain special characters
      const str = String(value);
      if (str.includes(':') || str.includes('#') || str.includes('"') || str.includes("'")) {
        lines.push(`${key}: "${str.replace(/"/g, '\\"')}"`);
      } else {
        lines.push(`${key}: "${str}"`);
      }
    }
  }
  return lines.join('\n');
}

export const POST: APIRoute = async ({ request }) => {
  const cookies = request.headers.get('cookie');
  const token = getSessionToken(cookies);

  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body: CreatePostBody = await request.json();
    const { slug, collection, frontmatter, content } = body as any;

    if (!slug || !collection) {
      return new Response(
        JSON.stringify({ error: 'Missing slug or collection' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const safeSlug = sanitizeSlug(slug);
    if (!safeSlug) {
      return new Response(
        JSON.stringify({ error: 'Invalid slug' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    if (!validateCollection(collection)) {
      return new Response(
        JSON.stringify({ error: 'Invalid collection' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Set defaults
    if (!frontmatter.date) {
      frontmatter.date = new Date().toISOString().split('T')[0];
    }
    if (frontmatter.draft === undefined) {
      frontmatter.draft = true;
    }

    const layoutPath =
      collection === 'writing'
        ? '../../layouts/PostLayout.astro'
        : '../../layouts/ProjectLayout.astro';

    const frontmatterStr = buildFrontmatter({
      layout: layoutPath,
      ...frontmatter,
    });

    const mdxContent = `---\n${frontmatterStr}\n---\n\n${content || ''}`;

    const filePath = `src/pages/${collection}/${safeSlug}.mdx`;

    await createOrUpdateFiles(
      token,
      [{ path: filePath, content: mdxContent }],
      `cms: create ${collection}/${safeSlug}`,
    );

    return new Response(
      JSON.stringify({ success: true, slug: safeSlug, collection }),
      { status: 201, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
