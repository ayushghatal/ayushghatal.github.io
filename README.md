# Portfolio

Minimal Astro + MDX portfolio. Pure black & white, system fonts only (no
webfont loading), a floating nav pinned to the left-center of the screen
(site links + socials on regular pages, "return" + scroll-spy table of
contents on individual posts), and a GitHub-style contribution card on the
homepage. Smooth page-to-page transitions via Astro's built-in View
Transitions. In the style of personal dev sites like antfu.me / grizz.fyi /
leerob.com: plain list rows instead of bordered cards, and one genuinely
personal section (a physics reading list) instead of generic "About Me"
filler.

## Running it locally

```bash
npm install
npm run dev
```

Then open http://localhost:4321

## Deploying (Vercel)

1. Push this folder to a GitHub repo.
2. Go to vercel.com → New Project → import the repo.
3. Vercel auto-detects Astro. No config needed. Click Deploy.

## Where everything lives

```
src/
  pages/
    index.astro           ← homepage (intro, activity, work, writing, reading)
    projects.astro         ← "all projects" page
    writing/
      index.astro           ← "all writing" page, filterable + sortable
      *.mdx                  ← YOUR POSTS GO HERE, one file per post
  data/
    site.js                 ← your name + GitHub username, used everywhere
    projects.js              ← edit this array to change project entries
    reading.js                ← your physics reading list (the "bookshelf" section)
    activity.js               ← fallback activity data (used only if the GitHub fetch fails)
  layouts/
    BaseLayout.astro         ← page shell: sidebar + content column, fonts, code-block script
    PostLayout.astro          ← wraps every writing post (title, date, category, tags)
  components/
    Nav.astro                 ← the sidebar itself (fixed on desktop, top bar on mobile)
    ProjectCard.astro, PostCard.astro, ActivityGrid.astro,
    TimelineEntry.astro, ReadingRow.astro
  styles/
    global.css                ← ALL colors, fonts, and shared row/label styles live here
```

## Writing a new post

Copy `src/pages/writing/register-level-uart.mdx`, rename the file, and edit the
frontmatter at the top:

```md
---
layout: ../../layouts/PostLayout.astro
title: "Your Title"
description: "One sentence for the writing list and page metadata."
date: 2026-07-03
category: "Embedded"
tags: ["embedded", "fpga"]
---

Your content here, in Markdown. Code blocks get syntax highlighting and a
Claude-style header bar (language + copy button) automatically.
```

The post shows up on `/writing` — grouped under its `category` — and (if
recent) on the homepage, automatically. No extra registration step. Delete
the file to remove it.

### How the writing page works

Every post shows as one flat list that the *visitor* sorts and filters
themselves:

- **Category tabs** at the top ("all", plus one per category found in your
  posts) filter the list client-side — plain text, underline for the active
  one, no pill buttons.
- **The sort toggle** ("newest first" / "oldest first") flips the order of
  the whole list on click.
- The single most recent post *site-wide* still gets the larger "latest"
  treatment (bigger title, full description, tags shown) regardless of
  filter/sort state.
- Each entry shows its category as plain lowercase text next to the date —
  always visible, not just when filtering.

This is all plain JavaScript in a `<script>` tag at the bottom of
`src/pages/writing/index.astro` — no framework, nothing to install.

## Adding a project

Open `src/data/projects.js` and add an object to the array:

```js
{
  title: "Project Name",
  description: "One or two sentences.",
  tags: ["Tag1", "Tag2"],
  link: "https://github.com/you/repo", // or "/writing/your-writeup"
  featured: true, // shows on the homepage; false = only on /projects
}
```

Projects render as plain list rows (title, description, tags as lowercase
text) — no cards, no colored badges. That's intentional; it's the same
treatment writing entries get.

## The reading list ("currently reading")

This is the one genuinely personal section — a running list of your physics
reading, kept deliberately simple: just title, author, status. Edit
`src/data/reading.js`:

```js
{
  title: "Introduction to Electrodynamics",
  author: "David Griffiths",
  status: "queued", // reading | queued | evaluating | done
}
```

## Homepage row styling vs. list pages

