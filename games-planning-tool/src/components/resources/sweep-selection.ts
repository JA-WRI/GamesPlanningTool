import { Resource } from '@/types/resource';

export interface SweepGestureState {
  startIndex: number;
  cardId: string;
  startX: number;
  initialDir: 'right' | 'left';
  lastCurrentIndex: number;
  lastClientX: number;
  movingDirection: 'right' | 'left';
  initialSelectedSnapshot: Set<string>;
  filteredResources: Resource[];
  scrollContainer: HTMLDivElement | null;
}

export function createSweepState(
  startIndex: number,
  cardId: string,
  startX: number,
  initialClientX: number,
  selectedIds: Set<string>,
  filteredResources: Resource[],
  scrollContainer: HTMLDivElement | null,
): SweepGestureState {
  const dir = initialClientX >= startX ? 'right' : 'left';
  return {
    startIndex,
    cardId,
    startX,
    initialDir: dir,
    lastCurrentIndex: startIndex,
    lastClientX: initialClientX,
    movingDirection: dir,
    initialSelectedSnapshot: new Set(selectedIds),
    filteredResources,
    scrollContainer,
  };
}

export function autoScrollContainer(
  container: HTMLDivElement | null,
  clientX: number,
) {
  if (!container) return;
  const rect = container.getBoundingClientRect();
  if (clientX < rect.left + 40) {
    container.scrollLeft -= 12;
  } else if (clientX > rect.right - 40) {
    container.scrollLeft += 12;
  }
}

export function computeSweepStep(
  moveEvent: PointerEvent,
  state: SweepGestureState,
): {
  nextSelection: Set<string>;
  initialDir: 'right' | 'left';
  movingDirection: 'right' | 'left';
  lastClientX: number;
  lastCurrentIndex: number;
} {
  const {
    startIndex,
    cardId,
    startX,
    filteredResources,
    scrollContainer,
    initialSelectedSnapshot,
  } = state;

  autoScrollContainer(scrollContainer, moveEvent.clientX);

  let movingDirection = state.movingDirection;
  let lastClientX = state.lastClientX;
  const deltaX = moveEvent.clientX - lastClientX;
  if (deltaX > 2) {
    movingDirection = 'right';
    lastClientX = moveEvent.clientX;
  } else if (deltaX < -2) {
    movingDirection = 'left';
    lastClientX = moveEvent.clientX;
  }

  const elem =
    typeof document.elementFromPoint === 'function'
      ? document.elementFromPoint(moveEvent.clientX, moveEvent.clientY)
      : null;
  const cardElem = elem?.closest('[data-resource-id]');
  const hoveredCardId = cardElem?.getAttribute('data-resource-id');

  let currentIndex = state.lastCurrentIndex;
  if (hoveredCardId) {
    const idx = filteredResources.findIndex((r) => r.id === hoveredCardId);
    if (idx !== -1) {
      currentIndex = idx;
    }
  } else if (scrollContainer) {
    const cards = Array.from(
      scrollContainer.querySelectorAll('[data-resource-id]'),
    );
    let closestIdx = -1;
    let closestDist = Infinity;
    cards.forEach((c) => {
      const rect = c.getBoundingClientRect();
      const cardMidX = rect.left + rect.width / 2;
      const d = Math.abs(moveEvent.clientX - cardMidX);
      if (d < closestDist) {
        closestDist = d;
        const cId = c.getAttribute('data-resource-id');
        closestIdx = filteredResources.findIndex((r) => r.id === cId);
      }
    });
    if (closestIdx !== -1) {
      currentIndex = closestIdx;
    }
  }

  let initialDir = state.initialDir;
  if (currentIndex > startIndex) {
    initialDir = 'right';
  } else if (currentIndex < startIndex) {
    initialDir = 'left';
  }

  let isUnselectingCluster = false;
  if (initialSelectedSnapshot.has(cardId)) {
    if (currentIndex > startIndex) {
      isUnselectingCluster = filteredResources
        .slice(startIndex + 1)
        .some((r) => initialSelectedSnapshot.has(r.id));
    } else if (currentIndex < startIndex) {
      isUnselectingCluster = filteredResources
        .slice(0, startIndex)
        .some((r) => initialSelectedSnapshot.has(r.id));
    } else {
      isUnselectingCluster =
        movingDirection === 'right'
          ? filteredResources
              .slice(startIndex + 1)
              .some((r) => initialSelectedSnapshot.has(r.id))
          : filteredResources
              .slice(0, startIndex)
              .some((r) => initialSelectedSnapshot.has(r.id));
    }
  }

  let minIdx = startIndex;
  let maxIdx = startIndex;

  if (currentIndex > startIndex) {
    if (movingDirection === 'right') {
      minIdx = startIndex;
      maxIdx = currentIndex;
    } else {
      minIdx = startIndex;
      maxIdx = Math.max(startIndex, currentIndex - 1);
    }
  } else if (currentIndex < startIndex) {
    if (movingDirection === 'left') {
      minIdx = currentIndex;
      maxIdx = startIndex;
    } else {
      minIdx = Math.min(startIndex, currentIndex + 1);
      maxIdx = startIndex;
    }
  } else {
    const isAtRest =
      (movingDirection === 'right' &&
        moveEvent.clientX >= startX &&
        initialDir === 'left') ||
      (movingDirection === 'left' &&
        moveEvent.clientX <= startX &&
        initialDir === 'right');

    if (isAtRest) {
      minIdx = 1;
      maxIdx = 0;
    } else {
      minIdx = startIndex;
      maxIdx = startIndex;
    }
  }

  const nextSelection = new Set(initialSelectedSnapshot);
  for (let i = 0; i < filteredResources.length; i++) {
    const resId = filteredResources[i].id;
    if (i >= minIdx && i <= maxIdx) {
      if (isUnselectingCluster) {
        if (initialSelectedSnapshot.has(resId)) {
          nextSelection.delete(resId);
        } else {
          nextSelection.add(resId);
        }
      } else {
        nextSelection.add(resId);
      }
    } else {
      if (initialSelectedSnapshot.has(resId)) {
        nextSelection.add(resId);
      } else {
        nextSelection.delete(resId);
      }
    }
  }

  return {
    nextSelection,
    initialDir,
    movingDirection,
    lastClientX,
    lastCurrentIndex: currentIndex,
  };
}

