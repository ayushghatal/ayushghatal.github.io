document.addEventListener("DOMContentLoaded", function () {
  const params = new URLSearchParams(window.location.search);
  const idx = parseInt(params.get("i") || "0");
  const year = new Date().getFullYear();

  const project = (projectsData || [])[idx];

  if (!project) {
    document.body.innerHTML += `
      <div class="page-container">
        <a href="index.html" class="back-link">← Back</a>
        <p style="color:#6a6a6a;">Project not found.</p>
      </div>
    `;
    return;
  }

  // Update page title
  document.title = `${project.name} — ${config.name}`;

  // Tags
  let tagsHTML = "";
  if (project.tags && project.tags.length > 0) {
    tagsHTML =
      `<div class="project-tags">` +
      project.tags
        .map((t) => `<span class="project-tag">${t}</span>`)
        .join("") +
      `</div>`;
  }

  // Long description paragraphs
  let longDescHTML = "";
  if (project.longDescription && project.longDescription.length > 0) {
    longDescHTML =
      `<div class="project-long-desc">` +
      project.longDescription.map((p) => `<p>${p}</p>`).join("") +
      `</div>`;
  } else {
    longDescHTML = `<div class="project-long-desc"><p>${project.description}</p></div>`;
  }

  // GitHub button
  const githubSVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>`;
  const githubBtn = project.link
    ? `<a href="${project.link}" class="github-btn" target="_blank">${githubSVG} View on GitHub</a>`
    : "";

  const labelText = project.year ? `PROJECT · ${project.year}` : "PROJECT";

  document.body.innerHTML += `
    <div class="page-container">
      <a href="index.html" class="back-link">← Back</a>

      <div class="page-label">${labelText}</div>
      <h1 class="page-title">${project.name}</h1>
      <p class="page-subtitle">${project.description}</p>

      ${tagsHTML}
      ${longDescHTML}
      ${githubBtn}
    </div>

    <footer class="site-footer">
      <span>© ${year} ${config.name}</span>
      <em>Quietly building things.</em>
    </footer>
  `;
});
