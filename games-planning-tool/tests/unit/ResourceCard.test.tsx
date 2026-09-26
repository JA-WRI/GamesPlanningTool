import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ResourceCard } from '@/components/resources/ResourceCard';
import { Resource } from '@/types/resource';

describe('ResourceCard', () => {
  const dummyResource: Resource = {
    id: 'res-1',
    name: 'Sample Guide',
    type: 'link',
    URL: 'https://example.com',
    categories: ['Winter Games'],
  };

  const defaultProps = {
    resource: dummyResource,
    isEditing: false,
    isSelected: false,
    canReorder: false,
    isDraggingThisCard: false,
    onToggleSelect: vi.fn(),
    onRoundButtonPointerDown: vi.fn(),
    onRoundButtonClick: vi.fn(),
    onCardPointerDown: vi.fn(),
    onClick: vi.fn(),
  };

  it('renders resource name and calls onClick when not in edit mode', () => {
    const handleClick = vi.fn();
    render(<ResourceCard {...defaultProps} onClick={handleClick} />);

    expect(screen.getByText('Sample Guide')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Sample Guide'));
    expect(handleClick).toHaveBeenCalledWith(dummyResource);
  });

  it('toggles selection on card click when in edit mode', () => {
    const handleToggle = vi.fn();
    render(
      <ResourceCard
        {...defaultProps}
        isEditing={true}
        onToggleSelect={handleToggle}
      />,
    );

    fireEvent.click(screen.getByText('Sample Guide'));
    expect(handleToggle).toHaveBeenCalledWith('res-1');
  });

  it('handles round selection button click and pointerdown in edit mode', () => {
    const handleRoundClick = vi.fn();
    const handleRoundPointer = vi.fn();

    render(
      <ResourceCard
        {...defaultProps}
        isEditing={true}
        isSelected={false}
        onRoundButtonClick={handleRoundClick}
        onRoundButtonPointerDown={handleRoundPointer}
      />,
    );

    const selectBtn = screen.getByRole('button', { name: 'Select resource' });
    fireEvent.pointerDown(selectBtn);
    expect(handleRoundPointer).toHaveBeenCalledWith(expect.anything(), 'res-1');

    fireEvent.click(selectBtn);
    expect(handleRoundClick).toHaveBeenCalledWith('res-1');
  });

  it('renders checkmark when card is selected', () => {
    render(
      <ResourceCard {...defaultProps} isEditing={true} isSelected={true} />,
    );

    expect(
      screen.getByRole('button', { name: 'Deselect resource' }),
    ).toBeInTheDocument();
  });

  it('renders removal symbol when dragged over removal area', () => {
    render(
      <ResourceCard
        {...defaultProps}
        isEditing={true}
        isDraggingThisCard={true}
        showRemovalSymbol={true}
      />,
    );

    expect(screen.getByTestId('drag-removal-symbol')).toBeInTheDocument();
    expect(screen.getByText('Remove from Category')).toBeInTheDocument();
  });

  it('dispatches drag and pointer events when draggable', () => {
    const handleDragStart = vi.fn();
    const handleDragEnd = vi.fn();
    const handleDragOver = vi.fn();
    const handleDrop = vi.fn();
    const handleCardPointerDown = vi.fn();

    render(
      <ResourceCard
        {...defaultProps}
        isEditing={true}
        canReorder={true}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onCardPointerDown={handleCardPointerDown}
      />,
    );

    const card = screen
      .getByText('Sample Guide')
      .closest('[data-resource-id]')!;
    fireEvent.pointerDown(card);
    expect(handleCardPointerDown).toHaveBeenCalledWith(
      expect.anything(),
      'res-1',
    );

    fireEvent.dragStart(card);
    expect(handleDragStart).toHaveBeenCalledWith(expect.anything(), 'res-1');

    fireEvent.dragOver(card);
    expect(handleDragOver).toHaveBeenCalledWith(expect.anything(), 'res-1');

    fireEvent.drop(card);
    expect(handleDrop).toHaveBeenCalledWith(expect.anything(), 'res-1');

    fireEvent.dragEnd(card);
    expect(handleDragEnd).toHaveBeenCalled();
  });
});
