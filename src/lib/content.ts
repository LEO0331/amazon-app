import { getCollection } from 'astro:content';
import { isPublic } from './archive.mjs';
import { validateRelatedReferences } from './relationships.mjs';

export async function getPublicObjects() {
  const objects = await getCollection('objects', isPublic);
  validateRelatedReferences(objects);
  return objects;
}

export type PublicObject = Awaited<ReturnType<typeof getPublicObjects>>[number];

export function newestFirst(objects: PublicObject[]) {
  return [...objects].sort((a, b) => b.data.dateAdded.getTime() - a.data.dateAdded.getTime());
}

export function itemPath(id: string) {
  return `item/${id.replace(/\.md$/, '')}/`;
}

export function statusLabel(status: string) {
  return status.replaceAll('-', ' ').replace(/^./, (letter) => letter.toUpperCase());
}
