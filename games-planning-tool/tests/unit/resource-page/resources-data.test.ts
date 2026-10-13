// Made with AI agents (Antigravity)
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  normalizeResourceCategories,
  createFolder,
  loadResourcesFromStorage,
  getCachedResources,
  subscribeToResources,
  saveResourcesToStorage,
  getCategoryTopLevelResources,
  getFolderChildren,
  getDescendantResourceIds,
  getFolderFamilyIds,
  cascadeAddCategoryToFolder,
  cascadeRemoveCategoryFromFolder,
  removeFolderKeepContentsInTopLevel,
  INITIAL_RESOURCES,
} from '@/lib/resources-data';
import { Resource } from '@/types/resource';

describe('resources-data utility module', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('normalizes resource categories removing duplicates and empty strings', () => {
    const raw = ['General', 'Summer Games', '', '   '];
    const res = normalizeResourceCategories(raw);
    expect(res).toEqual(['General', 'Summer Games']);
  });

  it('creates a new folder with proper defaults', () => {
    const folder = createFolder('Test Folder', ['Winter Games']);
    expect(folder.name).toBe('Test Folder');
    expect(folder.type).toBe('folder');
    expect(folder.categories).toEqual(['Winter Games']);
    expect(folder.id.startsWith('folder-')).toBe(true);

    const defaultFolder = createFolder('Default Folder', ['General']);
    expect(defaultFolder.categories).toEqual(['General']);
  });

  it('loads resources from storage and falls back to INITIAL_RESOURCES if empty', () => {
    const loaded = loadResourcesFromStorage();
    expect(loaded).toEqual(INITIAL_RESOURCES);

    const custom: Resource[] = [
      {
        id: 'custom-1',
        name: 'Custom',
        type: 'folder',
        categories: ['General'],
      },
    ];
    localStorage.setItem('gpt_resources_state_v1', JSON.stringify(custom));
    const loadedCustom = loadResourcesFromStorage();
    expect(loadedCustom).toEqual(custom);
  });

  it('handles invalid JSON in localStorage gracefully', () => {
    localStorage.setItem('gpt_resources_state_v1', 'invalid-json{{{');
    const loaded = loadResourcesFromStorage();
    expect(loaded).toEqual(INITIAL_RESOURCES);
  });

  it('manages cached resources and subscriptions', () => {
    const initial = getCachedResources();
    expect(initial).toBeDefined();

    const listener = vi.fn();
    const unsubscribe = subscribeToResources(listener);

    const updated: Resource[] = [
      {
        id: 'new-1',
        name: 'New Resource',
        type: 'file',
        fileUrl: 'url',
        categories: ['General'],
      },
    ];

    saveResourcesToStorage(updated);
    expect(listener).toHaveBeenCalled();
    expect(getCachedResources()).toEqual(updated);

    unsubscribe();
    saveResourcesToStorage([]);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('filters category top level resources', () => {
    const testList: Resource[] = [
      {
        id: '1',
        name: 'Root File 1',
        type: 'file',
        fileUrl: '',
        categories: ['General'],
      },
      {
        id: '2',
        name: 'Root File 2',
        type: 'file',
        fileUrl: '',
        categories: ['Summer Games'],
      },
      {
        id: '3',
        name: 'Child File',
        type: 'file',
        fileUrl: '',
        categories: ['General'],
        parentId: 'f-1',
      },
    ];

    const gen = getCategoryTopLevelResources(testList, 'General');
    expect(gen.map((r) => r.id)).toEqual(['1']);

    const summer = getCategoryTopLevelResources(testList, 'Summer Games');
    expect(summer.map((r) => r.id)).toEqual(['2']);
  });

  it('gets folder children accurately', () => {
    const testList: Resource[] = [
      { id: 'f-1', name: 'Folder 1', type: 'folder', categories: ['General'] },
      {
        id: 'c-1',
        name: 'Child 1',
        type: 'file',
        fileUrl: '',
        categories: ['General'],
        parentId: 'f-1',
      },
      {
        id: 'c-2',
        name: 'Child 2',
        type: 'file',
        fileUrl: '',
        categories: ['General'],
        parentId: 'f-1',
      },
      {
        id: 'c-3',
        name: 'Other Child',
        type: 'file',
        fileUrl: '',
        categories: ['General'],
        parentId: 'f-2',
      },
    ];

    const children = getFolderChildren(testList, 'f-1');
    expect(children.map((r) => r.id)).toEqual(['c-1', 'c-2']);
  });

  it('gets descendant resource IDs and family IDs recursively', () => {
    const testList: Resource[] = [
      {
        id: 'root-folder',
        name: 'Root',
        type: 'folder',
        categories: ['General'],
      },
      {
        id: 'sub-folder',
        name: 'Sub',
        type: 'folder',
        categories: ['General'],
        parentId: 'root-folder',
      },
      {
        id: 'file-in-sub',
        name: 'File',
        type: 'file',
        fileUrl: '',
        categories: ['General'],
        parentId: 'sub-folder',
      },
      {
        id: 'file-in-root',
        name: 'File Root',
        type: 'file',
        fileUrl: '',
        categories: ['General'],
        parentId: 'root-folder',
      },
    ];

    const descendants = getDescendantResourceIds(testList, 'root-folder');
    expect(descendants).toContain('sub-folder');
    expect(descendants).toContain('file-in-sub');
    expect(descendants).toContain('file-in-root');
    expect(descendants.length).toBe(3);

    const family = getFolderFamilyIds(testList, 'root-folder');
    expect(family).toContain('root-folder');
    expect(family).toContain('sub-folder');
    expect(family.size).toBe(4);
  });

  it('cascades adding a category to a folder and all its descendants', () => {
    const testList: Resource[] = [
      { id: 'f-1', name: 'F1', type: 'folder', categories: ['General'] },
      {
        id: 'f-2',
        name: 'F2',
        type: 'folder',
        categories: ['General'],
        parentId: 'f-1',
      },
      {
        id: 'f-3',
        name: 'F3',
        type: 'file',
        fileUrl: '',
        categories: ['General'],
        parentId: 'f-2',
      },
    ];

    const updated = cascadeAddCategoryToFolder(testList, 'f-1', 'Summer Games');
    expect(updated.find((r) => r.id === 'f-1')?.categories).toContain(
      'Summer Games',
    );
    expect(updated.find((r) => r.id === 'f-2')?.categories).toContain(
      'Summer Games',
    );
    expect(updated.find((r) => r.id === 'f-3')?.categories).toContain(
      'Summer Games',
    );
  });

  it('cascades removing a category from a folder and all its descendants', () => {
    const testList: Resource[] = [
      {
        id: 'f-1',
        name: 'F1',
        type: 'folder',
        categories: ['General', 'Summer Games'],
      },
      {
        id: 'f-2',
        name: 'F2',
        type: 'folder',
        categories: ['General', 'Summer Games'],
        parentId: 'f-1',
      },
      {
        id: 'other',
        name: 'Other',
        type: 'folder',
        categories: ['Summer Games'],
      },
    ];

    const updated = cascadeRemoveCategoryFromFolder(
      testList,
      'f-1',
      'Summer Games',
    );
    expect(updated.find((r) => r.id === 'f-1')?.categories).toEqual([
      'General',
    ]);
    expect(updated.find((r) => r.id === 'f-2')?.categories).toEqual([
      'General',
    ]);
    expect(updated.find((r) => r.id === 'other')?.categories).toEqual([
      'Summer Games',
    ]);
  });

  it('removes a folder while promoting its direct children to root', () => {
    const testList: Resource[] = [
      { id: 'f-1', name: 'F1', type: 'folder', categories: ['General'] },
      {
        id: 'c-1',
        name: 'Child 1',
        type: 'file',
        fileUrl: '',
        categories: ['General'],
        parentId: 'f-1',
      },
      {
        id: 'c-2',
        name: 'Child 2',
        type: 'file',
        fileUrl: '',
        categories: ['General'],
        parentId: 'f-1',
      },
      {
        id: 'other',
        name: 'Other',
        type: 'file',
        fileUrl: '',
        categories: ['General'],
      },
    ];

    const updated = removeFolderKeepContentsInTopLevel(
      testList,
      'f-1',
      'General',
    );
    expect(updated.find((r) => r.id === 'f-1')).toBeDefined();
    expect(updated.find((r) => r.id === 'c-1')?.parentId).toBeNull();
    expect(updated.find((r) => r.id === 'c-2')?.parentId).toBeNull();
    expect(updated.find((r) => r.id === 'other')).toBeDefined();
  });
});
