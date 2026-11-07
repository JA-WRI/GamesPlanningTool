// 50% or more AI-generated
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@/generated/prisma/client';
import type { ResourceModel } from '@/generated/prisma/models/Resource';
import {
  CANADIAN_NSOS,
  type Resource,
} from '@/features/resources/types/resource';

const DEFAULT_CATEGORY = 'General';
const PUBLIC_CATEGORIES = ['General', 'Global'];
const GAME_CATEGORIES = ['Summer Games', 'Winter Games'];

export type ResourceVisibility = {
  gameCategory: string;
  nsoCategory?: string;
};

export type NewResource = {
  name: string;
  categories?: string[];
  parentId?: string | null;
  fileOrWebpageURL: string | null;
  isWebpage?: boolean;
};

function normalizeCategories(categories: string[] = []): string[] {
  const filtered = categories.filter((category) => category.trim());
  return filtered.length > 0 ? filtered : [DEFAULT_CATEGORY];
}

function fileNameFromUrl(url: string): string {
  const name = url.split('?')[0].split('/').pop();
  if (!name || name === '#') return 'document';
  try {
    return decodeURIComponent(name);
  } catch {
    return name;
  }
}

function faviconUrl(url: string): string {
  return `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(url)}&sz=128`;
}

function toResource(row: ResourceModel): Resource {
  const base = {
    id: row.id,
    name: row.name,
    categories: row.categories,
    parentId: row.parentFolderId,
  };

  if (row.fileOrWebpageURL === null) {
    return { ...base, type: 'folder' };
  }

  if (row.isWebpage) {
    return {
      ...base,
      type: 'link',
      URL: row.fileOrWebpageURL,
      previewUrl: faviconUrl(row.fileOrWebpageURL),
    };
  }

  return {
    ...base,
    type: 'file',
    fileUrl: row.fileOrWebpageURL,
    file: { name: fileNameFromUrl(row.fileOrWebpageURL) },
  };
}

function orderSiblingGroup(rows: ResourceModel[]): ResourceModel[] {
  const byId = new Map(rows.map((row) => [row.id, row]));
  const head = rows.find(
    (row) => !row.previousElementId || !byId.has(row.previousElementId),
  );

  const ordered: ResourceModel[] = [];
  const seen = new Set<string>();
  let current = head;

  while (current && !seen.has(current.id)) {
    ordered.push(current);
    seen.add(current.id);
    current = current.nextElementId
      ? byId.get(current.nextElementId)
      : undefined;
  }

  return [...ordered, ...rows.filter((row) => !seen.has(row.id))];
}

function orderResources(rows: ResourceModel[]): ResourceModel[] {
  const groups = new Map<string | null, ResourceModel[]>();

  for (const row of rows) {
    const group = groups.get(row.parentFolderId) ?? [];
    group.push(row);
    groups.set(row.parentFolderId, group);
  }

  return [...groups.keys()]
    .sort((a, b) => (a === null ? -1 : b === null ? 1 : 0))
    .flatMap((parentId) => orderSiblingGroup(groups.get(parentId)!));
}

async function writeSiblingOrder(orderedIds: string[]): Promise<void> {
  if (orderedIds.length === 0) return;

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.resource.update({
        where: { id },
        data: {
          previousElementId: orderedIds[index - 1] ?? null,
          nextElementId: orderedIds[index + 1] ?? null,
        },
      }),
    ),
  );
}

async function rechainSiblings(parentFolderId: string | null): Promise<void> {
  const siblings = await prisma.resource.findMany({
    where: { parentFolderId },
  });
  await writeSiblingOrder(orderSiblingGroup(siblings).map((row) => row.id));
}

function collectDescendantIds(
  rows: ResourceModel[],
  ids: string[],
): Set<string> {
  const childrenByParent = new Map<string, ResourceModel[]>();
  for (const row of rows) {
    if (!row.parentFolderId) continue;
    const children = childrenByParent.get(row.parentFolderId) ?? [];
    children.push(row);
    childrenByParent.set(row.parentFolderId, children);
  }

  const result = new Set(ids);
  const queue = [...ids];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    for (const child of childrenByParent.get(currentId) ?? []) {
      if (result.has(child.id)) continue;
      result.add(child.id);
      queue.push(child.id);
    }
  }

  return result;
}

function wouldCreateCycle(
  rows: ResourceModel[],
  movedIds: Set<string>,
  targetId: string,
): boolean {
  const byId = new Map(rows.map((row) => [row.id, row]));
  let current = byId.get(targetId);

  while (current) {
    if (movedIds.has(current.id)) return true;
    current = current.parentFolderId
      ? byId.get(current.parentFolderId)
      : undefined;
  }

  return false;
}

