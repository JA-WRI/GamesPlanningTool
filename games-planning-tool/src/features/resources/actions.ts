'use server';

import {
  createResource,
  deleteResources as deleteResourcesFromDb,
  moveResources as moveResourcesInDb,
  renameResource as renameResourceInDb,
  reorderResources as reorderResourcesInDb,
  updateResourceCategories as updateResourceCategoriesInDb,
} from '@/lib/resources';
import { uploadResourceFile } from '@/lib/supabase';

export async function createLinkResource(input: {
  name: string;
  url: string;
  categories: string[];
  parentId?: string | null;
}) {
  return createResource({
    name: input.name,
    categories: input.categories,
    parentId: input.parentId ?? null,
    fileOrWebpageURL: input.url,
    isWebpage: true,
  });
}

export async function createFolder(input: {
  name: string;
  categories?: string[];
  parentId?: string | null;
}) {
  return createResource({
    name: input.name,
    categories: input.categories,
    parentId: input.parentId ?? null,
    fileOrWebpageURL: null,
  });
}

export async function createFileResource(formData: FormData) {
  const file = formData.get('file');
  const name = String(formData.get('name') ?? '').trim();

  if (!(file instanceof File)) throw new Error('A file is required.');
  if (!name) throw new Error('A name is required.');

  const url = await uploadResourceFile(file);

  return createResource({
    name,
    categories: JSON.parse(String(formData.get('categories') ?? '[]')),
    parentId: (formData.get('parentId') as string | null) || null,
    fileOrWebpageURL: url,
  });
}

export async function renameResource(id: string, name: string) {
  return renameResourceInDb(id, name);
}

export async function updateResourceCategories(
  id: string,
  categories: string[],
) {
  return updateResourceCategoriesInDb(id, categories);
}

export async function deleteResources(ids: string[]) {
  return deleteResourcesFromDb(ids);
}

export async function moveResources(
  ids: string[],
  targetParentId: string | null,
) {
  return moveResourcesInDb(ids, targetParentId);
}

export async function reorderResources(
  parentId: string | null,
  orderedIds: string[],
) {
  return reorderResourcesInDb(parentId, orderedIds);
}
