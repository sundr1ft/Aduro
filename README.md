# Aduro

Minimal static site generator for personal sites and blogs. Write Markdown, get HTML.

## Install

```sh
npm install -g aduro
```

Or as a project dependency:

```sh
npm install aduro
```

## Usage

```sh
aduro build <site-dir> [out-dir]
aduro serve <site-dir> [--port=3000]
```

`build` compiles your site to `<site-dir>/public` by default.  
`serve` builds, then watches for changes and live-reloads the browser.

## Site structure

```
my-site/
├── config.yaml        # site metadata
├── content/
│   ├── index.md       # home page (optional)
│   ├── about.md       # becomes /about/
│   └── posts/
│       └── hello.md   # becomes /posts/hello/
├── layouts/
│   ├── page.html      # Handlebars layout for pages
│   ├── post.html      # Handlebars layout for posts
│   ├── index.html     # layout for auto-generated index (optional)
│   └── partials/      # Handlebars partials
└── static/            # copied to output as-is
```

### config.yaml

```yaml
title: My Site
baseUrl: https://example.com
description: A personal site
author: Your Name
```

### Front matter

```markdown
---
title: Hello World
date: 2025-01-01
description: My first post
draft: false
layout: post   # overrides the default layout
---

Content goes here.
```

### Layouts

Layouts are Handlebars templates. Available context:

| Variable   | Description                          |
|------------|--------------------------------------|
| `site`     | Values from `config.yaml`            |
| `page`     | Front matter from the current page   |
| `content`  | Rendered HTML of the page body       |
| `posts`    | Array of all non-draft posts         |
| `url`      | URL of the current page              |

## Using from a separate site repo

```json
{
  "scripts": {
    "build": "aduro build .",
    "serve": "aduro serve ."
  },
  "dependencies": {
    "aduro": "^0.1.0"
  }
}
```

## License

MIT