function visibilityWhere({
  gameCategory,
  nsoCategory,
}: ResourceVisibility): Prisma.ResourceWhereInput {
  const matchesGame: Prisma.ResourceWhereInput = {
    OR: [
      { categories: { hasSome: PUBLIC_CATEGORIES } },
      { categories: { has: gameCategory } },
      { NOT: { categories: { hasSome: GAME_CATEGORIES } } },
    ],
  };

  if (!nsoCategory) return matchesGame;

  return {
    AND: [
      matchesGame,
      {
        OR: [
          { categories: { hasSome: PUBLIC_CATEGORIES } },
          { categories: { has: nsoCategory } },
          { NOT: { categories: { hasSome: [...CANADIAN_NSOS] } } },
        ],
      },
    ],
  };
}

export async function listResources(
  visibility?: ResourceVisibility,
): Promise<Resource[]> {
  const rows = await prisma.resource.findMany({
    where: visibility ? visibilityWhere(visibility) : undefined,
  });
  return orderResources(rows).map(toResource);
}

export async function createResource(input: NewResource): Promise<Resource[]> {
  const parentFolderId = input.parentId ?? null;
  const siblings = await prisma.resource.findMany({
    where: { parentFolderId },
  });
  const ordered = orderSiblingGroup(siblings);
  const tail = ordered[ordered.length - 1];

  const created = await prisma.resource.create({
    data: {
      name: input.name,
      categories: normalizeCategories(input.categories),
      parentFolderId,
      fileOrWebpageURL: input.fileOrWebpageURL,
      isWebpage: input.isWebpage ?? false,
      previousElementId: tail?.id ?? null,
    },
  });

  if (tail) {
    await prisma.resource.update({
      where: { id: tail.id },
      data: { nextElementId: created.id },
    });
  }

  return listResources();
}

export async function renameResource(
  id: string,
  name: string,
): Promise<Resource[]> {
  await prisma.resource.update({ where: { id }, data: { name } });
  return listResources();
}

export async function updateResourceCategories(
  id: string,
  categories: string[],
): Promise<Resource[]> {
  await prisma.resource.update({
    where: { id },
    data: { categories: normalizeCategories(categories) },
  });
  return listResources();
}

export async function deleteResources(ids: string[]): Promise<Resource[]> {
  const rows = await prisma.resource.findMany();
  const toDelete = collectDescendantIds(rows, ids);
  const affectedParents = new Set(
    rows.filter((row) => toDelete.has(row.id)).map((row) => row.parentFolderId),
  );

  await prisma.resource.deleteMany({
    where: { id: { in: [...toDelete] } },
  });

  for (const parentId of affectedParents) {
    if (parentId && toDelete.has(parentId)) continue;
    await rechainSiblings(parentId);
  }

  return listResources();
}

// Exceeds 50 lines: validates targets, links siblings, and reorders the old parent.
export async function moveResources(
  ids: string[],
  targetParentId: string | null,
): Promise<Resource[]> {
  const rows = await prisma.resource.findMany();
  const byId = new Map(rows.map((row) => [row.id, row]));
  const target = targetParentId ? byId.get(targetParentId) : null;

  if (targetParentId && (!target || target.fileOrWebpageURL !== null)) {
    throw new Error('Target folder not found.');
  }
  if (targetParentId && wouldCreateCycle(rows, new Set(ids), targetParentId)) {
    throw new Error('A folder cannot be moved into itself.');
  }

  const movedIds = ids.filter((id) => byId.has(id));
  const oldParents = new Set(
    movedIds
      .map((id) => byId.get(id)!.parentFolderId)
      .filter((parentId) => parentId !== targetParentId),
  );

  const remainingTargetSiblings = rows.filter(
    (row) =>
      row.parentFolderId === targetParentId && !movedIds.includes(row.id),
  );
  const targetTail = orderSiblingGroup(remainingTargetSiblings).at(-1);

  let previousId = targetTail?.id ?? null;

  for (const id of movedIds) {
    await prisma.resource.update({
      where: { id },
      data: {
        parentFolderId: targetParentId,
        previousElementId: previousId,
        nextElementId: null,
      },
    });

    if (previousId) {
      await prisma.resource.update({
        where: { id: previousId },
        data: { nextElementId: id },
      });
    }

    previousId = id;
  }

  for (const parentId of oldParents) {
    await rechainSiblings(parentId);
  }

  return listResources();
}

export async function reorderResources(
  parentFolderId: string | null,
  orderedIds: string[],
): Promise<Resource[]> {
  const siblings = await prisma.resource.findMany({
    where: { parentFolderId },
  });
  const currentOrder = orderSiblingGroup(siblings).map((row) => row.id);
  const ordered = orderedIds.filter((id) => currentOrder.includes(id));
  const positions = currentOrder
    .map((id, index) => (ordered.includes(id) ? index : -1))
    .filter((index) => index >= 0);

  const nextOrder = [...currentOrder];
  positions.forEach((position, index) => {
    nextOrder[position] = ordered[index];
  });

  await writeSiblingOrder(nextOrder);
  return listResources();
}
