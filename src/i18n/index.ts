import type { PublicObject } from '../lib/content';
import { sitePath } from '../lib/urls';
import { zhObjects } from './zh-objects';
import { ui, type Locale } from './ui';

export { ui, type Locale };

export function localePath(locale: Locale, path = '') {
  return sitePath(`${locale === 'zh' ? 'zh/' : ''}${path}`);
}

export function languagePaths(pathname: string) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const relative = pathname.slice(base.length).replace(/^\/+/, '').replace(/^zh\//, '');
  return { en: localePath('en', relative), zh: localePath('zh', relative) };
}

export function objectSlug(object: PublicObject) {
  return object.id.replace(/\.md$/, '');
}

export function localizedObject(object: PublicObject, locale: Locale) {
  const data = object.data;
  if (locale === 'en') {
    return {
      title: data.title, category: data.category, summary: data.summary, story: object.body,
      maker: data.maker, creator: data.creator, materials: data.materials ?? [],
      tags: data.tags ?? [], edition: data.edition,
      imageAlts: data.images.map((image) => image.alt),
      imageCaptions: data.images.map((image) => image.caption ?? null),
    };
  }

  const translated = zhObjects[objectSlug(object)];
  if (!translated) throw new Error(`Missing zh translation for ${object.id}`);
  if (translated.imageAlts.length !== data.images.length ||
      (translated.materials?.length ?? 0) !== (data.materials?.length ?? 0) ||
      (translated.tags?.length ?? 0) !== (data.tags?.length ?? 0) ||
      (data.maker && !translated.maker) || (data.creator && !translated.creator) ||
      (data.edition && !translated.edition)) {
    throw new Error(`Incomplete zh translation for ${object.id}`);
  }
  const captions = data.images.map((image) => Boolean(image.caption));
  if (translated.imageCaptions && translated.imageCaptions.length !== data.images.length ||
      captions.some((hasCaption, index) => hasCaption !== Boolean(translated.imageCaptions?.[index]?.trim()))) {
    throw new Error(`Inconsistent zh image captions for ${object.id}`);
  }
  return {
    title: translated.title, category: translated.category, summary: translated.summary,
    story: translated.story, maker: translated.maker, creator: translated.creator,
    materials: translated.materials ?? [], tags: translated.tags ?? [],
    edition: translated.edition, imageAlts: translated.imageAlts,
    imageCaptions: translated.imageCaptions ?? data.images.map(() => null),
  };
}
