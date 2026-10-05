//Pure helper functions for the navbar's three-dot overflow. No DOM or React in here,

type FitInput = {
  //Natural width of each tab, in original order.
  widths: number[];
  // Space the tabs may use (container width minus any safety buffer).
  available: number;
  //Width of the three-dot button.
  moreWidth: number;
  // Index of the active tab, or -1 if no tab is active.
  activeIndex: number;
};

/**
 * How many tabs to show before the rest move into the three-dot menu.
 * If the active tab wouldn't fit, its width is reserved first so it can take
 * the last visible slot.
 */
export function countVisibleItems({
  widths,
  available,
  moreWidth,
  activeIndex,
}: FitInput): number {
  //How many of indexes fit in space, taken in order.
  const countFitting = (
    indexes: number[],
    space: number,
    alwaysReserveMore: boolean,
  ) => {
    let used = 0;
    let count = 0;

    for (let n = 0; n < indexes.length; n++) {
      // The three-dot button is only needed if something is left over.
      const isLast = n === indexes.length - 1;
      const limit = alwaysReserveMore || !isLast ? space - moreWidth : space;

      used += widths[indexes[n]];
      if (used > limit) break;

      count++;
    }
    return count;
  };

  const all = widths.map((_, i) => i);
  const count = countFitting(all, available, false);

  if (activeIndex < count) return count;

  //The active tab didn't fit: reserve its width and fit the rest around it.
  const others = all.filter((i) => i !== activeIndex);
  return countFitting(others, available - widths[activeIndex], true) + 1;
}

/**
 * Moves the active item into the last visible slot if it would otherwise be
 * hidden in the overflow menu. Returns a new array, never mutates the input.
 */
export function moveActiveIntoView<T>(
  items: T[],
  activeIndex: number,
  visibleCount: number,
): T[] {
  if (activeIndex < visibleCount || visibleCount < 1) return items;

  const ordered = [...items];
  const [active] = ordered.splice(activeIndex, 1);
  ordered.splice(visibleCount - 1, 0, active);
  return ordered;
}
