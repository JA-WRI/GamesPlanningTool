// AI contribution: 100% AI-generated
'use client';

import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GridHeaderPage from '../../../../games-planning-tool/src/components/commons/GridHeader';

describe('GridHeaderPage', () => {
  const defaultProps = {
    title: 'Test Title',
    description: 'Test Description',
    isEditing: false,
    isPreview: false,
    onEditToggle: vi.fn(),
    onPreviewToggle: vi.fn(),
    onSave: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders title and description when provided', () => {
    render(<GridHeaderPage {...defaultProps} />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders Edit button when not editing', () => {
    render(<GridHeaderPage {...defaultProps} isEditing={false} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    expect(editButton).toBeInTheDocument();

    fireEvent.click(editButton);
    expect(defaultProps.onEditToggle).toHaveBeenCalledTimes(1);
  });

  it('renders Cancel, Edit View, Preview, and Save buttons when editing', () => {
    render(<GridHeaderPage {...defaultProps} isEditing={true} />);

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /edit view/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /preview/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  it('triggers preview toggle handlers correctly', () => {
    render(<GridHeaderPage {...defaultProps} isEditing={true} />);

    fireEvent.click(screen.getByRole('button', { name: /preview/i }));
    expect(defaultProps.onPreviewToggle).toHaveBeenCalledWith(true);

    fireEvent.click(screen.getByRole('button', { name: /edit view/i }));
    expect(defaultProps.onPreviewToggle).toHaveBeenCalledWith(false);
  });

  it('triggers save and cancel actions', () => {
    render(<GridHeaderPage {...defaultProps} isEditing={true} />);

    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(defaultProps.onSave).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });
});
