// Made with AI agents (Antigravity)
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { FolderDirectoryModal } from '@/components/resources/FolderDirectoryModal';
import { FolderResource, FileResource } from '@/types/resource';

describe('FolderDirectoryModal Drag Coverage', () => {
  const rootFolder: FolderResource = {
    id: 'folder-root',
    name: 'Root',
    type: 'folder',
    categories: ['Winter'],
  };
  const subFolder: FolderResource = {
    id: 'folder-sub-1',
    name: 'Sub',
    type: 'folder',
    parentId: 'folder-root',
    categories: ['Winter'],
  };
  const childFile: FileResource = {
    id: 'file-1',
    name: 'File 1',
    type: 'file',
    parentId: 'folder-root',
    categories: ['Winter'],
  };
  const allResources = [rootFolder, subFolder, childFile];

  it('triggers drag and drop on a subfolder', () => {
    const handleMove = vi.fn();
    render(
      <FolderDirectoryModal
        folder={rootFolder}
        allResources={allResources}
        currentCategory="Winter"
        onClose={vi.fn()}
        onMoveResourceToFolder={handleMove}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    expect(screen.getByRole('button', { name: 'Done' })).not.toBeNull();

    const fileEl = document.querySelector(
      '[data-folder-item-id="file-1"]',
    ) as HTMLElement;
    const folderEl = document.querySelector(
      '[data-folder-item-id="folder-sub-1"]',
    ) as HTMLElement;

    expect(fileEl).not.toBeNull();
    expect(folderEl).not.toBeNull();

    // Start dragging file
    const cardEl = fileEl.querySelector(
      '[data-resource-id="file-1"]',
    ) as HTMLElement;

    const origElementFromPoint = document.elementFromPoint;
    document.elementFromPoint = vi.fn(() => document.body);

    act(() => {
      fireEvent.pointerDown(cardEl, {
        clientX: 10,
        clientY: 10,
        pointerId: 1,
        preventDefault: vi.fn(),
      });
      document.dispatchEvent(
        new PointerEvent('pointermove', {
          clientX: 30,
          clientY: 30,
          pointerId: 1,
        }),
      );
    });

    document.elementFromPoint = vi.fn(() => folderEl);
    folderEl.getBoundingClientRect = vi.fn(() => ({
      left: 40,
      right: 60,
      top: 40,
      bottom: 60,
      width: 20,
      height: 20,
      x: 40,
      y: 40,
      toJSON: () => {},
    })) as unknown as DOMRect;

    const panel = document.querySelector(
      '[role="dialog"] > div:last-child',
    ) as HTMLElement;
    panel.getBoundingClientRect = vi.fn(() => ({
      left: 0,
      right: 1000,
      top: 0,
      bottom: 1000,
      width: 1000,
      height: 1000,
      x: 0,
      y: 0,
      toJSON: () => {},
    })) as unknown as DOMRect;

    act(() => {
      document.dispatchEvent(
        new PointerEvent('pointermove', {
          clientX: 50,
          clientY: 50,
          pointerId: 1,
        }),
      );
      document.dispatchEvent(
        new PointerEvent('pointerup', {
          clientX: 50,
          clientY: 50,
          pointerId: 1,
        }),
      );
    });

    document.elementFromPoint = origElementFromPoint;

    expect(handleMove).toHaveBeenCalledWith(['file-1'], 'folder-sub-1');
  });

  it('triggers drag and drop outside the panel', () => {
    const handleDropCat = vi.fn();
    render(
      <FolderDirectoryModal
        folder={rootFolder}
        allResources={allResources}
        currentCategory="Winter"
        onClose={vi.fn()}
        onDropOnCategory={handleDropCat}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));

    const fileEl = document.querySelector(
      '[data-folder-item-id="file-1"]',
    ) as HTMLElement;
    const cardEl = fileEl.querySelector(
      '[data-resource-id="file-1"]',
    ) as HTMLElement;

    const origElementFromPoint = document.elementFromPoint;
    document.elementFromPoint = vi.fn(() => document.body);

    act(() => {
      fireEvent.pointerDown(cardEl, {
        clientX: 10,
        clientY: 10,
        pointerId: 1,
        preventDefault: vi.fn(),
      });
      document.dispatchEvent(
        new PointerEvent('pointermove', {
          clientX: 30,
          clientY: 30,
          pointerId: 1,
        }),
      );
    });

    // Drop outside panel (e.g. at 2000, 2000)
    const panel = document.querySelector(
      '[role="dialog"] > div:last-child',
    ) as HTMLElement;
    panel.getBoundingClientRect = vi.fn(() => ({
      left: 0,
      right: 500,
      top: 0,
      bottom: 500,
      width: 500,
      height: 500,
      x: 0,
      y: 0,
      toJSON: () => {},
    })) as unknown as DOMRect;

    act(() => {
      document.dispatchEvent(
        new PointerEvent('pointermove', {
          clientX: 2000,
          clientY: 2000,
          pointerId: 1,
        }),
      );
      document.dispatchEvent(
        new PointerEvent('pointerup', {
          clientX: 2000,
          clientY: 2000,
          pointerId: 1,
        }),
      );
    });

    document.elementFromPoint = origElementFromPoint;
    expect(handleDropCat).toHaveBeenCalledWith(['file-1'], null);
  });

  it('triggers drag and drop reordering', () => {
    const handleReorder = vi.fn();
    render(
      <FolderDirectoryModal
        folder={rootFolder}
        allResources={allResources}
        currentCategory="Winter"
        onClose={vi.fn()}
        onReorderInFolder={handleReorder}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));

    const fileEl = document.querySelector(
      '[data-folder-item-id="file-1"]',
    ) as HTMLElement;
    const folderEl = document.querySelector(
      '[data-folder-item-id="folder-sub-1"]',
    ) as HTMLElement;
    const cardEl = fileEl.querySelector(
      '[data-resource-id="file-1"]',
    ) as HTMLElement;

    const origElementFromPoint = document.elementFromPoint;
    document.elementFromPoint = vi.fn(() => document.body);

    act(() => {
      fireEvent.pointerDown(cardEl, {
        clientX: 10,
        clientY: 10,
        pointerId: 1,
        preventDefault: vi.fn(),
      });
      document.dispatchEvent(
        new PointerEvent('pointermove', {
          clientX: 30,
          clientY: 30,
          pointerId: 1,
        }),
      );
    });

    document.elementFromPoint = vi.fn(() => folderEl);
    folderEl.getBoundingClientRect = vi.fn(() => ({
      left: 40,
      right: 60,
      top: 40,
      bottom: 60,
      width: 20,
      height: 20,
      x: 40,
      y: 40,
      toJSON: () => {},
    })) as unknown as DOMRect;
    const panel = document.querySelector(
      '[role="dialog"] > div:last-child',
    ) as HTMLElement;
    panel.getBoundingClientRect = vi.fn(() => ({
      left: 0,
      right: 1000,
      top: 0,
      bottom: 1000,
      width: 1000,
      height: 1000,
      x: 0,
      y: 0,
      toJSON: () => {},
    })) as unknown as DOMRect;

    // Drop outside the middle 50% so it's a reorder, not a drop INTO
    act(() => {
      document.dispatchEvent(
        new PointerEvent('pointermove', {
          clientX: 42,
          clientY: 42,
          pointerId: 1,
        }),
      );
      document.dispatchEvent(
        new PointerEvent('pointerup', {
          clientX: 42,
          clientY: 42,
          pointerId: 1,
        }),
      );
    });

    document.elementFromPoint = origElementFromPoint;
    expect(handleReorder).toHaveBeenCalled();
  });
});
