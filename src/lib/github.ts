const GITHUB_API = 'https://api.github.com';

interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  content: string;
  encoding: string;
}

interface GitHubCommitFile {
  path: string;
  content: string;
  sha?: string;
}

function getOwnerRepo() {
  const repo = import.meta.env.GITHUB_REPO; // e.g. "ayushghatal/portfolio"
  if (!repo) throw new Error('GITHUB_REPO env not set');
  const [owner, name] = repo.split('/');
  return { owner, name };
}

function getBranch() {
  return import.meta.env.GITHUB_BRANCH || 'main';
}

function isBinaryFile(filePath: string): boolean {
  const ext = filePath.split('.').pop()?.toLowerCase() || '';
  const binaryExts = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico', 'pdf', 'woff', 'woff2', 'ttf', 'eot'];
  return binaryExts.includes(ext);
}

function headers(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };
}

export async function getFile(
  token: string,
  filePath: string,
): Promise<GitHubFile | null> {
  const { owner, name } = getOwnerRepo();
  const branch = getBranch();
  const url = `${GITHUB_API}/repos/${owner}/${name}/contents/${filePath}?ref=${branch}`;

  const res = await fetch(url, { headers: headers(token) });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);

  return res.json();
}

export async function getFiles(
  token: string,
  dir: string,
): Promise<GitHubFile[]> {
  const { owner, name } = getOwnerRepo();
  const branch = getBranch();
  const url = `${GITHUB_API}/repos/${owner}/${name}/contents/${dir}?ref=${branch}`;

  const res = await fetch(url, { headers: headers(token) });
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);

  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function createBlob(
  token: string,
  content: string, // base64-encoded
): Promise<string> {
  const { owner, name } = getOwnerRepo();
  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${name}/git/blobs`,
    {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify({
        content,
        encoding: 'base64',
      }),
    },
  );
  if (!res.ok) throw new Error(`Failed to create blob: ${res.status}`);
  const data = await res.json();
  return data.sha;
}

export async function createOrUpdateFiles(
  token: string,
  files: GitHubCommitFile[],
  message: string,
  sha?: string,
) {
  const { owner, name } = getOwnerRepo();
  const branch = getBranch();

  // Get the current commit SHA for the branch
  const refRes = await fetch(
    `${GITHUB_API}/repos/${owner}/${name}/git/refs/heads/${branch}`,
    { headers: headers(token) },
  );
  if (!refRes.ok) throw new Error(`Failed to get ref: ${refRes.status}`);
  const refData = await refRes.json();
  const currentSha = refData.object.sha;

  // Build the tree — use blobs for binary files or pre-computed SHAs
  const tree: Array<{ path: string; mode: string; type: string; sha?: string; content?: string }> = [];
  for (const f of files) {
    if (f.sha) {
      tree.push({ path: f.path, mode: '100644', type: 'blob', sha: f.sha });
    } else if (isBinaryFile(f.path)) {
      const blobSha = await createBlob(token, f.content);
      tree.push({ path: f.path, mode: '100644', type: 'blob', sha: blobSha });
    } else {
      tree.push({ path: f.path, mode: '100644', type: 'blob', content: f.content });
    }
  }

  const treeRes = await fetch(
    `${GITHUB_API}/repos/${owner}/${name}/git/trees`,
    {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify({
        base_tree: currentSha,
        tree,
      }),
    },
  );
  if (!treeRes.ok) throw new Error(`Failed to create tree: ${treeRes.status}`);
  const treeData = await treeRes.json();

  // Create the commit
  const commitRes = await fetch(
    `${GITHUB_API}/repos/${owner}/${name}/git/commits`,
    {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify({
        message,
        tree: treeData.sha,
        parents: [currentSha],
      }),
    },
  );
  if (!commitRes.ok) throw new Error(`Failed to create commit: ${commitRes.status}`);
  const commitData = await commitRes.json();

  // Update the ref
  const updateRefRes = await fetch(
    `${GITHUB_API}/repos/${owner}/${name}/git/refs/heads/${branch}`,
    {
      method: 'PATCH',
      headers: headers(token),
      body: JSON.stringify({
        sha: commitData.sha,
        force: false,
      }),
    },
  );
  if (!updateRefRes.ok) throw new Error(`Failed to update ref: ${updateRefRes.status}`);

  return commitData;
}

export async function deleteFile(
  token: string,
  filePath: string,
  message: string,
  sha: string,
) {
  const { owner, name } = getOwnerRepo();
  const branch = getBranch();

  // Get current commit SHA
  const refRes = await fetch(
    `${GITHUB_API}/repos/${owner}/${name}/git/refs/heads/${branch}`,
    { headers: headers(token) },
  );
  if (!refRes.ok) throw new Error(`Failed to get ref: ${refRes.status}`);
  const refData = await refRes.json();
  const currentSha = refData.object.sha;

  // Get the tree of the current commit to rebuild without the deleted file
  const commitRes = await fetch(
    `${GITHUB_API}/repos/${owner}/${name}/git/commits/${currentSha}`,
    { headers: headers(token) },
  );
  const commitData = await commitRes.json();
  const treeSha = commitData.tree.sha;

  // Get all files in the tree
  const treeRes = await fetch(
    `${GITHUB_API}/repos/${owner}/${name}/git/trees/${treeSha}`,
    { headers: headers(token) },
  );
  const treeData = await treeRes.json();

  // Filter out the deleted file using full path
  const filteredTree = treeData.tree.filter(
    (item: any) => item.path !== filePath,
  );

  // Create new tree without the file
  const newTreeRes = await fetch(
    `${GITHUB_API}/repos/${owner}/${name}/git/trees`,
    {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify({
        base_tree: currentSha,
        tree: filteredTree.map((item: any) => ({
          path: item.path,
          mode: item.mode,
          type: item.type,
          sha: item.sha,
        })),
      }),
    },
  );
  if (!newTreeRes.ok) throw new Error(`Failed to create tree: ${newTreeRes.status}`);
  const newTreeData = await newTreeRes.json();

  // Create commit
  const newCommitRes = await fetch(
    `${GITHUB_API}/repos/${owner}/${name}/git/commits`,
    {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify({
        message,
        tree: newTreeData.sha,
        parents: [currentSha],
      }),
    },
  );
  if (!newCommitRes.ok) throw new Error(`Failed to create commit: ${newCommitRes.status}`);
  const newCommitData = await newCommitRes.json();

  // Update ref
  const updateRefRes = await fetch(
    `${GITHUB_API}/repos/${owner}/${name}/git/refs/heads/${branch}`,
    {
      method: 'PATCH',
      headers: headers(token),
      body: JSON.stringify({
        sha: newCommitData.sha,
        force: false,
      }),
    },
  );
  if (!updateRefRes.ok) throw new Error(`Failed to update ref: ${updateRefRes.status}`);

  return newCommitData;
}

export async function getUser(token: string) {
  const res = await fetch(`${GITHUB_API}/user`, {
    headers: headers(token),
  });
  if (!res.ok) return null;
  return res.json();
}
