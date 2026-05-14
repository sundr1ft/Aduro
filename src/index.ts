#!/usr/bin/env node
import { resolve, join } from 'path';
import { build } from './build.js';
import { serve } from './server.js';

const [, , command, siteDirArg, ...rest] = process.argv;

if (!command || command === '--help' || command === '-h') {
  console.log(`aduro — minimal static site generator

Usage:
  aduro build <site-dir> [out-dir]
  aduro serve <site-dir> [--port=3000]`);
  process.exit(0);
}

const siteDir = resolve(siteDirArg ?? '.');
const outDir = resolve(rest.find((a) => !a.startsWith('--')) ?? join(siteDir, 'public'));

if (command === 'build') {
  build(siteDir, outDir);
} else if (command === 'serve') {
  const portArg = rest.find((a) => a.startsWith('--port='));
  const port = portArg ? parseInt(portArg.split('=')[1], 10) : 3000;
  serve(siteDir, outDir, port);
} else {
  console.error(`unknown command: ${command}`);
  process.exit(1);
}
