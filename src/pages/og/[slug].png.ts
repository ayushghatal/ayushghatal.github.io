import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import fs from 'node:fs';
import { site } from '../../data/site.js';

// Every writing post and every project gets its own image; anything else
// (home, /writing, /projects, 404) falls back to the "default" one. Adding
// a new post or project picks this up automatically — nothing to update
// here.
export async function getStaticPaths() {
  const posts = Object.values(import.meta.glob('../writing/*.mdx', { eager: true }))
    .filter((p: any) => p.frontmatter?.title)
    .map((p: any) => ({
      slug: p.url.split('/').filter(Boolean).pop(),
      title: p.frontmatter.title,
      description: p.frontmatter.description,
      kind: 'writing',
    }));

  const projects = Object.values(import.meta.glob('../projects/*.mdx', { eager: true }))
    .filter((p: any) => p.frontmatter?.title)
    .map((p: any) => ({
      slug: p.url.split('/').filter(Boolean).pop(),
      title: p.frontmatter.title,
      description: p.frontmatter.description,
      kind: 'project',
    }));

  return [
    { params: { slug: 'default' }, props: { title: site.name, description: site.description, kind: 'default' } },
    ...posts.map(p => ({ params: { slug: p.slug }, props: p })),
    ...projects.map(p => ({ params: { slug: p.slug }, props: p })),
  ];
}

// @fontsource/inter ships real font files under node_modules — satori needs
// actual font bytes to render text (it can't use system/CSS fonts).
const interRegular = fs.readFileSync('./node_modules/@fontsource/inter/files/inter-latin-400-normal.woff');
const interBold = fs.readFileSync('./node_modules/@fontsource/inter/files/inter-latin-700-normal.woff');

export async function GET({ props }: { props: { title: string; description?: string; kind: string } }) {
  const { title, description, kind } = props;

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#000000',
          padding: '80px',
          fontFamily: 'Inter',
        },
        children: [
          {
            type: 'div',
            props: {
              style: { display: 'flex', flexDirection: 'column', gap: '28px' },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: kind === 'default' ? 64 : 56,
                      fontWeight: 700,
                      color: '#ffffff',
                      lineHeight: 1.2,
                      maxWidth: '1000px',
                    },
                    children: title,
                  },
                },
                ...(description
                  ? [
                      {
                        type: 'div',
                        props: {
                          style: { fontSize: 28, color: '#b8b8b8', lineHeight: 1.5, maxWidth: '920px' },
                          children: description,
                        },
                      },
                    ]
                  : []),
              ],
            },
          },
          {
            type: 'div',
            props: {
              style: { display: 'flex', alignItems: 'center', fontSize: 24, color: '#8a8a8a' },
              children: kind === 'default' ? site.description : `${site.name} — ${kind}`,
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Inter', data: interRegular, weight: 400, style: 'normal' },
        { name: 'Inter', data: interBold, weight: 700, style: 'normal' },
      ],
    }
  );

  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();

  return new Response(png, {
    headers: { 'Content-Type': 'image/png' },
  });
}
