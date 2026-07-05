import type { APIRoute } from 'astro';
import { getSessionToken } from '../../../lib/session';
import { getFile, createOrUpdateFiles } from '../../../lib/github';

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

function splitQuotedArray(str: string): string[] {
  const result: string[] = [];
  let current = '';
  let inSingle = false;
  let inDouble = false;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === '"' && !inSingle) { inDouble = !inDouble; continue; }
    if (ch === "'" && !inDouble) { inSingle = !inSingle; continue; }
    if (ch === ',' && !inSingle && !inDouble) { result.push(current); current = ''; continue; }
    current += ch;
  }
  result.push(current);
  return result;
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

function parseFrontmatter(content: string) {
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!frontmatterMatch) return null;

  const frontmatterStr = frontmatterMatch[1];
  const body = frontmatterMatch[2];

  const frontmatter: Record<string, any> = {};
  for (const line of frontmatterStr.split(/\r?\n/)) {
    const match = line.match(/^(\w+):\s*(.+)$/);
    if (match) {
      let [, key, value] = match;
      value = value.trim();
      if (value.startsWith('[') && value.endsWith(']')) {
        value = splitQuotedArray(value.slice(1, -1)).map((s: string) => s.trim().replace(/^["']|["']$/g, ''));
      } else if (value === 'true' || value === '"true"' || value === "'true'") value = true;
      else if (value === 'false' || value === '"false"' || value === "'false'") value = false;
      else value = value.replace(/^["']|["']$/g, '');
      frontmatter[key] = value;
    }
  }

  return { frontmatter, body };
}

export const GET: APIRoute = async ({ params, request }) => {
  const cookies = request.headers.get('cookie');
  const token = getSessionToken(cookies);

  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { slug } = params as { slug: string };
  if (!slug) {
    return new Response(JSON.stringify({ error: 'Missing slug' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    let file = await getFile(token, `src/pages/writing/${slug}.mdx`);
    let collection = 'writing';

    if (!file) {
      file = await getFile(token, `src/pages/projects/${slug}.mdx`);
      collection = 'projects';
    }

    if (!file) {
      return new Response(JSON.stringify({ error: 'Post not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const content = Buffer.from(file.content, file.encoding).toString('utf-8');
    const parsed = parseFrontmatter(content);

    if (!parsed) {
      return new Response(JSON.stringify({ error: 'Invalid MDX format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        slug,
        collection,
        sha: file.sha,
        frontmatter: parsed.frontmatter,
        body: parsed.body,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  const cookies = request.headers.get('cookie');
  const token = getSessionToken(cookies);

  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { slug } = params as { slug: string };
  if (!slug) {
    return new Response(JSON.stringify({ error: 'Missing slug' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const safeSlug = sanitizeSlug(slug);
  if (!safeSlug) {
    return new Response(
      JSON.stringify({ error: 'Invalid slug' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  try {
    const body = await request.json();
    const { collection, frontmatter, content } = body;

    if (!collection) {
      return new Response(
        JSON.stringify({ error: 'Missing collection' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    if (!validateCollection(collection)) {
      return new Response(
        JSON.stringify({ error: 'Invalid collection' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Get existing file to preserve layout
    const existing = await getFile(token, `src/pages/${collection}/${safeSlug}.mdx`);
    let layoutPath = collection === 'writing'
      ? '../../layouts/PostLayout.astro'
      : '../../layouts/ProjectLayout.astro';

    if (existing) {
      const existingContent = Buffer.from(existing.content, existing.encoding).toString('utf-8');
      const layoutMatch = existingContent.match(/^layout:\s*(.+)$/m);
      if (layoutMatch) layoutPath = layoutMatch[1].trim();
    }

    const frontmatterStr = buildFrontmatter({
      layout: layoutPath,
      ...frontmatter,
    });

    const mdxContent = `---\n${frontmatterStr}\n---\n\n${content || ''}`;
    const filePath = `src/pages/${collection}/${safeSlug}.mdx`;

    await createOrUpdateFiles(
      token,
      [{ path: filePath, content: mdxContent }],
      `cms: update ${collection}/${safeSlug}`,
    );

    return new Response(
      JSON.stringify({ success: true, slug: safeSlug, collection }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const DELETE: APIRoute = async ({ params, request }) => {
  const cookies = request.headers.get('cookie');
  const token = getSessionToken(cookies);

  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { slug } = params as { slug: string };
  if (!slug) {
    return new Response(JSON.stringify({ error: 'Missing slug' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const safeSlug = sanitizeSlug(slug);
  if (!safeSlug) {
    return new Response(
      JSON.stringify({ error: 'Invalid slug' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  try {
    const { collection, sha } = await request.json();
    if (!collection || !sha) {
      return new Response(
        JSON.stringify({ error: 'Missing collection or sha' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    if (!validateCollection(collection)) {
      return new Response(
        JSON.stringify({ error: 'Invalid collection' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const repo = import.meta.env.GITHUB_REPO;
    const [owner, name] = repo.split('/');
    const branch = import.meta.env.GITHUB_BRANCH || 'main';

    const ghHeaders = {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };

    const refRes = await fetch(
      `https://api.github.com/repos/${owner}/${name}/git/refs/heads/${branch}`,
      { headers: ghHeaders },
    );
    if (!refRes.ok) {
      return new Response(
        JSON.stringify({ error: `Failed to get ref: ${refRes.status}` }),
        { status: 502, headers: { 'Content-Type': 'application/json' } },
      );
    }
    const refData = await refRes.json();

    const commitRes = await fetch(
      `https://api.github.com/repos/${owner}/${name}/git/commits/${refData.object.sha}`,
      { headers: ghHeaders },
    );
    if (!commitRes.ok) {
      return new Response(
        JSON.stringify({ error: `Failed to get commit: ${commitRes.status}` }),
        { status: 502, headers: { 'Content-Type': 'application/json' } },
      );
    }
    const commitData = await commitRes.json();

    const treeRes = await fetch(
      `https://api.github.com/repos/${owner}/${name}/git/trees/${commitData.tree.sha}`,
      { headers: ghHeaders },
    );
    if (!treeRes.ok) {
      return new Response(
        JSON.stringify({ error: `Failed to get tree: ${treeRes.status}` }),
        { status: 502, headers: { 'Content-Type': 'application/json' } },
      );
    }
    const treeData = await treeRes.json();

    const targetPath = `src/pages/${collection}/${safeSlug}.mdx`;
    const filteredTree = treeData.tree.filter((item: any) => item.path !== targetPath);

    const newTreeRes = await fetch(
      `https://api.github.com/repos/${owner}/${name}/git/trees`,
      {
        method: 'POST',
        headers: ghHeaders,
        body: JSON.stringify({
          base_tree: refData.object.sha,
          tree: filteredTree.map((item: any) => ({
            path: item.path,
            mode: item.mode,
            type: item.type,
            sha: item.sha,
          })),
        }),
      },
    );
    if (!newTreeRes.ok) {
      return new Response(
        JSON.stringify({ error: `Failed to create tree: ${newTreeRes.status}` }),
        { status: 502, headers: { 'Content-Type': 'application/json' } },
      );
    }
    const newTreeData = await newTreeRes.json();

    const newCommitRes = await fetch(
      `https://api.github.com/repos/${owner}/${name}/git/commits`,
      {
        method: 'POST',
        headers: ghHeaders,
        body: JSON.stringify({
          message: `cms: delete ${collection}/${safeSlug}`,
          tree: newTreeData.sha,
          parents: [refData.object.sha],
        }),
      },
    );
    if (!newCommitRes.ok) {
      return new Response(
        JSON.stringify({ error: `Failed to create commit: ${newCommitRes.status}` }),
        { status: 502, headers: { 'Content-Type': 'application/json' } },
      );
    }
    const newCommitData = await newCommitRes.json();

    const updateRefRes = await fetch(
      `https://api.github.com/repos/${owner}/${name}/git/refs/heads/${branch}`,
      {
        method: 'PATCH',
        headers: ghHeaders,
        body: JSON.stringify({ sha: newCommitData.sha }),
      },
    );
    if (!updateRefRes.ok) {
      return new Response(
        JSON.stringify({ error: `Failed to update ref: ${updateRefRes.status}` }),
        { status: 502, headers: { 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
