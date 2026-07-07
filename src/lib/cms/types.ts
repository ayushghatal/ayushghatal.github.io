export interface User {
  login: string;
  name: string;
  avatar_url: string;
}

export interface Post {
  slug: string;
  collection: string;
  sha: string;
  path: string;
}

export interface PostDetail {
  slug: string;
  collection: string;
  sha: string;
  frontmatter: Record<string, any>;
  body: string;
}