On the homepage, rows in "work", "writing", and "currently reading" don't
have divider lines between them — sections are separated by the label's top
border instead (see `.section-label` in `global.css`), and each row's title
is muted gray until you hover it, which is the whole affordance. On the
dedicated `/writing` and `/projects` pages, rows keep their divider lines,
since there's no section label there doing the separating. This is
controlled by a `.compact` class added only on the homepage's row lists —
if you want the same divider-free look elsewhere, add `class="row-list
compact"` to that list.

## The floating nav

Navigation is a single fixed element pinned to the left-center of the
viewport (`src/components/Nav.astro`) — no top bar, no full-height sidebar.

- On `/`, `/writing`, and `/projects`, it shows site links (home, writing,
  projects) plus your social links (GitHub, mail, LinkedIn) below a divider —
  edit both in that file, and edit the actual URLs in `src/data/site.js`.
- On an individual post page, it automatically swaps to a "← return" link
  plus a table of contents built from that post's `##` headings — no manual
  setup, it reads them straight from the MDX file. As you scroll, the
  section you're currently reading highlights in the TOC via
  `IntersectionObserver`. This re-initializes on every client-side page
  navigation (Astro's View Transitions), not just a hard reload — without
  that, the highlight would stop working after the first post you visit.
- Below 900px width it drops to a plain horizontal bar above the content
  (the TOC hides on mobile to keep things simple — just "return" stays).

Add/remove site-wide links in the `links` array near the top of that file.

## Smooth page transitions

Astro's built-in View Transitions (`astro:transitions`) are enabled in
`BaseLayout.astro`, so navigating between pages cross-fades instead of hard-
reloading. This is native to Astro — no extra library.

## The activity grid (GitHub-synced)

The homepage activity calendar pulls your real contribution graph at **build
time** from a free, unauthenticated API
(`github-contributions-api.jogruber.de`) that mirrors what's on your GitHub
profile — no token or setup needed. It rebuilds every time you deploy.

It's now a self-contained card (bordered, rounded) rather than a bare grid —
a total-contributions headline up top, month labels, a full trailing year of
squares, and a "less → more" legend with a link to your real GitHub profile
underneath. Unlike GitHub's own widget, the columns are fluid-width (`fr`
units, not fixed pixels) so it always fits the content column exactly — no
horizontal scrolling, even across a full year. Change `WEEKS` at the top of
`src/components/ActivityGrid.astro` if you want a shorter or longer range.

Your username is set once in `src/data/site.js`:

```js
githubUsername: "ayushghatal",
```

If the fetch ever fails at build time (offline, API down), the grid silently
falls back to the sample data in `src/data/activity.js` so the site never
breaks — you can ignore that file otherwise.

## Changing colors or fonts

Everything is defined once, at the top of `src/styles/global.css`:

```css
--color-bg: #000000;
--color-text: #ffffff;          /* headings, active/hovered titles */
--color-text-secondary: #b8b8b8; /* row titles at rest, post body text */
--color-text-muted: #8a8a8a;     /* descriptions, dates, captions */
--font-body: -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: ui-monospace, SFMono-Regular, monospace;
```

There's no separate "accent" color — this is deliberately plain black and
white. There are three tiers of brightness instead of just two, so a row's
title and its description don't blend into the same gray: full white is
reserved for headings and hovered/active titles, `--color-text-secondary`
is for titles at rest and post body copy, and `--color-text-muted` is for
the dimmest supporting text (dates, tags, captions). Hover states brighten
`secondary` up to full white.

Fonts are the system stack (whatever your OS already has installed), so
there's no webfont to load or configure — if you want a specific typeface,
add a Google Fonts `<link>` to the `<head>` in `BaseLayout.astro` and update
`--font-body` / `--font-mono` here.

## Code blocks

Code blocks get a Claude-style header bar (language name + Copy button)
automatically — this is added by a small script in `BaseLayout.astro` that
wraps every Shiki-rendered `<pre>` on the page. The syntax theme itself is set
in `astro.config.mjs` (`shikiConfig.theme`, currently `vitesse-dark`) — any
[Shiki theme name](https://shiki.style/themes) works there.

## Changing your name / nav links

- Name and GitHub username: `src/data/site.js`.
- Nav links: the `links` array at the top of `src/components/Nav.astro`.
