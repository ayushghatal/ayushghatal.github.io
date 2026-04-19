document.addEventListener("DOMContentLoaded", function () {
  const posts = journalPosts || [];
  const year = new Date().getFullYear();

  let postsHTML = "";
  if (posts.length === 0) {
    postsHTML = `<p style="color:#6a6a6a;font-size:15px;">No posts yet. Check back soon.</p>`;
  } else {
    posts.forEach((post) => {
      postsHTML += `
        <div class="journal-post-item">
          <div class="journal-post-header">
            <a href="post.html?id=${post.id}" class="journal-post-title">${post.title}</a>
            <span class="journal-post-date">${post.dateShort}</span>
          </div>
          <p class="journal-post-excerpt">${post.excerpt}</p>
          <div class="journal-post-meta">
            <a href="post.html?id=${post.id}" class="journal-read-link">Read →</a>
            <span>· ${post.readTime}</span>
          </div>
        </div>
      `;
    });
  }

  document.body.innerHTML += `
    <div class="page-container">
      <a href="index.html" class="back-link">← Back</a>

      <div class="page-label">Journal</div>
      <h1 class="page-title">Notes &amp; writing</h1>
      <p class="page-subtitle">Half-formed thoughts, build logs, and ideas worth remembering.</p>

      <div class="journal-list">
        ${postsHTML}
      </div>
    </div>

    <footer class="site-footer">
      <span>© ${year} ${config.name}</span>
      <em>Quietly building things.</em>
    </footer>
  `;
});
