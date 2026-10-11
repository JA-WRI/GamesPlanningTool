// Made with AI agents (Antigravity)

export type SweepGestureState = {
  startIndex: number;
  cardId: string;
  startX: number;
  startY: number;
  initialDir: 'forward' | 'backward';
  lastCurrentIndex: number;
  lastClientX: number;
  lastClientY: number;
  movingDirection: 'forward' | 'backward';
  initialSelectedSnapshot: Set<string>;
  filteredResources: { id: string; [key: string]: unknown }[];
  scrollContainer: HTMLElement | null;
};

export function createSweepState(
  startIndex: number,
  cardId: string,
  startX: number,
  startY: number,
  selectedIds: Set<string>,
  filteredResources: { id: string; [key: string]: unknown }[],
  scrollContainer: HTMLElement | null,
): SweepGestureState {
  return {
    startIndex,
    cardId,
    startX,
    startY,
    initialDir: 'forward', // Defaults to forward, will be updated immediately on move
    lastCurrentIndex: startIndex,
    lastClientX: startX,
    lastClientY: startY,
    movingDirection: 'forward',
    initialSelectedSnapshot: new Set(selectedIds),
    filteredResources,
    scrollContainer,
  };
}

export function autoScrollContainer(
  container: HTMLElement | null,
  clientX: number,
  clientY: number,
) {
  if (container) {
    const rect = container.getBoundingClientRect();
    if (clientX < rect.left + 40) container.scrollLeft -= 12;
    else if (clientX > rect.right - 40) container.scrollLeft += 12;
    if (clientY < rect.top + 40) container.scrollTop -= 12;
    else if (clientY > rect.bottom - 40) container.scrollTop += 12;
  } else {
    if (clientY < 40) window.scrollBy(0, -12);
    else if (clientY > window.innerHeight - 40) window.scrollBy(0, 12);
  }
}

export function computeSweepStep(
  moveEvent: PointerEvent,
  state: SweepGestureState,
): {
  nextSelection: Set<string>;
  initialDir: 'forward' | 'backward';
  movingDirection: 'forward' | 'backward';
  lastCurrentIndex: number;
  lastClientX: number;
  lastClientY: number;
} {
  const {
    startIndex,
    cardId,
    startX,
    filteredResources,
    scrollContainer,
    initialSelectedSnapshot,
  } = state;

  autoScrollContainer(scrollContainer, moveEvent.clientX, moveEvent.clientY);

  const elem =
    typeof document.elementFromPoint === 'function'
      ? document.elementFromPoint(moveEvent.clientX, moveEvent.clientY)
      : null;
  const cardElem = elem?.closest('[data-resource-id]');
  const hoveredCardId = cardElem?.getAttribute('data-resource-id');

  let currentIndex = state.lastCurrentIndex;
  if (hoveredCardId) {
    const idx = filteredResources.findIndex((r) => r.id === hoveredCardId);
    if (idx !== -1) currentIndex = idx;
  } else {
    const containerToQuery = scrollContainer || document;
    const cards = Array.from(
      containerToQuery.querySelectorAll('[data-resource-id]'),
    );
    let closestIdx = -1;
    let closestDist = Infinity;
    cards.forEach((c) => {
      const rect = c.getBoundingClientRect();
      const cardMidX = rect.left + rect.width / 2;
      const cardMidY = rect.top + rect.height / 2;
      const d = Math.hypot(
        moveEvent.clientX - cardMidX,
        moveEvent.clientY - cardMidY,
      );
      if (d < closestDist) {
        closestDist = d;
        const cId = c.getAttribute('data-resource-id');
        closestIdx = filteredResources.findIndex((r) => r.id === cId);
      }
    });
    if (closestIdx !== -1) currentIndex = closestIdx;
  }

  let movingDirection = state.movingDirection;
  const deltaX = moveEvent.clientX - state.lastClientX;
  const deltaY = moveEvent.clientY - state.lastClientY;

  if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      movingDirection = deltaX > 0 ? 'forward' : 'backward';
    } else {
      movingDirection = deltaY > 0 ? 'forward' : 'backward';
    }
  }

  let initialDir = state.initialDir;
  if (currentIndex > startIndex) {
    initialDir = 'forward';
  } else if (currentIndex < startIndex) {
    initialDir = 'backward';
  } else if (state.lastCurrentIndex === startIndex) {
    // If we just started, set initialDir based on movement
    initialDir = movingDirection;
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
        movingDirection === 'forward'
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
    minIdx = startIndex;
    maxIdx = currentIndex;
  } else if (currentIndex < startIndex) {
    minIdx = currentIndex;
    maxIdx = startIndex;
  } else {
    // We are at the start index!
    const isAtRest =
      (movingDirection === 'forward' &&
        moveEvent.clientX >= startX &&
        initialDir === 'backward') ||
      (movingDirection === 'backward' &&
        moveEvent.clientX <= startX &&
        initialDir === 'forward');

    if (isAtRest) {
      minIdx = 1;
      maxIdx = 0; // Empty range to clear
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
        if (initialSelectedSnapshot.has(resId)) nextSelection.delete(resId);
        else nextSelection.add(resId);
      } else {
        nextSelection.add(resId);
      }
    } else {
      if (initialSelectedSnapshot.has(resId)) nextSelection.add(resId);
      else nextSelection.delete(resId);
    }
  }

  return {
    nextSelection,
    initialDir,
    movingDirection,
    lastCurrentIndex: currentIndex,
    lastClientX: moveEvent.clientX,
    lastClientY: moveEvent.clientY,
  };
}

export function applySelectionUpdate(
  nextSelection: Set<string>,
  filteredResources: { id: string; [key: string]: unknown }[],
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
  filteredResources: { id: string; [key: string]: unknown }[],
  selectedIds: Set<string>,
  onUpdateSelectedIds?: (newIds: Set<string>) => void,
  onSelectMultiple?: (ids: string[], select: boolean) => void,
) {
  const result = computeSweepStep(moveEvent, sweepState);
  sweepState.initialDir = result.initialDir;
  sweepState.movingDirection = result.movingDirection;
  sweepState.lastCurrentIndex = result.lastCurrentIndex;
  sweepState.lastClientX = result.lastClientX;
  sweepState.lastClientY = result.lastClientY;

  applySelectionUpdate(
    result.nextSelection,
    filteredResources,
    selectedIds,
    onUpdateSelectedIds,
    onSelectMultiple,
  );
}
