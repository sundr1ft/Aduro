import { describe, test, expect, beforeAll, afterAll } from 'vitest'
import { build } from '../src/build.js'
import { existsSync, readFileSync, mkdtempSync, rmSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { tmpdir } from 'os'

const __dirname = dirname(fileURLToPath(import.meta.url))
const siteDir = join(__dirname, '../example')
const outDir = mkdtempSync(join(tmpdir(), 'aduro-test-'))

beforeAll(() => build(siteDir, outDir))
afterAll(() => rmSync(outDir, { recursive: true, force: true }))

const read = (path: string) => readFileSync(join(outDir, path), 'utf-8')
const exists = (path: string) => existsSync(join(outDir, path))

describe('output files', () => {
  test('generates auto index page', () => expect(exists('index.html')).toBe(true))
  test('generates about page', () => expect(exists('about/index.html')).toBe(true))
  test('generates hello-world post', () => expect(exists('posts/hello-world/index.html')).toBe(true))
  test('generates second-post', () => expect(exists('posts/second-post/index.html')).toBe(true))
  test('generates post with no date', () => expect(exists('posts/no-date-post/index.html')).toBe(true))
  test('generates page with custom layout', () => expect(exists('projects/index.html')).toBe(true))
  test('copies static assets', () => expect(exists('style.css')).toBe(true))
})

describe('drafts', () => {
  test('draft post output file does not exist', () => {
    expect(exists('posts/draft-post/index.html')).toBe(false)
  })
  test('draft post title absent from post list', () => {
    expect(read('index.html')).not.toContain('Should Not Publish')
  })
})

describe('post list', () => {
  test('posts sorted newest-first', () => {
    const html = read('index.html')
    expect(html.indexOf('Building in Public')).toBeLessThan(html.indexOf('Hello, World'))
  })
  test('undated post appears in list without a date span', () => {
    const html = read('index.html')
    expect(html).toContain('A Timeless Post')
    // the date span should only appear alongside its title, not for undated posts
    const timelessPos = html.indexOf('A Timeless Post')
    const nextPostPos = html.indexOf('<li>', timelessPos + 1)
    const snippet = html.slice(timelessPos, nextPostPos === -1 ? undefined : nextPostPos)
    expect(snippet).not.toContain('post-date')
  })
})

describe('content rendering', () => {
  test('markdown headings rendered to HTML', () => {
    expect(read('posts/hello-world/index.html')).toContain('<h2>')
  })
  test('markdown code blocks rendered', () => {
    expect(read('posts/hello-world/index.html')).toContain('<pre><code')
  })
  test('markdown blockquote rendered', () => {
    expect(read('posts/second-post/index.html')).toContain('<blockquote>')
  })
  test('post title present in page', () => {
    expect(read('posts/hello-world/index.html')).toContain('Hello, World')
  })
  test('post body content rendered', () => {
    expect(read('posts/hello-world/index.html')).toContain('No plugins, no themes')
  })
})

describe('dates', () => {
  test('post date rendered and formatted', () => {
    const html = read('posts/hello-world/index.html')
    expect(html).toContain('class="post-meta"')
    expect(html).toContain('Mar')
  })
  test('post without date has no date metadata element', () => {
    expect(read('posts/no-date-post/index.html')).not.toContain('class="post-meta"')
  })
})

describe('metadata', () => {
  test('description meta tag present when front matter has description', () => {
    expect(read('posts/hello-world/index.html')).toContain('name="description"')
  })
  test('description meta tag absent when not set', () => {
    expect(read('posts/no-date-post/index.html')).not.toContain('name="description"')
  })
  test('site title in page head', () => {
    expect(read('index.html')).toContain('My Blog')
  })
  test('page title combined with site title', () => {
    expect(read('posts/hello-world/index.html')).toContain('Hello, World — My Blog')
  })
})

describe('layouts', () => {
  test('custom wide layout applied to projects page', () => {
    expect(read('projects/index.html')).toContain('class="wide"')
  })
  test('default post layout used when none specified', () => {
    expect(read('posts/hello-world/index.html')).toContain('class="post-title"')
  })
  test('header partial rendered', () => {
    expect(read('posts/hello-world/index.html')).toContain('<header>')
  })
  test('footer partial rendered', () => {
    expect(read('posts/hello-world/index.html')).toContain('Built with Aduro')
  })
})
