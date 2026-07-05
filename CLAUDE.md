## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## CMS Setup

The site includes a built-in CMS at `/admin` that uses GitHub OAuth for login and commits content directly to your repo.

### 1. Create a GitHub OAuth App

1. Go to https://github.com/settings/applications/new
2. **App name:** anything (e.g. "Portfolio CMS")
3. **Homepage URL:** `http://localhost:4321`
4. **Authorization callback URL:** `http://localhost:4321/api/auth/callback`
5. Click **Register application**
6. Click **Generate a new client secret**
7. Copy the **Client ID** and **Client Secret**

### 2. Set Environment Variables

Create a `.env` file (use `.env.example` as reference):

```
GITHUB_OAUTH_ID=your_client_id
GITHUB_OAUTH_SECRET=your_client_secret
GITHUB_REPO=ayushghatal/portfolio
GITHUB_BRANCH=main
```

### 3. Access the CMS

1. Run `astro dev`
2. Open `http://localhost:4321/admin`
3. Click **sign in with github**
4. Create/edit posts — changes commit directly to your GitHub repo

### Draft Feature

All posts support a `draft: true/false` frontmatter field. Draft posts are hidden from the public site (homepage, /writing, /projects, sitemap, OG images) but visible in the CMS editor. Set `draft: false` and publish to make a post live.

### CMS API Routes

- `GET /api/auth/login` — redirects to GitHub OAuth
- `GET /api/auth/callback` — handles OAuth callback
- `GET /api/auth/logout` — clears session
- `GET /api/auth/me` — returns current user info
- `GET /api/posts` — list all posts (writing + projects)
- `GET /api/posts/[slug]` — get a single post with full content
- `POST /api/posts/create` — create a new post (commits to GitHub)
- `PUT /api/posts/[slug]` — update an existing post
- `DELETE /api/posts/[slug]` — delete a post

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
