// Made with AI agents (Antigravity)
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { FolderDirectoryModal } from '@/components/resources/FolderDirectoryModal';
import * as resourcesData from '@/lib/resources-data';
import { FolderResource, Resource } from '@/types/resource';

vi.mock('@/lib/resources-data', async () => {
  const actual = await vi.importActual('@/lib/resources-data');
  return {
    ...actual,
    getFolderChildren: vi.fn(),
  };
});

describe('FolderDirectoryModal pointer and drag events', () => {
  const mockFolder: FolderResource = {
    id: 'folder-1',
    name: 'My Folder',
    type: 'folder',
    categories: ['General'],
  };

  const mockChildren: Resource[] = [
    {
      id: 'file-1',
      name: 'File 1',
      type: 'file',
      fileUrl: 'test1',
      categories: ['General'],
      parentId: 'folder-1',
    },
    {
      id: 'subfolder-1',
      name: 'Sub Folder',
      type: 'folder',
      categories: ['General'],
      parentId: 'folder-1',
    },
    {
      id: 'file-2',
      name: 'File 2',
      type: 'file',
      fileUrl: 'test2',
      categories: ['General'],
      parentId: 'folder-1',
    },
  ];

  const defaultProps = {
    folder: mockFolder,
    allResources: [mockFolder, ...mockChildren],
    currentCategory: 'General',
    onClose: vi.fn(),
    onSelectResourceDetail: vi.fn(),
    onCreateSubfolder: vi.fn(),
    onAddResourceToFolder: vi.fn(),
    onMoveResourceToFolder: vi.fn(),
    onReorderInFolder: vi.fn(),
    onRenameResource: vi.fn(),
    onDeleteResources: vi.fn(),
    onDropOnMainPage: vi.fn(),
    onPointerHoverMainPage: vi.fn(),
    onCategoriesChange: vi.fn(),
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    vi.mocked(resourcesData.getFolderChildren).mockReturnValue(mockChildren);
    document.elementFromPoint = vi.fn().mockReturnValue(document.body);
    Element.prototype.getBoundingClientRect = vi.fn().mockReturnValue({
      left: 0,
      right: 1000,
      top: 0,
      bottom: 1000,
      width: 1000,
      height: 1000,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('triggers edit mode and selection via sweep pointer down', () => {
    render(<FolderDirectoryModal {...defaultProps} />);
    const editBtn = screen.getByRole('button', { name: 'Edit' });
    fireEvent.click(editBtn);

    const cards = document.querySelectorAll('[data-resource-id]');
    expect(cards.length).toBe(3);

    const toggleBtn = cards[0].querySelector('.rounded-full.border-2');
    if (toggleBtn) {
      fireEvent.pointerDown(toggleBtn, { clientX: 10, clientY: 10, button: 0 });
      act(() => {
        window.dispatchEvent(
          new PointerEvent('pointermove', { clientX: 50, clientY: 50 }),
        );
      });
      act(() => {
        window.dispatchEvent(new PointerEvent('pointerup'));
      });
      fireEvent.click(toggleBtn);
    }
  });

  it('handles card drag and drop to reorder', () => {
    render(<FolderDirectoryModal {...defaultProps} />);
    const panel = document.querySelector(
      '.bg-white.rounded-2xl',
    ) as HTMLElement;
    if (panel) {
      panel.getBoundingClientRect = () =>
        ({
          left: 0,
          right: 1000,
          top: 0,
          bottom: 1000,
          width: 1000,
          height: 1000,
        }) as unknown as DOMRect;
    }
    const cards = document.querySelectorAll('[data-resource-id]');

    fireEvent.pointerDown(cards[0], { clientX: 100, clientY: 100, button: 0 });

    act(() => {
      window.dispatchEvent(
        new PointerEvent('pointermove', { clientX: 120, clientY: 120 }),
      );
    });

    const mockCard = document.createElement('div');
    mockCard.setAttribute('data-resource-id', 'file-2');
    mockCard.setAttribute('data-resource-type', 'file');
    mockCard.getBoundingClientRect = () =>
      ({
        left: 200,
        right: 300,
        top: 100,
        bottom: 200,
        width: 100,
        height: 100,
      }) as unknown as DOMRect;
    (
      document.elementFromPoint as unknown as {
        mockReturnValue: (el: HTMLElement) => void;
      }
    ).mockReturnValue(mockCard);

    act(() => {
      window.dispatchEvent(
        new PointerEvent('pointermove', { clientX: 250, clientY: 150 }),
      );
    });

    act(() => {
      window.dispatchEvent(new PointerEvent('pointerup'));
    });

    expect(defaultProps.onReorderInFolder).toHaveBeenCalled();
  });

  it('handles closing the modal', () => {
    render(<FolderDirectoryModal {...defaultProps} />);
    const closeBtn = screen.getByRole('button', {
      name: 'Close folder dialog',
    });
    fireEvent.click(closeBtn);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('handles creating subfolder', () => {
    render(<FolderDirectoryModal {...defaultProps} />);
    const newFolderBtn = screen.getByRole('button', {
      name: '+ Create Subfolder',
    });
    fireEvent.click(newFolderBtn);

    const input = screen.getByPlaceholderText('Subfolder name...');
    fireEvent.change(input, { target: { value: 'My New Subfolder' } });

    const createBtn = screen.getByRole('button', { name: 'Create' });
    fireEvent.click(createBtn);
    expect(defaultProps.onCreateSubfolder).toHaveBeenCalledWith(
      'My New Subfolder',
      'folder-1',
    );
  });

  it('handles navigation into subfolder and back via breadcrumb', () => {
    render(<FolderDirectoryModal {...defaultProps} />);
    const subfolderCard = screen.getByText('Sub Folder');
    fireEvent.click(subfolderCard);

    const backBtn = screen.getByTitle('Go back (drag items here to move up)');
    fireEvent.click(backBtn);
  });

  it('handles resource click to open detail', () => {
    render(<FolderDirectoryModal {...defaultProps} />);
    const fileCard = screen.getByText('File 1');
    fireEvent.click(fileCard);
    expect(defaultProps.onSelectResourceDetail).toHaveBeenCalled();
  });

  it('renders read-only mode correctly', () => {
    render(<FolderDirectoryModal {...defaultProps} isReadOnly={true} />);
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull();
    expect(screen.queryByRole('button', { name: '+ Add Resource' })).toBeNull();
  });

  it('handles dragging card outside modal panel to drop on main page', () => {
    render(<FolderDirectoryModal {...defaultProps} />);
    const cards = document.querySelectorAll('[data-resource-id]');

    fireEvent.pointerDown(cards[0], { clientX: 100, clientY: 100, button: 0 });

    act(() => {
      window.dispatchEvent(
        new PointerEvent('pointermove', { clientX: 5000, clientY: 5000 }),
      );
    });

    act(() => {
      window.dispatchEvent(
        new PointerEvent('pointerup', { clientX: 5000, clientY: 5000 }),
      );
    });

    expect(defaultProps.onDropOnMainPage).toHaveBeenCalledWith(
      ['file-1'],
      null,
    );
  });

  it('handles category editing modal toggle inside folder', () => {
    render(<FolderDirectoryModal {...defaultProps} />);
    const editCatsBtn = screen.getByRole('button', { name: 'Edit Categories' });
    fireEvent.click(editCatsBtn);

    expect(screen.getByText('Primary Categories')).toBeDefined();

    // Toggle close
    fireEvent.click(editCatsBtn);
  });

  it('handles dropping pointer drag onto back nav target and spring navigation', () => {
    const parentFolder: FolderResource = {
      id: 'parent-folder-id',
      name: 'Parent',
      type: 'folder',
      categories: [],
    };
    const folderWithParent: FolderResource = {
      ...mockFolder,
      parentId: 'parent-folder-id',
    };
    render(
      <FolderDirectoryModal
        {...defaultProps}
        folder={folderWithParent}
        allResources={[parentFolder, folderWithParent, ...mockChildren]}
      />,
    );
    const cards = document.querySelectorAll('[data-resource-id]');

    fireEvent.pointerDown(cards[0], { clientX: 100, clientY: 100, button: 0 });

    const backBtn = document.querySelector(
      '[data-folder-nav="back"]',
    ) as HTMLElement;
    (
      document.elementFromPoint as unknown as {
        mockReturnValue: (el: HTMLElement) => void;
      }
    ).mockReturnValue(backBtn);

    act(() => {
      window.dispatchEvent(
        new PointerEvent('pointermove', { clientX: 20, clientY: 20 }),
      );
    });

    act(() => {
      window.dispatchEvent(
        new PointerEvent('pointerup', { clientX: 20, clientY: 20 }),
      );
    });

    expect(defaultProps.onMoveResourceToFolder).toHaveBeenCalledWith(
      ['file-1'],
      'parent-folder-id',
    );
  });

  it('handles dropping pointer drag onto a subfolder card', () => {
    render(<FolderDirectoryModal {...defaultProps} />);
    const cards = document.querySelectorAll('[data-resource-id]');

    fireEvent.pointerDown(cards[0], { clientX: 100, clientY: 100, button: 0 });

    const folderCard = document.querySelector(
      '[data-folder-item-id="subfolder-1"]',
    ) as HTMLElement;
    folderCard.getBoundingClientRect = () =>
      ({
        left: 200,
        right: 300,
        top: 100,
        bottom: 200,
        width: 100,
        height: 100,
      }) as unknown as DOMRect;
    (
      document.elementFromPoint as unknown as {
        mockReturnValue: (el: HTMLElement) => void;
      }
    ).mockReturnValue(folderCard);

    act(() => {
      window.dispatchEvent(
        new PointerEvent('pointermove', { clientX: 250, clientY: 150 }),
      );
    });

    act(() => {
      window.dispatchEvent(
        new PointerEvent('pointerup', { clientX: 250, clientY: 150 }),
      );
    });

    expect(defaultProps.onMoveResourceToFolder).toHaveBeenCalledWith(
      ['file-1'],
      'subfolder-1',
    );
  });

  it('handles renaming folder title on enter', () => {
    render(<FolderDirectoryModal {...defaultProps} />);
    const title = screen.getByTitle('Click to rename');
    fireEvent.click(title);

    const input = screen.getByDisplayValue('My Folder');
    fireEvent.change(input, { target: { value: 'Updated Folder Name' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(defaultProps.onRenameResource).toHaveBeenCalledWith(
      'folder-1',
      'Updated Folder Name',
    );
  });

  it('handles renaming folder title on blur', () => {
    render(<FolderDirectoryModal {...defaultProps} />);
    const title = screen.getByTitle('Click to rename');
    fireEvent.click(title);

    const input = screen.getByDisplayValue('My Folder');
    fireEvent.change(input, { target: { value: 'Blur Renamed' } });
    fireEvent.blur(input);

    expect(defaultProps.onRenameResource).toHaveBeenCalledWith(
      'folder-1',
      'Blur Renamed',
    );
  });

  it('handles canceling folder title rename on escape', () => {
    render(<FolderDirectoryModal {...defaultProps} />);
    const title = screen.getByTitle('Click to rename');
    fireEvent.click(title);

    const input = screen.getByDisplayValue('My Folder');
    fireEvent.change(input, { target: { value: 'Escaped Name' } });
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(defaultProps.onRenameResource).not.toHaveBeenCalledWith(
      'folder-1',
      'Escaped Name',
    );
  });

  it('handles selecting and deleting items inside folder in edit mode', () => {
    window.confirm = vi.fn().mockReturnValue(true);
    render(<FolderDirectoryModal {...defaultProps} />);

    const editBtn = screen.getByRole('button', { name: 'Edit' });
    fireEvent.click(editBtn);

    const cards = document.querySelectorAll('[data-resource-id]');
    fireEvent.click(cards[0]);

    const deleteBtn = screen.getByRole('button', { name: /Delete Selected/ });
    fireEvent.click(deleteBtn);

    expect(defaultProps.onDeleteResources).toHaveBeenCalled();
  });

  it('renders empty folder state when folder has no children', () => {
    vi.mocked(resourcesData.getFolderChildren).mockReturnValue([]);
    render(<FolderDirectoryModal {...defaultProps} />);
    expect(screen.getByText('This folder is empty.')).toBeInTheDocument();
  });

  it('handles canceling subfolder creation', () => {
    render(<FolderDirectoryModal {...defaultProps} />);
    const newFolderBtn = screen.getByRole('button', {
      name: '+ Create Subfolder',
    });
    fireEvent.click(newFolderBtn);

    const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelBtn);
    expect(screen.queryByPlaceholderText('Subfolder name...')).toBeNull();
  });

  it('handles backdrop dragOver and drop with externalDraggedId', () => {
    render(
      <FolderDirectoryModal {...defaultProps} externalDraggedId="file-1" />,
    );
    const backdrop = screen.getByLabelText('Close dialog');

    const dt = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      dataTransfer: { dropEffect: 'none', getData: () => 'file-1' },
    };

    fireEvent.dragOver(backdrop, dt);
    expect(dt.dataTransfer.dropEffect).toBe('move');

    act(() => {
      vi.advanceTimersByTime(900);
    });
    expect(defaultProps.onClose).toHaveBeenCalled();

    fireEvent.drop(backdrop, dt);
    expect(defaultProps.onMoveResourceToFolder).toHaveBeenCalledWith(
      ['file-1'],
      'folder-1',
    );
  });

  it('handles modal panel dragOver and drop with externalDraggedId', () => {
    render(
      <FolderDirectoryModal {...defaultProps} externalDraggedId="file-1" />,
    );
    const panel = document.querySelector(
      '.bg-white.rounded-2xl',
    ) as HTMLElement;

    // Drag over panel
    fireEvent.dragOver(panel, {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      dataTransfer: { dropEffect: 'none' },
    });

    const externalDt = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      dataTransfer: { dropEffect: 'none', getData: () => 'external-res-1' },
    };
    fireEvent.drop(panel, externalDt);
    expect(defaultProps.onMoveResourceToFolder).toHaveBeenCalledWith(
      ['external-res-1'],
      'folder-1',
    );

    // Drop onto modal panel with existing local item
    const localDt = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      dataTransfer: { dropEffect: 'none', getData: () => 'file-1' },
    };
    fireEvent.drop(panel, localDt);
    expect(defaultProps.onReorderInFolder).toHaveBeenCalled();
  });

  it('handles breadcrumb drag navigation and clicking breadcrumb in header', () => {
    const parentFolder: FolderResource = {
      id: 'parent-1',
      name: 'Root Folder',
      type: 'folder',
      categories: [],
    };
    const curFolder: FolderResource = {
      id: 'folder-1',
      name: 'Current Folder',
      type: 'folder',
      categories: [],
      parentId: 'parent-1',
    };

    render(
      <FolderDirectoryModal
        {...defaultProps}
        folder={curFolder}
        allResources={[parentFolder, curFolder, ...mockChildren]}
      />,
    );

    const bcBtn = screen.getByRole('button', { name: 'Root Folder' });
    fireEvent.click(bcBtn);

    const cards = document.querySelectorAll('[data-resource-id]');
    fireEvent.pointerDown(cards[0], { clientX: 100, clientY: 100, button: 0 });

    (
      document.elementFromPoint as unknown as {
        mockReturnValue: (el: HTMLElement) => void;
      }
    ).mockReturnValue(bcBtn);
    act(() => {
      window.dispatchEvent(
        new PointerEvent('pointermove', { clientX: 50, clientY: 50 }),
      );
    });
    act(() => {
      window.dispatchEvent(
        new PointerEvent('pointerup', { clientX: 50, clientY: 50 }),
      );
    });
    expect(defaultProps.onMoveResourceToFolder).toHaveBeenCalledWith(
      ['file-1'],
      'parent-1',
    );
  });

  it('handles add resource button click and filterPredicate', () => {
    const filterPredicate = (r: Resource) => r.type === 'file';
    render(
      <FolderDirectoryModal
        {...defaultProps}
        filterPredicate={filterPredicate}
      />,
    );

    const addBtn = screen.getByRole('button', { name: '+ Add Resource' });
    fireEvent.click(addBtn);
    expect(defaultProps.onAddResourceToFolder).toHaveBeenCalledWith('folder-1');

    expect(screen.queryByText('Sub Folder')).toBeNull();
  });

  it('handles category editor change', () => {
    render(<FolderDirectoryModal {...defaultProps} />);
    const editCatsBtn = screen.getByRole('button', { name: 'Edit Categories' });
    fireEvent.click(editCatsBtn);

    const catBadge = screen.getByText('Summer Games');
    fireEvent.click(catBadge);
    expect(defaultProps.onCategoriesChange).toHaveBeenCalled();
  });

  it('updates currentFolderId when folder prop changes', () => {
    const newFolder: FolderResource = {
      id: 'folder-2',
      name: 'Folder Two',
      type: 'folder',
      categories: [],
    };
    const { rerender } = render(
      <FolderDirectoryModal
        {...defaultProps}
        allResources={[mockFolder, newFolder, ...mockChildren]}
      />,
    );
    rerender(
      <FolderDirectoryModal
        {...defaultProps}
        folder={newFolder}
        allResources={[mockFolder, newFolder, ...mockChildren]}
      />,
    );
    expect(screen.getByText('Folder Two')).toBeInTheDocument();
  });

  it('triggers spring timer navigation when hovering back button', () => {
    const parentFolder: FolderResource = {
      id: 'parent-folder-id',
      name: 'Parent',
      type: 'folder',
      categories: [],
    };
    const folderWithParent: FolderResource = {
      ...mockFolder,
      parentId: 'parent-folder-id',
    };
    render(
      <FolderDirectoryModal
        {...defaultProps}
        folder={folderWithParent}
        allResources={[parentFolder, folderWithParent, ...mockChildren]}
      />,
    );
    const cards = document.querySelectorAll('[data-resource-id]');
    fireEvent.pointerDown(cards[0], { clientX: 100, clientY: 100, button: 0 });

    const backBtn = document.querySelector(
      '[data-folder-nav="back"]',
    ) as HTMLElement;
    (
      document.elementFromPoint as unknown as {
        mockReturnValue: (el: HTMLElement) => void;
      }
    ).mockReturnValue(backBtn);

    act(() => {
      window.dispatchEvent(
        new PointerEvent('pointermove', { clientX: 20, clientY: 20 }),
      );
    });

    act(() => {
      vi.advanceTimersByTime(850);
    });
  });

  it('triggers spring timer navigation when hovering breadcrumb button', () => {
    const parentFolder: FolderResource = {
      id: 'parent-1',
      name: 'Root Folder',
      type: 'folder',
      categories: [],
    };
    const curFolder: FolderResource = {
      id: 'folder-1',
      name: 'Current Folder',
      type: 'folder',
      categories: [],
      parentId: 'parent-1',
    };
    render(
      <FolderDirectoryModal
        {...defaultProps}
        folder={curFolder}
        allResources={[parentFolder, curFolder, ...mockChildren]}
      />,
    );
    const cards = document.querySelectorAll('[data-resource-id]');
    fireEvent.pointerDown(cards[0], { clientX: 100, clientY: 100, button: 0 });

    const bcBtn = screen.getByRole('button', { name: 'Root Folder' });
    (
      document.elementFromPoint as unknown as {
        mockReturnValue: (el: HTMLElement) => void;
      }
    ).mockReturnValue(bcBtn);

    act(() => {
      window.dispatchEvent(
        new PointerEvent('pointermove', { clientX: 50, clientY: 50 }),
      );
    });

    act(() => {
      vi.advanceTimersByTime(850);
    });
  });

  it('triggers spring timer navigation when hovering a subfolder card', () => {
    render(<FolderDirectoryModal {...defaultProps} />);
    const cards = document.querySelectorAll('[data-resource-id]');
    fireEvent.pointerDown(cards[0], { clientX: 100, clientY: 100, button: 0 });

    const folderCard = document.querySelector(
      '[data-folder-item-id="subfolder-1"]',
    ) as HTMLElement;
    folderCard.getBoundingClientRect = () =>
      ({
        left: 200,
        right: 300,
        top: 100,
        bottom: 200,
        width: 100,
        height: 100,
      }) as unknown as DOMRect;
    (
      document.elementFromPoint as unknown as {
        mockReturnValue: (el: HTMLElement) => void;
      }
    ).mockReturnValue(folderCard);

    act(() => {
      window.dispatchEvent(
        new PointerEvent('pointermove', { clientX: 250, clientY: 150 }),
      );
    });

    act(() => {
      vi.advanceTimersByTime(850);
    });
  });

  it('handles HTML5 drop on a subfolder card inside modal', () => {
    render(<FolderDirectoryModal {...defaultProps} />);
    const subfolderEl = document.querySelector(
      '[data-folder-item-id="subfolder-1"]',
    ) as HTMLElement;
    const innerCard = subfolderEl.querySelector(
      '[data-resource-id]',
    ) as HTMLElement;

    const dt = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      dataTransfer: { dropEffect: 'move', getData: () => 'file-1' },
    };

    fireEvent.drop(innerCard, dt);
    expect(defaultProps.onMoveResourceToFolder).toHaveBeenCalledWith(
      ['file-1'],
      'subfolder-1',
    );
  });

  it('handles HTML5 dragOver on modal panel with externalDraggedId over subfolder', () => {
    render(
      <FolderDirectoryModal {...defaultProps} externalDraggedId="external-1" />,
    );
    const panel = document.querySelector(
      '.bg-white.rounded-2xl',
    ) as HTMLElement;
    const subfolderEl = document.querySelector(
      '[data-folder-item-id="subfolder-1"]',
    ) as HTMLElement;
    subfolderEl.getBoundingClientRect = () =>
      ({
        left: 200,
        right: 300,
        top: 100,
        bottom: 200,
        width: 100,
        height: 100,
      }) as unknown as DOMRect;
    (
      document.elementFromPoint as unknown as {
        mockReturnValue: (el: HTMLElement) => void;
      }
    ).mockReturnValue(subfolderEl);

    fireEvent.dragOver(panel, {
      clientX: 250,
      clientY: 150,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      dataTransfer: { dropEffect: 'none' },
    });

    act(() => {
      vi.advanceTimersByTime(850);
    });

    // Hover non-folder card
    const fileCard = document.querySelector(
      '[data-folder-item-id="file-2"]',
    ) as HTMLElement;
    fileCard.getBoundingClientRect = () =>
      ({
        left: 400,
        right: 500,
        top: 100,
        bottom: 200,
        width: 100,
        height: 100,
      }) as unknown as DOMRect;
    (
      document.elementFromPoint as unknown as {
        mockReturnValue: (el: HTMLElement) => void;
      }
    ).mockReturnValue(fileCard);

    fireEvent.dragOver(panel, {
      clientX: 450,
      clientY: 150,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      dataTransfer: { dropEffect: 'none' },
    });
  });

  it('handles blur after enter key commit on title rename without duplicate callback', () => {
    render(<FolderDirectoryModal {...defaultProps} />);
    const title = screen.getByTitle('Click to rename');
    fireEvent.click(title);

    const input = screen.getByDisplayValue('My Folder');
    fireEvent.change(input, { target: { value: 'Committed Once' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(defaultProps.onRenameResource).toHaveBeenCalledWith(
      'folder-1',
      'Committed Once',
    );

    // Subsequent blur should return early
    fireEvent.blur(input);
    expect(defaultProps.onRenameResource).toHaveBeenCalledTimes(1);
  });
});
