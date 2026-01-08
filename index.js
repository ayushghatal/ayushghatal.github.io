document.addEventListener("DOMContentLoaded", function () {
  // Get initials from name
  const initials = config.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  // Generate photo HTML
  let photoHTML = "";
  if (config.photo === "placeholder") {
    photoHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:500;background:#0a0a0a;color:#ffffff;letter-spacing:2px;">${initials}</div>`;
  } else {
    photoHTML = `<img src="${config.photo}" alt="${config.name}">`;
  }

  // SVG Icons
  const emailIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`;

  const linkedinIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>`;

  const githubIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>`;

  const twitterIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><g><path      │
  │    d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084                                │
  │    4.126H5.117z"></path></g></svg>`;

  const websiteIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`;

  // Generate contact links with icons
  let contactLinks = "";
  if (config.email) {
    contactLinks += `<a href="mailto:${config.email}" title="Email" class="icon-link">${emailIcon}</a>`;
  }
  if (config.linkedin) {
    contactLinks += `<a href="https://${config.linkedin}" target="_blank" title="LinkedIn" class="icon-link">${linkedinIcon}</a>`;
  }
  if (config.github) {
    contactLinks += `<a href="https://${config.github}" target="_blank" title="GitHub" class="icon-link">${githubIcon}</a>`;
  }
  if (config.twitter) {
    contactLinks += `<a href="https://${config.twitter}" target="_blank" title="Twitter" class="icon-link">${twitterIcon}</a>`;
  }
  if (config.website) {
    contactLinks += `<a href="https://${config.website}" target="_blank" title="Website" class="icon-link">${websiteIcon}</a>`;
  }

  // Function to render different section types
  function renderSection(section) {
    const { title, type, items } = section;

    if (!items || items.length === 0) return "";

    let sectionHTML = `<div class="section"><h2>${title}</h2>`;

    switch (type) {
      case "projects":
        items.forEach((item) => {
          sectionHTML += `
            <div class="project">
              <div class="project-name">${item.name}</div>
              <p class="project-desc">${item.description}</p>
              ${item.link ? `<a href="${item.link}" class="project-link" target="_blank">View project</a>` : ""}
            </div>
          `;
        });
        break;

      case "experience":
        items.forEach((item) => {
          sectionHTML += `
            <div class="experience-item">
              <div class="experience-header">
                <div class="experience-role">${item.role}</div>
                <div class="experience-period">${item.period}</div>
              </div>
              <div class="experience-org">${item.organization}</div>
              ${item.description ? `<p class="experience-desc">${item.description}</p>` : ""}
            </div>
          `;
        });
        break;

      case "publications":
        items.forEach((item) => {
          sectionHTML += `
            <div class="publication-item">
              <div class="publication-title">${item.title}</div>
              <div class="publication-meta">${item.publisher} · ${item.year}</div>
              ${item.link ? `<a href="${item.link}" class="project-link" target="_blank">Read publication</a>` : ""}
            </div>
          `;
        });
        break;

      case "skills":
        sectionHTML += `<div class="skills-list">`;
        items.forEach((skill) => {
          sectionHTML += `<span class="skill-tag">${skill}</span>`;
        });
        sectionHTML += `</div>`;
        break;

      default:
        // Generic fallback for custom types
        items.forEach((item) => {
          if (typeof item === "string") {
            sectionHTML += `<div class="generic-item">${item}</div>`;
          } else if (item.name) {
            sectionHTML += `
              <div class="generic-item">
                <div class="generic-name">${item.name}</div>
                ${item.description ? `<p class="generic-desc">${item.description}</p>` : ""}
              </div>
            `;
          }
        });
    }

    sectionHTML += `</div>`;
    return sectionHTML;
  }

  // Build all sections
  let sectionsHTML = "";
  if (config.sections && config.sections.length > 0) {
    config.sections.forEach((section) => {
      sectionsHTML += renderSection(section);
    });
  }

  // Build the page
  document.body.innerHTML += `
    <div class="profile">
      <div class="profile-photo">
        ${photoHTML}
      </div>
      <h1>${config.name}</h1>
      <div class="subtitle">${config.title}</div>
      <div class="contact-icons">
        ${contactLinks}
      </div>
      <p class="bio">${config.bio}</p>
    </div>

    ${sectionsHTML}
  `;
});
