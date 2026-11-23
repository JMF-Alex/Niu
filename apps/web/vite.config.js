import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

const root = import.meta.dirname;

const pages = Object.fromEntries(
  readdirSync(root).filter((f) => f.endsWith('.html')).map((f) => [f.slice(0, -5), resolve(root, f)]),
);

const partials = {
  name: 'niu-partials',
  transformIndexHtml: {
    order: 'pre',
    handler: (html) => html.replace(/<!--\s*include:([\w-]+)\s*-->/g, (_, name) =>
      readFileSync(resolve(root, 'partials', `${name}.html`), 'utf8')),
  },
};

export default defineConfig({
  plugins: [partials],
  server: { proxy: { '/api': process.env.API_URL ?? 'http://localhost:4000' } },
  build: { rollupOptions: { input: pages } },
});
