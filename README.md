# Portfolio

Minimal Astro + MDX portfolio. Pure black & white, system fonts only (no
webfont loading), a floating nav pinned to the left-center of the screen
(site links + socials on regular pages, "return" + scroll-spy table of
contents on individual posts), a Cmd+K command palette, client-side search
and filtering on `/writing`, and a GitHub-style contribution card on the
homepage. Smooth page-to-page transitions via Astro's built-in View
Transitions, with the nav persisted across navigation so it never flickers.
In the style of personal dev sites like antfu.me / grizz.fyi / leerob.com:
plain list rows instead of bordered cards, and one genuinely personal
section (a physics reading list) instead of generic "About Me" filler.

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
    index.astro           ← homepage (intro, now, activity, work, writing, reading)
    404.astro               ← custom not-found page
    writing/
      index.astro           ← "all writing" page, filterable + sortable + searchable
      *.mdx                  ← YOUR POSTS GO HERE, one file per post
    projects/
      index.astro           ← "all projects" page
      *.mdx                  ← YOUR PROJECTS GO HERE, one file per project (with real content)
    og/
      [slug].png.ts          ← generates a real social-preview image per post/project at build time
  data/
    site.js                 ← your name, GitHub username, social links — used everywhere
    reading.js                ← your physics reading list (the "bookshelf" section)
    activity.js               ← fallback activity data (used only if the GitHub fetch fails)
  layouts/
    BaseLayout.astro         ← page shell: nav, command palette, OG tags, code-block script
    PostLayout.astro          ← wraps every writing post (series, related posts, prose)
    ProjectLayout.astro        ← wraps every project page (repo link, related projects, prose)
  components/
    Nav.astro                 ← the floating nav (site links + socials, or return + TOC on posts)
    CommandPalette.astro       ← the ⌘K quick-jump palette
    ProjectCard.astro, PostCard.astro, ActivityGrid.astro,
    TimelineEntry.astro, ReadingRow.astro
  styles/
    global.css                ← ALL colors, fonts, and shared row/label/prose styles live here
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

The post shows up on `/writing`, the ⌘K command palette, and (if recent) the
homepage, automatically. No extra registration step. Delete the file to
remove it. It also gets its own social-preview image for free — see "Social
preview images" below.

### Multi-part series

Add `series` and `part` to link posts into a sequence:

```md
series: "STM32 Bare-Metal"
part: 2
```

Any post sharing the same `series` string becomes part of that series,
ordered by `part`. A "part N of M" note appears next to the date, and
prev/next links appear at the end of the post — but only once a series has
more than one part; a single post with a `series` field but no siblings
doesn't show anything extra, so there's no cost to adding it early.

### Related posts

Every post automatically gets a "related" block at the end listing up to 3
other posts that share its `category` — no manual linking needed. This is
separate from series navigation: series is "read these in order," related
is "you might also like these."

### Footnotes

Standard Markdown footnote syntax works out of the box:

```md
Some claim that needs a citation.[^1]

[^1]: The citation itself, rendered in a numbered list at the end of the post.
```

This isn't the Tufte-style margin sidenote (there's no side margin to put
one in, given the floating nav) — it's a classic numbered footnote with a
jump-to-note link and a "↩" back-link, styled to match the rest of the site.

### How the writing page works

Every post shows as one flat list that the *visitor* sorts and filters
themselves:

- **Category tabs** at the top ("all", plus one per category found in your
  posts) filter the list client-side — plain text, underline for the active
  one, no pill buttons.
- **The search box** filters by title + description, and works together
  with the category tabs (both narrow the same list at once).
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

Projects work exactly like posts now — each one is its own file under
`src/pages/projects/`, with a real page (content, table of contents, its own
social-preview image) instead of just a one-line description. Copy
`src/pages/projects/fpga-spi-filter.mdx`, rename it, and edit the
frontmatter:

