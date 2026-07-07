import { parseMarkdown } from './markdown';

const $ = (s: string) => document.querySelector(s) as HTMLElement;

let markdownSource = '';

export function setEditorContent(md: string) {
  markdownSource = md;
  updateEditorFromMarkdown();
}

export function getEditorContent(): string {
  return markdownSource;
}

export function updateEditorFromMarkdown() {
  const editor = $('#ed-body');
  const html = parseMarkdown(markdownSource);
  editor.innerHTML = html || '<p><br></p>';
}

export function insertAtCursor(before: string, after: string = '', placeholder: string = '') {
  const editor = $('#ed-body');
  editor.focus();
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount) {
    // Fallback: append to end
    markdownSource += before + placeholder + after;
    updateEditorFromMarkdown();
    return;
  }

  const range = selection.getRangeAt(0);
  const selectedText = range.toString();
  const insertText = selectedText || placeholder;

  const pos = getCaretPositionInMarkdown();
  if (pos !== -1) {
    markdownSource = markdownSource.slice(0, pos) + before + insertText + after + markdownSource.slice(pos);
    updateEditorFromMarkdown();
    setCaretPositionInMarkdown(pos + before.length + insertText.length);
  } else {
    // Fallback: append to end
    markdownSource += before + insertText + after;
    updateEditorFromMarkdown();
  }
}

export function getCaretPositionInMarkdown(): number {
  const editor = $('#ed-body');
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount) return -1;

  const range = selection.getRangeAt(0);
  const preRange = document.createRange();
  preRange.selectNodeContents(editor);
  preRange.setEnd(range.startContainer, range.startOffset);
  const textBefore = preRange.toString();

  if (!textBefore) return 0;

  // Try exact match first
  let pos = markdownSource.lastIndexOf(textBefore, markdownSource.length);
  if (pos !== -1) return pos + textBefore.length;

  // Try partial match from the end
  for (let i = Math.min(50, textBefore.length); i > 0; i--) {
    const partial = textBefore.slice(-i);
    pos = markdownSource.lastIndexOf(partial);
    if (pos !== -1) return pos + i;
  }

  // Try from the beginning
  for (let i = Math.min(50, textBefore.length); i > 0; i--) {
    const partial = textBefore.slice(0, i);
    pos = markdownSource.indexOf(partial);
    if (pos !== -1) return pos + i;
  }

  return -1;
}

export function setCaretPositionInMarkdown(pos: number) {
  const editor = $('#ed-body');
  const textContent = markdownSource.slice(0, pos);
  const lines = textContent.split('\n');

  let currentLine = 0;

  for (let i = 0; i < editor.childNodes.length; i++) {
    const node = editor.childNodes[i];
    const nodeText = node.textContent || '';
    const nodeLines = nodeText.split('\n');

    if (currentLine + nodeLines.length > lines.length - 1) {
      const lineIndex = lines.length - 1 - currentLine;
      const lineText = lines[lines.length - 1];
      const offset = Math.min(lineText.length, nodeLines[lineIndex]?.length || 0);

      const range = document.createRange();
      range.setStart(node, offset);
      range.collapse(true);

      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      return;
    }

    currentLine += nodeLines.length;
  }
}

export function handleToolbarAction(action: string) {
  switch (action) {
    case 'bold':
      insertAtCursor('**', '**', 'bold text');
      break;
    case 'italic':
      insertAtCursor('*', '*', 'italic text');
      break;
    case 'strikethrough':
      insertAtCursor('~~', '~~', 'strikethrough text');
      break;
    case 'code':
      insertAtCursor('`', '`', 'code');
      break;
    case 'link':
      insertAtCursor('[', '](url)', 'link text');
      break;
    case 'image':
      insertAtCursor('![', '](image-url)', 'alt text');
      break;
    case 'quote':
      insertAtCursor('> ', '', 'blockquote');
      break;
    case 'hr':
      insertAtCursor('\n---\n', '', '');
      break;
    case 'ul':
      insertAtCursor('- ', '', 'list item');
      break;
    case 'ol':
      insertAtCursor('1. ', '', 'list item');
      break;
    case 'task':
      insertAtCursor('- [ ] ', '', 'task item');
      break;
    case 'table':
      insertAtCursor('\n| Header | Header |\n| ------ | ------ |\n| Cell   | Cell   |\n', '', '');
      break;
    case 'codeblock':
      insertAtCursor('\n```javascript\n', '\n```\n', 'code here');
      break;
    case 'mdx':
      insertAtCursor('\n<Callout type="info">\n', '\n</Callout>\n', 'MDX content');
      break;
    case 'h1':
      insertAtCursor('# ', '', 'Heading 1');
      break;
    case 'h2':
      insertAtCursor('## ', '', 'Heading 2');
      break;
    case 'h3':
      insertAtCursor('### ', '', 'Heading 3');
      break;
    case 'h4':
      insertAtCursor('#### ', '', 'Heading 4');
      break;
    case 'h5':
      insertAtCursor('##### ', '', 'Heading 5');
      break;
    case 'h6':
      insertAtCursor('###### ', '', 'Heading 6');
      break;
  }
}

