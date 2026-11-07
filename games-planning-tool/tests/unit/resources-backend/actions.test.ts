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

const mocks = vi.hoisted(() => ({
  createResource: vi.fn(),
  renameResource: vi.fn(),
  updateResourceCategories: vi.fn(),
  deleteResources: vi.fn(),
  moveResources: vi.fn(),
  reorderResources: vi.fn(),
  uploadResourceFile: vi.fn(),
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
