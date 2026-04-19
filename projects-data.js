// ============================================================
// PROJECTS DATA
// ============================================================
// This file powers the dedicated project detail pages.
// The order here must match the order of projects in config.js
// so that project.html?i=0 opens the first project, etc.
//
// Each project can have:
//   name            — project name (same as in config.js)
//   description     — short description (same as in config.js)
//   link            — GitHub / live link (same as in config.js)
//   year            — shown as "PROJECT · 2025" on the detail page
//   tags            — array of tech/topic tags shown as pills
//   longDescription — array of paragraphs for the detail page.
//                     Each string becomes its own <p> block.
//                     Write as much as you want here — no limits.
// ============================================================

const projectsData = [
  {
    name: "2D Ray Casting",
    description:
      "Implementation of ray casting in 2D with a light source and an object. Made with SDL in C.",
    link: "https://github.com/ayushghatal/2D-Ray-Casting",
    year: "2025",
    tags: ["C", "SDL2", "Math"],
    longDescription: [
      "A from-scratch 2D ray casting engine built in C using SDL2. The light source emits hundreds of rays each frame; each ray walks the scene and stops at the first wall it hits, producing soft volumetric light against simple geometry.",
      "The project explores the fundamentals behind classic Wolfenstein-style rendering and modern path tracers — line/segment intersection, vector math, and the interplay between simulation rate and frame rate.",
      "What I learned: writing tight inner loops in C, SDL's surface vs. renderer pipeline, and how surprisingly expressive 2D can feel when light behaves correctly.",
    ],
  },

  {
    name: "Minimal Portfolio Template",
    description:
      "Easy to configure portfolio template for non coders with more than 20 themes.",
    link: "https://github.com/ayushghatal/Portfolio-Template",
    year: "2025",
    tags: ["HTML", "CSS", "JavaScript"],
    longDescription: [
      "A minimal, config-driven portfolio template built for people who want a clean online presence without touching much code. Everything lives in a single config.js file — name, bio, projects, skills, experience — and the page builds itself.",
      "Supports over 20 themes, a fully responsive layout, and sections for projects, skills, experience, and publications. Zero dependencies, zero build step, just drop the files in a folder and open index.html.",
    ],
  },

  // ── Add a new project by copying the block above ───────────
  // {
  //   name: "Your Project Name",
  //   description: "Short one-line description for the home page card.",
  //   link: "https://github.com/yourhandle/your-repo",
  //   year: "2026",
  //   tags: ["Tag1", "Tag2"],
  //   longDescription: [
  //     "First paragraph — introduce the project and what it does.",
  //     "Second paragraph — how it works, what's interesting about it.",
  //     "Third paragraph — what you learned, what's next.",
  //   ],
  // },
];
