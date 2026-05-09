import Handlebars from 'handlebars';
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, extname, basename } from 'path';

export type TemplateMap = Map<string, Handlebars.TemplateDelegate>;

export function loadLayouts(layoutsDir: string): TemplateMap {
  const hb = Handlebars.create();

  hb.registerHelper('date', (dateStr: unknown, format: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr as string);
    if (isNaN(d.getTime())) return String(dateStr);
    if (format === 'short') {
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
    return d.toISOString().split('T')[0];
  });

  const partialsDir = join(layoutsDir, 'partials');
  if (existsSync(partialsDir)) {
    for (const file of readdirSync(partialsDir)) {
      const full = join(partialsDir, file);
      if (statSync(full).isFile() && extname(file) === '.html') {
        hb.registerPartial(basename(file, '.html'), readFileSync(full, 'utf-8'));
      }
    }
  }

  const layouts: TemplateMap = new Map();
  for (const file of readdirSync(layoutsDir)) {
    const full = join(layoutsDir, file);
    if (statSync(full).isFile() && extname(file) === '.html') {
      layouts.set(basename(file, '.html'), hb.compile(readFileSync(full, 'utf-8')));
    }
  }
  return layouts;
}
