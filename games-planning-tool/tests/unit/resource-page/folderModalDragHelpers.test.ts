// Made with AI agents (Antigravity)
import { describe, it, expect } from 'vitest';
import {
  reorderListWithInjection,
  isPointInsidePanel,
  getFolderBreadcrumbs,
} from '@/features/resources/utilities/folderModalDragHelpers';
import { Resource } from '@/features/resources/types/resource';

describe('folderModalDragHelpers', () => {
  const itemA: Resource = {
    id: 'res-a',
    name: 'A',
    type: 'file',
    fileUrl: 'a',
    categories: [],
  };
  const itemB: Resource = {
    id: 'res-b',
    name: 'B',
    type: 'file',
    fileUrl: 'b',
    categories: [],
  };
  const itemC: Resource = {
    id: 'res-c',
    name: 'C',
    type: 'file',
    fileUrl: 'c',
    categories: [],
  };
  const itemExt: Resource = {
    id: 'res-ext',
    name: 'Ext',
    type: 'file',
    fileUrl: 'ext',
    categories: [],
  };

  const rect: DOMRect = {
    left: 100,
    right: 200,
    top: 50,
    bottom: 150,
    width: 100,
    height: 100,
    x: 100,
    y: 50,
    toJSON: () => {},
  };

  describe('reorderListWithInjection', () => {
    it('returns currentList if targetId is not found', () => {
      const list = [itemA, itemB];
      const result = reorderListWithInjection(
        list,
        [itemA, itemB],
        ['res-a'],
        'nonexistent',
        150,
        rect,
      );
      expect(result).toBe(list);
    });

    it('returns currentList if sourceIdx equals targetIdx', () => {
      const list = [itemA, itemB];
      const result = reorderListWithInjection(
        list,
        [itemA, itemB],
        ['res-a'],
        'res-a',
        150,
        rect,
      );
      expect(result).toBe(list);
    });

    it('returns currentList if moving forward but clientX < midX', () => {
      const list = [itemA, itemB];
      // midX = 150. clientX = 120 (< 150)
      const result = reorderListWithInjection(
        list,
        [itemA, itemB],
        ['res-a'],
        'res-b',
        120,
        rect,
      );
      expect(result).toBe(list);
    });

    it('returns currentList if moving backward but clientX > midX', () => {
      const list = [itemA, itemB];
      // source is B (idx 1), target is A (idx 0). clientX = 180 (> 150)
      const result = reorderListWithInjection(
        list,
        [itemA, itemB],
        ['res-b'],
        'res-a',
        180,
        rect,
      );
      expect(result).toBe(list);
    });

    it('reorders forward when clientX >= midX', () => {
      const list = [itemA, itemB, itemC];
      // source is A (idx 0), target is B (idx 1). clientX = 160 (>= 150)
      const result = reorderListWithInjection(
        list,
        [itemA, itemB, itemC],
        ['res-a'],
        'res-b',
        160,
        rect,
      );
      expect(result.map((r) => r.id)).toEqual(['res-b', 'res-a', 'res-c']);
    });

    it('reorders backward when clientX <= midX', () => {
      const list = [itemA, itemB, itemC];
      // source is C (idx 2), target is A (idx 0). clientX = 140 (<= 150)
      const result = reorderListWithInjection(
        list,
        [itemA, itemB, itemC],
        ['res-c'],
        'res-a',
        140,
        rect,
      );
      expect(result.map((r) => r.id)).toEqual(['res-c', 'res-a', 'res-b']);
    });

    it('returns currentList if itemsToMove is empty', () => {
      const list = [itemA, itemB];
      const result = reorderListWithInjection(
        list,
        [itemA, itemB],
        ['ghost-id'],
        'res-b',
        160,
        rect,
      );
      expect(result).toBe(list);
    });

    it('injects external item before target if clientX <= midX', () => {
      const list = [itemA, itemB];
      const all = [itemA, itemB, itemExt];
      const result = reorderListWithInjection(
        list,
        all,
        ['res-ext'],
        'res-b',
        140,
        rect,
      );
      expect(result.map((r) => r.id)).toEqual(['res-a', 'res-ext', 'res-b']);
    });

    it('injects external item after target if clientX > midX', () => {
      const list = [itemA, itemB];
      const all = [itemA, itemB, itemExt];
      const result = reorderListWithInjection(
        list,
        all,
        ['res-ext'],
        'res-b',
        160,
        rect,
      );
      expect(result.map((r) => r.id)).toEqual(['res-a', 'res-b', 'res-ext']);
    });
  });

  describe('isPointInsidePanel', () => {
    it('returns true if panel is null', () => {
      expect(isPointInsidePanel(null, 100, 100)).toBe(true);
    });

    it('returns true if point is inside panel with padding', () => {
      const el = document.createElement('div');
      el.getBoundingClientRect = () => rect;

      // Inside rect
      expect(isPointInsidePanel(el, 150, 100, 10)).toBe(true);
      // In padding boundary
      expect(isPointInsidePanel(el, 95, 100, 10)).toBe(true);
      expect(isPointInsidePanel(el, 205, 100, 10)).toBe(true);
    });

    it('returns false if point is outside panel bounds', () => {
      const el = document.createElement('div');
      el.getBoundingClientRect = () => rect;

      expect(isPointInsidePanel(el, 80, 100, 10)).toBe(false); // too far left
      expect(isPointInsidePanel(el, 220, 100, 10)).toBe(false); // too far right
      expect(isPointInsidePanel(el, 150, 30, 10)).toBe(false); // too far top
      expect(isPointInsidePanel(el, 150, 170, 10)).toBe(false); // too far bottom
    });
  });

  describe('getFolderBreadcrumbs', () => {
    it('returns empty array if currentFolder is null', () => {
      expect(getFolderBreadcrumbs(null, [])).toEqual([]);
    });

    it('returns single breadcrumb if folder has no parentId', () => {
      const rootFolder: Resource = {
        id: 'f-1',
        name: 'Root',
        type: 'folder',
        categories: [],
      };
      expect(getFolderBreadcrumbs(rootFolder, [rootFolder])).toEqual([
        { id: 'f-1', name: 'Root' },
      ]);
    });

    it('returns multi-level breadcrumbs chain up to root', () => {
      const rootFolder: Resource = {
        id: 'f-root',
        name: 'Root',
        type: 'folder',
        categories: [],
      };
      const subFolder: Resource = {
        id: 'f-sub',
        name: 'Sub',
        type: 'folder',
        parentId: 'f-root',
        categories: [],
      };
      const deepFolder: Resource = {
        id: 'f-deep',
        name: 'Deep',
        type: 'folder',
        parentId: 'f-sub',
        categories: [],
      };

      const all = [rootFolder, subFolder, deepFolder];
      expect(getFolderBreadcrumbs(deepFolder, all)).toEqual([
        { id: 'f-root', name: 'Root' },
        { id: 'f-sub', name: 'Sub' },
        { id: 'f-deep', name: 'Deep' },
      ]);
    });

    it('handles broken parent chain gracefully', () => {
      const orphanFolder: Resource = {
        id: 'f-orphan',
        name: 'Orphan',
        type: 'folder',
        parentId: 'f-missing',
        categories: [],
      };
      expect(getFolderBreadcrumbs(orphanFolder, [orphanFolder])).toEqual([
        { id: 'f-orphan', name: 'Orphan' },
      ]);
    });
  });
});
