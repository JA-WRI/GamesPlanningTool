// Made with AI agents (Antigravity)
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ResourceCard } from '@/components/resources/ResourceCard';
import { Resource } from '@/types/resource';

describe('ResourceCard', () => {
  const mockFile: Resource = {
    id: 'file-1',
    name: 'My File',
    type: 'file',
    fileUrl: 'test',
    categories: ['General'],
  };

  const folderResource: Resource = {
    id: 'folder-1',
    name: 'My Folder',
    type: 'folder',
    categories: [],
  };

  const defaultProps = {
    resource: mockFile,
    isEditing: false,
    isSelected: false,
    canReorder: false,
    isDraggingThisCard: false,
    onClick: vi.fn(),
    onToggleSelect: vi.fn(),
    onRoundButtonClick: vi.fn(),
    onRoundButtonPointerDown: vi.fn(),
    onCardPointerDown: vi.fn(),
    onRename: vi.fn(),
    onDragStart: vi.fn(),
    onDragOver: vi.fn(),
    onDragEnd: vi.fn(),
    onDrop: vi.fn(),
  };

  it('renders a file resource correctly', () => {
    render(<ResourceCard {...defaultProps} />);
    expect(screen.getByText('My File')).toBeInTheDocument();
  });

  it('renders a folder resource', () => {
    render(
      <ResourceCard
        {...defaultProps}
        resource={folderResource}
        itemCount={5}
      />,
    );
    expect(screen.getByText('My Folder')).toBeInTheDocument();
  });

  it('handles click events and double click to rename', () => {
    render(<ResourceCard {...defaultProps} />);

    // Normal click
    fireEvent.click(screen.getByText('My File'));
    expect(defaultProps.onClick).toHaveBeenCalledWith(mockFile);

    // Double click to rename
    fireEvent.doubleClick(screen.getByText('My File'));
    const input = screen.getByDisplayValue('My File');
    expect(input).toBeInTheDocument();

    // Change and save
    fireEvent.change(input, { target: { value: 'New File Name' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(defaultProps.onRename).toHaveBeenCalledWith(
      mockFile.id,
      'New File Name',
    );
  });

  it('handles rename cancellation', () => {
    render(<ResourceCard {...defaultProps} />);
    fireEvent.doubleClick(screen.getByText('My File'));
    const input = screen.getByDisplayValue('My File');
    fireEvent.change(input, { target: { value: 'New File Name' } });
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByDisplayValue('New File Name')).not.toBeInTheDocument();
  });

  it('shows selection indicator when isEditing is true', () => {
    render(<ResourceCard {...defaultProps} isEditing={true} />);
    const indicator = screen.getByRole('button', { name: 'Select resource' });
    fireEvent.click(indicator);
    expect(defaultProps.onRoundButtonClick).toHaveBeenCalledWith(mockFile.id);
  });

  it('shows removal symbol when showRemovalSymbol is true', () => {
    render(
      <ResourceCard
        {...defaultProps}
        showRemovalSymbol={true}
        isDraggingThisCard={true}
      />,
    );
    expect(screen.getByTestId('drag-removal-symbol')).toBeInTheDocument();
  });

  it('handles drag events', () => {
    render(<ResourceCard {...defaultProps} canDrag={true} />);
    const card = screen.getByRole('button', { name: 'My File' });

    fireEvent.dragStart(card);
    expect(defaultProps.onDragStart).toHaveBeenCalled();

    fireEvent.dragOver(card);
    expect(defaultProps.onDragOver).toHaveBeenCalled();

    fireEvent.drop(card);
    expect(defaultProps.onDrop).toHaveBeenCalled();

    fireEvent.dragEnd(card);
    expect(defaultProps.onDragEnd).toHaveBeenCalled();
  });

  it('does not allow drag when isCardDraggable is false', () => {
    render(
      <ResourceCard {...defaultProps} canDrag={false} canReorder={false} />,
    );
    const card = screen.getByRole('button', { name: 'My File' });
    fireEvent.dragStart(card);
    // onDragStart shouldn't be called because isCardDraggable is false
    expect(defaultProps.onDragStart).not.toHaveBeenCalled();
  });

  it('renders link resource preview logic', () => {
    const linkResource: Resource = {
      id: 'link-1',
      name: 'My Link',
      type: 'link',
      URL: 'example.com',
      categories: [],
    };
    render(<ResourceCard {...defaultProps} resource={linkResource} />);
    expect(screen.getByText('My Link')).toBeInTheDocument();
  });

  it('handles double click to rename a folder resource', () => {
    render(<ResourceCard {...defaultProps} resource={folderResource} />);
    fireEvent.doubleClick(screen.getByText('My Folder'));
    const input = screen.getByDisplayValue('My Folder');
    fireEvent.change(input, { target: { value: 'Renamed Folder' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(defaultProps.onRename).toHaveBeenCalledWith(
      'folder-1',
      'Renamed Folder',
    );
  });

  it('handles selection indicator and round button pointer events in folder mode', () => {
    render(
      <ResourceCard
        {...defaultProps}
        resource={folderResource}
        isEditing={true}
        isSelected={true}
        canReorder={true}
      />,
    );
    const deselectBtn = screen.getByRole('button', {
      name: 'Deselect resource',
    });
    fireEvent.pointerDown(deselectBtn, { clientX: 10, clientY: 10 });
    window.dispatchEvent(new PointerEvent('pointerup'));
    fireEvent.click(deselectBtn);
    expect(defaultProps.onRoundButtonClick).toHaveBeenCalledWith('folder-1');
  });

  it('handles image error fallback', () => {
    render(<ResourceCard {...defaultProps} />);
    const img = document.querySelector('img')!;
    fireEvent.error(img);
    expect(img.style.display).toBe('none');
  });

  it('triggers click on Enter key press', () => {
    render(<ResourceCard {...defaultProps} />);
    const card = screen.getByRole('button', { name: 'My File' });
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(defaultProps.onClick).toHaveBeenCalled();
  });
});
