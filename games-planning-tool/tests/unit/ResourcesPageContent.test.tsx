import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within, act } from '@testing-library/react';
import React from 'react';
import { ResourcesPageContent } from '@/components/resources/ResourcesPageContent';

import {
  INITIAL_RESOURCES,
  saveResourcesToStorage,
} from '@/lib/resources-data';

function enterCategoryEdit(title: string) {
  const section = screen.getByText(title).closest('section')!;
  fireEvent.click(within(section).getByRole('button', { name: 'Edit' }));
  return section;
}

function createMockDataTransfer() {
  return {
    effectAllowed: '',
    setData: vi.fn(),
    getData: vi.fn(),
    dropEffect: '',
  };
}

describe('ResourcesPageContent', () => {
  beforeEach(() => {
    saveResourcesToStorage(INITIAL_RESOURCES);
    vi.restoreAllMocks();
  });

  it('renders categories and handles global search', () => {
    render(<ResourcesPageContent />);

    expect(screen.getByText('Winter Games')).toBeInTheDocument();
    expect(screen.getByText('Summer Games')).toBeInTheDocument();

    const searchInput = screen.getAllByPlaceholderText(
      'Search by name, category...',
    )[0];
    fireEvent.change(searchInput, { target: { value: 'Winter' } });
    expect(screen.getByText('Winter Games')).toBeInTheDocument();
  });

  it('toggles global edit mode and updates selection delete count', () => {
    render(<ResourcesPageContent />);

    const globalEditBtn = screen.getAllByRole('button', { name: 'Edit' })[0];
    fireEvent.click(globalEditBtn);

    expect(
      screen.getAllByRole('button', { name: 'Done' })[0],
    ).toBeInTheDocument();

    const firstCard = document.querySelector('[data-resource-id]')!;
    fireEvent.click(firstCard);

    expect(
      screen.getAllByRole('button', { name: /Delete \(1\)/ })[0],
    ).toBeInTheDocument();

    fireEvent.click(firstCard);
    expect(
      screen.queryByRole('button', { name: /Delete \(1\)/ }),
    ).not.toBeInTheDocument();
  });

  it('toggles category-specific edit mode', () => {
    render(<ResourcesPageContent />);

    const winterSection = enterCategoryEdit('Winter Games');

    expect(
      within(winterSection).getByRole('button', { name: 'Done' }),
    ).toBeInTheDocument();

    fireEvent.click(
      within(winterSection).getByRole('button', { name: 'Done' }),
    );
    expect(
      within(winterSection).getByRole('button', { name: 'Edit' }),
    ).toBeInTheDocument();
  });

  it('opens and closes Add Resource modal and adds a new resource', () => {
    render(<ResourcesPageContent />);

    const addButtons = screen.getAllByRole('button', { name: 'Add' });
    fireEvent.click(addButtons[0]);

    expect(screen.getByText('Add New Resource')).toBeInTheDocument();

    fireEvent.change(
      screen.getByPlaceholderText('e.g. LA 2028 Team Roster Guide'),
      { target: { value: 'Brand New Resource' } },
    );
    fireEvent.change(
      screen.getByPlaceholderText('https://olympic.ca/handbook'),
      {
        target: { value: 'https://newresource.ca' },
      },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Add Resource' }));

    expect(screen.getByText('Brand New Resource')).toBeInTheDocument();
  });

  it('opens and closes Resource detail modal on card click', () => {
    render(<ResourcesPageContent />);

    const card = screen.getAllByTitle(/Milano/i)[0];
    fireEvent.click(card);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('deletes selected resources when confirmed in edit mode', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<ResourcesPageContent />);

    const editBtn = screen.getAllByRole('button', { name: 'Edit' })[0];
    fireEvent.click(editBtn);

    const firstCard = document.querySelector('[data-resource-id]')!;
    fireEvent.click(firstCard);

    const deleteBtn = screen.getAllByRole('button', {
      name: /Delete \(1\)/,
    })[0];
    expect(deleteBtn).toBeInTheDocument();
    fireEvent.click(deleteBtn);

    expect(window.confirm).toHaveBeenCalled();
  });

  it('deletes selected resources within a single category', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<ResourcesPageContent />);

    const winterSection = enterCategoryEdit('Winter Games');

    const card = within(winterSection).getByText(/Milano/i);
    fireEvent.click(card);

    const deleteBtn = within(winterSection).getByRole('button', {
      name: /Delete \(1\)/,
    });
    fireEvent.click(deleteBtn);

    expect(window.confirm).toHaveBeenCalled();
  });

  it('handles moving a resource to another category via drop', () => {
    render(<ResourcesPageContent />);

    const winterSection = enterCategoryEdit('Winter Games');

    const card = within(winterSection)
      .getByText(/Milano/i)
      .closest('[data-resource-id]')!;

    const dt = createMockDataTransfer();
    fireEvent.dragStart(card, { dataTransfer: dt });

    const summerSection = screen.getByText('Summer Games').closest('section')!;

    fireEvent.drop(summerSection, { dataTransfer: dt });

    expect(
      within(summerSection).getByText(/Milano Cortina 2026 Manual/i),
    ).toBeInTheDocument();
  });

  it('handles removing resource from category when dropped on outer main area', () => {
    render(<ResourcesPageContent />);

    const updatedWinter = enterCategoryEdit('Winter Games');

    const card = within(updatedWinter)
      .getByText(/Milano/i)
      .closest('[data-resource-id]')!;

    const dt = createMockDataTransfer();
    fireEvent.dragStart(card, { dataTransfer: dt });

    const root = document.querySelector('.min-h-screen')!;
    fireEvent.dragOver(root, { clientX: 20, clientY: 20 });
    fireEvent.drop(root, { dataTransfer: dt });
    fireEvent.dragEnd(card);

    const finalWinter = screen.getByText('Winter Games').closest('section')!;
    expect(
      within(finalWinter).queryByText(/Milano Cortina 2026 Manual/i),
    ).not.toBeInTheDocument();

    const generalSection = screen.getByText('General').closest('section')!;
    expect(
      within(generalSection).getByText(/Milano Cortina 2026 Manual/i),
    ).toBeInTheDocument();
  });

  it('handles vertical multi-drag gesture across category sections', () => {
    render(<ResourcesPageContent />);

    const winterSection = enterCategoryEdit('Winter Games');

    const selectButtons = within(winterSection).getAllByRole('button', {
      name: 'Select resource',
    });
    fireEvent.click(selectButtons[0]);
    fireEvent.click(selectButtons[1]);

    const firstCard = within(winterSection)
      .getByText(/Milano/i)
      .closest('[data-resource-id]')!;
    const summerSection = screen.getByText('Summer Games').closest('section')!;
    const origElementFromPoint = document.elementFromPoint;
    document.elementFromPoint = () => summerSection;

    act(() => {
      fireEvent.pointerDown(firstCard, { clientX: 100, clientY: 100 });
      window.dispatchEvent(
        new PointerEvent('pointermove', { clientX: 100, clientY: 130 }),
      );
      window.dispatchEvent(
        new PointerEvent('pointermove', { clientX: 100, clientY: 150 }),
      );
    });

    expect(screen.getByTestId('multi-drag-avatar')).toBeInTheDocument();
    expect(screen.getByText('+ Add to Summer Games')).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new PointerEvent('pointerup'));
    });
    document.elementFromPoint = origElementFromPoint;

    expect(screen.queryByTestId('multi-drag-avatar')).not.toBeInTheDocument();
  });
});
