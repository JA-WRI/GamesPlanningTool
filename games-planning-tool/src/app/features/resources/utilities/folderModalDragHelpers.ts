// Made with AI agents (Antigravity)
import { Resource } from '@/types/resource';

/**
 * Reorders resources within a local list when a card is dragged over another card.
 */
export function reorderListWithInjection(
  currentList: Resource[],
  allResources: Resource[],
  draggedIds: string[],
  targetId: string,
  clientX: number,
  rect: DOMRect,
): Resource[] {
  const sourceId = draggedIds[0];
  const midX = rect.left + rect.width / 2;

  const targetIdx = currentList.findIndex((r) => r.id === targetId);
  if (targetIdx === -1) return currentList;

  const sourceIdx = currentList.findIndex((r) => r.id === sourceId);
  if (sourceIdx !== -1) {
    if (sourceIdx === targetIdx) return currentList;
    if (sourceIdx < targetIdx && clientX < midX) return currentList;
    if (sourceIdx > targetIdx && clientX > midX) return currentList;
  }

  const itemsToMove = draggedIds
    .map(
      (id) =>
        currentList.find((r) => r.id === id) ||
        allResources.find((r) => r.id === id),
    )
    .filter(Boolean) as Resource[];
  if (itemsToMove.length === 0) return currentList;

  const filtered = currentList.filter((r) => !draggedIds.includes(r.id));
  let newTargetIdx = filtered.findIndex((r) => r.id === targetId);
  if (newTargetIdx === -1) newTargetIdx = filtered.length;

  let insertAfter = false;
  if (sourceIdx !== -1) insertAfter = sourceIdx < targetIdx;
  else insertAfter = clientX > midX;

  if (insertAfter) newTargetIdx++;

  filtered.splice(newTargetIdx, 0, ...itemsToMove);
  return filtered;
}

/**
 * Checks whether a given client coordinate is within the modal panel bounds.
 */
export function isPointInsidePanel(
  panel: HTMLElement | null,
  clientX: number,
  clientY: number,
  padding = 10,
): boolean {
  if (!panel) return true;
  const rect = panel.getBoundingClientRect();
  return (
    clientX >= rect.left - padding &&
    clientX <= rect.right + padding &&
    clientY >= rect.top - padding &&
    clientY <= rect.bottom + padding
  );
}

export function getFolderBreadcrumbs(
  currentFolder: Resource | null,
  allResources: Resource[],
): { id: string; name: string }[] {
  const breadcrumbs: { id: string; name: string }[] = [];
  let cur = currentFolder;
  while (cur) {
    breadcrumbs.unshift({ id: cur.id, name: cur.name });
    if (cur.parentId) {
      cur = allResources.find((r) => r.id === cur?.parentId) || null;
    } else {
      cur = null;
    }
  }
  return breadcrumbs;
}
