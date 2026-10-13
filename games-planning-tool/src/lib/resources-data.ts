// Made with AI agents (Antigravity)
import { Resource, DEFAULT_CATEGORY } from '@/types/resource';
import { INITIAL_RESOURCES } from './initial-resources';

export { INITIAL_RESOURCES };

export function normalizeResourceCategories(categories: string[]): string[] {
  const filtered = categories.filter((c) => c && c.trim().length > 0);
  if (filtered.length === 0) {
    return [DEFAULT_CATEGORY];
  }
  return filtered;
}

export function createFolder(
  name: string,
  categories: string[],
  parentId?: string | null,
): import('@/types/resource').FolderResource {
  const randomSuffix =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID().split('-')[0]
      : Date.now().toString(36);
  return {
    id: `folder-${randomSuffix}`,
    name,
    type: 'folder',
    categories,
    parentId,
    childrenIds: [],
    createdAt: new Date().toISOString(),
    order: 0,
  };
}

const STORAGE_KEY = 'gpt_resources_state_v1';

let cachedResources: Resource[] = INITIAL_RESOURCES;
let hasLoadedFromStorage = false;

export function loadResourcesFromStorage(): Resource[] {
  if (typeof window === 'undefined') return INITIAL_RESOURCES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_RESOURCES;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_RESOURCES;
  } catch {
    return INITIAL_RESOURCES;
  }
}

export function getCachedResources(): Resource[] {
  if (typeof window === 'undefined') return INITIAL_RESOURCES;
  if (!hasLoadedFromStorage) {
    cachedResources = loadResourcesFromStorage();
    hasLoadedFromStorage = true;
  }
  return cachedResources;
}

export function subscribeToResources(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = () => {
    cachedResources = loadResourcesFromStorage();
    callback();
  };
  window.addEventListener('storage', handler);
  window.addEventListener('gpt-resources-change', handler);
  return () => {
    window.removeEventListener('storage', handler);
    window.removeEventListener('gpt-resources-change', handler);
  };
}

export function saveResourcesToStorage(resources: Resource[]): void {
  if (typeof window === 'undefined') return;
  try {
    cachedResources = resources;
    hasLoadedFromStorage = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resources));
    window.dispatchEvent(new Event('gpt-resources-change'));
  } catch (e) {
    console.error('Failed to save resources to localStorage', e);
  }
}

export function getCategoryTopLevelResources(
  resources: Resource[],
  category: string,
): Resource[] {
  return resources.filter(
    (r) => r.categories.includes(category) && !r.parentId,
  );
}

export function getFolderChildren(
  resources: Resource[],
  folderId: string,
): Resource[] {
  return resources.filter((r) => r.parentId === folderId);
}

export function getDescendantResourceIds(
  resources: Resource[],
  rootFolderId: string,
): string[] {
  const result: string[] = [];
  const queue: string[] = [rootFolderId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const children = resources.filter((r) => r.parentId === currentId);
    for (const child of children) {
      result.push(child.id);
      if (child.type === 'folder') {
        queue.push(child.id);
      }
    }
  }

  return result;
}

export function getFolderFamilyIds(
  resources: Resource[],
  folderId: string,
): Set<string> {
  return new Set([folderId, ...getDescendantResourceIds(resources, folderId)]);
}

export function cascadeAddCategoryToFolder(
  resources: Resource[],
  folderId: string,
  targetCategory: string,
): Resource[] {
  const familyIds = getFolderFamilyIds(resources, folderId);

  return resources.map((r) => {
    if (!familyIds.has(r.id) || r.categories.includes(targetCategory)) return r;
    const withoutGeneral = r.categories.filter((c) => c !== 'General');
    const newCategories = [...withoutGeneral, targetCategory];
    return {
      ...r,
      categories: newCategories.length > 0 ? newCategories : ['General'],
    };
  });
}

export function cascadeRemoveCategoryFromFolder(
  resources: Resource[],
  folderId: string,
  categoryToRemove: string,
): Resource[] {
  const familyIds = getFolderFamilyIds(resources, folderId);

  return resources.map((r) => {
    if (!familyIds.has(r.id)) return r;
    const remaining = r.categories.filter((c) => c !== categoryToRemove);
    return {
      ...r,
      categories: remaining.length > 0 ? remaining : [DEFAULT_CATEGORY],
    };
  });
}

export function removeFolderKeepContentsInTopLevel(
  resources: Resource[],
  folderId: string,
  categoryToRemove: string,
): Resource[] {
  const descendantIds = getDescendantResourceIds(resources, folderId);
  const descendantSet = new Set(descendantIds);

  return resources.map((r) => {
    if (r.id === folderId) {
      const remaining = r.categories.filter((c) => c !== categoryToRemove);
      return {
        ...r,
        categories: remaining.length > 0 ? remaining : [DEFAULT_CATEGORY],
      };
    }
    if (descendantSet.has(r.id)) {
      if (r.type !== 'folder') {
        return {
          ...r,
          parentId: null,
        };
      }
      const remaining = r.categories.filter((c) => c !== categoryToRemove);
      return {
        ...r,
        categories: remaining.length > 0 ? remaining : [DEFAULT_CATEGORY],
        parentId: null,
      };
    }
    return r;
  });
}
