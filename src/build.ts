import { mkdirSync, writeFileSync, existsSync, cpSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { load as parseYaml } from 'js-yaml';
import { loadPages } from './content';
import { loadLayouts } from './render';
import { Page, SiteConfig, PostSummary } from './types';

function loadConfig(siteDir: string): SiteConfig {
  const raw = readFileSync(join(siteDir, 'config.yaml'), 'utf-8');
  return parseYaml(raw) as SiteConfig;
}

function toPostSummary(p: Page): PostSummary {
  return {
    url: p.url,
    title: p.data.title,
    date: p.data.date || '',
    description: p.data.description,
  };
}

export function build(siteDir: string, outDir: string): void {
  const config = loadConfig(siteDir);
  const layouts = loadLayouts(join(siteDir, 'layouts'));
  const pages = loadPages(join(siteDir, 'content'), outDir);

  const posts: PostSummary[] = pages
    .filter((p) => p.isPost && !p.data.draft)
    .sort((a, b) => {
      const da = a.data.date ? new Date(a.data.date).getTime() : 0;
      const db = b.data.date ? new Date(b.data.date).getTime() : 0;
      return db - da;
    })
    .map(toPostSummary);

  let rendered = 0;

  for (const page of pages) {
    if (page.data.draft) continue;
    const layoutName = page.data.layout ?? (page.isPost ? 'post' : 'page');
    const layout = layouts.get(layoutName);
    if (!layout) {
      console.warn(`  warn: layout "${layoutName}" not found — skipping ${page.url}`);
      continue;
    }
    const html = layout({
      site: config,
      page: page.data,
      content: page.content,
      posts,
      url: page.url,
    });
    mkdirSync(dirname(page.outputPath), { recursive: true });
    writeFileSync(page.outputPath, html);
    rendered++;
  }

  // Auto-generate index page if no content/index.md
  if (!pages.some((p) => p.slug === '')) {
    const indexLayout = layouts.get('index');
    if (indexLayout) {
      const html = indexLayout({ site: config, posts, page: { title: config.title }, url: '/' });
      mkdirSync(outDir, { recursive: true });
      writeFileSync(join(outDir, 'index.html'), html);
      rendered++;
    }
  }

  const staticDir = join(siteDir, 'static');
  if (existsSync(staticDir)) {
    cpSync(staticDir, outDir, { recursive: true });
  }

  console.log(`built ${rendered} pages → ${outDir}`);
}