export function handleEditorKeydown(e: KeyboardEvent) {
  if (e.metaKey || e.ctrlKey) {
    switch (e.key.toLowerCase()) {
      case 'b':
        e.preventDefault();
        handleToolbarAction('bold');
        break;
      case 'i':
        e.preventDefault();
        handleToolbarAction('italic');
        break;
      case 'k':
        e.preventDefault();
        handleToolbarAction('link');
        break;
    }
  }
}

export function handleEditorInput() {
  const editor = $('#ed-body');
  const text = extractTextFromEditor(editor);
  markdownSource = text;
}

function extractTextFromEditor(node: Node): string {
  let text = '';
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent || '';
  }
  if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();

    if (tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4' || tag === 'h5' || tag === 'h6') {
      const level = parseInt(tag[1]);
      text = '#'.repeat(level) + ' ';
    } else if (tag === 'p') {
      text = '';
    } else if (tag === 'strong' || tag === 'b') {
      text = '**';
    } else if (tag === 'em' || tag === 'i') {
      text = '*';
    } else if (tag === 'del' || tag === 's') {
      text = '~~';
    } else if (tag === 'code') {
      if (el.parentElement?.tagName.toLowerCase() === 'pre') {
        text = '```\n';
      } else {
        text = '`';
      }
    } else if (tag === 'a') {
      text = '[';
    } else if (tag === 'img') {
      return `![${el.getAttribute('alt') || ''}](${el.getAttribute('src') || ''})`;
    } else if (tag === 'ul') {
      text = '';
    } else if (tag === 'ol') {
      text = '';
    } else if (tag === 'li') {
      if (el.classList.contains('task-list-item')) {
        const checkbox = el.querySelector('input[type="checkbox"]') as HTMLInputElement;
        const checked = checkbox?.checked ? 'x' : ' ';
        text = `- [${checked}] `;
      } else {
        text = '- ';
      }
    } else if (tag === 'blockquote') {
      text = '> ';
    } else if (tag === 'hr') {
      return '\n---\n';
    } else if (tag === 'table') {
      return extractTableAsMarkdown(el);
    } else if (tag === 'pre') {
      const code = el.querySelector('code');
      const lang = code?.className.replace('language-', '') || '';
      return '\n```' + lang + '\n' + (code?.textContent || '') + '\n```\n';
    }
  }

  for (let i = 0; i < node.childNodes.length; i++) {
    const child = node.childNodes[i];
    const childText = extractTextFromEditor(child);

    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();

      if (tag === 'strong' || tag === 'b') {
        text += childText + '**';
      } else if (tag === 'em' || tag === 'i') {
        text += childText + '*';
      } else if (tag === 'del' || tag === 's') {
        text += childText + '~~';
      } else if (tag === 'code' && el.parentElement?.tagName.toLowerCase() !== 'pre') {
        text += childText + '`';
      } else if (tag === 'a') {
        const href = el.getAttribute('href') || '';
        text += childText + '](' + href + ')';
      } else if (tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4' || tag === 'h5' || tag === 'h6') {
        text += childText + '\n\n';
      } else if (tag === 'p') {
        text += childText + '\n\n';
      } else if (tag === 'li') {
        text += childText + '\n';
      } else if (tag === 'ul' || tag === 'ol') {
        text += childText;
      } else if (tag === 'blockquote') {
        const lines = childText.split('\n').filter(l => l.trim());
        text += lines.map(l => '> ' + l).join('\n') + '\n\n';
      } else {
        text += childText;
      }
    } else {
      text += childText;
    }
  }

  return text;
}

function extractTableAsMarkdown(table: HTMLElement): string {
  let md = '\n';
  const rows = table.querySelectorAll('tr');
  rows.forEach((row, rowIdx) => {
    const cells = row.querySelectorAll('th, td');
    const cellTexts: string[] = [];
    cells.forEach(cell => cellTexts.push(cell.textContent?.trim() || ''));
    md += '| ' + cellTexts.join(' | ') + ' |\n';
    if (rowIdx === 0) {
      md += '| ' + cellTexts.map(() => '---').join(' | ') + ' |\n';
    }
  });
  return md + '\n';
}
