import type { APIRoute } from 'astro';
import { getSessionToken } from '../../../lib/session';
import { createBlob, createOrUpdateFiles } from '../../../lib/github';

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
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const collection = formData.get('collection') as string || 'writing';

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Generate a unique filename
    const ext = file.name.split('.').pop() || 'png';
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
    const fileName = `${timestamp}-${safeName}`;
    const filePath = `public/images/${collection}/${fileName}`;

    // Read file as base64
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    // For binary files, create blob first then reference by SHA
    const blobSha = await createBlob(token, base64);

    await createOrUpdateFiles(
      token,
      [{ path: filePath, content: '', sha: blobSha }],
      `cms: upload image ${fileName}`,
    );

    const imageUrl = `/images/${collection}/${fileName}`;

    return new Response(
      JSON.stringify({ success: true, url: imageUrl }),
      { status: 201, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