```md
---
layout: ../../layouts/ProjectLayout.astro
title: "Project Name"
description: "One or two sentences — shown on cards and as the page subtitle."
tags: ["Tag1", "Tag2"]
featured: true    # shows on the homepage; false = only on /projects
date: 2026-07-03
repo: "https://github.com/you/repo"   # optional — shows as "view source →"
---

Write about the project here. What it does, why you built it, what was
hard. `##` headings show up in the floating table of contents, same as a
writing post.
```

Two projects sharing a tag automatically show up in each other's "related"
block — same mechanism as related posts, just matched by tag instead of
category. Cross-link between a project and the post that documents it with
a normal Markdown link (see how `fpga-spi-filter.mdx` and
`register-level-uart.mdx` reference each other) — there's no special syntax,
just `[link text](/projects/other-project)` or `[link text](/writing/other-post)`.

Projects render as plain list rows on `/projects` and the homepage (title,
description, tags as lowercase text) — no cards, no colored badges. That's
intentional; it's the same treatment writing entries get.

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

## Social preview images

`src/pages/og/[slug].png.ts` generates a real PNG (1200×630, matching the
site's black/white look) for every post and every project at build time —
this is what shows up when a link to your site is shared on Twitter,
LinkedIn, iMessage, etc. It reads straight from each file's `title` and
`description`, so there's nothing to maintain per-post; add a post or
project and its image exists on the next build. Everything else (home,
`/writing`, `/projects`, 404) shares one default image.

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
  `IntersectionObserver`, with a small indicator bar that slides to track
  it — a more tactile connection between scrolling and the nav than just a
  color change. This re-initializes on every client-side page navigation
  (Astro's View Transitions), not just a hard reload — without that, the
  highlight would stop working after the first post you visit.
- Below 900px width it drops to a plain horizontal bar above the content
  (the TOC hides on mobile to keep things simple — just "return" stays).

Add/remove site-wide links in the `links` array near the top of that file.

### A note on the scripts in this project

Every interactive script (nav highlighting, TOC scroll-spy, the command
palette, code-block copy buttons, the writing page's filter/sort/search)
follows the same pattern: define a setup function, and call it *only* via
`document.addEventListener('astro:page-load', setupThing)` — never also call
it directly. `astro:page-load` already fires on the very first page load, not
just after transitions, so calling a setup function both directly *and* via
that listener double-binds every event handler inside it. For a filter
button that just sets a class, double-binding is invisible (applying the
same state twice looks like applying it once). For a toggle that flips state
— like the sort button — double-binding means one click fires the handler
twice, which flips it back to where it started. That was the actual sort
bug: it looked identical to the working filter buttons in every way except
that it wasn't idempotent under a duplicate call. If you add your own
interactive script to this site, follow the same pattern (listener only, no
direct call) or you'll hit the same class of bug.

### Why the nav is persisted, and how the active link stays correct

The nav has `transition:persist`, so Astro keeps the exact same DOM element
across navigations between `/`, `/writing`, and `/projects` instead of
tearing it down and rebuilding it — that's what makes it feel perfectly
still while the content cross-fades, rather than flickering.

That comes with a catch: a persisted element's DOM is reused as-is, so the
`active` class baked in at build time for whichever page loaded *first*
would otherwise stay stuck forever. A small script re-computes which link
should be active from `window.location.pathname` after every navigation
(`astro:page-load`), so it stays correct regardless of persistence.

The persistence itself is scoped by giving the nav a different
`transition:name` depending on context — `'nav-site'` on regular pages, and
a name unique to each post when viewing one. Astro only persists elements
whose name matches on both sides of a navigation, so it persists freely
between the site's list pages, but correctly swaps in fresh content when you
enter a post or move from one post to a different one (each post has its
own table of contents, so that swap has to happen — persisting across two
different posts would leave the first post's TOC on screen).

## Command palette (⌘K)

Press `Cmd+K` (or `Ctrl+K` on Windows/Linux) anywhere on the site to open a
quick-jump palette — type to filter, arrow keys to move, Enter to go. It
also has a visible "search ⌘K" trigger in the nav on regular pages. It
lists:

- the three site pages (home, writing, projects)
- every writing post — pulled automatically from `src/pages/writing/*.mdx`,
  so new posts appear with no extra step
- your social links

All of this lives in `src/components/CommandPalette.astro`. There's nothing
to configure — it stays in sync with your content automatically.

## Search and filtering on /writing

The controls above the writing list (category tabs, the search box, and the
newest/oldest sort toggle) are all plain client-side JavaScript — no
external library, and nothing to fetch. Search matches against each post's
title and description, and works together with the category filter (both
narrow the same list at once).

## Custom 404 page

`src/pages/404.astro` — matches the rest of the site instead of showing a
default host error page. Astro and Vercel both automatically serve this for
unmatched routes; nothing else to configure.

## The "now" line

Below the main intro paragraph on the homepage there's a short "now" line —
what you're actively working on this week. It's just a paragraph in
`src/pages/index.astro` (search for `class="now"`) — update it whenever your
focus changes. Deliberately not a whole separate page; it's meant to be
low-effort enough that you'll actually keep it current.

## Adding images

Two different things here, since a project's frontmatter is plain YAML and
can't hold an imported/optimized image:

- **A thumbnail on the card** (shown on `/projects` and the homepage): put
  the file in `public/` (e.g. `public/projects/thumb.png`) and set
  `image: "/projects/thumb.png"` in that project's frontmatter. This is a
  plain, unoptimized `<img>` — fine for a small thumbnail.
- **Real content images** (diagrams, screenshots, waveform captures) inside
  a post or project's actual writing: put the file under `src/assets/` and
  reference it with normal Markdown syntax —
  `![GTKWave output](../../assets/filter-waveform.png)`. Astro automatically
  optimizes these (resizes, converts to modern formats, lazy-loads) even
  though they're plain Markdown, no extra setup needed. This is the one that
  actually matters for the "biggest lever for a fast page" advice below —
  use it for anything substantial.

## Sitemap and robots.txt

`@astrojs/sitemap` is enabled in `astro.config.mjs` and generates
`sitemap-index.xml` automatically on every build — no content to maintain.
`public/robots.txt` points at it. **Both depend on the `site` value in
`astro.config.mjs` being your real domain** — it's currently the placeholder
`https://example.com`; update it (and the URL inside `robots.txt`) once you
know your real domain, or the sitemap will contain wrong URLs.

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

## Scroll feel

A couple of small, deliberate touches:

- Post headings have `scroll-margin-top`, so clicking a TOC link (or any
  anchor link) lands the heading with a bit of breathing room instead of
  jammed against the very top of the viewport.
- The TOC's sliding indicator (see "The floating nav" above) is the other
  half of this — it ties the act of scrolling to a visible, continuous
  response in the nav rather than a static list sitting off to the side.

## Performance notes

- Every list of rows (projects, writing, reading) has `content-visibility:
  auto` — the browser skips layout/paint work for rows that are off-screen.
  Doesn't matter yet at 3 posts; matters once you have 50.
- Use Astro's automatic Markdown image optimization (see "Adding images"
  above) for anything you add going forward — it's the single biggest lever
  for keeping the site fast, since unoptimized images are the most common
  cause of a slow page.
- View Transitions + the persisted nav mean navigation never re-downloads or
  re-parses the nav's CSS/JS — only the page content actually changes.
