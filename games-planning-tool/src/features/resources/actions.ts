// 50% or more AI-generated
'use server';

import {
  createResource,
  deleteResources as deleteResourcesFromDb,
  moveResources as moveResourcesInDb,
  renameResource as renameResourceInDb,
  reorderResources as reorderResourcesInDb,
  updateResourceCategories as updateResourceCategoriesInDb,
} from '@/lib/resources';
import { uploadResourceFile } from '@/lib/storage';
import { getSession } from '@/server/auth/session'; // TODO(auth): real session
import {
  MAX_RESOURCE_FILE_SIZE,
  MAX_RESOURCE_FILE_SIZE_MESSAGE,
} from '@/features/resources/types/resource';

async function assertAdmin() {
  const session = await getSession();
  if (session.user.role !== 'admin') {
    throw new Error('You do not have permission to modify resources.');
  }
}

function parseCategories(value: FormDataEntryValue | null): string[] {
  if (typeof value !== 'string' || value === '') return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error('Invalid categories.');
  }

  if (
    !Array.isArray(parsed) ||
    !parsed.every((item) => typeof item === 'string')
  ) {
    throw new Error('Invalid categories.');
  }
  return parsed;
}

function validateUrl(value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error('Please provide a valid URL for the resource.');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Please provide a valid URL for the resource.');
  }
  return value;
}

export async function createLinkResource(input: {
  name: string;
  url: string;
  categories: string[];
  parentId?: string | null;
}) {
  await assertAdmin();

  return createResource({
    name: input.name,
    categories: input.categories,
    parentId: input.parentId ?? null,
    fileOrWebpageURL: validateUrl(input.url),
    isWebpage: true,
  });
}

export async function createFolder(input: {
  name: string;
  categories?: string[];
  parentId?: string | null;
}) {
  await assertAdmin();

  return createResource({
    name: input.name,
    categories: input.categories,
    parentId: input.parentId ?? null,
    fileOrWebpageURL: null,
  });
}

export async function createFileResource(formData: FormData) {
  await assertAdmin();

  const file = formData.get('file');
  const name = String(formData.get('name') ?? '').trim();

  if (!(file instanceof File)) throw new Error('A file is required.');
  if (!name) throw new Error('A name is required.');
  if (file.size > MAX_RESOURCE_FILE_SIZE) {
    throw new Error(MAX_RESOURCE_FILE_SIZE_MESSAGE);
  }

  const categories = parseCategories(formData.get('categories'));
  const url = await uploadResourceFile(file);

  return createResource({
    name,
    categories,
    parentId: (formData.get('parentId') as string | null) || null,
    fileOrWebpageURL: url,
  });
}

export async function renameResource(id: string, name: string) {
  await assertAdmin();
  return renameResourceInDb(id, name);
}

export async function updateResourceCategories(
  id: string,
  categories: string[],
) {
  await assertAdmin();
  return updateResourceCategoriesInDb(id, categories);
}

export async function deleteResources(ids: string[]) {
  await assertAdmin();
  return deleteResourcesFromDb(ids);
}

export async function moveResources(
  ids: string[],
  targetParentId: string | null,
) {
  await assertAdmin();
  return moveResourcesInDb(ids, targetParentId);
}

export async function reorderResources(
  parentId: string | null,
  orderedIds: string[],
) {
  await assertAdmin();
  return reorderResourcesInDb(parentId, orderedIds);
}
