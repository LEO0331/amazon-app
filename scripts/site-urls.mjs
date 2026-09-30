const origin = 'https://leo0331.github.io';
const base = '/amazon-app/';

function assertSiteUrl(raw, page, exists) {
  if (/^(?:mailto:|tel:|data:)/i.test(raw)) return;
  const url = new URL(raw, new URL(page.replace(/index\.html$/, ''), `${origin}${base}`));
  if (url.origin !== origin) return;
  if (!url.pathname.startsWith(base)) throw new Error(`Local URL outside ${base}: ${raw}`);
  const path = decodeURIComponent(url.pathname.slice(base.length));
  if (path.includes('..')) throw new Error(`Unsafe local path: ${raw}`);
  if (!exists(path || 'index.html') && !exists(`${path}index.html`)) throw new Error(`Broken local path: ${raw}`);
}

export function auditHtmlLinks(html, page, exists) {
  for (const tag of html.match(/<(?:a|link|img|script|source)\b[^>]*>/gi) ?? []) {
    for (const [, attribute, value] of tag.matchAll(/\b(href|src|srcset)="([^"]*)"/gi)) {
      if (attribute.toLowerCase() === 'srcset') {
        for (const candidate of value.split(',')) assertSiteUrl(candidate.trim().split(/\s+/)[0], page, exists);
      } else {
        assertSiteUrl(value, page, exists);
      }
    }
  }
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    if (!/\bproperty="og:(?:url|image)"/i.test(tag)) continue;
    const value = tag.match(/\bcontent="([^"]*)"/i)?.[1];
    if (value) assertSiteUrl(value, page, exists);
  }
}