export function applySelectionUpdate(
  nextSelection: Set<string>,
  filteredResources: Resource[],
  selectedIds: Set<string>,
  onUpdateSelectedIds?: (newIds: Set<string>) => void,
  onSelectMultiple?: (ids: string[], select: boolean) => void,
) {
  if (onUpdateSelectedIds) {
    onUpdateSelectedIds(nextSelection);
  } else if (onSelectMultiple) {
    const toAdd: string[] = [];
    const toRemove: string[] = [];
    filteredResources.forEach((r) => {
      const shouldBeSelected = nextSelection.has(r.id);
      const isCurrentlySelected = selectedIds.has(r.id);
      if (shouldBeSelected && !isCurrentlySelected) toAdd.push(r.id);
      if (!shouldBeSelected && isCurrentlySelected) toRemove.push(r.id);
    });
    if (toAdd.length > 0) onSelectMultiple(toAdd, true);
    if (toRemove.length > 0) onSelectMultiple(toRemove, false);
  }
}

export function runSweepStep(
  moveEvent: PointerEvent,
  sweepState: SweepGestureState,
  filteredResources: Resource[],
  selectedIds: Set<string>,
  onUpdateSelectedIds?: (newIds: Set<string>) => void,
  onSelectMultiple?: (ids: string[], select: boolean) => void,
) {
  const result = computeSweepStep(moveEvent, sweepState);
  sweepState.initialDir = result.initialDir;
  sweepState.movingDirection = result.movingDirection;
  sweepState.lastClientX = result.lastClientX;
  sweepState.lastCurrentIndex = result.lastCurrentIndex;

  applySelectionUpdate(
    result.nextSelection,
    filteredResources,
    selectedIds,
    onUpdateSelectedIds,
    onSelectMultiple,
  );
}

export function extractDragPayload(
  e: React.DragEvent,
  globalActiveDragInfo: { resourceId: string; sourceCategory: string } | null,
  activeDragSourceCategory?: string | null,
): { resourceId: string; sourceCat: string } {
  let resourceId = globalActiveDragInfo?.resourceId || '';
  let sourceCat =
    globalActiveDragInfo?.sourceCategory || activeDragSourceCategory || '';

  if (!resourceId) {
    try {
      const raw = e.dataTransfer.getData('application/json');
      if (raw) {
        const parsed = JSON.parse(raw);
        resourceId = parsed.resourceId || '';
        sourceCat = parsed.sourceCategory || sourceCat;
      }
    } catch {
      // fallback
    }
    if (!resourceId) {
      resourceId = e.dataTransfer.getData('text/plain');
    }
  }

  return { resourceId, sourceCat };
}
