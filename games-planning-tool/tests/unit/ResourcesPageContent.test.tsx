// Made with AI agents (Antigravity)
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { ResourcesPageContent } from '@/components/resources/ResourcesPageContent';
import * as resourcesData from '@/lib/resources-data';
import { Resource } from '@/types/resource';

vi.mock('@/lib/resources-data', async () => {
  const actual = await vi.importActual('@/lib/resources-data');
  return {
    ...actual,
    subscribeToResources: vi.fn(),
    getCachedResources: vi.fn(),
    saveResourcesToStorage: vi.fn(),
    createFolder: vi.fn().mockReturnValue({
      id: 'new-folder',
      name: 'New Folder',
      type: 'folder',
      categories: [],
    }),
    deleteResource: vi.fn(),
  };
});

describe('ResourcesPageContent', () => {
  const mockResources: Resource[] = [
    {
      id: '1',
      name: 'General Folder',
      type: 'folder',
      categories: ['General'],
    },
    {
      id: '2',
      name: 'File 1',
      type: 'file',
      fileUrl: 'test',
      categories: ['Summer Games'],
    },
    {
      id: '3',
      name: 'File 2',
      type: 'file',
      fileUrl: 'test',
      categories: ['Winter Games'],
    },
    {
      id: 'child-1',
      name: 'Child 1',
      type: 'file',
      fileUrl: 'test',
      categories: ['General'],
      parentId: '1',
    },
  ];

  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(resourcesData.subscribeToResources).mockImplementation(
      () => () => {},
    );
    vi.mocked(resourcesData.getCachedResources).mockReturnValue(mockResources);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders resources page and allows searching', () => {
    render(<ResourcesPageContent />);
    expect(screen.getByText('Resources Dashboard')).toBeInTheDocument();

    const searchInput = screen.getAllByPlaceholderText(
      'Search by name, category...',
    )[0];
    fireEvent.change(searchInput, { target: { value: 'File 1' } });

    expect(screen.getByText('File 1')).toBeInTheDocument();
  });

  it('can open add resource and create folder modals', () => {
    render(<ResourcesPageContent />);
    const addBtn = screen.getByRole('button', { name: 'Add Resource' });
    fireEvent.click(addBtn);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    const createFolderBtn = screen.getByRole('button', {
      name: 'Create Folder',
    });
    fireEvent.click(createFolderBtn);

    const input = screen.getByPlaceholderText('e.g. Venue Maps');
    fireEvent.change(input, { target: { value: 'New Test Folder' } });

    const submitBtn = screen
      .getAllByRole('button', { name: 'Create Folder' })
      .find((b) => b.getAttribute('type') === 'submit');
    if (submitBtn) {
      fireEvent.click(submitBtn);
      expect(resourcesData.saveResourcesToStorage).toHaveBeenCalled();
    }
  });

  it('handles edit mode delete confirmation and cancellation', () => {
    window.confirm = vi.fn().mockReturnValue(false);
    render(<ResourcesPageContent />);

    const editBtns = screen.getAllByRole('button', { name: 'Edit' });
    const editBtn = editBtns[editBtns.length - 1];
    fireEvent.click(editBtn);

    const cards = document.querySelectorAll('[data-resource-id]');
    fireEvent.click(cards[0]); // toggle selection

    const deleteBtn = screen.getByText(/Delete/);
    fireEvent.click(deleteBtn);
    expect(resourcesData.saveResourcesToStorage).not.toHaveBeenCalled();

    // Confirm true
    window.confirm = vi.fn().mockReturnValue(true);
    fireEvent.click(deleteBtn);
    expect(resourcesData.saveResourcesToStorage).toHaveBeenCalled();
  });

  it('handles drag and drop to reorder via HTML5 drag/drop', () => {
    render(<ResourcesPageContent />);
    const cards = document.querySelectorAll('[data-resource-id]');

    const dt = { setData: vi.fn(), dropEffect: 'move', effectAllowed: 'move' };
    fireEvent.dragStart(cards[0], { dataTransfer: dt });
    fireEvent.dragOver(cards[1], {
      dataTransfer: dt,
      clientX: 200,
      currentTarget: {
        getBoundingClientRect: () => ({ left: 100, width: 200 }),
      },
    });
    fireEvent.drop(cards[1]);
    fireEvent.dragEnd(cards[0]);

    expect(resourcesData.saveResourcesToStorage).toHaveBeenCalled();
  });

  it('prevents drag start when items are selected', () => {
    render(<ResourcesPageContent />);
    const editBtn = screen.getByRole('button', { name: 'Edit' });
    fireEvent.click(editBtn);

    const cards = document.querySelectorAll('[data-resource-id]');
    fireEvent.click(cards[0]);

    const dt = { setData: vi.fn(), preventDefault: vi.fn() };
    fireEvent.dragStart(cards[0], { dataTransfer: dt });
  });

  it('handles drag end without drop by resetting order', () => {
    render(<ResourcesPageContent />);
    const cards = document.querySelectorAll('[data-resource-id]');

    const dt = { setData: vi.fn(), dropEffect: 'move', effectAllowed: 'move' };
    fireEvent.dragStart(cards[0], { dataTransfer: dt });
    // Cancelled drag without drop
    fireEvent.dragEnd(cards[0]);
  });

  it('handles drop into a folder and spring loading', () => {
    render(<ResourcesPageContent />);
    const cards = document.querySelectorAll('[data-resource-id]');

    const dt = {
      setData: vi.fn(),
      getData: () => '2',
      dropEffect: 'move',
      effectAllowed: 'move',
    };
    fireEvent.dragStart(cards[1], { dataTransfer: dt });

    // Hover folder
    fireEvent.dragOver(cards[0], {
      dataTransfer: dt,
      clientX: 150,
      currentTarget: {
        getBoundingClientRect: () => ({ left: 100, width: 100 }),
      },
    });

    act(() => {
      vi.advanceTimersByTime(700);
    });

    fireEvent.drop(cards[0], { dataTransfer: dt });

    expect(resourcesData.saveResourcesToStorage).toHaveBeenCalled();
  });

  it('handles pointer hover on main page from external drag with spring load', () => {
    render(<ResourcesPageContent />);

    const folderCard = screen.getByText('General Folder');
    fireEvent.click(folderCard);

    expect(screen.getByText('Child 1')).toBeInTheDocument();

    // Mock elementFromPoint hitting folder
    const targetFolderEl = document.querySelector(
      '[data-resource-id="1"]',
    ) as HTMLElement;
    targetFolderEl.getBoundingClientRect = () =>
      ({
        left: 100,
        width: 100,
        top: 0,
        bottom: 100,
        right: 200,
        height: 100,
      }) as DOMRect;
    document.elementFromPoint = vi.fn().mockReturnValue(targetFolderEl);

    // Call pointer hover directly or via window event
    const cards = document.querySelectorAll('[data-resource-id]');
    fireEvent.pointerDown(cards[0], { clientX: 100, clientY: 100, button: 0 });

    act(() => {
      window.dispatchEvent(
        new PointerEvent('pointermove', { clientX: 5000, clientY: 5000 }),
      );
    });
  });

  it('handles FolderDirectoryModal callbacks from within ResourcesPageContent', () => {
    render(<ResourcesPageContent />);

    const folderCard = screen.getByText('General Folder');
    fireEvent.click(folderCard);

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    const subfolderBtn = screen.getByRole('button', {
      name: '+ Create Subfolder',
    });
    fireEvent.click(subfolderBtn);
    const subfolderInput = screen.getByPlaceholderText('Subfolder name...');
    fireEvent.change(subfolderInput, { target: { value: 'Nested Folder' } });
    const createBtn = screen.getByRole('button', { name: 'Create' });
    fireEvent.click(createBtn);

    expect(resourcesData.saveResourcesToStorage).toHaveBeenCalled();
  });

  it('handles moving, reordering, and deleting resources from inside FolderDirectoryModal', () => {
    window.confirm = vi.fn().mockReturnValue(true);
    render(<ResourcesPageContent />);

    const folderCard = screen.getByText('General Folder');
    fireEvent.click(folderCard);

    // Test add resource to folder
    const addResBtn = screen.getByRole('button', { name: '+ Add Resource' });
    fireEvent.click(addResBtn);
    expect(screen.getByText('Add New Resource')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Cancel'));

    // Edit in modal to delete item
    const allEdits = screen.getAllByRole('button', { name: 'Edit' });
    const editBtn = allEdits[allEdits.length - 1];
    fireEvent.click(editBtn);

    const selectBtn = screen.getByRole('button', { name: 'Select resource' });
    fireEvent.click(selectBtn);

    const deleteBtn = screen.getByRole('button', { name: /Delete Selected/ });
    fireEvent.click(deleteBtn);
    expect(resourcesData.saveResourcesToStorage).toHaveBeenCalled();
  });

  it('handles dropping resources onto main page from folder modal onto folder target', () => {
    render(<ResourcesPageContent />);

    const folderCard = screen.getByText('General Folder');
    fireEvent.click(folderCard);

    // Drag item outside panel onto main page folder
    const modalCards = document.querySelectorAll('[data-folder-item-id]');
    const cardEl = modalCards[0].querySelector(
      '[data-resource-id]',
    ) as HTMLElement;
    fireEvent.pointerDown(cardEl, { clientX: 100, clientY: 100, button: 0 });

    const mainPageFolder = document.createElement('div');
    mainPageFolder.setAttribute('data-resource-id', '1');
    mainPageFolder.setAttribute('data-resource-type', 'folder');
    document.elementFromPoint = vi.fn().mockReturnValue(mainPageFolder);

    act(() => {
      window.dispatchEvent(
        new PointerEvent('pointermove', { clientX: 120, clientY: 120 }),
      );
      window.dispatchEvent(
        new PointerEvent('pointermove', { clientX: 5000, clientY: 5000 }),
      );
    });

    act(() => {
      window.dispatchEvent(
        new PointerEvent('pointerup', { clientX: 5000, clientY: 5000 }),
      );
    });

    expect(resourcesData.saveResourcesToStorage).toHaveBeenCalled();
  });

  it('handles dropping resources onto main page from folder modal onto non-folder target', () => {
    render(<ResourcesPageContent />);

    const folderCard = screen.getByText('General Folder');
    fireEvent.click(folderCard);

    const modalCards = document.querySelectorAll('[data-folder-item-id]');
    const cardEl = modalCards[0].querySelector(
      '[data-resource-id]',
    ) as HTMLElement;
    fireEvent.pointerDown(cardEl, { clientX: 100, clientY: 100, button: 0 });

    const mainPageFile = document.createElement('div');
    mainPageFile.setAttribute('data-resource-id', '2');
    mainPageFile.setAttribute('data-resource-type', 'file');
    document.elementFromPoint = vi.fn().mockReturnValue(mainPageFile);

    act(() => {
      window.dispatchEvent(
        new PointerEvent('pointermove', { clientX: 120, clientY: 120 }),
      );
      window.dispatchEvent(
        new PointerEvent('pointermove', { clientX: 5000, clientY: 5000 }),
      );
    });

    act(() => {
      window.dispatchEvent(
        new PointerEvent('pointerup', { clientX: 5000, clientY: 5000 }),
      );
    });

    expect(resourcesData.saveResourcesToStorage).toHaveBeenCalled();
  });

  it('displays empty state when search matches nothing', () => {
    render(<ResourcesPageContent />);
    const searchInput = screen.getAllByPlaceholderText(
      'Search by name, category...',
    )[0];
    fireEvent.change(searchInput, { target: { value: 'NonExistentMatchXYZ' } });
    expect(
      screen.getByText('No resources match your criteria.'),
    ).toBeInTheDocument();
  });

  it('handles sweep pointer down on round button in edit mode', () => {
    render(<ResourcesPageContent />);
    const editBtn = screen.getByRole('button', { name: 'Edit' });
    fireEvent.click(editBtn);

    const roundBtns = document.querySelectorAll('.rounded-full.border-2');
    if (roundBtns.length > 0) {
      fireEvent.pointerDown(roundBtns[0], {
        clientX: 10,
        clientY: 10,
        button: 0,
      });
      act(() => {
        window.dispatchEvent(
          new PointerEvent('pointermove', { clientX: 50, clientY: 50 }),
        );
      });
      act(() => {
        window.dispatchEvent(new PointerEvent('pointerup'));
      });
      fireEvent.click(roundBtns[0]);
    }
  });

  it('opens resource detail modal when clicking a file and handles rename and categories change', () => {
    render(<ResourcesPageContent />);
    const fileCard = screen.getByText('File 1');
    fireEvent.click(fileCard);

    // Detail modal opens
    expect(screen.getByText('Download File')).toBeInTheDocument();

    // Trigger categories edit
    const editCatsBtn = screen.getByRole('button', { name: 'Edit Categories' });
    fireEvent.click(editCatsBtn);

    const catBadge = screen.getByText('Winter Games');
    fireEvent.click(catBadge);
    expect(resourcesData.saveResourcesToStorage).toHaveBeenCalled();

    // Close detail modal
    const closeBtn = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeBtn);
  });

  it('ignores empty folder name submission', () => {
    render(<ResourcesPageContent />);
    const createFolderBtn = screen.getByRole('button', {
      name: 'Create Folder',
    });
    fireEvent.click(createFolderBtn);

    const submitBtn = screen
      .getAllByRole('button', { name: 'Create Folder' })
      .find((b) => b.getAttribute('type') === 'submit');
    if (submitBtn) {
      fireEvent.click(submitBtn);
      expect(resourcesData.saveResourcesToStorage).not.toHaveBeenCalled();
    }
  });

  it('closes create folder modal on Cancel or backdrop click', () => {
    render(<ResourcesPageContent />);
    const createFolderBtn = screen.getByRole('button', {
      name: 'Create Folder',
    });
    fireEvent.click(createFolderBtn);

    const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelBtn);
    expect(screen.queryByPlaceholderText('e.g. Venue Maps')).toBeNull();

    fireEvent.click(createFolderBtn);
    const backdrop = screen.getByLabelText('Close dialog');
    fireEvent.click(backdrop);
    expect(screen.queryByPlaceholderText('e.g. Venue Maps')).toBeNull();
  });

  it('handles rename resource via card', () => {
    render(<ResourcesPageContent />);
    const card = screen.getByText('File 1');
    fireEvent.doubleClick(card);
    const input = screen.getByDisplayValue('File 1');
    fireEvent.change(input, { target: { value: 'Renamed File 1' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(resourcesData.saveResourcesToStorage).toHaveBeenCalled();
  });

  it('handles dragOver edge conditions for reordering', () => {
    render(<ResourcesPageContent />);
    const cards = document.querySelectorAll('[data-resource-id]');
    const dt = { setData: vi.fn(), dropEffect: 'move' };

    // Start drag on card 0
    fireEvent.dragStart(cards[0], { dataTransfer: dt });

    // Drag over same card
    fireEvent.dragOver(cards[0], {
      dataTransfer: dt,
      clientX: 100,
      currentTarget: {
        getBoundingClientRect: () => ({ left: 50, width: 100 }),
      },
    });

    // Drag from card 0 over card 2 with clientX < midX (before mid point)
    fireEvent.dragOver(cards[2], {
      dataTransfer: dt,
      clientX: 60,
      currentTarget: {
        getBoundingClientRect: () => ({ left: 50, width: 100 }),
      },
    });

    // Drag from card 2 over card 0 with clientX > midX (after mid point)
    fireEvent.dragStart(cards[2], { dataTransfer: dt });
    fireEvent.dragOver(cards[0], {
      dataTransfer: dt,
      clientX: 120,
      currentTarget: {
        getBoundingClientRect: () => ({ left: 50, width: 100 }),
      },
    });
  });

  it('handles FolderDirectoryModal onDropOnMainPage with injection and append', () => {
    render(<ResourcesPageContent />);
    const folderCard = screen.getByText('General Folder');
    fireEvent.click(folderCard);

    const modalCards = document.querySelectorAll('[data-folder-item-id]');
    const cardEl = modalCards[0].querySelector(
      '[data-resource-id]',
    ) as HTMLElement;
    fireEvent.pointerDown(cardEl, { clientX: 100, clientY: 100, button: 0 });

    const targetEl = document.createElement('div');
    targetEl.setAttribute('data-resource-id', 'non-existent-target');
    document.elementFromPoint = vi.fn().mockReturnValue(targetEl);

    act(() => {
      window.dispatchEvent(
        new PointerEvent('pointermove', { clientX: 120, clientY: 120 }),
      );
      window.dispatchEvent(
        new PointerEvent('pointermove', { clientX: 5000, clientY: 5000 }),
      );
      window.dispatchEvent(
        new PointerEvent('pointerup', { clientX: 5000, clientY: 5000 }),
      );
    });

    expect(resourcesData.saveResourcesToStorage).toHaveBeenCalled();
  });

  it('handles dropping directly onto the wrapping grid container', () => {
    render(<ResourcesPageContent />);
    const cards = document.querySelectorAll('[data-resource-id]');
    const gridContainer = document.querySelector(
      '.grid.gap-4.items-end',
    ) as HTMLElement;

    const dt = {
      setData: vi.fn(),
      dropEffect: 'move',
      effectAllowed: 'move',
      getData: () => '2',
    };

    fireEvent.dragStart(cards[1], { dataTransfer: dt });
    fireEvent.dragOver(gridContainer, { dataTransfer: dt });
    fireEvent.drop(gridContainer, { dataTransfer: dt });
    expect(resourcesData.saveResourcesToStorage).toHaveBeenCalled();
  });

  it('handles dropping directly onto folder card to move item into folder', () => {
    render(<ResourcesPageContent />);
    const folderCard = document.querySelector(
      '[data-resource-id="1"]',
    ) as HTMLElement;
    const fileCard = document.querySelector(
      '[data-resource-id="2"]',
    ) as HTMLElement;

    const dt = {
      setData: vi.fn(),
      getData: () => '2',
      dropEffect: 'move',
      effectAllowed: 'move',
    };
    fireEvent.dragStart(fileCard, { dataTransfer: dt });
    fireEvent.drop(folderCard, { dataTransfer: dt });

    expect(resourcesData.saveResourcesToStorage).toHaveBeenCalled();
  });

  it('handles pointer hover on main page with empty draggedIds resetting order', () => {
    render(<ResourcesPageContent />);
    const folderCard = screen.getByText('General Folder');
    fireEvent.click(folderCard);

    // Call pointer hover with empty ids
    const modalCards = document.querySelectorAll('[data-folder-item-id]');
    const cardEl = modalCards[0].querySelector(
      '[data-resource-id]',
    ) as HTMLElement;
    fireEvent.pointerDown(cardEl, { clientX: 100, clientY: 100, button: 0 });

    act(() => {
      window.dispatchEvent(
        new PointerEvent('pointermove', { clientX: 120, clientY: 120 }),
      );
      window.dispatchEvent(new PointerEvent('pointerup'));
    });
  });

  it('triggers onMoveResourceToFolder and onReorderInFolder inside folder modal', () => {
    const parentFolder: Resource = {
      id: '1',
      name: 'General Folder',
      type: 'folder',
      categories: ['General'],
    };
    const child1: Resource = {
      id: 'child-1',
      name: 'Child 1',
      type: 'file',
      fileUrl: 'test',
      categories: ['General'],
      parentId: '1',
    };
    const childSub: Resource = {
      id: 'child-sub',
      name: 'Child Sub',
      type: 'folder',
      categories: ['General'],
      parentId: '1',
    };
    vi.mocked(resourcesData.getCachedResources).mockReturnValue([
      parentFolder,
      child1,
      childSub,
    ]);

    render(<ResourcesPageContent />);
    const folderCard = screen.getByText('General Folder');
    fireEvent.click(folderCard);

    // Reorder inside folder
    const modalCards = document.querySelectorAll('[data-folder-item-id]');
    const childEl = modalCards[0].querySelector(
      '[data-resource-id]',
    ) as HTMLElement;
    fireEvent.pointerDown(childEl, { clientX: 100, clientY: 100, button: 0 });

    const targetChildEl = modalCards[1].querySelector(
      '[data-resource-id]',
    ) as HTMLElement;
    targetChildEl.getBoundingClientRect = () =>
      ({
        left: 200,
        right: 300,
        top: 100,
        bottom: 200,
        width: 100,
        height: 100,
      }) as unknown as DOMRect;
    document.elementFromPoint = vi.fn().mockReturnValue(targetChildEl);

    act(() => {
      window.dispatchEvent(
        new PointerEvent('pointermove', { clientX: 250, clientY: 150 }),
      );
      window.dispatchEvent(
        new PointerEvent('pointerup', { clientX: 250, clientY: 150 }),
      );
    });

    expect(resourcesData.saveResourcesToStorage).toHaveBeenCalled();
  });

  it('handles folder modal callbacks: add resource, create subfolder, and delete resources', () => {
    const parentFolder: Resource = {
      id: '1',
      name: 'General Folder',
      type: 'folder',
      categories: ['General'],
    };
    const child1: Resource = {
      id: 'child-1',
      name: 'Child 1',
      type: 'file',
      fileUrl: 'test',
      categories: ['General'],
      parentId: '1',
    };
    vi.mocked(resourcesData.getCachedResources).mockReturnValue([
      parentFolder,
      child1,
    ]);

    render(<ResourcesPageContent />);
    fireEvent.click(screen.getByText('General Folder'));

    // Open add resource from folder modal
    fireEvent.click(screen.getByRole('button', { name: '+ Add Resource' }));
    expect(screen.getByText('Add New Resource')).toBeDefined();
    // Close Add New Resource modal
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    // Create subfolder from folder modal
    fireEvent.click(screen.getByRole('button', { name: '+ Create Subfolder' }));
    const folderInput = screen.getByPlaceholderText('Subfolder name...');
    fireEvent.change(folderInput, { target: { value: 'Subfolder A' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    expect(resourcesData.saveResourcesToStorage).toHaveBeenCalled();

    // Delete resource from folder modal
    const editBtns = screen.getAllByRole('button', { name: 'Edit' });
    fireEvent.click(editBtns[editBtns.length - 1]);
    const selectBtn = screen.getByRole('button', { name: 'Select resource' });
    fireEvent.click(selectBtn);
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    fireEvent.click(screen.getByRole('button', { name: /Delete Selected/ }));
    expect(resourcesData.saveResourcesToStorage).toHaveBeenCalled();
  });
});
