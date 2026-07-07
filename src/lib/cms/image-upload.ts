import { insertAtCursor, getEditorContent, setEditorContent } from './editor';

const $ = (s: string) => document.querySelector(s) as HTMLElement;

function toast(msg: string, type: 'success' | 'error' = 'success') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  $('#toasts').appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity 0.3s'; setTimeout(() => el.remove(), 300); }, 2500);
}

const pendingImages = new Map<string, File>();

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function queueImage(file: File, _collection: string) {
  const dataUrl = await fileToDataUrl(file);
  pendingImages.set(dataUrl, file);
  insertAtCursor(`![${file.name}](${dataUrl})`, '', '');
  toast(`Image queued: ${file.name}`);
}

export function getPendingImageCount(): number {
  return pendingImages.size;
}

export async function uploadPendingImages(collection: string): Promise<Map<string, string> | null> {
  if (pendingImages.size === 0) return new Map();

  const replacementMap = new Map<string, string>();

  for (const [dataUrl, file] of pendingImages) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('collection', collection);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        replacementMap.set(dataUrl, result.url);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (err: any) {
      console.error(`Failed to upload ${file.name}:`, err);
      toast(`Failed to upload ${file.name}: ${err.message}`, 'error');
      return null;
    }
  }

  pendingImages.clear();
  return replacementMap;
}

export function replacePendingUrls(replacementMap: Map<string, string>) {
  if (replacementMap.size === 0) return;

  let content = getEditorContent();
  for (const [dataUrl, realUrl] of replacementMap) {
    content = content.split(dataUrl).join(realUrl);
  }
  setEditorContent(content);
}

function isSvgText(text: string): boolean {
  const trimmed = text.trim();
  return trimmed.startsWith('<svg') || trimmed.startsWith('<?xml');
}

function svgTextToFile(text: string): File {
  const svgContent = text.trim();
  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  return new File([blob], 'diagram.svg', { type: 'image/svg+xml' });
}

export function handleEditorPaste(e: ClipboardEvent, collection: string) {
  const items = e.clipboardData?.items;
  if (!items) return;

  for (const item of items) {
    if (item.type.startsWith('image/') && item.type !== 'image/svg+xml') {
      e.preventDefault();
      const file = item.getAsFile();
      if (file) queueImage(file, collection);
      return;
    }
  }

  const text = e.clipboardData?.getData('text/plain');
  if (text && isSvgText(text)) {
    e.preventDefault();
    const file = svgTextToFile(text);
    queueImage(file, collection);
    return;
  }
}

export function handleEditorDrop(e: DragEvent, collection: string) {
  e.preventDefault();
  const files = e.dataTransfer?.files;
  if (!files) return;

  for (const file of files) {
    if (file.type.startsWith('image/')) {
      queueImage(file, collection);
    }
  }
}
