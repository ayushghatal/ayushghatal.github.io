import type { User, Post, PostDetail } from './types';

const $ = (s: string) => document.querySelector(s) as HTMLElement;

export let user: User | null = null;
export let posts: Post[] = [];
export let current: PostDetail | null = null;
export let view: 'writing' | 'projects' = 'writing';
export let query = '';

export function setCurrent(post: PostDetail | null) {
  current = post;
}

export function setView(v: 'writing' | 'projects') {
  view = v;
}

export function setQuery(q: string) {
  query = q;
}

function escapeHtml(str: string): string {
  const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return str.replace(/[&<>"']/g, (ch) => map[ch]);
}

export function toast(msg: string, type: 'success' | 'error' = 'success') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  $('#toasts').appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity 0.3s'; setTimeout(() => el.remove(), 300); }, 2500);
}

export async function checkAuth(): Promise<boolean> {
  try {
    const r = await fetch('/api/auth/me');
    if (r.ok) {
      const d = await r.json();
      user = d.user;
      $('#u-name').textContent = `@${user!.login}`;
      $('#u-av').src = user!.avatar_url;
      $('#login-page').style.display = 'none';
      $('#app').classList.add('active');
      return true;
    }
  } catch (e) {
    console.error('Auth check failed:', e);
  }
  return false;
}

export async function loadPosts() {
  try {
    const r = await fetch('/api/posts');
    if (r.ok) {
      posts = (await r.json()).posts;
      const wc = posts.filter(p => p.collection === 'writing').length;
      const pc = posts.filter(p => p.collection === 'projects').length;
      $('#count-writing').textContent = String(wc);
      $('#count-projects').textContent = String(pc);
    }
  } catch { toast('Failed to load posts', 'error'); }
}

export function renderList(renderCard: (slug: string) => void) {
  const wrap = $('#post-list');
  const title = $('#list-title');
  title.textContent = view === 'writing' ? 'Writing' : 'Projects';

  let list = posts.filter(p => p.collection === view);
  if (query) { const q = query.toLowerCase(); list = list.filter(p => p.slug.includes(q)); }
  list.sort((a, b) => b.slug.localeCompare(a.slug));

  if (!list.length) {
    wrap.innerHTML = `<div class="list-empty">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 5v14M5 12h14"/></svg>
      <p>${query ? 'No matches' : 'No posts yet'}</p>
    </div>`;
    return;
  }

  wrap.innerHTML = list.map(p => `
    <div class="post-card" data-slug="${escapeHtml(p.slug)}">
      <div class="pc-status draft" id="dot-${escapeHtml(p.slug)}"></div>
      <div class="pc-body">
        <div class="pc-title" id="t-${escapeHtml(p.slug)}">${escapeHtml(p.slug.replace(/-/g, ' '))}</div>
        <div class="pc-desc" id="desc-${escapeHtml(p.slug)}"></div>
        <div class="pc-meta">
          <span class="pc-tag">${escapeHtml(p.collection)}</span>
          <span id="date-${escapeHtml(p.slug)}"></span>
        </div>
      </div>
      <div class="pc-arrow">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
      </div>
    </div>
  `).join('');

  list.forEach(p => renderCard(p.slug));

  wrap.querySelectorAll('.post-card').forEach(el => {
    el.addEventListener('click', () => {
      const event = new CustomEvent('openpost', { detail: { slug: (el as HTMLElement).dataset.slug! } });
      document.dispatchEvent(event);
    });
  });
}

export async function hydrateCard(slug: string) {
  try {
    const r = await fetch(`/api/posts/${slug}`);
    if (!r.ok) return;
    const d: PostDetail = await r.json();
    const fm = d.frontmatter;
    const t = $(`#t-${CSS.escape(slug)}`);
    const dot = $(`#dot-${CSS.escape(slug)}`);
    const desc = $(`#desc-${CSS.escape(slug)}`);
    const date = $(`#date-${CSS.escape(slug)}`);
    if (t && fm.title) t.textContent = fm.title;
    const draft = fm.draft === true || fm.draft === 'true';
    if (dot) dot.className = `pc-status ${draft ? 'draft' : 'published'}`;
    if (desc && fm.description) desc.textContent = fm.description;
    if (date && fm.date) date.textContent = fm.date;
  } catch (e) {
    console.error(`Failed to hydrate card ${slug}:`, e);
  }
}

export function showList() {
  $('#list-view').style.display = '';
  $('#editor-view').style.display = 'none';
  current = null;
  document.querySelectorAll('.post-card').forEach(el => el.classList.remove('active'));
}

export function showCollectionFields(collection: string) {
  $('#section-writing').style.display = collection === 'writing' ? '' : 'none';
  $('#section-projects').style.display = collection === 'projects' ? '' : 'none';
}

export function gatherFm(): Record<string, any> {
  const fm: Record<string, any> = {};
  const t = $('#ed-title').value.trim();
  const d = $('#ed-desc').value.trim();
  const dt = $('#ed-date').value;
  const c = $('#ed-category').value.trim();
  const tg = $('#ed-tags').value.trim();
  if (t) fm.title = t;
  if (d) fm.description = d;
  if (dt) fm.date = dt;
  if (c) fm.category = c;
  if (tg) fm.tags = tg.split(',').map((s: string) => s.trim()).filter(Boolean);
  fm.draft = $('#ed-draft').checked;
  const collection = current?.collection || view;
  if (collection === 'projects') {
    const f = $('#ed-featured').checked;
    const r = $('#ed-repo').value.trim();
    if (f) fm.featured = f;
    if (r) fm.repo = r;
  } else {
    const s = $('#ed-series').value.trim();
    const p = $('#ed-part').value;
    if (s) fm.series = s;
    if (p) fm.part = parseInt(p, 10);
  }
  return fm;
}

export function setLoading(on: boolean) {
  ($('#ed-save') as HTMLButtonElement).disabled = on;
  ($('#ed-publish') as HTMLButtonElement).disabled = on;
  if (on) { $('#ed-status').className = 'badge saving'; $('#ed-status').textContent = 'SAVING'; }
}

export async function save(publish: boolean, getContent: () => string) {
  const originalDraft = $('#ed-draft').checked;
  if (publish) $('#ed-draft').checked = false;
  const slug = $('#ed-slug-input').value.trim();
  if (!slug) { toast('Slug is required', 'error'); return; }
  const collection = current?.collection || view;

  setLoading(true);
  try {
    const url = current ? `/api/posts/${current.slug}` : '/api/posts/create';
    const method = current ? 'PUT' : 'POST';
    const body = current
      ? { collection, frontmatter: gatherFm(), content: getContent(), sha: current.sha }
      : { slug, collection, frontmatter: gatherFm(), content: getContent() };

    const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (r.ok) {
      toast(publish ? 'Published!' : 'Draft saved');
      current = null;
      await loadPosts();
    } else {
      $('#ed-draft').checked = originalDraft;
      const e = await r.json();
      toast(e.error || 'Save failed', 'error');
    }
  } catch {
    $('#ed-draft').checked = originalDraft;
    toast('Network error', 'error');
  }
  setLoading(false);
}

export async function deletePost() {
  if (!current) return;
  if (!confirm('Delete this post?')) return;
  try {
    const r = await fetch(`/api/posts/${current.slug}`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collection: current.collection, sha: current.sha }),
    });
    if (r.ok) { toast('Deleted'); showList(); await loadPosts(); }
    else toast('Delete failed', 'error');
  } catch { toast('Network error', 'error'); }
}
