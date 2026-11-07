// 50% or more AI-generated
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ResourceModel } from '@/generated/prisma/models/Resource';
import {
  listResources,
  createResource,
  renameResource,
  updateResourceCategories,
  deleteResources,
  moveResources,
  reorderResources,
} from '@/lib/resources';
import { CANADIAN_NSOS } from '@/features/resources/types/resource';

const db = vi.hoisted(() => ({
  findMany: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  deleteMany: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    resource: db,
    $transaction: vi.fn(
      (
        arg:
          | Promise<unknown>[]
          | ((tx: { resource: typeof db }) => Promise<unknown>),
      ) =>
        typeof arg === 'function' ? arg({ resource: db }) : Promise.all(arg),
    ),
  },
}));

function row(
  overrides: Partial<ResourceModel> & Pick<ResourceModel, 'id' | 'name'>,
): ResourceModel {
  return {
    parentFolderId: null,
    fileOrWebpageURL: null,
    isWebpage: false,
    categories: ['General'],
    previousElementId: null,
    nextElementId: null,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  db.findMany.mockResolvedValue([]);
  db.create.mockResolvedValue(row({ id: 'new', name: 'New' }));
  db.update.mockResolvedValue(undefined);
  db.deleteMany.mockResolvedValue({ count: 0 });
});

describe('listResources', () => {
  it('orders chained siblings, appends unchained rows, and maps resource types', async () => {
    const rows = [
      row({ id: 'a', name: 'Folder', nextElementId: 'b' }),
      row({
        id: 'b',
        name: 'Report',
        fileOrWebpageURL: 'https://ex.com/docs/report%20one.pdf',
        previousElementId: 'a',
      }),
      row({
        id: 'c',
        name: 'Site',
        fileOrWebpageURL: 'https://olympic.ca',
        isWebpage: true,
      }),
      row({
        id: 'd',
        name: 'Doc',
        parentFolderId: 'a',
        fileOrWebpageURL: 'https://ex.com/x.docx',
      }),
      row({ id: 'e', name: 'Nested Folder', parentFolderId: 'a' }),
      row({
        id: 'f',
        name: 'Bad Name',
        fileOrWebpageURL: 'https://ex.com/bad%E0%A4%A',
      }),
      row({ id: 'g', name: 'Hash', fileOrWebpageURL: 'https://ex.com/#' }),
    ];
    db.findMany.mockResolvedValueOnce(rows);

    const result = await listResources();

    expect(result.map((resource) => resource.id)).toEqual([
      'a',
      'b',
      'c',
      'f',
      'g',
      'd',
      'e',
    ]);
    expect(result[0]).toMatchObject({ type: 'folder', parentId: null });
    expect(result[1]).toMatchObject({
      type: 'file',
      fileUrl: 'https://ex.com/docs/report%20one.pdf',
      file: { name: 'report one.pdf' },
    });
    expect(result[2]).toMatchObject({
      type: 'link',
      URL: 'https://olympic.ca',
      previewUrl: expect.stringContaining(
        encodeURIComponent('https://olympic.ca'),
      ),
    });
    expect(result[3]).toMatchObject({ file: { name: 'bad%E0%A4%A' } });
    expect(result[4]).toMatchObject({ file: { name: 'document' } });
  });

  it('stops ordering when a sibling chain loops or references missing rows', async () => {
    const rows = [
      row({
        id: 'a',
        name: 'A',
        previousElementId: 'missing',
        nextElementId: 'b',
      }),
      row({ id: 'b', name: 'B', previousElementId: 'a', nextElementId: 'a' }),
    ];
    db.findMany.mockResolvedValueOnce(rows);

    const result = await listResources();

    expect(result.map((resource) => resource.id)).toEqual(['a', 'b']);
  });

  it('queries resources visible for a game category', async () => {
    await listResources({ gameCategory: 'Summer Games' });

    expect(db.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { categories: { hasSome: ['General', 'Global'] } },
          { categories: { has: 'Summer Games' } },
          {
            NOT: { categories: { hasSome: ['Summer Games', 'Winter Games'] } },
          },
        ],
      },
    });
  });

  it('queries resources visible for a game and NSO category', async () => {
    await listResources({
      gameCategory: 'Winter Games',
      nsoCategory: 'Cross Country Skiing',
    });

    expect(db.findMany).toHaveBeenCalledWith({
      where: {
        AND: [
          {
            OR: [
              { categories: { hasSome: ['General', 'Global'] } },
              { categories: { has: 'Winter Games' } },
              {
                NOT: {
                  categories: { hasSome: ['Summer Games', 'Winter Games'] },
                },
              },
            ],
          },
          {
            OR: [
              { categories: { hasSome: ['General', 'Global'] } },
              { categories: { has: 'Cross Country Skiing' } },
              { NOT: { categories: { hasSome: [...CANADIAN_NSOS] } } },
            ],
          },
        ],
      },
    });
  });
});

