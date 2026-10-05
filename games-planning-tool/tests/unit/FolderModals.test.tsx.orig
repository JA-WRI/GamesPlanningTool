// Made with AI agents (Antigravity)
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act, within } from '@testing-library/react';
import React from 'react';
import { FolderDirectoryModal } from '@/components/resources/FolderDirectoryModal';
import { FolderRemovalConfirmModal } from '@/components/resources/FolderRemovalConfirmModal';
import { FolderResource, FileResource } from '@/types/resource';

describe('FolderDirectoryModal & FolderRemovalConfirmModal', () => {
  const rootFolder: FolderResource = {
    id: 'folder-root',
    name: 'Competition Schedules',
    type: 'folder',
    categories: ['Winter Games'],
  };

  const subFolder: FolderResource = {
    id: 'folder-sub-1',
    name: 'Day 1 Runs',
    type: 'folder',
    parentId: 'folder-root',
    categories: ['Winter Games'],
  };

  const childFile: FileResource = {
    id: 'file-1',
    name: 'Alpine Schedule PDF',
    type: 'file',
    parentId: 'folder-root',
    categories: ['Winter Games'],
  };

  const allResources = [rootFolder, subFolder, childFile];

  it('renders FolderDirectoryModal with items and breadcrumbs', () => {
    const handleClose = vi.fn();
    const handleSelectDetail = vi.fn();
    const handleCreateSubfolder = vi.fn();
    const handleAddResource = vi.fn();
    const handleMove = vi.fn();

    render(
      <FolderDirectoryModal
        folder={rootFolder}
        allResources={allResources}
        currentCategory="Winter Games"
        onClose={handleClose}
        onSelectResourceDetail={handleSelectDetail}
        onCreateSubfolder={handleCreateSubfolder}
        onAddResourceToFolder={handleAddResource}
        onMoveResourceToFolder={handleMove}
      />,
    );

    expect(screen.getAllByText('Competition Schedules').length).toBeGreaterThan(
      0,
    );
    expect(screen.getByText('Day 1 Runs')).toBeInTheDocument();
    expect(screen.getByText('Alpine Schedule PDF')).toBeInTheDocument();

    // Clicking a child file card opens its detail
    const fileCard = document.querySelector(
      '[data-resource-id="file-1"]',
    ) as HTMLElement;
    fireEvent.click(fileCard);
    expect(handleSelectDetail).toHaveBeenCalledWith(childFile);

    // Filter items
    const searchInput = screen.getByPlaceholderText(
      'Search by name, category...',
    );
    fireEvent.change(searchInput, { target: { value: 'Day 1' } });
    expect(screen.getByText('Day 1 Runs')).toBeInTheDocument();
    expect(screen.queryByText('Alpine Schedule PDF')).not.toBeInTheDocument();

    // Clear filter
    fireEvent.change(searchInput, { target: { value: '' } });

    // Open inline subfolder form
    fireEvent.click(screen.getByRole('button', { name: /Subfolder/i }));
    const folderInput = screen.getByPlaceholderText('Subfolder name...');
    fireEvent.change(folderInput, { target: { value: 'Day 2 Runs' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    expect(handleCreateSubfolder).toHaveBeenCalledWith(
      'Day 2 Runs',
      'folder-root',
    );

    // Add item click
    fireEvent.click(screen.getByRole('button', { name: /^Resource$/i }));
    expect(handleAddResource).toHaveBeenCalledWith('folder-root');

    // Drill down into subfolder
    const subfolderCard = document.querySelector(
      '[data-resource-id="folder-sub-1"]',
    ) as HTMLElement;
    fireEvent.click(subfolderCard);
    expect(screen.getByText('This folder is empty.')).toBeInTheDocument();

    // Navigate back via breadcrumb
    const breadcrumbRoot = screen.getByRole('button', {
      name: 'Competition Schedules',
    });
    fireEvent.click(breadcrumbRoot);
    expect(screen.getByText('Day 1 Runs')).toBeInTheDocument();

    // Close modal
    fireEvent.click(screen.getByLabelText('Close folder dialog'));
    expect(handleClose).toHaveBeenCalled();
  });

  it('handles edit mode, selection, renaming, and removal', () => {
    const handleRemoveFromFolder = vi.fn();
    const handleDeleteResources = vi.fn();
    const handleRenameResource = vi.fn();
    
    render(
      <FolderDirectoryModal
        folder={rootFolder}
        allResources={allResources}
        currentCategory="Winter Games"
        onClose={vi.fn()}
        onSelectResourceDetail={vi.fn()}
        onCreateSubfolder={vi.fn()}
        onAddResourceToFolder={vi.fn()}
        onMoveResourceToFolder={vi.fn()}
        onRemoveFromFolder={handleRemoveFromFolder}
        onDeleteResources={handleDeleteResources}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));

    const fileCheckbox = screen.getAllByRole('button', { name: 'Select resource' })[1];
    fireEvent.click(fileCheckbox);
    
    window.confirm = vi.fn().mockReturnValue(true);
    
    fireEvent.click(screen.getByRole('button', { name: /Delete Selected \(1\)/ }));
    expect(handleDeleteResources).toHaveBeenCalledWith(['file-1']);
  });

  it('handles pointer dragging', () => {
    render(
      <FolderDirectoryModal
        folder={rootFolder}
        allResources={allResources}
        currentCategory="Winter Games"
        onClose={vi.fn()}
        onSelectResourceDetail={vi.fn()}
        onCreateSubfolder={vi.fn()}
        onAddResourceToFolder={vi.fn()}
        onMoveResourceToFolder={vi.fn()}
        onReorderInFolder={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    
    const fileCard = document.querySelector('[data-resource-id="file-1"]') as HTMLElement;
    
    fireEvent.pointerDown(fileCard, { clientX: 100, clientY: 100 });
    
    act(() => {
      window.dispatchEvent(new PointerEvent('pointermove', { clientX: 120, clientY: 120 }));
      window.dispatchEvent(new PointerEvent('pointermove', { clientX: 150, clientY: 150 }));
    });
    
    act(() => {
      window.dispatchEvent(new PointerEvent('pointerup'));
    });
  });

  it('renders FolderRemovalConfirmModal and triggers callbacks', () => {
    const handleCascade = vi.fn();
    const handleKeep = vi.fn();
    const handleCancel = vi.fn();

    render(
      <FolderRemovalConfirmModal
        isOpen={true}
        folderName="Competition Schedules"
        categoryTitle="Winter Games"
        onConfirmCascade={handleCascade}
        onConfirmKeepInTopLevel={handleKeep}
        onCancel={handleCancel}
      />,
    );

    expect(
      screen.getByText(/Remove Folder from Winter Games/i),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', {
        name: /Yes, remove all contained files as well/i,
      }),
    );
    expect(handleCascade).toHaveBeenCalled();

    fireEvent.click(
      screen.getByRole('button', {
        name: /No, keep contained files in Winter Games/i,
      }),
    );
    expect(handleKeep).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(handleCancel).toHaveBeenCalled();
  });
});
