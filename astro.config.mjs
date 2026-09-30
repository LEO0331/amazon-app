import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';
import { assertPublicContent } from './scripts/publication-policy.mjs';

assertPublicContent(fileURLToPath(new URL('./src/content/objects/', import.meta.url)));

export default defineConfig({
  site: 'https://leo0331.github.io',
  base: '/amazon-app',
  output: 'static',
  trailingSlash: 'always',
  i18n: {
    locales: ['en', 'zh'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: false },
  },
});
