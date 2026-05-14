import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

const CONFIG = (name: string) => `title: ${name}
baseUrl: http://localhost:3000
description: A personal blog
author: Your Name
`;

const LAYOUT_INDEX = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{site.title}}</title>
    {{#if site.description}}
    <meta name="description" content="{{site.description}}" />
    {{/if}}
    <link rel="stylesheet" href="/style.css" />
  </head>
  <body>
    <div class="container">
      {{> header}}
      <main>
        {{#if posts.length}}
        <ul class="post-list">
          {{#each posts}}
          <li>
            <a href="{{url}}">{{title}}</a>
            {{#if date}}<span class="post-date">{{date date "short"}}</span>{{/if}}
          </li>
          {{/each}}
        </ul>
        {{else}}
        <p>No posts yet.</p>
        {{/if}}
      </main>
      {{> footer}}
    </div>
  </body>
</html>
`;

const LAYOUT_POST = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{page.title}} — {{site.title}}</title>
    {{#if page.description}}
    <meta name="description" content="{{page.description}}" />
    {{/if}}
    <link rel="stylesheet" href="/style.css" />
  </head>
  <body>
    <div class="container">
      {{> header}}
      <main>
        <article>
          <h1 class="post-title">{{page.title}}</h1>
          {{#if page.date}}
          <p class="post-meta">{{date page.date "short"}}</p>
          {{/if}} {{{ content }}}
        </article>
      </main>
      {{> footer}}
    </div>
  </body>
</html>
`;

const LAYOUT_PAGE = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{page.title}} — {{site.title}}</title>
    <link rel="stylesheet" href="/style.css" />
  </head>
  <body>
    <div class="container">
      {{> header}}
      <main>
        <h1>{{page.title}}</h1>
        {{{ content }}}
      </main>
      {{> footer}}
    </div>
  </body>
</html>
`;

const PARTIAL_HEADER = `<header>
  <a href="/" class="site-title">{{site.title}}</a>
  <nav>
    <a href="/about/">About</a>
  </nav>
</header>
`;

const PARTIAL_FOOTER = `<footer>
  {{#if site.author}}<span>{{site.author}}</span> · {{/if}}<span>Built with Aduro</span>
</footer>
`;

const STYLE_CSS = `:root {
  --bg: #ffffff;
  --fg: #1a1a1a;
  --muted: #666666;
  --accent: #2563eb;
  --border: #e5e5e5;
  --max: 680px;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0f0f0f;
    --fg: #e8e8e8;
    --muted: #999999;
    --accent: #60a5fa;
    --border: #2a2a2a;
  }
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 18px;
  line-height: 1.7;
  color: var(--fg);
  background: var(--bg);
  padding: 2rem 1.25rem;
}

.container {
  max-width: var(--max);
  margin: 0 auto;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border);
}

.site-title {
  font-weight: 700;
  font-size: 1rem;
  text-decoration: none;
  color: var(--fg);
}

header nav a {
  margin-left: 1.5rem;
  color: var(--muted);
  font-size: 0.9rem;
  text-decoration: none;
}

header nav a:hover {
  color: var(--fg);
}

main {
  min-height: 60vh;
  margin-bottom: 4rem;
}

h1 {
  font-size: 1.9rem;
  line-height: 1.2;
  margin-bottom: 0.4rem;
}
h2 {
  font-size: 1.35rem;
  margin: 2rem 0 0.5rem;
}
h3 {
  font-size: 1.1rem;
  margin: 1.5rem 0 0.4rem;
}
h4,
h5,
h6 {
  font-size: 1rem;
  margin: 1.25rem 0 0.4rem;
  font-weight: 600;
}

p {
  margin-bottom: 1rem;
}

a {
  color: var(--accent);
}
a:hover {
  text-decoration: none;
}

strong {
  font-weight: 600;
}
em {
  font-style: italic;
}

code {
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
  font-size: 0.85em;
  background: var(--border);
  padding: 0.1em 0.35em;
  border-radius: 3px;
}

pre {
  background: var(--border);
  padding: 1rem 1.25rem;
  border-radius: 6px;
  overflow-x: auto;
  margin-bottom: 1.5rem;
}

pre code {
  background: none;
  padding: 0;
  font-size: 0.875rem;
}

blockquote {
  border-left: 3px solid var(--accent);
  padding: 0.25rem 0 0.25rem 1rem;
  color: var(--muted);
  font-style: italic;
  margin: 1.5rem 0;
}

ul,
ol {
  padding-left: 1.5rem;
  margin-bottom: 1rem;
}
li {
  margin-bottom: 0.2rem;
}
li p {
  margin-bottom: 0.25rem;
}

img {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
  display: block;
  margin: 1.5rem 0;
}
hr {
  border: none;
  border-top: 1px solid var(--border);
  margin: 2.5rem 0;
}

.post-meta {
  color: var(--muted);
  font-size: 0.875rem;
  margin-bottom: 2.5rem;
}
.post-title {
  margin-bottom: 0.25rem;
}

.post-list {
  list-style: none;
  padding: 0;
}

.post-list li {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--border);
}

.post-list li:first-child {
  border-top: 1px solid var(--border);
}

.post-list a {
  text-decoration: none;
  font-weight: 500;
  color: var(--fg);
}

.post-list a:hover {
  color: var(--accent);
}

.post-date {
  color: var(--muted);
  font-size: 0.85rem;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

footer {
  color: var(--muted);
  font-size: 0.85rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
}
`;

const ABOUT_MD = `---
title: About
layout: page
---

This is my site. There are many like it, but this one is mine.
`;

export async function init(name: string, cwd = process.cwd()): Promise<void> {
  const root = join(cwd, name);

  const dirs = [
    root,
    join(root, 'content'),
    join(root, 'layouts', 'partials'),
    join(root, 'static'),
  ];

  for (const dir of dirs) {
    await mkdir(dir, { recursive: true });
  }

  const files: [string, string][] = [
    [join(root, 'config.yaml'), CONFIG(name)],
    [join(root, 'layouts', 'index.html'), LAYOUT_INDEX],
    [join(root, 'layouts', 'post.html'), LAYOUT_POST],
    [join(root, 'layouts', 'page.html'), LAYOUT_PAGE],
    [join(root, 'layouts', 'partials', 'header.html'), PARTIAL_HEADER],
    [join(root, 'layouts', 'partials', 'footer.html'), PARTIAL_FOOTER],
    [join(root, 'static', 'style.css'), STYLE_CSS],
    [join(root, 'content', 'about.md'), ABOUT_MD],
  ];

  for (const [path, content] of files) {
    await writeFile(path, content);
  }

  console.log(`Created ${name}/`);
  console.log(`  config.yaml`);
  console.log(`  content/about.md`);
  console.log(`  layouts/index.html`);
  console.log(`  layouts/post.html`);
  console.log(`  layouts/page.html`);
  console.log(`  layouts/partials/header.html`);
  console.log(`  layouts/partials/footer.html`);
  console.log(`  static/style.css`);
  console.log(``);
  console.log(`Get started:`);
  console.log(`  aduro serve ${name}`);
}
