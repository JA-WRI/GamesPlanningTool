// 50% or more AI-generated
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createLinkResource,
  createFolder,
  createFileResource,
  renameResource,
  updateResourceCategories,
  deleteResources,
  moveResources,
  reorderResources,
} from '@/features/resources/actions';
import {
  MAX_RESOURCE_FILE_SIZE,
  MAX_RESOURCE_FILE_SIZE_MESSAGE,
} from '@/features/resources/types/resource';

const mocks = vi.hoisted(() => ({
  createResource: vi.fn(),
  renameResource: vi.fn(),
  updateResourceCategories: vi.fn(),
  deleteResources: vi.fn(),
  moveResources: vi.fn(),
  reorderResources: vi.fn(),
  uploadResourceFile: vi.fn(),
  getSession: vi.fn(),
}));

vi.mock('@/lib/data', () => ({
  getSession: mocks.getSession,
}));

vi.mock('@/lib/resources', () => ({
  createResource: mocks.createResource,
  renameResource: mocks.renameResource,
  updateResourceCategories: mocks.updateResourceCategories,
  deleteResources: mocks.deleteResources,
  moveResources: mocks.moveResources,
  reorderResources: mocks.reorderResources,
}));

vi.mock('@/lib/supabase', () => ({
  uploadResourceFile: mocks.uploadResourceFile,
}));

function fileFormData(overrides: Record<string, string> = {}): FormData {
  const formData = new FormData();
  const fields = {
    name: 'Plan',
    categories: JSON.stringify(['General']),
    parentId: 'p1',
    ...overrides,
  };
  Object.entries(fields).forEach(([key, value]) => formData.set(key, value));
  formData.set(
    'file',
    new File(['data'], 'plan.pdf', { type: 'application/pdf' }),
  );
  return formData;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getSession.mockResolvedValue({
    user: { role: 'admin', gameId: 'game_id_1' },
  });
  mocks.createResource.mockResolvedValue([]);
  mocks.uploadResourceFile.mockResolvedValue('https://cdn/plan.pdf');
});

describe('resource actions', () => {
  it('creates link resources', async () => {
    await createLinkResource({
      name: 'Site',
      url: 'https://olympic.ca',
      categories: ['General'],
      parentId: 'p1',
    });
    expect(mocks.createResource).toHaveBeenCalledWith({
      name: 'Site',
      categories: ['General'],
      parentId: 'p1',
      fileOrWebpageURL: 'https://olympic.ca',
      isWebpage: true,
    });

    await createLinkResource({
      name: 'Root',
      url: 'https://olympic.ca',
      categories: ['General'],
    });
    expect(mocks.createResource).toHaveBeenLastCalledWith(
      expect.objectContaining({ parentId: null }),
    );
  });

  it('creates folders', async () => {
    await createFolder({ name: 'Folder' });
    expect(mocks.createResource).toHaveBeenCalledWith({
      name: 'Folder',
      categories: undefined,
      parentId: null,
      fileOrWebpageURL: null,
    });
  });

  it('uploads a file before creating the resource', async () => {
    const formData = fileFormData();

    await createFileResource(formData);

    expect(mocks.uploadResourceFile).toHaveBeenCalledWith(expect.any(File));
    expect(mocks.createResource).toHaveBeenCalledWith({
      name: 'Plan',
      categories: ['General'],
      parentId: 'p1',
      fileOrWebpageURL: 'https://cdn/plan.pdf',
    });
  });

  it('defaults the parent to null when none is provided', async () => {
    const formData = fileFormData({ parentId: '' });

    await createFileResource(formData);

    expect(mocks.createResource).toHaveBeenCalledWith(
      expect.objectContaining({ parentId: null }),
    );
  });

  it('rejects files over the size limit before uploading', async () => {
    const formData = fileFormData();
    const file = formData.get('file') as File;
    Object.defineProperty(file, 'size', {
      value: MAX_RESOURCE_FILE_SIZE + 1,
    });

    await expect(createFileResource(formData)).rejects.toThrow(
      MAX_RESOURCE_FILE_SIZE_MESSAGE,
    );
    expect(mocks.uploadResourceFile).not.toHaveBeenCalled();
  });

  it('requires a file and a name', async () => {
    const withoutFile = new FormData();
    withoutFile.set('name', 'Plan');
    await expect(createFileResource(withoutFile)).rejects.toThrow(
      'A file is required.',
    );

    const withoutName = new FormData();
    withoutName.set('file', new File(['data'], 'plan.pdf'));
    await expect(createFileResource(withoutName)).rejects.toThrow(
      'A name is required.',
    );
  });

  it('rejects mutations from non-admin sessions', async () => {
    mocks.getSession.mockResolvedValue({
      user: { role: 'nso', gameId: 'game_id_1', nsoId: 'nso_1' },
    });

    await expect(createFolder({ name: 'Folder' })).rejects.toThrow(
      'You do not have permission to modify resources.',
    );
    expect(mocks.createResource).not.toHaveBeenCalled();
  });

  it('rejects link URLs that are not http or https', async () => {
    await expect(
      createLinkResource({
        name: 'Bad',
        url: 'javascript:alert(1)',
        categories: ['General'],
      }),
    ).rejects.toThrow('Please provide a valid URL for the resource.');
    expect(mocks.createResource).not.toHaveBeenCalled();
  });

  it('rejects malformed categories before uploading', async () => {
    const formData = fileFormData();
    formData.set('categories', '"not-an-array"');

    await expect(createFileResource(formData)).rejects.toThrow(
      'Invalid categories.',
    );

    formData.set('categories', 'not-json');

    await expect(createFileResource(formData)).rejects.toThrow(
      'Invalid categories.',
    );
    expect(mocks.uploadResourceFile).not.toHaveBeenCalled();
  });

  it('delegates rename, categories, delete, move, and reorder', async () => {
    await renameResource('1', 'New');
    expect(mocks.renameResource).toHaveBeenCalledWith('1', 'New');

    await updateResourceCategories('1', ['Winter Games']);
    expect(mocks.updateResourceCategories).toHaveBeenCalledWith('1', [
      'Winter Games',
    ]);

    await deleteResources(['1', '2']);
    expect(mocks.deleteResources).toHaveBeenCalledWith(['1', '2']);

    await moveResources(['1'], 'p');
    expect(mocks.moveResources).toHaveBeenCalledWith(['1'], 'p');

    await reorderResources(null, ['2', '1']);
    expect(mocks.reorderResources).toHaveBeenCalledWith(null, ['2', '1']);
  });
});
