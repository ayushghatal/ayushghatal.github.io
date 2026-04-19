document.addEventListener("DOMContentLoaded", function () {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id") || "";
  const year = new Date().getFullYear();

  // Basic sanitisation — only allow letters, numbers, and hyphens
  if (!/^[a-z0-9-]+$/.test(id)) {
    renderError();
    return;
  }

  // Dynamically load the post file from the posts/ folder
  const script = document.createElement("script");
  script.src = `posts/${id}.js`;

  script.onload = function () {
    const post = window.currentPost;
    if (!post) {
      renderError();
      return;
    }

    document.title = `${post.title} — ${config.name}`;

    let contentHTML = "";
    (post.content || []).forEach((block) => {
      switch (block.type) {
        case "h2":
          contentHTML += `<h2 class="post-h2">${block.text}</h2>`;
          break;
        case "h3":
          contentHTML += `<h3 class="post-h3">${block.text}</h3>`;
          break;
        case "blockquote":
          contentHTML += `<blockquote class="post-blockquote">${block.text}</blockquote>`;
          break;
        default:
          contentHTML += `<p class="post-p">${block.text}</p>`;
      }
    });

    document.body.innerHTML += `
      <div class="page-container">
        <a href="journal.html" class="back-link">← Back to journal</a>
        <div class="post-meta">${post.date} · ${post.readTime}</div>
        <h1 class="post-title">${post.title}</h1>
        <div class="post-content">${contentHTML}</div>
      </div>
      <footer class="site-footer">
        <span>© ${year} ${config.name}</span>
        <em>Quietly building things.</em>
      </footer>
    `;
  };

  script.onerror = function () {
    renderError();
  };
  document.head.appendChild(script);

  function renderError() {
    document.body.innerHTML += `
      <div class="page-container">
        <a href="journal.html" class="back-link">← Back to journal</a>
        <p style="color:#6a6a6a;">Post not found.</p>
      </div>
    `;
  }
});
