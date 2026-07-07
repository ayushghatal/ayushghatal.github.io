function escapeHtml(str: string): string {
  const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return str.replace(/[&<>"']/g, (ch) => map[ch]);
}

export function parseInlineMarkdown(text: string): string {
  let result = text;
  // Images (before links)
  result = result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');
  // Links
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
  // Bold + Italic
  result = result.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  // Bold
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  result = result.replace(/__(.+?)__/g, '<strong>$1</strong>');
  // Italic
  result = result.replace(/\*(.+?)\*/g, '<em>$1</em>');
  result = result.replace(/_(.+?)_/g, '<em>$1</em>');
  // Strikethrough
  result = result.replace(/~~(.+?)~~/g, '<del>$1</del>');
  // Inline code
  result = result.replace(/`([^`]+)`/g, '<code>$1</code>');
  return result;
}

export function renderTable(rows: string[][]): string {
  if (rows.length === 0) return '';
  let html = '<table>\n<thead>\n<tr>\n';
  rows[0].forEach(cell => { html += `<th>${parseInlineMarkdown(cell)}</th>\n`; });
  html += '</tr>\n</thead>\n<tbody>\n';
  for (let i = 1; i < rows.length; i++) {
    html += '<tr>\n';
    rows[i].forEach(cell => { html += `<td>${parseInlineMarkdown(cell)}</td>\n`; });
    html += '</tr>\n';
  }
  html += '</tbody>\n</table>\n';
  return html;
}

export function parseMarkdown(md: string): string {
  const lines = md.split('\n');
  let html = '';
  let inCodeBlock = false;
  let codeLang = '';
  let codeContent = '';
  let inList = false;
  let listType = '';
  let inBlockquote = false;
  let blockquoteContent = '';
  let inTable = false;
  let tableRows: string[][] = [];
  let isTableRowSeparator = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code blocks
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        html += `<pre><code class="language-${escapeHtml(codeLang)}">${escapeHtml(codeContent.trim())}</code></pre>\n`;
        inCodeBlock = false;
        codeLang = '';
        codeContent = '';
      } else {
        if (inList) { html += listType === 'ul' ? '</ul>\n' : '</ol>\n'; inList = false; }
        if (inBlockquote) { html += `<blockquote>${parseInlineMarkdown(blockquoteContent.trim())}</blockquote>\n`; inBlockquote = false; blockquoteContent = ''; }
        if (inTable) { html += renderTable(tableRows); inTable = false; tableRows = []; }
        inCodeBlock = true;
        codeLang = line.trim().slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent += line + '\n';
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      if (inList) { html += listType === 'ul' ? '</ul>\n' : '</ol>\n'; inList = false; }
      if (inBlockquote) { html += `<blockquote>${parseInlineMarkdown(blockquoteContent.trim())}</blockquote>\n`; inBlockquote = false; blockquoteContent = ''; }
      if (inTable && tableRows.length > 0) { html += renderTable(tableRows); inTable = false; tableRows = []; }
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headingMatch) {
      if (inList) { html += listType === 'ul' ? '</ul>\n' : '</ol>\n'; inList = false; }
      if (inBlockquote) { html += `<blockquote>${parseInlineMarkdown(blockquoteContent.trim())}</blockquote>\n`; inBlockquote = false; blockquoteContent = ''; }
      if (inTable) { html += renderTable(tableRows); inTable = false; tableRows = []; }
      const level = headingMatch[1].length;
      html += `<h${level}>${parseInlineMarkdown(headingMatch[2])}</h${level}>\n`;
      continue;
    }

    // Horizontal rule
    if (/^(\*{3,}|-{3,}|_{3,})\s*$/.test(line.trim())) {
      if (inList) { html += listType === 'ul' ? '</ul>\n' : '</ol>\n'; inList = false; }
      if (inBlockquote) { html += `<blockquote>${parseInlineMarkdown(blockquoteContent.trim())}</blockquote>\n`; inBlockquote = false; blockquoteContent = ''; }
      if (inTable) { html += renderTable(tableRows); inTable = false; tableRows = []; }
      html += '<hr />\n';
      continue;
    }

    // Blockquotes
    if (line.trim().startsWith('>')) {
      if (inList) { html += listType === 'ul' ? '</ul>\n' : '</ol>\n'; inList = false; }
      if (inTable) { html += renderTable(tableRows); inTable = false; tableRows = []; }
      const content = line.trim().slice(1).trim();
      if (!inBlockquote) inBlockquote = true;
      blockquoteContent += content + '\n';
      continue;
    } else if (inBlockquote) {
      html += `<blockquote>${parseInlineMarkdown(blockquoteContent.trim())}</blockquote>\n`;
      inBlockquote = false;
      blockquoteContent = '';
    }

    // Tables
    if (line.includes('|') && line.trim().startsWith('|')) {
      if (inList) { html += listType === 'ul' ? '</ul>\n' : '</ol>\n'; inList = false; }
      const cells = line.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1).map(c => c.trim());
      if (cells.every(c => /^[:\-]+$/.test(c))) {
        isTableRowSeparator = true;
        continue;
      }
      if (!inTable) inTable = true;
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      html += renderTable(tableRows);
      inTable = false;
      tableRows = [];
    }

    // Unordered list
    if (/^[\s]*[-*+]\s/.test(line)) {
      if (inBlockquote) { html += `<blockquote>${parseInlineMarkdown(blockquoteContent.trim())}</blockquote>\n`; inBlockquote = false; blockquoteContent = ''; }
      if (inTable) { html += renderTable(tableRows); inTable = false; tableRows = []; }
      const content = line.replace(/^[\s]*[-*+]\s/, '');
      if (!inList || listType !== 'ul') {
        if (inList) html += listType === 'ul' ? '</ul>\n' : '</ol>\n';
        html += '<ul>\n';
        inList = true;
        listType = 'ul';
      }
      // Task list
      if (content.startsWith('[ ] ') || content.startsWith('[x] ') || content.startsWith('[X] ')) {
        const checked = content[1] === 'x' || content[1] === 'X';
        const taskContent = content.slice(4);
        html += `<li class="task-list-item"><input type="checkbox" ${checked ? 'checked' : ''} disabled /> ${parseInlineMarkdown(taskContent)}</li>\n`;
      } else {
        html += `<li>${parseInlineMarkdown(content)}</li>\n`;
      }
      continue;
    }

    // Ordered list
    if (/^[\s]*\d+\.\s/.test(line)) {
      if (inBlockquote) { html += `<blockquote>${parseInlineMarkdown(blockquoteContent.trim())}</blockquote>\n`; inBlockquote = false; blockquoteContent = ''; }
      if (inTable) { html += renderTable(tableRows); inTable = false; tableRows = []; }
      const content = line.replace(/^[\s]*\d+\.\s/, '');
      if (!inList || listType !== 'ol') {
        if (inList) html += listType === 'ul' ? '</ul>\n' : '</ol>\n';
        html += '<ol>\n';
        inList = true;
        listType = 'ol';
      }
      html += `<li>${parseInlineMarkdown(content)}</li>\n`;
      continue;
    } else if (inList) {
      html += listType === 'ul' ? '</ul>\n' : '</ol>\n';
      inList = false;
    }

    // Paragraph
    html += `<p>${parseInlineMarkdown(line)}</p>\n`;
  }

  // Close open elements
  if (inCodeBlock) html += `<pre><code class="language-${escapeHtml(codeLang)}">${escapeHtml(codeContent.trim())}</code></pre>\n`;
  if (inList) html += listType === 'ul' ? '</ul>\n' : '</ol>\n';
  if (inBlockquote) html += `<blockquote>${parseInlineMarkdown(blockquoteContent.trim())}</blockquote>\n`;
  if (inTable) html += renderTable(tableRows);

  return html;
}
