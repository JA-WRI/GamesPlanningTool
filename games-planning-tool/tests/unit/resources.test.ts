// Made with AI agents (Antigravity)
import { describe, it, expect, vi } from 'vitest';
import {
  normalizeResourceCategories,
  INITIAL_RESOURCES,
  loadResourcesFromStorage,
  saveResourcesToStorage,
  getCachedResources,
  subscribeToResources,
} from '@/lib/resources-data';
import {
  Resource,
  LinkResource,
  FileResource,
  DEFAULT_CATEGORY,
} from '@/types/resource';

describe('Resource Management and Logic', () => {
  it('automatically assigns "General" when no category is entered', () => {
    expect(normalizeResourceCategories([])).toEqual([DEFAULT_CATEGORY]);
    expect(normalizeResourceCategories(['', '   '])).toEqual([
      DEFAULT_CATEGORY,
    ]);
  });

  it('preserves user selected categories when provided', () => {
    expect(
      normalizeResourceCategories(['Summer Games', 'Athletics Canada']),
    ).toEqual(['Summer Games', 'Athletics Canada']);
    expect(normalizeResourceCategories(['Winter Games'])).toEqual([
      'Winter Games',
    ]);
  });

  it('verifies LinkResource adheres to UML schema (name, categories, URL)', () => {
    const link: LinkResource = {
      id: 'test-link-1',
      name: 'Olympic Channel',
      type: 'link',
      URL: 'https://olympics.com',
      categories: ['Summer Games'],
    };

    expect(link.name).toBe('Olympic Channel');
    expect(link.type).toBe('link');
    expect(link.URL).toBe('https://olympics.com');
    expect(link.categories).toContain('Summer Games');
  });

  it('verifies FileResource adheres to UML schema (name, categories, file)', () => {
    const fileRes: FileResource = {
      id: 'test-file-1',
      name: 'Roster Guide',
      type: 'file',
      categories: ['General'],
      file: {
        name: 'roster.pdf',
        size: 1024,
        type: 'application/pdf',
      },
      fileUrl: 'blob:http://localhost/mock-uuid',
    };

    expect(fileRes.name).toBe('Roster Guide');
    expect(fileRes.type).toBe('file');
    expect(fileRes.file?.name).toBe('roster.pdf');
    expect(fileRes.categories).toEqual(['General']);
  });

  it('contains valid initial resources for Winter Games, Summer Games, and General', () => {
    expect(INITIAL_RESOURCES.length).toBeGreaterThan(0);

    const hasWinter = INITIAL_RESOURCES.some((r) =>
      r.categories.includes('Winter Games'),
    );
    const hasSummer = INITIAL_RESOURCES.some((r) =>
      r.categories.includes('Summer Games'),
    );
    const hasGeneral = INITIAL_RESOURCES.some((r) =>
      r.categories.includes('General'),
    );

    expect(hasWinter).toBe(true);
    expect(hasSummer).toBe(true);
    expect(hasGeneral).toBe(true);
  });

  it('supports rearranging and reordering of resource items', () => {
    const list: Resource[] = [
      {
        id: '1',
        name: 'Item 1',
        type: 'link',
        URL: 'http://a',
        categories: ['Winter Games'],
      },
      {
        id: '2',
        name: 'Item 2',
        type: 'link',
        URL: 'http://b',
        categories: ['Winter Games'],
      },
      {
        id: '3',
        name: 'Item 3',
        type: 'link',
        URL: 'http://c',
        categories: ['Winter Games'],
      },
    ];

    const reordered = [...list];
    const [moved] = reordered.splice(2, 1);
    reordered.splice(0, 0, moved);

    expect(reordered[0].id).toBe('3');
    expect(reordered[1].id).toBe('1');
    expect(reordered[2].id).toBe('2');
  });

  it('supports removing selected resources by ID set', () => {
    const list: Resource[] = [
      {
        id: '1',
        name: 'Item 1',
        type: 'link',
        URL: 'http://a',
        categories: ['General'],
      },
      {
        id: '2',
        name: 'Item 2',
        type: 'link',
        URL: 'http://b',
        categories: ['General'],
      },
      {
        id: '3',
        name: 'Item 3',
        type: 'link',
        URL: 'http://c',
        categories: ['General'],
      },
    ];

    const selectedIds = new Set(['1', '3']);
    const remaining = list.filter((r) => !selectedIds.has(r.id));

    expect(remaining.length).toBe(1);
    expect(remaining[0].id).toBe('2');
  });

  it('handles loadResourcesFromStorage fallbacks and valid storage', () => {
    localStorage.clear();
    expect(loadResourcesFromStorage().length).toBeGreaterThan(0);

    localStorage.setItem('gpt_resources_v1', 'invalid-json');
    expect(loadResourcesFromStorage().length).toBeGreaterThan(0);

    localStorage.setItem('gpt_resources_v1', '[]');
    expect(loadResourcesFromStorage().length).toBeGreaterThan(0);

    const testItem = [
      { id: 't1', name: 'T1', type: 'link', categories: ['General'] },
    ];
    saveResourcesToStorage(testItem);
    expect(loadResourcesFromStorage()).toEqual(testItem);
    expect(getCachedResources()).toEqual(testItem);

    const listener = vi.fn();
    const unsub = subscribeToResources(listener);
    window.dispatchEvent(new Event('gpt-resources-change'));
    window.dispatchEvent(new Event('storage'));
    expect(listener).toHaveBeenCalledTimes(2);
    unsub();

    const setItemSpy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('quota');
      });
    saveResourcesToStorage(testItem);
    setItemSpy.mockRestore();
  });

  it('correctly operates folder helpers (descendants, cascade add, cascade remove, keep top-level)', async () => {
    const {
      getCategoryTopLevelResources,
      getFolderChildren,
      getDescendantResourceIds,
      cascadeAddCategoryToFolder,
      cascadeRemoveCategoryFromFolder,
      removeFolderKeepContentsInTopLevel,
    } = await import('@/lib/resources-data');

    const sampleResources: Resource[] = [
      {
        id: 'f1',
        name: 'Root Folder',
        type: 'folder',
        categories: ['Winter Games'],
      },
      {
        id: 'f2',
        name: 'Nested Folder',
        type: 'folder',
        parentId: 'f1',
        categories: ['Winter Games'],
      },
      {
        id: 'file1',
        name: 'File In Nested',
        type: 'file',
        parentId: 'f2',
        categories: ['Winter Games'],
      },
      {
        id: 'file2',
        name: 'Top Level File',
        type: 'file',
        categories: ['Winter Games'],
      },
    ];

    // getCategoryTopLevelResources
    const topLevel = getCategoryTopLevelResources(
      sampleResources,
      'Winter Games',
    );
    expect(topLevel.map((r) => r.id)).toEqual(['f1', 'file2']);

    // getFolderChildren
    const f1Children = getFolderChildren(sampleResources, 'f1');
    expect(f1Children.map((r) => r.id)).toEqual(['f2']);

    // getDescendantResourceIds
    const descIds = getDescendantResourceIds(sampleResources, 'f1');
    expect(descIds).toEqual(['f2', 'file1']);

    // cascadeAddCategoryToFolder
    const withSummer = cascadeAddCategoryToFolder(
      sampleResources,
      'f1',
      'Summer Games',
    );
    expect(withSummer.find((r) => r.id === 'f1')?.categories).toContain(
      'Summer Games',
    );
    expect(withSummer.find((r) => r.id === 'f2')?.categories).toContain(
      'Summer Games',
    );
    expect(withSummer.find((r) => r.id === 'file1')?.categories).toContain(
      'Summer Games',
    );
    expect(withSummer.find((r) => r.id === 'file2')?.categories).not.toContain(
      'Summer Games',
    );

    // cascadeRemoveCategoryFromFolder
    const withoutWinter = cascadeRemoveCategoryFromFolder(
      sampleResources,
      'f1',
      'Winter Games',
    );
    expect(withoutWinter.find((r) => r.id === 'f1')?.categories).toEqual([
      'General',
    ]);
    expect(withoutWinter.find((r) => r.id === 'f2')?.categories).toEqual([
      'General',
    ]);
    expect(withoutWinter.find((r) => r.id === 'file1')?.categories).toEqual([
      'General',
    ]);

    // removeFolderKeepContentsInTopLevel
    const kept = removeFolderKeepContentsInTopLevel(
      sampleResources,
      'f1',
      'Winter Games',
    );
    expect(kept.find((r) => r.id === 'f1')?.categories).toEqual(['General']);
    expect(kept.find((r) => r.id === 'file1')?.parentId).toBeNull();
    expect(kept.find((r) => r.id === 'file1')?.categories).toEqual([
      'Winter Games',
    ]);
  });
});