describe('createResource', () => {
  it('creates a root resource with the default category', async () => {
    const created = row({
      id: 'new',
      name: 'Doc',
      fileOrWebpageURL: 'https://ex.com/file',
    });
    db.create.mockResolvedValueOnce(created);
    db.findMany.mockResolvedValueOnce([]).mockResolvedValueOnce([created]);

    const result = await createResource({
      name: 'Doc',
      fileOrWebpageURL: 'https://ex.com/file',
    });

    expect(db.create).toHaveBeenCalledWith({
      data: {
        name: 'Doc',
        categories: ['General'],
        parentFolderId: null,
        fileOrWebpageURL: 'https://ex.com/file',
        isWebpage: false,
        previousElementId: null,
      },
    });
    expect(db.update).not.toHaveBeenCalled();
    expect(result[0]).toMatchObject({ id: 'new', type: 'file' });
  });

  it('appends after the last sibling and links the previous tail', async () => {
    db.findMany
      .mockResolvedValueOnce([
        row({ id: 'a', name: 'A', parentFolderId: 'p', nextElementId: 'b' }),
        row({
          id: 'b',
          name: 'B',
          parentFolderId: 'p',
          previousElementId: 'a',
        }),
      ])
      .mockResolvedValueOnce([]);
    db.create.mockResolvedValueOnce(
      row({ id: 'c', name: 'C', parentFolderId: 'p' }),
    );

    await createResource({
      name: 'C',
      fileOrWebpageURL: null,
      isWebpage: true,
      categories: ['Summer Games'],
      parentId: 'p',
    });

    expect(db.create).toHaveBeenCalledWith({
      data: {
        name: 'C',
        categories: ['Summer Games'],
        parentFolderId: 'p',
        fileOrWebpageURL: null,
        isWebpage: true,
        previousElementId: 'b',
      },
    });
    expect(db.update).toHaveBeenCalledWith({
      where: { id: 'b' },
      data: { nextElementId: 'c' },
    });
  });
});

describe('renameResource and updateResourceCategories', () => {
  it('renames a resource and returns the refreshed list', async () => {
    db.findMany.mockResolvedValueOnce([row({ id: '1', name: 'Renamed' })]);

    const result = await renameResource('1', 'Renamed');

    expect(db.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { name: 'Renamed' },
    });
    expect(result[0].name).toBe('Renamed');
  });

  it('normalizes empty categories back to General', async () => {
    await updateResourceCategories('1', []);
    expect(db.update).toHaveBeenLastCalledWith({
      where: { id: '1' },
      data: { categories: ['General'] },
    });

    await updateResourceCategories('1', ['Winter Games']);
    expect(db.update).toHaveBeenLastCalledWith({
      where: { id: '1' },
      data: { categories: ['Winter Games'] },
    });
  });
});

describe('deleteResources', () => {
  const a = row({ id: 'a', name: 'A' });
  const b = row({ id: 'b', name: 'B', parentFolderId: 'a' });
  const c = row({ id: 'c', name: 'C', parentFolderId: 'b' });
  const d = row({ id: 'd', name: 'D', parentFolderId: 'a' });
  const e = row({ id: 'e', name: 'E', fileOrWebpageURL: 'https://ex.com/e' });

  it('deletes descendants and rechains the remaining root siblings', async () => {
    db.findMany
      .mockResolvedValueOnce([a, b, c, d, e])
      .mockResolvedValueOnce([e])
      .mockResolvedValueOnce([]);

    await deleteResources(['a']);

    const argument = db.deleteMany.mock.calls[0][0] as {
      where: { id: { in: string[] } };
    };
    expect(argument.where.id.in.sort()).toEqual(['a', 'b', 'c', 'd']);
    expect(db.update).toHaveBeenCalledWith({
      where: { id: 'e' },
      data: { previousElementId: null, nextElementId: null },
    });
  });

  it('rechains the parent of a deleted child without touching deleted parents', async () => {
    db.findMany
      .mockResolvedValueOnce([a, b, c, d])
      .mockResolvedValueOnce([d])
      .mockResolvedValueOnce([]);

    await deleteResources(['b']);

    expect(db.update).toHaveBeenCalledTimes(1);
    expect(db.update).toHaveBeenCalledWith({
      where: { id: 'd' },
      data: { previousElementId: null, nextElementId: null },
    });
  });

  it('skips reordering when the parent has no remaining siblings', async () => {
    db.findMany
      .mockResolvedValueOnce([e])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    await deleteResources(['e']);

    expect(db.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ['e'] } },
    });
    expect(db.update).not.toHaveBeenCalled();
  });
});

