// 50% or more AI-generated
import {
  Resource,
  DEFAULT_CATEGORY,
} from '@/features/resources/types/resource';

export function normalizeResourceCategories(categories: string[]): string[] {
  const filtered = categories.filter((c) => c && c.trim().length > 0);
  if (filtered.length === 0) {
    return [DEFAULT_CATEGORY];
  }
  return filtered;
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
