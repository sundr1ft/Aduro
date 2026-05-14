import { readFileSync, readdirSync, statSync } from 'fs';
import { join, basename, extname, relative } from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { Page, PageData } from './types.js';

function walk(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...walk(full));
    } else if (extname(entry) === '.md') {
      results.push(full);
    }
  }
  return results;
}

export function loadPages(contentDir: string, outDir: string): Page[] {
  const files = walk(contentDir);
  return files.map((file) => {
    const rel = relative(contentDir, file).replace(/\\/g, '/');
    const { data, content } = matter(readFileSync(file, 'utf-8'));
    const rendered = marked(content) as string;

    const isPost = rel.startsWith('posts/');
    const name = basename(rel, '.md');

    let slug: string;
    let url: string;
    let outputPath: string;

    if (name === 'index' && !isPost) {
      slug = '';
      url = '/';
      outputPath = join(outDir, 'index.html');
    } else if (isPost) {
      slug = name;
      url = `/posts/${name}/`;
      outputPath = join(outDir, 'posts', name, 'index.html');
    } else {
      slug = name;
      url = `/${name}/`;
      outputPath = join(outDir, name, 'index.html');
    }

    return { slug, url, content: rendered, data: data as PageData, isPost, outputPath };
  });
}