describe('moveResources', () => {
  it('moves a resource to the root after the last root sibling', async () => {
    db.findMany
      .mockResolvedValueOnce([
        row({ id: 'a', name: 'A' }),
        row({ id: 'p', name: 'P' }),
        row({ id: 'b', name: 'B', parentFolderId: 'p' }),
      ])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    await moveResources(['b'], null);

    expect(db.update).toHaveBeenCalledWith({
      where: { id: 'b' },
      data: {
        parentFolderId: null,
        previousElementId: 'p',
        nextElementId: null,
      },
    });
    expect(db.update).toHaveBeenCalledWith({
      where: { id: 'p' },
      data: { nextElementId: 'b' },
    });
  });

  it('moves a resource into a folder after its existing children', async () => {
    db.findMany
      .mockResolvedValueOnce([
        row({ id: 'a', name: 'A' }),
        row({ id: 'p', name: 'P' }),
        row({ id: 'c', name: 'C', parentFolderId: 'p' }),
      ])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    await moveResources(['a'], 'p');

    expect(db.update).toHaveBeenCalledWith({
      where: { id: 'a' },
      data: {
        parentFolderId: 'p',
        previousElementId: 'c',
        nextElementId: null,
      },
    });
    expect(db.update).toHaveBeenCalledWith({
      where: { id: 'c' },
      data: { nextElementId: 'a' },
    });
  });

  it('rejects missing or non-folder targets', async () => {
    db.findMany.mockResolvedValue([
      row({ id: 'f', name: 'F', fileOrWebpageURL: 'https://ex.com/f' }),
    ]);

    await expect(moveResources(['f'], 'missing')).rejects.toThrow(
      'Target folder not found.',
    );
    await expect(moveResources(['f'], 'f')).rejects.toThrow(
      'Target folder not found.',
    );
  });

  it('rejects moving a folder into its own descendant', async () => {
    db.findMany.mockResolvedValue([
      row({ id: 'a', name: 'A' }),
      row({ id: 'b', name: 'B', parentFolderId: 'a' }),
    ]);

    await expect(moveResources(['a'], 'b')).rejects.toThrow(
      'A folder cannot be moved into itself.',
    );
  });

  it('ignores ids that no longer exist', async () => {
    db.findMany
      .mockResolvedValueOnce([row({ id: 'a', name: 'A' })])
      .mockResolvedValueOnce([]);

    await moveResources(['ghost'], null);

    expect(db.update).not.toHaveBeenCalled();
  });
});

describe('reorderResources', () => {
  it('applies the requested order to the given siblings only', async () => {
    db.findMany
      .mockResolvedValueOnce([
        row({ id: 'a', name: 'A', nextElementId: 'b' }),
        row({
          id: 'b',
          name: 'B',
          previousElementId: 'a',
          nextElementId: 'c',
        }),
        row({ id: 'c', name: 'C', previousElementId: 'b' }),
      ])
      .mockResolvedValueOnce([]);

    await reorderResources(null, ['unknown', 'c', 'a']);

    expect(db.update).toHaveBeenNthCalledWith(1, {
      where: { id: 'c' },
      data: { previousElementId: null, nextElementId: 'b' },
    });
    expect(db.update).toHaveBeenNthCalledWith(2, {
      where: { id: 'b' },
      data: { previousElementId: 'c', nextElementId: 'a' },
    });
    expect(db.update).toHaveBeenNthCalledWith(3, {
      where: { id: 'a' },
      data: { previousElementId: 'b', nextElementId: null },
    });
  });

  it('does nothing when there are no siblings', async () => {
    db.findMany.mockResolvedValueOnce([]);

    await reorderResources(null, []);

    expect(db.update).not.toHaveBeenCalled();
  });
});
