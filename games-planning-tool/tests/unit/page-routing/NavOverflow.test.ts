//80% AI generated to create unit tests
import { describe, expect, it } from 'vitest'; // Jest: delete this line (globals are built in)
import {
  countVisibleItems,
  moveActiveIntoView,
} from '@/lib/routing/NavOverflow';

describe('countVisibleItems', () => {
  const widths = [100, 100, 100, 200];
  const moreWidth = 50;

  it('shows everything when all tabs fit, without reserving the dots button', () => {
    expect(
      countVisibleItems({
        widths: [100, 100, 100],
        available: 300,
        moreWidth,
        activeIndex: 0,
      }),
    ).toBe(3);
  });

  it('reserves room for the dots button once something has to overflow', () => {
    // One pixel short of fitting all three, so only two fit beside the button.
    expect(
      countVisibleItems({
        widths: [100, 100, 100],
        available: 299,
        moreWidth,
        activeIndex: 0,
      }),
    ).toBe(2);
  });

  it('keeps the original cutoff when the active tab is already visible', () => {
    expect(
      countVisibleItems({ widths, available: 350, moreWidth, activeIndex: 1 }),
    ).toBe(3);
  });

  it('makes room for an active tab that would have overflowed', () => {
    // Active tab (200px) + dots (50px) leaves 100px, so one other tab fits.
    expect(
      countVisibleItems({ widths, available: 350, moreWidth, activeIndex: 3 }),
    ).toBe(2);
  });

  it('still shows the active tab when it is wider than the whole bar', () => {
    expect(
      countVisibleItems({
        widths: [100, 500],
        available: 300,
        moreWidth,
        activeIndex: 1,
      }),
    ).toBe(1);
  });

  it('does not reserve anything when no tab is active (activeIndex -1)', () => {
    expect(
      countVisibleItems({ widths, available: 350, moreWidth, activeIndex: -1 }),
    ).toBe(3);
  });

  it('returns 0 when nothing fits and no tab is active', () => {
    expect(
      countVisibleItems({
        widths: [400, 400],
        available: 300,
        moreWidth,
        activeIndex: -1,
      }),
    ).toBe(0);
  });

  it('handles an empty list', () => {
    expect(
      countVisibleItems({
        widths: [],
        available: 300,
        moreWidth,
        activeIndex: -1,
      }),
    ).toBe(0);
  });
});

describe('moveActiveIntoView', () => {
  const items = ['a', 'b', 'c', 'd', 'e'];

  it('leaves the order alone when the active item is visible', () => {
    expect(moveActiveIntoView(items, 1, 3)).toEqual(items);
  });

  it('leaves the order alone when nothing is active', () => {
    expect(moveActiveIntoView(items, -1, 3)).toEqual(items);
  });

  it('moves a hidden active item into the last visible slot', () => {
    expect(moveActiveIntoView(items, 4, 3)).toEqual(['a', 'b', 'e', 'c', 'd']);
  });

  it('works when only one slot is visible', () => {
    expect(moveActiveIntoView(['a', 'b', 'c', 'd'], 3, 1)).toEqual([
      'd',
      'a',
      'b',
      'c',
    ]);
  });

  it('does not mutate the input array', () => {
    const input = ['a', 'b', 'c', 'd'];
    moveActiveIntoView(input, 3, 2);
    expect(input).toEqual(['a', 'b', 'c', 'd']);
  });

  it('agrees with countVisibleItems: the active tab lands in the visible slice', () => {
    const widths = [100, 100, 100, 200];
    const visible = countVisibleItems({
      widths,
      available: 350,
      moreWidth: 50,
      activeIndex: 3,
    });
    const ordered = moveActiveIntoView(['a', 'b', 'c', 'd'], 3, visible);
    expect(ordered.slice(0, visible)).toContain('d');
  });
});
