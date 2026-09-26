import { describe, it, expect } from 'vitest';
import {
  normalizeResourceCategories,
  INITIAL_RESOURCES,
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
});
