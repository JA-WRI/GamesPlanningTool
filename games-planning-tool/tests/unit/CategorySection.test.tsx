import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { CategorySection } from '@/components/resources/CategorySection';
import { Resource } from '@/types/resource';

describe('CategorySection', () => {
  const dummyResources: Resource[] = [
    {
      id: 'res-w-1',
      name: 'Curling Manual',
      type: 'link',
      URL: 'https://example.com/curling',
      categories: ['Winter Games'],
    },
    {
      id: 'res-w-2',
      name: 'Skating Guide',
      type: 'link',
      URL: 'https://example.com/skating',
      categories: ['Winter Games'],
    },
  ];

  const defaultProps = {
    categoryTitle: 'Winter Games',
    resources: dummyResources,
    isEditing: false,
    selectedIds: new Set<string>(),
    onToggleEdit: vi.fn(),
    onOpenAddModal: vi.fn(),
    onToggleSelect: vi.fn(),
    onSelectMultiple: vi.fn(),
    onDeleteSelected: vi.fn(),
    onSelectResourceDetail: vi.fn(),
    onReorderResources: vi.fn(),
  };

  it('renders section title, cards, and handles add button click', () => {
    const handleOpenAdd = vi.fn();
    render(
      <CategorySection {...defaultProps} onOpenAddModal={handleOpenAdd} />,
    );

    expect(screen.getByText('Winter Games')).toBeInTheDocument();
    expect(screen.getByText('Curling Manual')).toBeInTheDocument();
    expect(screen.getByText('Skating Guide')).toBeInTheDocument();

    const addBtn = screen.getByRole('button', { name: 'Add' });
    fireEvent.click(addBtn);
    expect(handleOpenAdd).toHaveBeenCalledWith('Winter Games');
  });

  it('filters resources by search query', () => {
    render(<CategorySection {...defaultProps} />);
    const searchInput = screen.getByPlaceholderText(
      'Search by name, category...',
    );

    fireEvent.change(searchInput, { target: { value: 'Curling' } });
    expect(screen.getByText('Curling Manual')).toBeInTheDocument();
    expect(screen.queryByText('Skating Guide')).not.toBeInTheDocument();
  });

  it('shows empty search state when no items match filter', () => {
    render(<CategorySection {...defaultProps} />);
    const searchInput = screen.getByPlaceholderText(
      'Search by name, category...',
    );
    fireEvent.change(searchInput, { target: { value: 'Nonexistent' } });
    expect(
      screen.getByText('No resources match your search.'),
    ).toBeInTheDocument();
  });

  it('shows empty category state when resources list is empty', () => {
    render(<CategorySection {...defaultProps} resources={[]} />);
    expect(screen.getByText('No resources available.')).toBeInTheDocument();
  });

  it('shows action buttons and delete counter in edit mode when cards are selected', () => {
    const handleDelete = vi.fn();
    const handleToggleEdit = vi.fn();

    render(
      <CategorySection
        {...defaultProps}
        isEditing={true}
        selectedIds={new Set(['res-w-1'])}
        onDeleteSelected={handleDelete}
        onToggleEdit={handleToggleEdit}
      />,
    );

    const deleteBtn = screen.getByRole('button', { name: /Delete \(1\)/ });
    expect(deleteBtn).toBeInTheDocument();
    fireEvent.click(deleteBtn);
    expect(handleDelete).toHaveBeenCalledTimes(1);

    const doneBtn = screen.getByRole('button', { name: 'Done' });
    fireEvent.click(doneBtn);
    expect(handleToggleEdit).toHaveBeenCalledTimes(1);
  });

  it('handles drag over section and drop on category', () => {
    const handleDrop = vi.fn();
    const handleDragOver = vi.fn();

    render(
      <CategorySection
        {...defaultProps}
        isEditing={true}
        onDropOnCategory={handleDrop}
        onDragOverSection={handleDragOver}
      />,
    );

    const section = screen.getByText('Winter Games').closest('section')!;

    fireEvent.dragOver(section, {
      dataTransfer: {
        getData: (type: string) =>
          type === 'application/json'
            ? JSON.stringify({
                resourceId: 'res-summer-1',
                sourceCategory: 'Summer Games',
              })
            : '',
      },
    });
    expect(handleDragOver).toHaveBeenCalled();

    fireEvent.drop(section, {
      dataTransfer: {
        getData: (type: string) =>
          type === 'application/json'
            ? JSON.stringify({
                resourceId: 'res-summer-1',
                sourceCategory: 'Summer Games',
              })
            : '',
      },
    });
    expect(handleDrop).toHaveBeenCalledWith('res-summer-1', 'Winter Games');
  });

  it('renders multi-drag hover cue when dragging items over category', () => {
    render(
      <CategorySection
        {...defaultProps}
        isEditing={true}
        activeMultiDragResourceIds={['res-1', 'res-2']}
        activeMultiDragHoveredCategory="Winter Games"
        activeMultiDragCount={2}
      />,
    );

    expect(
      screen.getByText('+ Add 2 resources to Winter Games'),
    ).toBeInTheDocument();
  });

  it('initiates card drag and reordering in edit mode', () => {
    const handleStartDrag = vi.fn();
    const handleEndDrag = vi.fn();

    render(
      <CategorySection
        {...defaultProps}
        isEditing={true}
        onStartDragCard={handleStartDrag}
        onEndDragCard={handleEndDrag}
      />,
    );

    const firstCard = document.querySelector('[data-resource-id="res-w-1"]')!;
    const secondCard = document.querySelector('[data-resource-id="res-w-2"]')!;

    const dt = {
      effectAllowed: '',
      setData: vi.fn(),
      dropEffect: '',
    };

    fireEvent.dragStart(firstCard, { dataTransfer: dt });
    expect(handleStartDrag).toHaveBeenCalledWith('res-w-1', 'Winter Games');

    fireEvent.dragOver(secondCard, {
      clientX: 200,
      dataTransfer: dt,
    });

    fireEvent.dragEnd(firstCard);
    expect(handleEndDrag).toHaveBeenCalled();
  });

  it('triggers vertical multi-drag gesture when moving pointer vertically on selected card', () => {
    const handleStartMultiDrag = vi.fn();
    const handleMoveMultiDrag = vi.fn();
    const handleEndMultiDrag = vi.fn();

    render(
      <CategorySection
        {...defaultProps}
        isEditing={true}
        selectedIds={new Set(['res-w-1'])}
        onStartMultiDrag={handleStartMultiDrag}
        onMoveMultiDrag={handleMoveMultiDrag}
        onEndMultiDrag={handleEndMultiDrag}
      />,
    );

    const firstCard = document.querySelector('[data-resource-id="res-w-1"]')!;
    fireEvent.pointerDown(firstCard, { clientX: 100, clientY: 100 });

    window.dispatchEvent(
      new PointerEvent('pointermove', { clientX: 100, clientY: 120 }),
    );
    expect(handleStartMultiDrag).toHaveBeenCalledWith(
      ['res-w-1'],
      'Winter Games',
      expect.objectContaining({ x: 100, y: 120 }),
    );

    window.dispatchEvent(
      new PointerEvent('pointermove', { clientX: 100, clientY: 140 }),
    );
    expect(handleMoveMultiDrag).toHaveBeenCalledWith({ x: 100, y: 140 });

    window.dispatchEvent(new PointerEvent('pointerup'));
    expect(handleEndMultiDrag).toHaveBeenCalled();
  });

  it('triggers sweep selection gesture when moving pointer horizontally from round button', () => {
    const handleUpdateSelected = vi.fn();

    render(
      <CategorySection
        {...defaultProps}
        isEditing={true}
        onUpdateSelectedIds={handleUpdateSelected}
      />,
    );

    const selectBtn = screen.getAllByRole('button', {
      name: 'Select resource',
    })[0];
    fireEvent.pointerDown(selectBtn, { clientX: 100, clientY: 100 });

    window.dispatchEvent(
      new PointerEvent('pointermove', { clientX: 140, clientY: 100 }),
    );
    expect(handleUpdateSelected).toHaveBeenCalled();

    window.dispatchEvent(new PointerEvent('pointerup'));
  });

  it('reorders and drops resource within the same category', () => {
    const handleReorder = vi.fn();

    render(
      <CategorySection
        {...defaultProps}
        isEditing={true}
        onReorderResources={handleReorder}
      />,
    );

    const firstCard = document.querySelector('[data-resource-id="res-w-1"]')!;
    const secondCard = document.querySelector('[data-resource-id="res-w-2"]')!;

    const dt = {
      effectAllowed: '',
      setData: vi.fn(),
      getData: vi.fn(
        () => '{"resourceId":"res-w-1","sourceCategory":"Winter Games"}',
      ),
      dropEffect: '',
    };

    fireEvent.dragStart(firstCard, { dataTransfer: dt });
    fireEvent.dragOver(secondCard, {
      clientX: 200,
      dataTransfer: dt,
    });
    fireEvent.drop(secondCard, { dataTransfer: dt });

    expect(handleReorder).toHaveBeenCalledWith(
      'Winter Games',
      expect.any(Array),
    );
  });
});
