import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { AddResourceModal } from '@/components/resources/AddResourceModal';

describe('AddResourceModal', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(
      <AddResourceModal
        isOpen={false}
        onClose={() => {}}
        onAddResource={() => {}}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal and triggers onClose on Cancel button or close icon', () => {
    const handleClose = vi.fn();
    render(
      <AddResourceModal
        isOpen={true}
        onClose={handleClose}
        onAddResource={() => {}}
      />,
    );

    expect(screen.getByText('Add New Resource')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Cancel'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('validates required fields and shows error messages', () => {
    render(
      <AddResourceModal
        isOpen={true}
        onClose={() => {}}
        onAddResource={() => {}}
      />,
    );

    const submitBtn = screen.getByRole('button', { name: 'Add Resource' });
    fireEvent.click(submitBtn);

    const nameInput = screen.getByPlaceholderText(
      'e.g. LA 2028 Team Roster Guide',
    );
    fireEvent.change(nameInput, { target: { value: 'Valid Name' } });
    fireEvent.click(submitBtn);

    expect(
      screen.getByText('Please provide a valid URL for the resource.'),
    ).toBeInTheDocument();

    const fileTab = screen.getByRole('button', { name: /Upload File/i });
    fireEvent.click(fileTab);
    fireEvent.click(submitBtn);
    expect(
      screen.getByText('Please select or drop a file to upload.'),
    ).toBeInTheDocument();

    const linkTab = screen.getByRole('button', { name: /Website Link/i });
    fireEvent.click(linkTab);
  });

  it('submits a new link resource with selected categories and preview image', () => {
    const handleAdd = vi.fn();
    const handleClose = vi.fn();

    render(
      <AddResourceModal
        isOpen={true}
        preselectedCategory="Winter Games"
        onClose={handleClose}
        onAddResource={handleAdd}
      />,
    );

    const nameInput = screen.getByPlaceholderText(
      'e.g. LA 2028 Team Roster Guide',
    );
    fireEvent.change(nameInput, { target: { value: 'Olympic Portal' } });

    const urlInput = screen.getByPlaceholderText('https://olympic.ca/handbook');
    fireEvent.change(urlInput, { target: { value: 'olympics.com' } });

    const previewBtn = screen.getByRole('button', {
      name: /Olympic Stadium Track/i,
    });
    fireEvent.click(previewBtn);

    const customImgInput = screen.getByPlaceholderText(
      'Or paste custom image URL...',
    );
    fireEvent.change(customImgInput, {
      target: { value: 'https://images.example.com/custom.jpg' },
    });

    const summerBtn = screen.getByRole('button', { name: 'Summer Games' });
    fireEvent.click(summerBtn);

    const nsoFilter = screen.getByPlaceholderText('Filter NSOs...');
    fireEvent.change(nsoFilter, { target: { value: 'Athletics' } });
    const athleticsBtn = screen.getByRole('button', {
      name: 'Athletics Canada',
    });
    fireEvent.click(athleticsBtn);

    const submitBtn = screen.getByRole('button', { name: 'Add Resource' });
    fireEvent.click(submitBtn);

    expect(handleAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Olympic Portal',
        type: 'link',
        URL: 'https://olympics.com',
        previewUrl: 'https://images.example.com/custom.jpg',
        categories: expect.arrayContaining([
          'Winter Games',
          'Summer Games',
          'Athletics Canada',
        ]),
      }),
    );
    expect(handleClose).toHaveBeenCalled();
  });

  it('switches to file input, selects a file, and submits file resource', () => {
    const handleAdd = vi.fn();
    const handleClose = vi.fn();

    render(
      <AddResourceModal
        isOpen={true}
        onClose={handleClose}
        onAddResource={handleAdd}
      />,
    );

    const fileTab = screen.getByRole('button', { name: /Upload File/i });
    fireEvent.click(fileTab);

    const file = new File(['mock content'], 'team_roster.pdf', {
      type: 'application/pdf',
    });
    const fileInput = document.querySelector('input[type="file"]')!;
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(screen.getByText('team_roster.pdf')).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: 'Add Resource' });
    fireEvent.click(submitBtn);

    expect(handleAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Team roster',
        type: 'file',
        categories: ['General'],
        file: expect.objectContaining({
          name: 'team_roster.pdf',
        }),
      }),
    );
    expect(handleClose).toHaveBeenCalled();
  });

  it('handles drag and drop file upload and drag states', () => {
    render(
      <AddResourceModal
        isOpen={true}
        onClose={() => {}}
        onAddResource={() => {}}
      />,
    );

    const fileTab = screen.getByRole('button', { name: /Upload File/i });
    fireEvent.click(fileTab);

    const dropzone = screen
      .getByText(/Click to upload or drag and drop/i)
      .closest('[class*="border-dashed"]')!;
    fireEvent.dragOver(dropzone);
    fireEvent.dragLeave(dropzone);

    const imageFile = new File(['image-content'], 'badge.png', {
      type: 'image/png',
    });
    fireEvent.drop(dropzone, {
      dataTransfer: { files: [imageFile] },
    });

    expect(screen.getByText('badge.png')).toBeInTheDocument();
  });
});
